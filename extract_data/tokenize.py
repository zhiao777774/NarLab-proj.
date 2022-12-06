# tokenizing the data and doing sequence embedding
import re
import nar.util
import argparse
import pickle
from tqdm import tqdm
import transformers
import pandas as pd
import os
import torch

def get_args():
    parser = argparse.ArgumentParser()

    # Required arguments.
    parser.add_argument(
        '--data_file',
        default=f'{nar.util.DATA_PATH}/data_dict.pickle',
        help='tokenized data.',
        type=str
    )

    parser.add_argument(
        '--store_file',
        default=f'{nar.util.DATA_PATH}/dataset',
        help='tokenized data.',
        type=str
    )
    parser.add_argument(
        '--model',
        default='0324_data_1_seed_123/ckpt-4',
        help="model's path",
        type=str
    )
    parser.add_argument(
        '--language',
        default='chinese',
        help='tokenized data.',
        type=str
    )

    return parser.parse_args()

# load the data from the file
def load_data(data_path):
    tmp = {}

    df = pd.read_excel(f'{nar.util.XML_PATH}/0324_combine.xlsx')
    df = df[['系統編號', '計畫完整中文名稱', '計畫重點描述', '中文關鍵詞']]
    df['計畫重點描述'] = df['計畫重點描述'].apply(lambda x: str(x).replace('_x000D_', ''))
    
    df = df.to_dict('index')
    
    for key, value in df.items():
        tmp[key] = {}
        tmp[key]['chinese_keyword_tag'] = value['中文關鍵詞']
        tmp[key]['chinese_name_tag'] = value['計畫完整中文名稱']
        tmp[key]['chinese_description_tag'] = re.sub(r'(\n|\uf06e|\uf0d82|\t|\uf06dm|\u3000|\uf06c3|\uf06c5|_x000D_|\uf06c5)','',value['計畫重點描述'])
        if type(tmp[key]['chinese_keyword_tag']) == float:
            tmp[key]['chinese_keyword_tag'] = ''
        if type(tmp[key]['chinese_name_tag']) == float:
            tmp[key]['chinese_name_tag'] = ''
        if type(tmp[key]['chinese_description_tag']) == float:
            tmp[key]['chinese_description_tag'] = ''

    f = open(f'{nar.util.DATA_PATH}/xlsx_data_{args["language"]}.pickle', 'wb')
    pickle.dump(tmp,f)
    f.close()

    return tmp


if __name__ == "__main__":
    # MODEL_MAX_LENGTH = 512
    args = get_args()
    args = args.__dict__
    # xml is a boolean variable to select the small dataset or xml_dataset
    data = load_data(args['data_file'])
    
    exit()
    tokenized_data = {}

    if torch.cuda.is_available():
        DEVICE = 'cuda:1'
    else :
        DEVICE = 'cpu'
    # get the stored data in the dicitonary
    '''
        keyword = 關鍵字
        name = 計畫名稱
        description = 計畫內容描述
    '''
    keyword = f'{args["language"]}_keyword_tag'
    name = f'{args["language"]}_name_tag'
    description = f'{args["language"]}_description_tag'

    # select the tokenizer from hugging face
    if args['language'] == 'english':
        tokenizer = nar.util.get_tokenizer('bert-base-uncased')
        model_config = transformers.BertConfig.from_pretrained('bert-base-uncased')
        model = transformers.BertModel.from_pretrained('bert-base-uncased', config=model_config)
        model = model.to(DEVICE)
    elif args['language'] == 'chinese':
        tokenizer = nar.util.get_tokenizer('bert-base-chinese')
        # model = transformers.BertForSequenceClassification.from_pretrained(f'/home/NE6101050/nar/exp/new_data_1/ckpt-1', num_labels=10, output_hidden_states = True)
        model = transformers.BertForSequenceClassification.from_pretrained(f'{nar.util.SAVE_PATH}/{args["model"]}', num_labels=10, output_hidden_states = True)
        model = model.to(DEVICE)
    else:
        raise 'Unexpected language'

    try : 
        f = open(f'{nar.util.DATA_PATH}/tokenize_data/new_dataset_{args["language"]}.pickle', 'wb')
    except :
        os.mkdir(f'{nar.util.DATA_PATH}/tokenize_data')
        f = open(f'{nar.util.DATA_PATH}/tokenize_data/new_dataset_{args["language"]}.pickle', 'wb')

    # tokenizing
    for key in tqdm(data.keys()):
        tokenized_data[key] = {}
        tokenized_data[key][keyword] = model(**(tokenizer(data[key][keyword],  return_tensors="pt", max_length = 512, truncation='only_first').to(DEVICE))).hidden_states[-1][0][0].tolist()
        tokenized_data[key][description] = model(**(tokenizer(data[key][description],  return_tensors="pt", max_length = 512, truncation='only_first').to(DEVICE))).hidden_states[-1][0][0].tolist()
        tokenized_data[key][name] = model(**(tokenizer(data[key][name],  return_tensors="pt", max_length = 512, truncation='only_first').to(DEVICE))).hidden_states[-1][0][0].tolist()

    pickle.dump(tokenized_data, f)
    f.close()