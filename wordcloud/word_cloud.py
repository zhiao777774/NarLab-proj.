import pandas as pd
import json
import time
from wordcloud import WordCloud, STOPWORDS
from argparse import ArgumentParser

import sys, os
sys.path.append(os.getcwd())
from preprocessing import feature_mapping
        
def isNaN(string):
    return string != string

def find_class(data):
    class_name = []

    for idx, row in data.iterrows():
        if isNaN(row['category']) is False:
            classes = row['category'].split(';')

            for c in classes:
                if c not in class_name:
                    class_name.append(c)

    return class_name

def main(data, tfidf, wc):
    start = time.time()

    # class_name = find_class(data)
    class_name =  [
        'AI、雲端、巨量資料',
        '虛擬實境',
        '人才補助與延攬',
        '工研院與A+',
        '中小（堅）企業輔導',
        '化工材料與循環經濟',
        '能源',
        '太空/衛星',
        '太空/衛星',
        '文化',
        '水資源管理',
        '生技醫藥與精準醫療',
        '產業人才培育',
        '自動駕駛',
        '災害防救',
        '物聯網',
        '網路通訊/4G/5G/5G+/6G',
        '防疫',
        '創新創業',
        '資安',
        '長照與社會福利',
        '政策規劃與推動',
        '科研計畫補助',
        '科研設施',
        '晶片半導體',
        '海洋科技',
        '食品安全與食品科技',
        '校園人才培育',
        '氣候變遷與減碳',
        '農業',
        '國家標準檢驗',
        '國防',
        '專利與智財',
        '設計',
        '智慧交通',
        '智慧農業',
        '電商與物流',
        '智慧製造',
        '智慧醫療',
        '智慧顯示器',
        '傳統產業高值化',
        '運輸載具',
        '園區管理',
        '農業生技',
        '運動科技',
        '數位內容',
        '數位學習',
        '數位轉型與智慧政府',
        '環境監測與污染防治',
        '職安',
        '警政與法務'
    ]
    font = './wordcloud/NotoSansTC-Regular.otf'
    i = 0

    for c in class_name:
        tfidf_str = ''
        
        for idx, row in data.iterrows():
            if isNaN(row['code']) == False:
                if row['category'] == c:
                    for t in tfidf:
                        if t['code'] == row['code']:
                            for ch in t['data']['CH']:                   
                                tfidf_str += ch + ' '

        if tfidf_str != '':
            print(c)
            wordcloud = WordCloud(background_color='white', contour_width=1, contour_color='steelblue', font_path=font).generate(tfidf_str)
            wordcloud.to_file(wc + str(i) + '.png')
        
        i += 1

    # use the code below if no data is in a specific class
    tfidf_str = ''

    for idx, row in data.iterrows():
        if isNaN(row['code']) == False:
            if isinstance(row['chineseKeyword'], str):
                if '虛擬實境' in row['chineseKeyword']:
                    for t in tfidf:
                        if t['code'] == row['code']:
                            for ch in t['data']['CH']:                   
                                tfidf_str += ch + ' '

    if tfidf_str != '':
        wordcloud = WordCloud(background_color='white', contour_width=1, contour_color='steelblue', font_path=font).generate(tfidf_str)
        wordcloud.to_file(wc + '1.png')

    end = time.time()
    print(f'wordcloud: {end-start} s')


if __name__ == '__main__':
    parser = ArgumentParser()

    parser.add_argument('--data',
                        default='./data/folder_nar/103-110_full.xlsx',
                        type=str,
                        dest='data',
                        help='path to data')
    parser.add_argument('--tfidf',
                        default='./data/folder_nar/tfidf.json',
                        type=str,
                        dest='tfidf',
                        help='path to tfidf json file')
    parser.add_argument('--wordcloud',
                        default='./pea-sys/src/data/wordcloud/',
                        type=str,
                        dest='wordcloud',
                        help='path to save wordcloud images')
    
    args = parser.parse_args()
    data = pd.read_excel(args.data)
    data = feature_mapping(data)
    with open(args.tfidf, 'r') as f:
        tfidf = json.load(f)
    
    main(data, tfidf, args.wordcloud)
