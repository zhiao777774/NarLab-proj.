import argparse
import nar.util
import pickle
import numpy as np
import pandas as pd

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

if __name__=="__main__":
    # setting random seed
    np.random.seed(0)

    # get the arguments
    args = get_args()

    # tokenized data's path
    data_path = f'{nar.util.TOKENIZE_PATH}/new_dataset_{args.language}.pickle'

    # clustering
    labeled_data = nar.util.clustering(data_path, args.language, args.n_cluster)
    
    f = open(f'{nar.util.DATA_PATH}/xlsx_data_{args.language}.pickle', 'rb')
    origin = pickle.load(f)
    f.close()

    # storing the outcome of clustering in a directory
    for i in range(args.n_cluster):
        nar.util.infer(labeled_data, origin, args.language, center = i)
    
    # delete the data that won't use
    del origin

    # create a csv file named labeled_data
    df = pd.read_excel(f'{nar.util.XML_PATH}/0324_combine.xlsx')
    df = df[['年度', '計畫完整中文名稱', '部會']]
    df = df.to_dict('index')
    f = open(f'{nar.util.DATA_PATH}/result/result_0.pickle', 'rb')
    pred_result = pickle.load(f)
    f.close()
    store_data = nar.util.get_data_for_store('0', df, pred_result.keys(), trunc_len = 21)
    for i in range(1, args.n_cluster):
        f = open(f'{nar.util.DATA_PATH}/result/result_{i}.pickle', 'rb')
        pred_result = pickle.load(f)
        f.close()
        store_data += nar.util.get_data_for_store(str(i), df, pred_result.keys(), trunc_len = 21)

    # delete dataframe
    del df

    # create the dataframe with label
    store_data = store_data.split('\n')[:-1]
    store_data = map(lambda x : x.split(','), store_data)
    store_data = pd.DataFrame(store_data, columns = ['year', 'name', 'department', 'label'])

    # find the project's start and end year 
    store_data = nar.util.find_year(store_data)

    # combine the project's description
    df = pd.read_excel(f'{nar.util.XML_PATH}/0324_combine.xlsx')
    store_data = nar.util.combine_description(data = store_data, description = df)

    # # sorting the projects by its similarity
    df = df[['計畫完整中文名稱']]
    df = df.to_dict('index')
    data = nar.util.combine_bert(df, data_path)
    combined_result = nar.util.combine_with_result(store_data, data)
    combined_result = nar.util.get_correct_vector(combined_result)
    label_similarity = nar.util.label_sim(combined_result, args.n_cluster)
    final_result = nar.util.sim(combined_result, label_similarity)