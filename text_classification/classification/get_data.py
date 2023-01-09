import pandas as pd
def get_data():
    df=pd.read_csv("data.csv")
    key_words=df['中文關鍵詞']
    sumary=df['計畫重點描述']
    df=df[["計畫完整中文名稱","新標籤"]]
    df=df.dropna()
    for i in range(len(df["計畫完整中文名稱"])):
        df["計畫完整中文名稱"][i]+="\n"+str(key_words[i])
        df["計畫完整中文名稱"][i]+="\n"+str(sumary[i])
    
    y=[]

    for line in df["新標籤"]:
        lines=line.split(";")
        for i in lines:
            if i not in y:
                y.append(i)
    for i in y:
        df[i]=[0 for j in range(len(df["新標籤"]))]

    for e,line in enumerate(df["新標籤"]):
        lines=line.split(";")
        for i in lines:
            df[i][e]=1

    from sklearn.model_selection import train_test_split
    df_train,df_dev=train_test_split(df,test_size=0.2,random_state=42)
    train_list=[]
    for i in range(len(df_train["新標籤"])):
        buff=[]
        buff.append(df_train[i:i+1].values[0][0])
        buff.append(df_train[i:i+1].values[0][2:].tolist())
        train_list.append(buff)
    train_df=pd.DataFrame(train_list)
    train_df.columns = ["text", "labels"]
    # Preparing eval data
    dev_list=[]
    for i in range(len(df_dev["新標籤"])):
        buff=[]
        buff.append(df_dev[i:i+1].values[0][0])
        buff.append(df_dev[i:i+1].values[0][2:].tolist())
        dev_list.append(buff)
    eval_df = pd.DataFrame(dev_list)
    eval_df.columns = ["text", "labels"]    
    
    return train_df,eval_df,dev_list,y    
