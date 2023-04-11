import os
import logging
import pandas as pd
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from database import MongoDB
from data_type import ActionRequestModel, QueryRequestModel, DatasetRequestModel
from utils import import_lib, ROOT_PATH

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

preproc_module = import_lib('preprocessing', 'preprocessing', ROOT_PATH / 'preprocessing.py')
tfidf_module = import_lib('tfidf', 'tfidf.keyword', ROOT_PATH / 'tfidf/keyword.py')
cl_module = import_lib('classification', 'classification.main', ROOT_PATH / 'classification/main.py')
bertopic_module = import_lib('sup_bertopic', 'helloBERTopic.supervised', ROOT_PATH / 'helloBERTopic/supervised.py')
wordcloud_module = import_lib('wordcloud', 'wordcloud.word_cloud', ROOT_PATH / 'wordcloud/word_cloud.py')

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
db_conn = MongoDB()


@app.get('/api/tfidf')
@app.post('/api/tfidf')
def get_tfidf(req: QueryRequestModel, request: Request):
    cond = req.condition if request.method.upper() == 'POST' else {}
    res = []
    for d_tfidf in db_conn.find('tfidf', cond):
        d_tfidf['_id'] = str(d_tfidf['_id'])
        res.append(d_tfidf)
    return {d['code']: d for d in res}


@app.get('/api/dataset')
@app.post('/api/dataset')
def get_dataset(req: DatasetRequestModel, request: Request):
    cond = req.condition if request.method.upper() == 'POST' else {}
    load_combined = req.combined
    if load_combined:
        result = db_conn.find('dataset_combine', cond)
        res = {}
        for project in result:
            data = []
            for d in project['data']:
                d['_id'] = str(d['_id'])
                data.append(d)

            res[project['project']] = data
        return res
        #return {d['project']: d['data'] for d in result}
    else:
        res = []
        for d in db_conn.find('dataset', cond):
            d['_id'] = str(d['_id'])
            res.append(d)
        return res


@app.get('/api/category/stat')
@app.post('/api/category/stat')
def get_category_stat(req: QueryRequestModel, request: Request):
    cond = req.condition if request.method.upper() == 'POST' else {}
    res = db_conn.find('category_stat', cond)
    return {d['name']: d['data'] for d in res}


@app.get('/api/category/prob')
@app.post('/api/category/prob')
def get_category_prob(req: QueryRequestModel, request: Request):
    cond = req.condition if request.method.upper() == 'POST' else {}
    res = []
    for d_cat in db_conn.find('category_prob', cond):
        d_cat['_id'] = str(d_cat['_id'])
        res.append(d_cat)
    return {d['code']: d for d in res}


@app.post('/api/preprocess')
def preprocess(req: ActionRequestModel):
    return preproc_module.combine(pd.DataFrame.from_dict(req.data))


