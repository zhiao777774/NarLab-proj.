import unicodedata
import pandas as pd
import torch


def normalize(text):
    text = unicodedata.normalize('NFKD', text).encode('utf-16',
                                                      'ignore').decode(
                                                          'utf-16', 'ignore')
    text = text.replace("\n", " ")
    text = text.replace("_x000D_", " ")
    return text

def load_data(df, one_class=False):

    titles = df['name'].tolist()
    descriptions = df['description'].tolist()
    keywords = df['chineseKeyword'].tolist()
    year = df['startDate'].tolist()
    check = df['category'].tolist()[:-4]

    y = []
    count = 0
    null = -4
    y.append(count)

    #對標籤編號
    for i in range(1, len(check)):
        num = len(check[i].split(';'))
        if (num == 1):
            if (check[i] == check[i-1]):
                y.append(count)
            else:
                count = count + 1
                y.append(count)
        else:
            y.append(null)
            

    X = []
    for i in range(len(titles[:-4])):
        title = str(titles[i])
        keyword = str(keywords[i])
        description = str(descriptions[i])
        x = title + "。" + keyword + "。" + description
        x = normalize(x)
        X.append(x)

    if one_class:
        new_X = []
        new_y = []
        new_year = []
        new_y_name = []

        for i in range(len(y)):
            num_label = len(check[i].split(';'))
            if num_label == 1:
                new_X.append(X[i])
                new_y.append(y[i])
                new_year.append(int(year[i]))

                if check[i] not in new_y_name:
                    new_y_name.append(check[i])

    else:
        new_X = X
        new_y = y
        new_y_name = []
        new_year = []

    return new_X, new_y, new_year, new_y_name


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