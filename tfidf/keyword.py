import os
import pandas as pd
import time
from ckiptagger import WS, POS
from sklearn.feature_extraction.text import TfidfVectorizer
import re
import json
from argparse import ArgumentParser

os.environ["CUDA_VISIBLE_DEVICES"] = '0'

ws = WS('./tfidf/data', disable_cuda=False)
pos = POS('./tfidf/data', disable_cuda=False)
needed = ['Na', 'Nb', 'Nv']

def isNaN(string):
    return string != string

def find_noun(seg_list, pos_list):
    assert len(seg_list) == len(pos_list)
    tmp = ''

    for s, p in zip(seg_list, pos_list):
        if p in needed:
            tmp += s+' '

    return tmp

def main(data):
    clean_seg = []
    
    # ch keywords
    start = time.time()

    for idx, row in data.iterrows():
        if isNaN(row['系統編號']) == False:
            if type(row['計畫重點描述']) == str:
                sen = row['計畫重點描述'].replace('_x000D_', '\n')
                sen = sen.split('\n')
            
                seg_list = ws(sen)
                pos_list = pos(seg_list)
                tmp = ''
        
                for s, p in zip(seg_list, pos_list):
                    if find_noun(s, p) != '':
                        tmp += find_noun(s, p)
                        
                clean_seg.append(tmp)

    end = time.time()
    print(f'pos tagging and tokenization: {end-start} s')


    # tfidf
    start = time.time()

    vec = TfidfVectorizer(smooth_idf=True)
    score = vec.fit_transform(clean_seg)
    result = pd.DataFrame(score.toarray(), columns=vec.get_feature_names_out())

    keywords = []
    eng_keywords = []
    black_list = ['產業', '應用', '平台', '業者', '資料', '領域', '成果', '檢查', '會議', '研究', '議題', '人員', '成效',
                '政府', '團隊', '系統', '技術', '計畫', '任務', '事件', '用戶', '研討會', '法人', '貢獻', '單位', '行為',
                '國家', '標準', '廠商', '大型', '設施', '產出', '執行', '計畫書', '經費', '項目', '發展', '分工', '效益',
                '需要', '方面', '成果', '用戶']

    for idx, row in result.iterrows():
        tmp = []

        for j in range(len(row)):
            if (row[j] > 0.1) and (row.index[j] not in black_list):
                tmp.append(row.index[j])
        
        keywords.append(tmp)

    end = time.time()
    print(f'tfidf: {end-start} s')


    # eng keywords
    start = time.time()

    eng = re.compile(r'[0-9A-Za-z_&²/]+')
    other = re.compile(r'^[0-9_&²/]+$')

    for idx, row in data.iterrows():
        if isNaN(row['系統編號']) == False:
            if type(row['計畫重點描述']) == str:
                tmp = eng.findall(row['計畫重點描述'].replace('_x000D_', '\n'))
                others = []
                final1 = []
                final2 = []

                for t in tmp:
                    if re.match(other, t):
                        others.append(t)

                final1 = [x for x in tmp if x not in others]

                for x in final1:
                    if x not in final2:
                        final2.append(x)

                eng_keywords.append(final2)

    end = time.time()
    print(f'eng keywords: {end-start} s')


    # write json
    all = []

    for idx, row in data.iterrows():
        if isNaN(row['系統編號']) == False:
            d = dict()
            d['code'] = row['系統編號']
            d['name'] = row['計畫完整中文名稱']
            d['data'] = {'EN': eng_keywords[idx], 'CH': keywords[idx]}

            all.append(d)

    return all


if __name__ == '__main__':
    parser = ArgumentParser()

    parser.add_argument('--data',
                        default='./data/folder_nar/103-110_full.xlsx',
                        type=str,
                        dest='data',
                        help='path to data')
    
    args = parser.parse_args()
    data = pd.read_excel(args.data)
    main(data)