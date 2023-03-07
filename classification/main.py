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
cuda_available=torch.cuda.is_available()
NUM_EPOCH=20
finetune_name='bert-base-chinese'
model_name=f"model_{finetune_name}_{NUM_EPOCH}"
parser = argparse.ArgumentParser(description='Argument for prediction')
parser.add_argument('--pred_file', type=str, default = 'data.xlsx')
parser.add_argument('--model_name', type=str, default=model_name)
parser.add_argument('--output_file', type=str, default="output.csv")
args = parser.parse_args()
y=pd.read_csv('labels.csv')
y=y['label']
df,dic=get_text(args.pred_file)


if __name__=='__main__':
    model=MultiLabelClassificationModel("bert",args.model_name,use_cuda=cuda_available)
    output_pred(args.output_file,df,dic,y,model)
