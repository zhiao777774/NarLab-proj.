from simpletransformers.classification import MultiLabelClassificationModel, MultiLabelClassificationArgs
from define import get_data,output_file
import logging
import torch
import numpy as np

from sklearn.metrics import accuracy_score,f1_score
from sklearn.model_selection import KFold
import pandas as pd
import argparse
logging.basicConfig(level=logging.INFO)
transformers_logger = logging.getLogger("transformers")
transformers_logger.setLevel(logging.WARNING)
cuda_available=torch.cuda.is_available()
NUM_EPOCH=20
finetune_name='bert-base-chinese'
model_name=f"model_{finetune_name}_{NUM_EPOCH}"

parser = argparse.ArgumentParser(description='Argument for test')
parser.add_argument('--test_file', type=str, default = 'data.xlsx')
parser.add_argument('--model_name', type=str, default=model_name)

args = parser.parse_args()

train_df,val_df,eval_df,dev_list,train_list,val_list,y,num_dic=get_data(args.test_file)
all_df=pd.concat([train_df,val_df,eval_df])
all_list=dev_list+val_list+train_list
y=pd.read_csv('labels.csv')
y=y['label']
num_labels=len(y)




if __name__=='__main__':
    model=MultiLabelClassificationModel("bert",args.model_name,use_cuda=cuda_available)
    result, model_outputs, wrong_predictions = model.eval_model(
        all_df
    )
    fo=open("output.csv","w",encoding='utf_8_sig')
    fo.write("計劃編號,計劃名稱,True Label,Predict Label,Predict Probability,First 5 Label,First 5 Probability\n")
    pred_list,y_test,predictions,raw_outputs=output_file(fo,model,all_list,num_dic,y)
    print(result['LRAP'])