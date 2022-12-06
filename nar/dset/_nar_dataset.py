import re
import unicodedata

import pandas as pd
import torch

from sklearn.model_selection import train_test_split
from sklearn.model_selection import KFold

from nar.dset._dataset import Dataset

class NarDataset(Dataset):
    def __init__(self, max_seq_len, tokenizer):
        self.max_seq_len = max_seq_len
        self.tokenizer = tokenizer

    def load_data(self, path):
        df = pd.read_excel(path)
        labels2id = {'電池': 0, '智慧農業':1 , '5G':2, '精準醫療與精準健康':3, '創新創業':4, '再生能源': 5, '資安人培':6, '數位經濟':7, '防疫科技':8 , '文化': 9, 'other':10}

        content_desc = df['本計畫在施政項目之定位及功能'].apply(self.preprocess)
        content_func = df['計畫重點描述'].apply(self.preprocess)

        all_data, all_labels = [], []
        data, labels = [], []
        for i in range(len(df)):
            label = [df.iloc[i]['主題1'], df.iloc[i]['主題2'], df.iloc[i]['主題3'], df.iloc[i]['主題4'], df.iloc[i]['主題5'], df.iloc[i]['主題6'], df.iloc[i]['主題7'], df.iloc[i]['主題8'], df.iloc[i]['主題9'], df.iloc[i]['主題10'],]
            label = list(filter(lambda x: str(x)!='nan', label))
            if label:
                all_labels.append(labels2id[label[0]])
                labels.append(labels2id[label[0]])
                data.append(content_func[i])
            else:
                all_labels.append(labels2id['other'])
            all_data.append(content_func[i])

        self.all_labels, self.all_data = all_labels, all_data

        d = pd.DataFrame({'data': data, 'labels': labels})
        d = d.drop_duplicates()
        self.data = d.data.tolist()
        self.labels = d.labels.tolist()

        print(f'data size: {len(self.data)}')
        print(f'label size: {len(self.labels)}')
        print(f'all data size: {len(self.all_data)}')
        print(f'all label size: {len(self.all_labels)}')

    def preprocess(self, txt):
        txt = unicodedata.normalize('NFKC', txt)

        sub_pat_list = [
            r'\r\n',
            r'十?[一二三四五六七八九]、',
            r'\(十?[一二三四五六七八九]\)',
            r'\d+\.',
        ]

        for pat in sub_pat_list:
            txt = re.sub(pat, '', txt)
        return txt