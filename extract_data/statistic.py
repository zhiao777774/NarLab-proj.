import re
import nar.util
import pickle
import numpy as np
from tqdm import tqdm
if __name__=="__main__":
    f = open(f'{nar.util.DATA_PATH}/data_dict.pickle', 'rb')
    data_dict = pickle.load(f)
    f.close()
    TAG = 'chinese_keyword_tag'
    count = []
    non_null_data = 0
    null_data = 0
    too_big = 0
    min = 100
    max = 0
    for key in data_dict.keys():
        if len(data_dict[key][TAG]) > 0:
            count.append(len(data_dict[key][TAG]))
            non_null_data += 1
            if len(data_dict[key][TAG]) > max :
                max = len(data_dict[key][TAG])
            if len(data_dict[key][TAG]) < min :
                min = len(data_dict[key][TAG])
            if len(data_dict[key][TAG]) > 512 :
                too_big += 1
        else:
            null_data += 1

    # print(count)
    count = np.array(count)
    print('||value|')
    print('|-|-|')
    print(f'|標準差|{np.std(count)}|')
    print(f'|平均長度|{np.mean(count)}|')
    print(f'|最小長度|{min}|')
    print(f'|最大長度|{max}|')
    print(f'|空值數量|{null_data}|')
    print(f'|非空值數量|{non_null_data}|')
    print(f'|長度大於512|{too_big}|')
    # print(count / non_null_data)
    # print(len(data_dict.keys()) - non_null_data)
    # f = open(f'{nar.util.DATA_PATH}/data_dict.pickle', 'wb')
        # tmp = data_id_extracter.findall(data)[0]
        # data_dict[tmp] = data
    # pickle.dump(data_dict, f)
    # print(data_dict['46392'])


