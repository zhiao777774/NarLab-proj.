import pandas as pd
import math
import re
from collections import Counter
def get_similarity():
    WORD = re.compile(r"\w+")
    def get_cosine(vec1, vec2):
        vec1=text_to_vector(vec1)
        vec2=text_to_vector(vec2)
        intersection = set(vec1.keys()) & set(vec2.keys())
        numerator = sum([vec1[x] * vec2[x] for x in intersection])
        

        sum1 = sum([vec1[x] ** 2 for x in list(vec1.keys())])
        sum2 = sum([vec2[x] ** 2 for x in list(vec2.keys())])
        denominator = math.sqrt(sum1) * math.sqrt(sum2)
        if not denominator:
            return 0.0
        else:
            return float(numerator) / denominator

    def text_to_vector(text):
        words = WORD.findall(text)
        return Counter(words)

    df_true=pd.read_csv("data.csv")

    dic_true={}
    for i in range(len(df_true["新標籤"])):
        dic_true[df_true["計畫完整中文名稱"][i]]=df_true["新標籤"][i]

    from collections import defaultdict
    dic_predict=defaultdict(list)

    df_predict=pd.read_csv("output.csv")

    for i in range(len(df_predict["計劃名稱"])):
        dic_predict[df_predict["計劃名稱"][i]].append(df_predict["標籤"][i])
        
    for i in dic_predict:
        try:
            dic_predict[i].append(dic_true[i])
        except:
            pass
    similarity=[]
    
   
    for i in dic_predict:
        if len(dic_predict[i])==2:
            similarity.append(dic_predict[i])
    s=[]        
    for slist in similarity:
        if  slist[0].split(";")[1]!="":
            s.append(slist)
    return s    
    
