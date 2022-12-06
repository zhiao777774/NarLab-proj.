import os

DATA_PATH = os.path.abspath(os.path.join(
            os.path.abspath(__file__),
            os.pardir,
            os.pardir,
            os.pardir,
            'data'
        ))

SAVE_PATH = os.path.abspath(os.path.join(
    os.path.abspath(__file__),
    os.pardir,
    os.pardir,
    os.pardir,
    'exp'
))

XML_PATH = os.path.abspath(os.path.join(
    DATA_PATH,
    'folder_nar',
))

TOKENIZE_PATH = os.path.abspath(os.path.join(
    DATA_PATH,
    'tokenize_data',
))