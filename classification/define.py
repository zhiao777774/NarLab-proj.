import pandas as pd
import sys 
import os
sys.path.append(os.getcwd()) 
from preprocessing import feature_mapping
os.environ['CUDA_LAUNCH_BLOCKING']='1'
def get_data(file):
    df=pd.read_excel(file)
    df=feature_mapping(df)
    key_words=df['chineseKeyword']
    sumary=df['description']
    year=df['startDate']
    num=df["code"]
    # dic=dict(zip(df["name"],df["code"]))
    
    df=df[["name","category"]]
    
    
    df=df.dropna()
    for i in range(len(df["name"])):
        df["name"][i]+="\n"+num[i]
        df["name"][i]+="\n"+str(key_words[i])
        df["name"][i]+="\n"+str(sumary[i])
    dic=dict(zip(df["name"],num))
    y=[]

    for line in df["category"]:
        lines=line.split(";")
        for i in lines:
            if i not in y:
                y.append(i)
    for i in y:
        df[i]=[0 for j in range(len(df["category"]))]

    for e,line in enumerate(df["category"]):
        lines=line.split(";")
        for i in lines:
            df[i][e]=1

    from sklearn.model_selection import train_test_split
    df_train,df_dev=train_test_split(df,test_size=0.2,random_state=42)
    df_train,df_val=train_test_split(df_train,test_size=0.1,random_state=42)
    
    train_list=[]
    for i in range(len(df_train["category"])):
        buff=[]
        buff.append(df_train[i:i+1].values[0][0])
        
        buff.append(df_train[i:i+1].values[0][2:].tolist())
        
        train_list.append(buff)
    train_df=pd.DataFrame(train_list)
    train_df.columns = ["text", "labels"]
    val_list=[]
    for i in range(len(df_val["category"])):
        buff=[]
        buff.append(df_val[i:i+1].values[0][0])
        buff.append(df_val[i:i+1].values[0][2:].tolist())
        val_list.append(buff)
    val_df = pd.DataFrame(val_list)
    val_df.columns = ["text", "labels"]    
    # Preparing eval data
    dev_list=[]
    for i in range(len(df_dev["category"])):
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

def get_text(df):
    
    df=feature_mapping(df)
    key_words=df['chineseKeyword']
    sumary=df['description']
    year=df['startDate']
    num=df["code"]
    # dic=dict(zip(df["name"],df["code"]))
    df=df["name"]
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
    pred_res=[]
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

        pred_res.append({        
            'code': dic[x_test[e]],
            'name': text,
            'category': '',
            'predictCategoryTop5': pred5,
            'predictProbabilityTop5': raw5
        })

    return pred_res
