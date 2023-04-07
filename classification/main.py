import pandas as pd
import argparse
import os
import sys
sys.path.append('..')
sys.path.append(os.getcwd())
from classification.define import get_text,output_pred
from simpletransformers.classification import MultiLabelClassificationModel, MultiLabelClassificationArgs
import logging
import torch
import numpy as np
import pandas as pd
import argparse
logging.basicConfig(level=logging.INFO)
transformers_logger = logging.getLogger("transformers")
transformers_logger.setLevel(logging.WARNING)
def main(df,model_name,output_file):
    cuda_available = torch.cuda.is_available()
    df,dic=get_text(df)
    y=pd.read_csv('/home/ncku112/nar/NarLab-proj./classification/labels.csv')
    y=y['label']
    model=MultiLabelClassificationModel("bert",model_name,use_cuda=cuda_available)
    return output_pred(output_file,df,dic,y,model)

if __name__=='__main__':
    
    cuda_available=torch.cuda.is_available()
    print(cuda_available)
    NUM_EPOCH=20
    finetune_name='bert-base-chinese'
    model_name=f'model_{finetune_name}_{NUM_EPOCH}'
    model_name="/home/ncku112/nar/NarLab-proj./classification/model_bert-base-chinese_20"
    parser = argparse.ArgumentParser(description='Argument for prediction')
    parser.add_argument('--pred_file', type=str, default = '/home/ncku112/nar/NarLab-proj./classification/data2.xlsx')
    parser.add_argument('--model_name', type=str, default=model_name)
    parser.add_argument('--output_file', type=str, default="output.csv")
    args = parser.parse_args()
    y=pd.read_csv('/home/ncku112/nar/NarLab-proj./classification/labels.csv')
    y=y['label']
    df=pd.read_excel(args.pred_file)
    main(df,args.model_name,args.output_file)
