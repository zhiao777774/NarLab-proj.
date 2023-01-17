import os
import pandas as pd
from ckiptagger import WS, POS
from sklearn.feature_extraction.text import TfidfVectorizer
import re
import json

os.environ["CUDA_VISIBLE_DEVICES"] = '0'

ws = WS('./tfidf/data', disable_cuda=False)
pos = POS('./tfidf/data', disable_cuda=False)
needed = ['Na', 'Nb', 'Nv']


def find_noun(seg_list, pos_list):
    assert len(seg_list) == len(pos_list)
    tmp = ''

    for s, p in zip(seg_list, pos_list):
        if p in needed:
            tmp += s+' '

    return tmp

        
data = pd.read_excel('./data/folder_nar/103-110_full.xlsx')
clean_seg = []

# 3152
for i in range(3152):
    if type(data.iloc[i]['計畫重點描述']) == str:
        sen = data.iloc[i]['計畫重點描述'].replace('_x000D_', '\n')
    sen = sen.split('\n')
    seg_list = ws(sen)
    pos_list = pos(seg_list)
    tmp = ''
    
    for s, p in zip(seg_list, pos_list):
        if find_noun(s, p) != '':
            tmp += find_noun(s, p)
            
    clean_seg.append(tmp)

vec = TfidfVectorizer(smooth_idf=True)
score = vec.fit_transform(clean_seg)
result = pd.DataFrame(score.toarray(), columns=vec.get_feature_names_out())

keywords = []
eng_keywords = []

for i in range(3152):
    tmp = []

    for j in range(len(result.iloc[i])):
        if result.iloc[i][j] > 0.1:
            tmp.append(result.iloc[i].index[j])
    
    keywords.append(tmp)

eng = re.compile(r'[0-9A-Za-z_&²/]+')
num = re.compile(r'^\d+$')

for i in range(3152):
    if type(data.iloc[i]['計畫重點描述']) == str:
        tmp = eng.findall(data.iloc[i]['計畫重點描述'].replace('_x000D_', '\n'))
        number = []

        for t in tmp:
            if re.match(num, t):
                number.append(t)
        
        tmp = [x for x in tmp if x not in number]
        eng_keywords.append(tmp)

all = []

for i in range(3152):
    d = dict()
    d['code'] = data.iloc[i]['系統編號']
    d['name'] = data.iloc[i]['計畫完整中文名稱']
    d['tfidf'] = {'EN': eng_keywords[i], 'CH': keywords[i]}

    all.append(d)

f = open('./data/folder_nar/tfidf.json', 'w', encoding='utf8')
json.dump(all, f, indent=4, ensure_ascii=False)
f.close()