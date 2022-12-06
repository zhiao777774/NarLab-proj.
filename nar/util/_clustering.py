from sklearn.cluster import Birch
import numpy as np
import nar.util
import argparse
import pickle
import gc

def get_args():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        '--language',
        default='chinese',
        help='tokenized data.',
        type=str
    )

    parser.add_argument(
        '--n_cluster',
        default=20,
        help='',
        type=int
    )

    return parser.parse_args()

def load_data(path):
    f = open(path, 'rb')
    data = pickle.load(f)
    f.close()
    return data

def keep_description(dataset, language):
    data = []
    for key in dataset.keys():
        data.append(dataset[key][f'{language}_description_tag'])
    return np.array(data, dtype = float)

def clustering(data_path, language, n_cluster):
    data = load_data(data_path)
    dataset = keep_description(data, language)
    label = {}
    kmean_model = Birch(n_clusters = n_cluster).fit(dataset)
    count = 0
    for key in data.keys():
        label[key] = {}
        label[key]['label'] = kmean_model.labels_[count]
        count += 1
    return label
    

if __name__=="__main__":
    np.random.seed(0)
    args = get_args()
    dataset_path = f'{nar.util.TOKENIZE_PATH}/new_dataset_{args.language}.pickle'
    print('start clustering')
    print('-'*30)
    labeled_data = clustering(dataset_path, args.language, args.n_cluster)
    print('end clustering')
    f = open(f'{nar.util.DATA_PATH}/xlsx_description_{args.language}.pickle', 'wb')
    pickle.dump(labeled_data, f)
    f.close()
    