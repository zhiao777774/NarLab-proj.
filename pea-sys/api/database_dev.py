import os
import dotenv
import pandas as pd
import pymongo
from ssh_pymongo import MongoSession
from typing import Union

import preprocessing

dotenv.load_dotenv()


def get_env(var: str) -> str:
    return os.getenv(var)


class MongoDB:
    HOST = get_env('DB_HOST')  # local host
    PORT = int(get_env('DB_PORT'))  # mongodb server port
    SSH_HOST = get_env('DB_SSH_HOST')
    SSH_PORT = int(get_env('DB_SSH_PORT'))
    USER = get_env('DB_USER')  # student id.
    PASSWORD = get_env('DB_PASSWORD')  # ssh password to machine 9102

    def __init__(self):
        self.session: MongoSession = None
        self.db: pymongo.database.Database = None

    def __getitem__(self, col_name: str) -> pymongo.database.Collection:
        return self.db[col_name]

    def connect(self, db_name: str) -> None:
        self.session = MongoSession(
            host=self.SSH_HOST,
            port=self.SSH_PORT,
            user=self.USER,
            password=self.PASSWORD,
            uri=f'mongodb://root:root@localhost:27017/?authMechanism=DEFAULT',
        )

        self.db = self.session.connection[db_name]

    def close(self) -> None:
        self.session.stop()

    def find(self, col_name: str, condition: dict) -> list:
        return list(self.db[col_name].find(condition))

    def insert(self, col_name: str, data: Union[dict, list]):
        if isinstance(data, dict):
            return self.db[col_name].insert_one(data)
        return self.db[col_name].insert_many(data)

    def update(self, col_name: str, condition: dict, updated: Union[dict, list]):
        if isinstance(updated, dict):
            return self.db[col_name].update_one(condition, updated)
        return self.db[col_name].update_many(condition, updated)


if __name__ == '__main__':
    db_connection = MongoDB()
    db_connection.connect('nar')
    print(db_connection.db.collection_names())

    # df = pd.read_excel('/Users/chih_hao/資料/計畫/NAR_LAB/nar/data/folder_nar/103-110匯入系統20220509.xlsx')
    # df = preprocessing.combine(df)
    # for row in df:
    #     res = db_connection.update('dataset_combine', {'project': row}, {
    #         '$set': {
    #             'data': df[row]
    #         }
    #     })
    #
    #     print(row)

    db_connection.close()
