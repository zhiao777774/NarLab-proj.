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

    class_name = find_class(data)
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
        wordcloud.to_file(args.wordcloud + '1.png')

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