import pickle
import numpy as np
import nar.util
import copy
from math import dist
import gc
import argparse
from tqdm import tqdm
def get_args():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        '--language',
        default='english',
        help='tokenized data.',
        type=str
    )
    parser.add_argument(
        '--distance',
        default=50,
        help='Drop the null data or not',
        type=int
    )
    return parser.parse_args()

def dynamic_clustering(data, distance):
    keys = list(data.keys())
    first = keys[0]
    cluster = []
    cluster.append({'nodes': [first], 'center' : copy.deepcopy(data[first]['vector'])})

    for i in tqdm(range(1, len(keys))):
        flag = True
        for node in range(len(cluster)):
            if dist(cluster[node]['center'], data[keys[i]]['vector']) < distance:
                cluster[node]['nodes'].append(keys[i])
                cluster[node]['center'] = np.multiply(
                    np.array(cluster[node]['center']), 
                    np.array([len(cluster[node]['nodes'])])
                    ) 
                cluster[node]['center'] += np.array(data[keys[i]]['vector'])
                cluster[node]['center'] = np.multiply(
                    np.array(cluster[node]['center']), 
                    np.array([1 / (len(cluster[node]['nodes']))])
                    )
                flag = False
                break
        if flag :
            cluster.append({'nodes': [keys[i]], 'center' : copy.deepcopy(data[keys[i]]['vector'])})
    result = {}

    for label in range(len(cluster)):
        for node in cluster[label]['nodes']:    
            result[node] = {}
            result[node]['label'] = label
    return result
def load_data(path):
    f = open(path, 'rb')
    data = pickle.load(f)
    f.close()
    return data

def get_tag(dataset, language, trunc_len :int or None = None):
    data = {}
    for key in dataset.keys():
        data[key] = {}
        data[key]['vector'] = copy.deepcopy(dataset[key][f'{language}_description_tag'])
    del dataset
    gc.collect()
    return data

if __name__=="__main__":
    np.random.seed(0)
    args = get_args()
    args = args.__dict__
    dataset_path = f'{nar.util.DATA_PATH}/xlsx_dataset_{args["language"]}.pickle'
    print('start loading')
    print('-'*30)
    data = load_data(dataset_path)
    print('end loading')
    print('start getting tag')
    print('-'*30)
    preprocessed_data = get_tag(data, args["language"])
    print('start clustering')
    print('-'*30)
    labeled_data = dynamic_clustering(preprocessed_data, args['distance'])
    print('end clustering')
    f = open(f'{nar.util.DATA_PATH}/dynamic_{args["language"]}.pickle', 'wb')
    pickle.dump(labeled_data, f)
    f.close()
    