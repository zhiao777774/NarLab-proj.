import json
import pandas as pd
import nar.util
import argparse


def statistic(data, total):
    data = data.to_dict("index")

    count = {x : [0 for z in range(111 - 103)] for x in range(total)}
    for key in data.keys():
        for i in range(total):
            if data[key]['label'] == i:
                count[i][data[key]['year'] - 103] += 1        
        
    return count

def statistic_string(data, total):
    if total == 20:
        labels = {'時尚設計及國際商業服務': 8, '防疫科技': 12, '奈米晶片與元件工程': 13, '化工與機械工業製造': 4, '醫療及食安': 5, '水力與地質資源': 16, '智慧財產與專利檢索': 17, '地球科學與自然資源': 3, '人文及校園研究發展': 2, '創新創業': 14, '雲端、AI、大數據': 18, '資安人培與數位經濟': 1, '精準醫療與精準健康': 9, '跨領域多媒體與智慧技術整合': 19, '化學及環境污染': 10, '5G': 7, '健保長照與社會福利': 15, '能源': 0, '航太科技及交通運輸(含自駕車)': 11, '智慧農業': 6}
    else:
        labels = {'資訊與資料風險': 25, '生物多樣性漁業': 19, '資訊產品及效能': 17, '智慧平台產品': 18, '地下水資源': 16, '放射性輻射及廢棄物': 27, '太空衛星': 26, '綠色材料環境': 20, '生物疫苗國家': 5, '藥物毒品': 13, '行動通訊網路': 4, '科技政策': 11, '氣象資訊': 22, '生技疾病生醫': 1, '智慧國際材料': 6, '科學領域': 24, '綠能能源': 12, '資料建築地震': 7, '資訊防護': 23, '奈米及輻射': 10, '農產品': 28, '電子商務物流': 21, '科技國際文化': 9, '智慧國際產業': 29, '機械產品工業': 0, '環境資料高齡': 3, '交通領域': 15, '軟體資訊網路': 2, '服務業商業': 8, '國際園區廠商': 14}
    
    data = data.to_dict("index")

    count = {x : [0 for z in range(111 - 103)] for x in range(total)}
    for key in data.keys():
        for i in range(total):
            if labels[data[key]['label']] == i:
                count[i][data[key]['year'] - 103] += 1        
        
    return count
if __name__=="__main__":
    data_10 = pd.read_csv(f'{nar.util.XML_PATH}/final10.csv')
    data_20 = pd.read_csv(f'{nar.util.XML_PATH}/final20.csv')
    data_30 = pd.read_csv(f'{nar.util.XML_PATH}/final30.csv')
    data_40 = pd.read_csv(f'{nar.util.XML_PATH}/final40.csv')
    data_50 = pd.read_csv(f'{nar.util.XML_PATH}/final50.csv')

    ans = {a * 10 : 0 for a in range(1, 6)}
    ans[10] = statistic(data_10, 10)
    ans[20] = statistic_string(data_20, 20)
    ans[30] = statistic_string(data_30, 30)
    ans[40] = statistic(data_40, 40)
    ans[50] = statistic(data_50, 50)

    print(ans)
    f = open(f'{nar.util.XML_PATH}/statistic.json', 'w')
    json.dump(ans, f)