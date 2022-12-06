import pickle
import nar.util
import argparse
from ckiptagger import data_utils, construct_dictionary, WS, NER, POS
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
        '--center',
        default=0,
        help='tokenized data.',
        type=int
    )
    parser.add_argument(
        '--whole',
        default=False,
        help='infer whole dataset',
        type=bool
    )
    return parser.parse_args()

def infer(labeled_data, original_data, language, center = 0):
    count = 0
    max_len = 500
    pbar = tqdm(total=max_len)
    print(len(labeled_data))
    # ws = WS("./data", disable_cuda=False)
    # pos = POS("./data", disable_cuda=False)
    # ner = NER("./data", disable_cuda=False)
    tmp = {}
    for key, data in labeled_data.items():
        if data['label'] == center and len(original_data[key][f'{language}_description_tag']) > 50 and count < max_len:
            tmp[key] = {}
            # tmp[key][f'{language}_description_tag'] = ws([original_data[key][f'{language}_description_tag']])
            # word_sentence_list = ws([original_data[key][f'{language}_description_tag']])
            # pos_sentence_list = pos(word_sentence_list)
            # tmp[key][f'{language}_description_tag'] = ner(word_sentence_list, pos_sentence_list)
            tmp[key][f'{language}_description_tag'] = original_data[key][f'{language}_description_tag']
            # print(original_data[key][f'{language}_description_tag'])
            # print('-' * 30)
            count += 1
            pbar.update(1)
    f = open(f'{nar.util.DATA_PATH}/result_{center}.pickle', 'wb')
    pickle.dump(tmp,f)
    f.close()
    return labeled_data

# def delete_not_need(labeled_data):
#     tmp = {}
#     for key in labeled_data.keys():
#         tmp[key] = {}
#         tmp[key]['label'] = labeled_data[key]['label']

#     return tmp

if __name__ =="__main__":
    # data_utils.download_data_gdown("./")
    args = get_args()
    args = args.__dict__
    # xml dataset
    # f = open(f'{nar.util.DATA_PATH}/kmean_reduce_keyword_{args["language"]}.pickle', 'rb')

    # excel dataset
    f = open(f'{nar.util.DATA_PATH}/xlsx_description_{args["language"]}.pickle', 'rb')
    labeled = pickle.load(f)
    f.close()
    
    max_label = len(set([x['label'] for x in labeled.values()]))
    print(max_label)
    # xml dataset
    # f = open(f'{nar.util.DATA_PATH}/data_dict.pickle', 'rb')

    # excel dataset
    f = open(f'{nar.util.DATA_PATH}/xlsx_data_{args["language"]}.pickle', 'rb')
    origin = pickle.load(f)
    f.close()
    print('start infer')
    if args['whole']:
        for i in range(max_label):
            infer(labeled, origin, args["language"], center = i)
    else:
        infer(labeled, origin, args["language"], center = args["center"])


