import json
import pathlib
import logging
import sys
import importlib.util
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS


def import_lib(module_name, spec_name, spec_path):
    spec = importlib.util.spec_from_file_location(spec_name, spec_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    sys.modules[module_name] = module

    return module


app = Flask(__name__)
CORS(app)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

_ROOT_PATH = pathlib.PurePath(__file__).parent.parent.parent
preproc_module = import_lib('preprocessing', 'preprocessing', _ROOT_PATH / 'preprocessing.py')


# tfidf_module = import_lib('tfidf', 'tfidf.keyword', _ROOT_PATH / 'tfidf/keyword.py')


@app.route('/', methods=['GET'])
def index():
    return 'test'


@app.route('/preprocess', methods=['POST'])
def preprocess():
    req_data = request.get_data()
    req_data = json.loads(req_data)['data']
    data = preproc_module.combine(pd.DataFrame.from_dict(req_data))
    return jsonify(data)


@app.route('/store', methods=['PATCH', 'POST'])
def store():
    req_data = request.get_data()
    req_data = json.loads(req_data)['data']
    # POST: add new data
    if request.method == 'POST':
        df = pd.read_excel(_ROOT_PATH / 'data/folder_nar/103-110_full.xlsx')
        df = preproc_module.preprocess(df)
        df = pd.concat([df, pd.DataFrame.from_dict(req_data)])
        data = preproc_module.combine(df)
        return jsonify({'ok': True, 'result': data})
    # PATCH: modify an existing data
    else:
        return jsonify({'ok': True})


if __name__ == '__main__':
    port = 8090
    app.run(port=port, debug=True)
