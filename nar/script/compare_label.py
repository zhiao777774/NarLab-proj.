import pandas as pd
import nar.util
import argparse
import pickle
from collections import Counter

def get_args():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--topic',
        default='0',
        help='choose topic.',
        type=int
    )
    parser.add_argument(
        '--language',
        default='english',
        help='choose language.',
        type=str
    )
    return parser.parse_args()

def load_dataframe(topic, df):
    if args['topic'] == 0:
        df = df[df['主題1'].apply(lambda x : x == '電池')]
        # print(df['次主題1'])
        print(df['計畫重點描述'])
        # df = df[df['次主題1'].apply(lambda x : '釩液流電池' in x)]
    elif args['topic'] == 1:
        df = df[df['主題2'].apply(lambda x : x == '智慧農業')]
        # print(df['次主題2'])
        print(df['計畫重點描述'])
        # df = df[df['次主題2'].apply(lambda x : '人才培育' in x)]
    elif args['topic'] == 2:
        df = df[df['主題3'].apply(lambda x : x == '5G')]
        # print(df['次主題3'])
        print(df['計畫重點描述'])
        # df = df[df['次主題3'].apply(lambda x : '核心技術資安防護' in x)]
    elif args['topic'] == 3:
        df = df[df['主題4'].apply(lambda x : x == '精準醫療與精準健康')]
        print(df['計畫重點描述'])
    elif args['topic'] == 4:
        df = df[df['主題5'].apply(lambda x : x == '創新創業')]
        print(df['計畫重點描述'])
    elif args['topic'] == 5:
        df = df[df['主題6'].apply(lambda x : x == '再生能源')]
        print(df['計畫重點描述'])
    elif args['topic'] == 6:
        df = df[df['主題7'].apply(lambda x : x == '資安人培')]
        print(df['計畫重點描述'])
    elif args['topic'] == 7:
        df = df[df['主題8'].apply(lambda x : x == '數位經濟')]
        print(df['計畫重點描述'])
    else : 
        df = df[df['主題9'].apply(lambda x : x == '防疫科技')]
        print(df['計畫重點描述'])
    return df.to_dict('split')['index']

def find_cluster(label, index):
    tmp = []
    for i in index:
        if label[i]['label'] == 10:
            print(i)
        tmp.append(label[i]['label'])
    counted = Counter(tmp)
    print(counted)
    total_data = len(tmp)
    print(total_data)
    sum = 0
    print(len(Counter(tmp)))
    print(list(counted.keys()))

    return tmp

if __name__ == "__main__":
    args = get_args()
    args = args.__dict__
    df = pd.read_excel(f'{nar.util.DATA_PATH}/folder_nar/combined_data.xlsx')
    topic_index = load_dataframe(args['topic'], df)
    f = open(f'{nar.util.DATA_PATH}/xlsx_keyword_{args["language"]}.pickle', 'rb')
    label = pickle.load(f)
    f.close()
    find_cluster(label, topic_index)
