import pickle
import nar.util
from collections import Counter
import argparse
def get_args():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        '--center',
        default='10',
        help='choose center.',
        type=int
    )
    parser.add_argument(
        '--threshold',
        default='20',
        help='choose center.',
        type=int
    )
    parser.add_argument(
        '--label',
        default='10',
        help='choose center.',
        type=int
    )
    parser.add_argument(
        '--whole',
        default=False,
        help='infer whole dataset',
        type=bool
    )
    return parser.parse_args()

if __name__=="__main__":
    tf_result = []
    args = get_args()
    args = args.__dict__
    tf_list = []
    keyword_list = []
    if args['whole']:
        for i in range(args['label']):
            word_set = []
            f = open(f'{nar.util.DATA_PATH}/result_{i}.pickle', 'rb')
            result = pickle.load(f)
            f.close()
            for value in result.values():
                # word_set += value['chinese_description_tag'][0]
                word_set += list(set(value['chinese_description_tag'][0]))    
            tf_list.append(word_set)
        for itr1 in range(args['label']):
            tmp = []
            for itr2 in range(args['label']):
                if itr1 != itr2:
                    tmp += tf_list[itr2]
            keyword_list.append(list(set(tf_list[itr1]) - set(tmp)))
        for itr1 in range(args['label']):
            print(f'label {itr1} : {keyword_list[itr1]}')
            print('-' * 70 + '\n')
    else :
        word_set = []
        f = open(f'{nar.util.DATA_PATH}/result_{args["center"]}.pickle', 'rb')
        result = pickle.load(f)
        f.close()
        outcome = []
        tag = []
        for key in result.keys():
            # for data in list(result[key]['chinese_description_tag'][0]):
            #     tag.append(data[2])
            #     if data[2] == 'FAC' or data[2] == 'WORK_OF_ART' or data[2] == 'PRODUCT' or data[2] == 'LAW' or data[2] == 'EVENT':
            #         outcome.append(data[3])
            #         print(data[3])
                print(key)
        print(set(tag))
        print(' ,'.join(set(outcome)))
        for value in result.values():
            # word_set += value['chinese_description_tag'][0]
            word_set += list(set(value['chinese_description_tag'][0]))  
        tf = Counter(word_set)
        sorted_tf = sorted(tf)
        for word in sorted_tf:
            if tf[word] > args["threshold"]:
                tf_result.append(word)
        print(tf_result)