@app.patch('/api/store')
@app.post('/api/store')
def store(req: ActionRequestModel, request: Request):
    req_data = req.data
    if request.method.upper() == 'POST':
        # POST: add new data
        res = []
        for d in db_conn.find('dataset', {}):
            d['_id'] = str(d['_id'])
            res.append(d)
        old_df = pd.DataFrame(res)
        old_df = preproc_module.preprocess(old_df)
        new_df = pd.DataFrame.from_dict(req_data)
        combined_df = pd.concat([old_df, new_df])
        combined_data = preproc_module.combine(combined_df)

        db_conn.insert('dataset', req_data)
        db_conn['dataset_combine'].delete_many({})
        saved = [
            {'project': project, 'data': combined_data[project]}
            for project in combined_data
        ]
        db_conn.insert('dataset_combine', saved)

        try:
            # NOTE: Classification (depends on dataset (only new data))
            print('start classification')
            cl_result = cl_module.main(new_df, '/home/ncku112/nar/NarLab-proj./classification/model_bert-base-chinese_20', '/home/ncku112/nar/NarLab-proj./data/folder_nar/category_probability.csv')
            cl_ins_res = db_conn.insert('category_prob', cl_result)
            print('insert classification data successfully: ', cl_ins_res.inserted_ids)
            print('classification done')

            # NOTE: Category statistic (depends on Classification and dataset)
            print('start category statistic')
            db_conn['category_stat'].delete_many({})
            df = db_conn.find('dataset', {})
            cat_df = db_conn.find('category_prob', {})
            categories = list(set([d['predictCategoryTop5'][0] for d in cat_df]))
            years = list(set([d['startDate'] for d in df]))
            cat_year_mapping = {cat: {str(y): 0 for y in years} for cat in categories}
            for data in df:
                code = data['code']
                cat_data_idx = next((index for (index, d) in enumerate(cat_df) if d['code'] == code), None)
                cat = cat_df[cat_data_idx]['predictCategoryTop5'][0]
                year = data['startDate']
                cat_year_mapping[cat][str(year)] += 1

            res = []
            for cat, year_map in cat_year_mapping.items():
                res.append({
                    'name': cat,
                    'data': year_map
                })

            if len(res) != 50:
                tmp = res[0]['data'].copy()
                for year in tmp:
                    tmp[year] = 0

                res.append({
                    'name': '虛擬實境',
                    'data': tmp
                })
            db_conn.insert('category_stat', res)
            
            # db_conn['category_stat'].delete_many({})
            # for new_data in req_data:
            #     cl = next(item for item in cl_result if item['code'] == new_data['code'])
            #     cat = cl['predictCategoryTop5'][0]
            #     cat_data = db_conn.find('category_stat', {'name': cat})
                
            #     update = cat_data.copy()
            #     year = int(new_data['startDate'])
            #     if year in update['data']:
            #         update['data'][year] += 1
            #     else:
            #         update['data'][year] = 1

            #     db_conn.update('category_stat', {'name': cat}, {'$set': {'data': update['data']}})

            print('category statistic done')
        except:
            logging.exception('POST /api/store -> Error occurred during run CATEGORY analysis')

        try:
            # NOTE: TF-IDF (depends on dataset)
            print('start tf-idf')
            tfidf_result = tfidf_module.main(combined_df)
            tfidf_ins_res = db_conn.insert('tfidf', tfidf_result)
            print('insert tfidf data successfully: ', tfidf_ins_res.inserted_ids)
            print('tf-idf done')
         
            # NOTE: Wordcloud (depends on TF-IDF)
            print('start wordcloud')
            wordcloud_module.main(combined_df, tfidf_result, '/home/ncku112/nar/NarLab-proj./pea-sys/src/data/wordcloud/')
            print('wordcloud done')
        except:
             logging.exception('POST /api/store -> Error occurred during run KEYWORD analysis')

        # try:
        #     # NOTE: BERTopic (depends on dataset)
        #     print('start BERTopic')
        #     bertopic_module.main(combined_df)
        #     print('BERTopic done')
        # except:
        #     logging.exception('POST /api/store -> Error occurred during run BERTopic')


        return {'ok': True, 'result': combined_data}
    else:
        # PATCH: modify an existing data
        for item in req_data:
            code = list(item.keys())[0]
            target = db_conn.find('category_prob', {'code': code})[0]
            update_indexes = [
                i for i, cat in enumerate(target['predictCategoryTop5'][:3])
                if cat != item[code][i]
            ]
            for idx in update_indexes:
                ele = item[code][idx]
                cat_cond = f'predictCategoryTop5.{idx}'
                prob_cond = f'predictProbabilityTop5.{idx}'
                db_conn.update(
                    'category_prob',
                    {'code': code},
                    {
                        '$set': {
                            cat_cond: ele,
                            prob_cond: 1.0
                        }
                    }
                )
        return {'ok': True}


@app.on_event('startup')
async def startup_event():
    db_conn.connect('nar')
    print('connecting database successfully')


@app.on_event('shutdown')
def shutdown_event():
    db_conn.close()
    print('Database closed')


if __name__ == '__main__':
    uvicorn.run(app='server:app', reload=True)
