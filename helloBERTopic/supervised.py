import sys, os
import numpy as np
import pandas as pd
import heapq
from dataset import load_data
from utils import DATA_PATH, EXPORT_PATH
from bertopic import BERTopic
from halo import Halo
from ckiptagger import construct_dictionary, WS
from argparse import ArgumentParser

sys.path.append(os.getcwd())
from nar.util import XML_PATH
from preprocessing import feature_mapping

def isNaN(string):
    return string != string

def find_class(data_df):
    class_name = []

    for idx, row in data_df.iterrows():
        if isNaN(row['category']) is False:
            classes = row['category'].split(';')

            for c in classes:
                if c not in class_name:
                    class_name.append(c)

    return class_name

def main(data_df):

    label = find_class(data_df)
    total_X, y, timestamps, y_name = load_data(data_df, one_class=True)
    total_y = np.array(y)

    ws = WS(str(DATA_PATH))

    # 取出斷詞關鍵字
    keysfile = DATA_PATH / "keys_v2.txt"
    with open(keysfile) as file:
        lines = file.read().splitlines() 

    # 建立使用者字典 (幫助斷詞出關鍵字)
    keydict = { l: 1 for l in lines}
    dictionary = construct_dictionary(keydict)


    spinner = Halo(text='Tokenizing', spinner='dots')    
    spinner.start()

    # 開始斷詞
    word_sentence_list = ws(
        total_X,
        sentence_segmentation = True,
        segment_delimiter_set = {",", "。", ":", "?", "!", ";", "、", "！", "？", "：", "，", "；", "‧", " ", "(", ")"},
        recommend_dictionary = dictionary # 加入斷詞字典
    )

    spinner.stop()
    #print(word_sentence_list)

    # 轉換為BERTopic 可接受格式
    ws = [ " ".join(w) for w in word_sentence_list]
    #print(colored(f"BERTopics Input Showcase: \n [ { ws[0] }]", 'blue'))


    topic_model = BERTopic(language = 'chinese (traditional)', verbose=True, nr_topics=51)
    topics, _ = topic_model.fit_transform(ws, y=total_y)

    topics_over_time = topic_model.topics_over_time(ws, timestamps, nr_bins=20)


    temp = []
    for i in range(0, 50):
        temp.append([])

    #各標籤可能屬於的topic(計算相似度)
    for i in range(0, 50):
        if (label[i] == '資安'):
            label[i] == '機密資訊安全'
        elif(label[i] == '職安'):
            label[i] = '職業安全'

        similar_topics, similarity = topic_model.find_topics(label[i], top_n=10)
        for j in range(len(similar_topics)):
            if (similar_topics[j] == -1):
                continue
            temp[similar_topics[j]].append([similarity[j], label[i]])


    #配對各topic最適合的前3個標籤
    custom_dict = {}
    lst = []
    for i in range (0, 50):
        tmp = ""
        max = heapq.nlargest(3, temp[i])
        lst.append(max)
        for j in range(0, len(max)):
            if j == 0:
                tmp = max[j][1]
            else:
                tmp = tmp + " // " + max[j][1]
        custom_dict.update({i:tmp})


    # 各topic最適合的前三個標籤
    # title = ["1st", "2nd", "3rd"]
    # record = pd.DataFrame(columns=title, data=lst)
    # record.to_csv(EXPORT_PATH / "record.csv")

    topic_model.set_topic_labels(custom_dict)

    bar_fig = topic_model.visualize_barchart(
        top_n_topics=50,
        width=400,
        custom_labels=True
    )

    # 各 Topic 向量分佈圖
    topic_fig = topic_model.visualize_topics(
        top_n_topics=50,
        width=1000, 
        height=600,
        custom_labels=True
    )

    # 各 Topic 向量分佈圖
    tot_fig = topic_model.visualize_topics_over_time(
        topics_over_time,
        top_n_topics=50, 
        width=1000,
        custom_labels=True
    )

    # 儲存成 html 檔案，供前端展示使用
    bar_fig.write_html("./pea-sys/public/bar_fig.html")
    topic_fig.write_html("./pea-sys/public/topic_fig.html")
    tot_fig.write_html("./pea-sys/public/tot_fig.html")


if __name__ == '__main__':
    
    parser = ArgumentParser()

    parser.add_argument('--data',
                        default= XML_PATH + "/103-110_full.xlsx",
                        type=str,
                        dest='data',
                        help='path to data')

    args = parser.parse_args()
    
    data_df = pd.read_excel(args.data, dtype=str)
    data_df = feature_mapping(data_df)
    
    main(data_df)
    