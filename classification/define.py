import pandas as pd
def get_data(file):
    df=pd.read_excel(file)
    key_words=df['中文關鍵詞']
    sumary=df['計畫重點描述']
    year=df['年度']
    num=df["系統編號"]
    # dic=dict(zip(df["計畫完整中文名稱"],df["系統編號"]))
    df=df[["計畫完整中文名稱","新標籤"]]
    df=df.dropna()
    for i in range(len(df["計畫完整中文名稱"])):
        df["計畫完整中文名稱"][i]+="\n"+num[i]
        df["計畫完整中文名稱"][i]+="\n"+str(key_words[i])
        df["計畫完整中文名稱"][i]+="\n"+str(sumary[i])
    dic=dict(zip(df["計畫完整中文名稱"],num))
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
    df_train,df_val=train_test_split(df_train,test_size=0.1,random_state=42)
    
    train_list=[]
    for i in range(len(df_train["新標籤"])):
        buff=[]
        buff.append(df_train[i:i+1].values[0][0])
        buff.append(df_train[i:i+1].values[0][2:].tolist())
        train_list.append(buff)
    train_df=pd.DataFrame(train_list)
    train_df.columns = ["text", "labels"]
    val_list=[]
    for i in range(len(df_val["新標籤"])):
        buff=[]
        buff.append(df_val[i:i+1].values[0][0])
        buff.append(df_val[i:i+1].values[0][2:].tolist())
        val_list.append(buff)
    val_df = pd.DataFrame(val_list)
    val_df.columns = ["text", "labels"]    
    # Preparing eval data
    dev_list=[]
    for i in range(len(df_dev["新標籤"])):
        buff=[]
        buff.append(df_dev[i:i+1].values[0][0])
        buff.append(df_dev[i:i+1].values[0][2:].tolist())
        dev_list.append(buff)
    eval_df = pd.DataFrame(dev_list)
    eval_df.columns = ["text", "labels"]    
    
    return train_df,val_df,eval_df,dev_list,train_list,val_list,y,dic    

def output_file(fo,model,list,num_dic,y):
    x_test=[i[0] for i in list]
    y_test=[i[1] for i in list]
    dir_test={x_test[i]: y_test[i] for i in range(len(x_test))}
    predictions, raw_outputs = model.predict(x_test)
    pred_list=[]
    for e,i in enumerate(predictions):
        prob=[str(raw_outputs[e][k].round(3)) for k, l in enumerate(i) if l==1]
        predicted=[y[k] for k, l in enumerate(i) if l==1]
        pred_list.append(i)
        true=[y[k] for k, l in enumerate(y_test[e]) if l==1]
        text=x_test[e].split('\n')[0]
        
        raw=raw_outputs[e]
        d=dict(zip([y[k] for k,_ in enumerate(i)],[k for k in raw]))
        d=dict(sorted(d.items(), key=lambda x:x[1],reverse=True))
        
        pred5=[k for k in d][:5]
        raw5=[str(d[k].round(3)) for k in d][:5]
        fo.write(f"{num_dic[x_test[e]]},{text},{';'.join(true)},{';'.join(predicted)},{';'.join(prob)},{';'.join(pred5)},{';'.join(raw5)}\n")
    return pred_list,y_test,predictions,raw_outputs

def get_text(file):
    df=pd.read_excel(file)
    key_words=df['中文關鍵詞']
    sumary=df['計畫重點描述']
    year=df['年度']
    num=df["系統編號"]
    # dic=dict(zip(df["計畫完整中文名稱"],df["系統編號"]))
    df=df["計畫完整中文名稱"]
    df=df.dropna()
    for i in range(len(df)):
        
        df[i]+="\n"+str(num[i])
        df[i]+="\n"+str(key_words[i])
        df[i]+="\n"+str(sumary[i])
        df[i]=str(df[i])
    dic=dict(zip(df,num))
    return df,dic

def output_pred(file,x_test,dic,y,model=None):
    x_test=[str(i) for i in x_test]
    fo=open(file,"w",encoding='utf_8_sig')
    fo.write("計劃編號,計劃名稱,Predict Label,Predict Probability,First 5 Label,First 5 Probability\n") 
    
    predictions, raw_outputs = model.predict(x_test)
    pred_list=[]
    for e,i in enumerate(predictions):
        prob=[str(raw_outputs[e][k].round(3)) for k, l in enumerate(i) if l==1]
        predicted=[y[k] for k, l in enumerate(i) if l==1]
        pred_list.append(i)
        
        text=x_test[e].split('\n')[0]
        
        raw=raw_outputs[e]
        d=dict(zip([y[k] for k,_ in enumerate(i)],[k for k in raw]))
        d=dict(sorted(d.items(), key=lambda x:x[1],reverse=True))
        
        pred5=[k for k in d][:5]
        raw5=[str(d[k].round(3)) for k in d][:5]
        fo.write(f"{dic[x_test[e]]},{text},{';'.join(predicted)},{';'.join(prob)},{';'.join(pred5)},{';'.join(raw5)}\n")