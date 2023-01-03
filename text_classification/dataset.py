import unicodedata
import pandas as pd
import torch


def normalize(text):
    text = unicodedata.normalize('NFKD', text).encode('utf-8',
                                                      'ignore').decode(
                                                          'utf-8', 'ignore')
    text = text.replace("\n", " ")
    return text

def load_data(filename, one_class=False):

    df = pd.read_excel(filename)
    titles = df['計畫完整中文名稱'].tolist()
    descriptions = df['計畫重點描述'].tolist()
    y = df['新標籤'].tolist()[:-4]

    X = []
    for i in range(len(titles[:-4])):
        title = titles[i]
        description = descriptions[i]
        x = title + "。" + description
        x = normalize(x)
        X.append(x)

    if one_class:
        new_X = []
        new_y = []

        for i in range(len(y)):
            num_label = len(y[i].split(';'))
            if num_label == 1:
                new_X.append(X[i])
                new_y.append(y[i])

    else:
        new_X = X
        new_y = y

    return new_X, new_y


class NARDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):
        # 資料集總共有幾筆
        return len(self.labels)