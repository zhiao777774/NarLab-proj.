import pymongo
from typing import Union


class MongoDB:
    def __init__(self):
        self.session: pymongo.MongoClient = None
        self.db: pymongo.database.Database = None

    def __getitem__(self, col_name: str) -> pymongo.collection.Collection:
        return self.db[col_name]

    def connect(self, db_name: str) -> None:
        self.session = pymongo.MongoClient('mongodb://root:root@localhost:27017/?authMechanism=DEFAULT')
        self.db = self.session[db_name]

    def close(self) -> None:
        self.session.close()

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
    print(db_connection.db.list_collection_names())
    db_connection.close()
