import sys
import json
import pathlib
import importlib.util
import pandas as pd
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from database import MongoDB
from data_type import RequestData, BasicSearchData, SearchDataForDataset


def import_lib(module_name, spec_name, spec_path):
    spec = importlib.util.spec_from_file_location(spec_name, spec_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    sys.modules[module_name] = module

    return module


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
db_conn = MongoDB()
db_conn.connect('nar')

_ROOT_PATH = pathlib.PurePath(__file__).parent.parent.parent
preproc_module = import_lib('preprocessing', 'preprocessing', _ROOT_PATH / 'preprocessing.py')


# tfidf_module = import_lib('tfidf', 'tfidf.keyword', _ROOT_PATH / 'tfidf/keyword.py')


@app.get('/tfidf')
@app.post('/tfidf')
def get_tfidf(req: BasicSearchData, request: Request):
    cond = req.condition if request.method.upper() == 'POST' else {}
    res = []
    for d_tfidf in list(db_conn['tfidf'].find(cond)):
        d_tfidf['_id'] = str(d_tfidf['_id'])
        res.append(d_tfidf)
    return {d['code']: d for d in res}


@app.get('/dataset')
@app.post('/dataset')
def get_dataset(req: SearchDataForDataset, request: Request):
    cond = req.condition if request.method.upper() == 'POST' else {}
    load_combined = req.combined
    res = list(db_conn['dataset_combine' if load_combined else 'dataset'].find(cond))
    return {d['project']: d['data'] for d in res} if load_combined else res


@app.get('/category/stat')
@app.post('/category/stat')
def get_category_stat(req: BasicSearchData, request: Request):
    cond = req.condition if request.method.upper() == 'POST' else {}
    res = list(db_conn['category_stat'].find(cond))
    return {d['name']: d['data'] for d in res}


@app.get('/category/prob')
@app.post('/category/prob')
def get_category_prob(req: BasicSearchData, request: Request):
    cond = req.condition if request.method.upper() == 'POST' else {}
    res = []
    for d_cat in list(db_conn['category_prob'].find(cond)):
        d_cat['_id'] = str(d_cat['_id'])
        res.append(d_cat)
    return {d['code']: d for d in res}


@app.post('/preprocess')
def preprocess(req: RequestData):
    return preproc_module.combine(pd.DataFrame.from_dict(req.data))


@app.patch('/store')
@app.post('/store')
def store(req: RequestData, request: Request):
    req_data = req.data
    if request.method.upper() == 'POST':
        # POST: add new data
        df = pd.read_excel(_ROOT_PATH / 'data/folder_nar/103-110_full.xlsx')
        df = preproc_module.preprocess(df)
        df = pd.concat([df, pd.DataFrame.from_dict(req_data)])
        data = preproc_module.combine(df)
        # TODO: insert new data into Database
        # TODO: execute tfidf, classification, BERTopic, etc.
        return {'ok': True, 'result': data}
    else:
        # PATCH: modify an existing data
        for item in req_data:
            code = list(item.keys())[0]
            target = list(db_conn['category_prob'].find({'code': code}))[0]
            update_idx = [
                i for i, cat in enumerate(target['predictCategoryTop5'][:3])
                if cat != item[code][i]
            ]
            for i in update_idx:
                update_ele = item[code][i]
                cat_set_name = f'predictCategoryTop5.{i}'
                prob_set_name = f'predictProbabilityTop5.{i}'
                db_conn['category_prob'].update(
                    {'code': code},
                    {
                        '$set': {
                            cat_set_name: update_ele,
                            prob_set_name: 1.0
                        }
                    }
                )

        return {'ok': True}


if __name__ == '__main__':
    port = 8090
    uvicorn.run(app='server:app', host='127.0.0.1', port=port, reload=True)
