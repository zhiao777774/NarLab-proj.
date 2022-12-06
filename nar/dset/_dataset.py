import re
import pandas as pd
import torch
from sklearn.model_selection import train_test_split
from sklearn.model_selection import KFold


class Dataset:
    r"""Construct dataset and dataloader.
    """
    def __init__(self, max_seq_len, tokenizer):
        self.max_seq_len = max_seq_len
        self.tokenizer = tokenizer

    # Using pandas to load the data from csv file, then mapping aspect
    # representation from alphabet to number and drop the null data.
    # aspect range: (B~E) => (0~5)
    def load_data(self, file_path):
        aspect_to_id = {'B': 0, 'C': 1, 'D': 2, 'E': 3, 'F': 4}

        df = pd.read_csv(file_path, dtype='str')
        df = df[['content', 'aspect']]
        df = df.dropna()
        df = df.drop_duplicates()
        # 只保留大於 10 content 長度
        df = df[df['content'].apply(len) > 10]
        df = df[df['aspect'].apply(lambda aspect: 'B' <= str(aspect) <= 'F')]
        df['aspect'] = df['aspect'].apply(lambda aspect: aspect_to_id[aspect])

        return df

    # Process of tokenization including padding, truncation and add special
    # tokens (such as `[CLS]`, `[SEP]`). Then we get `input_ids`,
    # `attention_mask`, `token_type_ids` and `position_ids` which are needed for
    #  bert model training.
    def text_to_input_format(self, text):
        try:
            encode_obj = self.tokenizer(
                text,
                add_special_tokens=True,
                max_length=self.max_seq_len,
                truncation=True,
                padding='max_length'
            )
        except:
            print(type(text))
            print(text)

        input_ids = encode_obj.input_ids
        attention_mask = encode_obj.attention_mask
        token_type_ids = encode_obj.token_type_ids
        position_ids = range(self.max_seq_len)

        return input_ids, attention_mask, token_type_ids, position_ids

    def get_dataloader(self, contents, aspects, batch_size, is_shuffled=True):
        input_ids = []
        attention_mask = []
        token_type_ids = []
        position_ids = []

        for sentence in contents:
            x = self.text_to_input_format(sentence)
            input_ids.append(x[0])
            attention_mask.append(x[1])
            token_type_ids.append(x[2])
            position_ids.append(x[3])

        dataset = torch.utils.data.TensorDataset(
            torch.LongTensor(input_ids),
            torch.LongTensor(attention_mask),
            torch.LongTensor(token_type_ids),
            torch.LongTensor(position_ids),
            torch.LongTensor(aspects)
        )

        dataloader = torch.utils.data.DataLoader(
            dataset=dataset,
            batch_size=batch_size,
            shuffle=is_shuffled
        )

        return dataloader

    def split_data(self, contents, aspects, seed, ratio=0.2):
        return train_test_split(contents, aspects, test_size=ratio, random_state=seed)

    def split_K_fold(self, contents, aspects, n_splits, seed, is_shuffled=True):
        kf = KFold(n_splits=n_splits, random_state=seed, shuffle=is_shuffled)
        kf.get_n_splits(contents)
        coll = {'train': [], 'test': []}
        for train_index, test_index in kf.split(contents):
            coll['train'].append(train_index)
            coll['test'].append(test_index)

        x_train, y_train, x_test, y_test = {}, {}, {}, {}

        for i in range(n_splits):
            x_train[i], y_train[i], x_test[i], y_test[i] = [], [], [], []
            for idx in coll['train'][i]:
                x_train[i].append(contents[idx])
                y_train[i].append(aspects[idx])
            for idx in coll['test'][i]:
                x_test[i].append(contents[idx])
                y_test[i].append(aspects[idx])

        return x_train, x_test, y_train, y_test
