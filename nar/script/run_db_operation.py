import os
import argparse
import pandas as pd
import pymongo

OPERATION = {
    'DELETE': ('delete', 'del', 'd'),
}


def execute_operation(operator, col, where, from_):
    if operator in OPERATION['DELETE']:
        for item in where:
            res_id = col.delete_one({from_: item})
            print(f'SUCCESS: Delete {res_id} from {col} where {from_} is {item}')


def main(args):
    session = pymongo.MongoClient('mongodb://root:root@localhost:27017/?authMechanism=DEFAULT')
    db = session['nar']
    collections = ['category_prob', 'category_stat', 'tfidf', 'dataset', 'dataset_combine']

    args = vars(args)
    from_ = args['from']
    from_data = args['fromdata']
    where = args['where']
    if args['where'] is None:
        ext = os.path.splitext(from_data)[1][1:]
        if ext == 'txt':
            with open(from_data, 'r') as f:
                where = f.read().split(args['sep'])
        else:
            df = pd.read_csv(from_data, usecols=[0]) \
                if ext == 'csv' else pd.read_excel(args['data'], usecols=0)
            from_ = df.columns[0]
            where = df.values.tolist()

    oper_idx = [i for i, n in enumerate(OPERATION.values()) if args['operator'] in n][0]
    print(
        f'INFO: {list(OPERATION.keys())[oper_idx]} where {from_} is {where}')

    try:
        for col in collections:
            execute_operation(args['operator'], db[col], where, from_)
    except Exception as e:
        print(f'ERROR: {args["operator"]}')
        print(e)

    session.close()


def validate_file_ext(choices, fname, parser):
    ext = os.path.splitext(fname)[1][1:]
    if ext not in choices:
        parser.error("file doesn't end with one of {}".format(choices))
    return fname


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-p', '--operator', type=str, required=True,
                        choices=[alias for n in OPERATION.values() for alias in n])
    parser.add_argument('-f', '--from', type=str, default='code', choices=['code', 'name'], required=False)
    parser.add_argument('-w', '--where', nargs='*', required=False)
    parser.add_argument('--fromdata', type=lambda s: validate_file_ext(('csv', 'xlsx', 'xls', 'txt'), s, parser),
                        required=False)
    parser.add_argument('--sep', type=str, default='\n', required=False)

    args = parser.parse_args()
    print(args, '\n')
    main(args)
