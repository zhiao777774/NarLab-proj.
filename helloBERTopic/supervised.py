import sys, os
import numpy as np
import pandas as pd
import heapq
from dataset import load_data, NARDataset
from halo import Halo
from bertopic import BERTopic
from ckiptagger import construct_dictionary, WS
from argparse import ArgumentParser
from utils import EXPORT_PATH, set_up, DATA_PATH
from termcolor import colored

sys.path.append(os.getcwd())
from nar.util import XML_PATH
from preprocessing import feature_mapping



def main(data_df):

    label = ["AI、雲端、巨量資料", "虛擬實境", "人才補助與延攬", "工研院與A+", "中小(堅)企業輔導", "化工材料與循環經濟", "能源", "太空/衛星", 
            "文化", "水資源管理", "生技醫藥與精準醫療", "產業人才培育", "自動駕駛", "災害防救", "物聯網", "網路通訊/4G/5G/5G+/6G", "防疫", 
            "創新創業", "資安", "長照與社會福利", "政策規劃與推動", "科研計畫補助", "科研設施", "晶片半導體", "海洋科技", "食品安全與食品科技", 
            "校園人才培育", "氣候變遷與減碳", "農業", "國家標準檢驗", "國防", "專利與智財", "設計", "智慧交通", "智慧農業", "電商與物流", 
            "智慧製造", "智慧醫療", "智慧顯示器", "傳統產業高值化", "運輸載具", "園區管理", "農業生技", "運動科技", "數位內容", "數位學習", 
            "數位轉型與智慧政府", "環境監測與污染防治", "職安", "警政與法務"]

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


    spinner = Halo(text='Tokenizing with CKIP-Tagger', spinner='dots')    
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


    # 各 Topic TF-IDF 關鍵字直方圖
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
    bar_fig.write_html(f"{XML_PATH}/bar_fig.html")
    topic_fig.write_html(f"{XML_PATH}/topic_fig.html")
    tot_fig.write_html(f"{XML_PATH}/tot_fig.html")



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
    