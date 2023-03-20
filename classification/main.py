import pandas as pd
import argparse
from define import get_text,output_pred
from simpletransformers.classification import MultiLabelClassificationModel, MultiLabelClassificationArgs
import logging
import torch
import numpy as np
import pandas as pd
import argparse
logging.basicConfig(level=logging.INFO)
transformers_logger = logging.getLogger("transformers")
transformers_logger.setLevel(logging.WARNING)
def main(pred_file,model_name,output_file):
    
    
    df,dic=get_text(pred_file)
    model=MultiLabelClassificationModel("bert",model_name,use_cuda=cuda_available)
    output_pred(output_file,df,dic,y,model)

if __name__=='__main__':
    cuda_available=torch.cuda.is_available()
    NUM_EPOCH=20
    finetune_name='bert-base-chinese'
    model_name=f"model_{finetune_name}_{NUM_EPOCH}"
    parser = argparse.ArgumentParser(description='Argument for prediction')
    parser.add_argument('--pred_file', type=str, default = '../data/folder_nar/103-110_full.xlsx')
    parser.add_argument('--model_name', type=str, default=model_name)
    parser.add_argument('--output_file', type=str, default="output.csv")
    args = parser.parse_args()
    y=pd.read_csv('labels.csv')
    y=y['label']
    main(args.pred_file,args.model_name,args.output_file)
