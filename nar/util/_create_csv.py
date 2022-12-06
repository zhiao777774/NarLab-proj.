import pickle
import nar.util
import argparse
import pandas as pd

def get_args():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        '--center',
        default='10',
        help='choose center.',
        type=int
    )
    parser.add_argument(
        '--whole',
        default=True,
        help='label all file',
        type=bool
    )
    parser.add_argument(
        '--total_label',
        default=-1,
        help='label all file',
        type=int
    )
    
    return parser.parse_args()

def get_data_for_store(center:str, original_data:dict, keys, trunc_len = 18):
    data = []
    for key in list(keys):
        original_data[key]['label'] = center
        data.append(original_data[key])
    data = pd.DataFrame(data)
    data = data.to_csv(index=False)
    data = data[trunc_len:]
    return data

if __name__=="__main__":
    args = get_args()
    args = args.__dict__
    if(args["total_label"] < 0 and args["whole"]):
        raise "total_label should be greater than 0"
    if(args["whole"]):
        df = pd.read_excel(f'{nar.util.XML_PATH}/0324_combine.xlsx')
        df = df[['年度', '計畫完整中文名稱']]
        df = df.to_dict('index')
        f = open(f'{nar.util.DATA_PATH}/result/result_0.pickle', 'rb')
        pred_result = pickle.load(f)
        f.close()
        store_data = get_data_for_store('0', df, pred_result.keys())
        for i in range(1, args["total_label"]):
            f = open(f'{nar.util.DATA_PATH}/result/result_{i}.pickle', 'rb')
            pred_result = pickle.load(f)
            f.close()
            store_data += get_data_for_store(str(i), df, pred_result.keys())
        print(store_data)
        f = open(f'{nar.util.XML_PATH}/labeled_data.csv', 'w')
        f.write('year,name,label\n')
        f.write(store_data)
        f.close()       
    else:
        f = open(f'{nar.util.DATA_PATH}/result_{args["center"]}.pickle', 'rb')
        pred_result = pickle.load(f)
        f.close()
        df = pd.read_excel(f'{nar.util.XML_PATH}/0324_combine.xlsx')
        df = df[['年度', '計畫完整中文名稱']]
        df = df.to_dict('index')
        store_data = get_data_for_store('10', df, pred_result.keys())
        # print(df)