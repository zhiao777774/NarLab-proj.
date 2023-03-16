import pandas as pd
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from database import MongoDB
from data_type import ActionRequestModel, QueryRequestModel, DatasetRequestModel
from utils import import_lib, ROOT_PATH

preproc_module = import_lib('preprocessing', 'preprocessing', ROOT_PATH / 'preprocessing.py')
# tfidf_module = import_lib('tfidf', 'tfidf.keyword', ROOT_PATH / 'tfidf/keyword.py')

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
db_conn = MongoDB()


@app.get('/tfidf')
@app.post('/tfidf')
def get_tfidf(req: QueryRequestModel, request: Request):
    cond = req.condition if request.method.upper() == 'POST' else {}
    res = []
    for d_tfidf in db_conn.find('tfidf', cond):
        d_tfidf['_id'] = str(d_tfidf['_id'])
        res.append(d_tfidf)
    return {d['code']: d for d in res}


@app.get('/dataset')
@app.post('/dataset')
def get_dataset(req: DatasetRequestModel, request: Request):
    cond = req.condition if request.method.upper() == 'POST' else {}
    load_combined = req.combined
    if load_combined:
        res = db_conn.find('dataset_combine', cond)
        return {d['project']: d['data'] for d in res}
    else:
        res = []
        for d_tfidf in db_conn.find('dataset', cond):
            d_tfidf['_id'] = str(d_tfidf['_id'])
            res.append(d_tfidf)
        return res


@app.get('/category/stat')
@app.post('/category/stat')
def get_category_stat(req: QueryRequestModel, request: Request):
    cond = req.condition if request.method.upper() == 'POST' else {}
    res = db_conn.find('category_stat', cond)
    return {d['name']: d['data'] for d in res}


@app.get('/category/prob')
@app.post('/category/prob')
def get_category_prob(req: QueryRequestModel, request: Request):
    cond = req.condition if request.method.upper() == 'POST' else {}
    res = []
    for d_cat in db_conn.find('category_prob', cond):
        d_cat['_id'] = str(d_cat['_id'])
        res.append(d_cat)
    return {d['code']: d for d in res}


@app.post('/preprocess')
def preprocess(req: ActionRequestModel):
    return preproc_module.combine(pd.DataFrame.from_dict(req.data))


@app.patch('/store')
@app.post('/store')
def store(req: ActionRequestModel, request: Request):
    req_data = req.data
    if request.method.upper() == 'POST':
        # POST: add new data
        res = []
        for d_cat in db_conn.find('dataset', {}):
            d_cat['_id'] = str(d_cat['_id'])
            res.append(d_cat)
        old_df = pd.DataFrame(res)
        old_df = preproc_module.preprocess(old_df)
        combined_df = pd.concat([old_df, pd.DataFrame.from_dict(req_data)])
        combined_data = preproc_module.combine(combined_df)

        db_conn.insert('dataset', req_data)
        db_conn['dataset_combine'].delete_many({})
        saved = [
            {'project': project, 'data': combined_data[project]}
            for project in combined_data
        ]
        db_conn.insert('dataset_combine', saved)

        # TODO: execute tfidf, classification, BERTopic, etc.
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
    port = 8090
    uvicorn.run(app='server:app', host='127.0.0.1', port=port, reload=True)
