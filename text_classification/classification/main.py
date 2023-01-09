from simpletransformers.classification import MultiLabelClassificationModel, MultiLabelClassificationArgs
from get_data import get_data
import logging
import torch
import numpy as np
logging.basicConfig(level=logging.INFO)
transformers_logger = logging.getLogger("transformers")
transformers_logger.setLevel(logging.WARNING)
cuda_available=torch.cuda.is_available()
NUM_EPOCH=20
# Preparing train data

train_df,eval_df,dev_list,y=get_data()
num_labels=len(y)

# Optional model configuration
model_args = MultiLabelClassificationArgs(
                num_train_epochs=NUM_EPOCH,
                max_seq_length=128,
                output_dir=f"output{NUM_EPOCH}",
                use_multiprocessing=False,
                use_multiprocessing_for_evaluation=False,
                )

# Create a MultiLabelClassificationModel
model = MultiLabelClassificationModel(
    "bert",
    "bert-base-chinese",
    num_labels=num_labels,
    args=model_args,
    use_cuda=cuda_available,
    
)

# Train the model
import os

if __name__=='__main__':
    if not os.path.exists(f"output{NUM_EPOCH}"):
        model.train_model(train_df)

        # Evaluate the model
        result, model_outputs, wrong_predictions = model.eval_model(
            eval_df
        )
    else:
        model=MultiLabelClassificationModel("bert",f"output{NUM_EPOCH}",use_cuda=cuda_available)
        
    # Make predictions with the model
    a_lst=[]
    for e,i in enumerate(dev_list):
        
        a_lst.append(e)
    from random import sample
    # a_lst=sample(a_lst,1)
    
    fo=open("output.csv","w",encoding='utf_8_sig')
    fo.write("計劃名稱,True Label,Predict Label\n")
    
    for a in a_lst:
        predictions, raw_outputs = model.predict(dev_list[a][0])
        predicted=[]
        for e,i in enumerate(predictions[0]):
            if i==1:
                predicted.append(y[e])
        true=[]
        for e,i in enumerate(dev_list[a][1]):
            if i==1:
                true.append(y[e]) 
        # if len(predicted)==0:
        #     index=np.argmax(raw_outputs[0])
        #     predicted.append(y[index])
        text=dev_list[a][0].split('\n')[0]
        print(text,true,predicted)
        fo.write(f"{text},{';'.join(true)},{';'.join(predicted)}\n")
    
    
    
