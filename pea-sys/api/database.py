import os
import dotenv
import pymongo
from ssh_pymongo import MongoSession

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


if __name__ == '__main__':
    db_connection = MongoDB()
    db_connection.connect('nar')
    print(db_connection.db.collection_names())
    db_connection.close()
