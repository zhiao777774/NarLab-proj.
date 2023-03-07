from simpletransformers.classification import MultiLabelClassificationModel, MultiLabelClassificationArgs
from define import get_data,output_file
import logging
import torch
import numpy as np
from observation import observe
from sklearn.metrics import accuracy_score,f1_score
from sklearn.model_selection import KFold
import pandas as pd
import argparse
logging.basicConfig(level=logging.INFO)
transformers_logger = logging.getLogger("transformers")
transformers_logger.setLevel(logging.WARNING)
cuda_available=torch.cuda.is_available()

parser = argparse.ArgumentParser(description='Argument for training data')
parser.add_argument('--train_file', type=str, default = 'data.xlsx')
parser.add_argument('--epoch', type=int, default=20)
parser.add_argument('--finetune_name', type=str, default='bert-base-chinese')

args = parser.parse_args()
NUM_EPOCH=args.epoch
# Preparing train data
finetune_name=args.finetune_name
model_name=f"model_{finetune_name}_{NUM_EPOCH}"

train_df,val_df,eval_df,dev_list,train_list,val_list,y,num_dic=get_data(args.train_file)
all_df=pd.concat([train_df,val_df,eval_df])
y=pd.read_csv('labels.csv')
y=y['label']
num_labels=len(y)


# Optional model configuration


def train(df):
    model_args = MultiLabelClassificationArgs(
                    num_train_epochs=NUM_EPOCH,
                    max_seq_length=512,
                    output_dir=model_name,
                    use_multiprocessing=False,
                    use_multiprocessing_for_evaluation=False,
                    overwrite_output_dir=True
                    )

    # Create a MultiLabelClassificationModel

    model = MultiLabelClassificationModel(
        "bert",
        finetune_name,
        num_labels=num_labels,
        args=model_args,
        use_cuda=cuda_available,
    )
    model.train_model(df)
# Train the model
import os

if __name__=='__main__':
    if not os.path.exists(model_name):
        train(all_df)
        

    

def fold():
    NUM_EPOCH=20
    model_args = MultiLabelClassificationArgs(
                num_train_epochs=NUM_EPOCH,
                max_seq_length=512,
                overwrite_output_dir=True,
                use_multiprocessing=False,
                use_multiprocessing_for_evaluation=False,
                )
    n=5
    kf = KFold(n_splits=n, random_state=42, shuffle=True)
    results = []
    
    for train_index, val_index in kf.split(all_df):
    # splitting Dataframe (dataset not included)
        train_df = all_df.iloc[train_index]
        val_df = all_df.iloc[val_index]
        # Defining Model
        model = MultiLabelClassificationModel(
        "bert",
        model_name,
        num_labels=num_labels,
        args=model_args,
        use_cuda=cuda_available,
        )
    # train the model
        model.train_model(train_df)
    # validate the model 
        result, model_outputs, wrong_predictions = model.eval_model(val_df, multi_label=True)
        print(result['LRAP'])
    # append model score
        results.append(result['LRAP'])
    
    print("results",results)
    print(f"Mean-Precision: {sum(results) / len(results)}")
    
    
