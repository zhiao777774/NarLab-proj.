import pickle
import nar.util
import argparse
import os

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
    tmp = {}
    for key, data in labeled_data.items():
        if data['label'] == center and len(original_data[key][f'{language}_description_tag']) > 50 and count < max_len:
            tmp[key] = {}
            tmp[key][f'{language}_description_tag'] = original_data[key][f'{language}_description_tag']
            count += 1
    try : 
        f = open(f'{nar.util.DATA_PATH}/result/result_{center}.pickle', 'wb')
    except:
        os.mkdir(f'{nar.util.DATA_PATH}/result')
        f = open(f'{nar.util.DATA_PATH}/result/result_{center}.pickle', 'wb')
    pickle.dump(tmp,f)
    f.close()
    return labeled_data

if __name__ =="__main__":
    args = get_args()
    # xml dataset
    # f = open(f'{nar.util.DATA_PATH}/kmean_reduce_keyword_{args["language"]}.pickle', 'rb')

    # excel dataset(get from _clustering.py)
    f = open(f'{nar.util.DATA_PATH}/xlsx_description_{args.language}.pickle', 'rb')
    labeled = pickle.load(f)
    f.close()
    
    max_label = len(set([x['label'] for x in labeled.values()]))
    print(max_label)
    # xml dataset
    # f = open(f'{nar.util.DATA_PATH}/data_dict.pickle', 'rb')

    # excel dataset
    f = open(f'{nar.util.DATA_PATH}/xlsx_data_{args.language}.pickle', 'rb')
    origin = pickle.load(f)
    f.close()
    print('start infer')
    if args['whole']:
        for i in range(max_label):
            infer(labeled, origin, args.language, center = i)
    else:
        infer(labeled, origin, args.language, center = args.center)


