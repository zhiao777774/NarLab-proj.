import os

import numpy as np
from sklearn.metrics import accuracy_score
import torch
import torch.utils.tensorboard
from torch.utils.tensorboard import SummaryWriter
from tqdm import tqdm

from nar.util._path import  *


def evaluate(dataloader, device, model, ckpt, log_path):
    writer = SummaryWriter(log_path)

    # Inference to get true labels & predictions.
    labels, predictions = bert_infer(dataloader, device, model)

    my_ans = np.argmax(predictions, axis=-1)
    acc = accuracy_score(labels, my_ans)

    # Log accuracy of this `ckpt` on tensorboard.
    writer.add_scalar(f'acc', acc, ckpt)
    writer.close()

    return labels, my_ans, acc

# Inference to get true labels & predictions.
@torch.no_grad()
def bert_infer(dataloader, device, model):
    labels, prediction = None, None
    tqdm_desc = 'Bert inference'
    epoch_iterator = tqdm(dataloader, total=len(dataloader), desc=tqdm_desc, position=0)

    model.eval()
    for batch in epoch_iterator:
        batch = tuple(t.to(device) for t in batch)
        with torch.no_grad():
            inputs = {
                'input_ids': batch[0], 'attention_mask': batch[1],
                'token_type_ids': batch[2], 'position_ids': batch[3],
                # 'labels': batch[4]
            }
            outputs = model(**inputs)
            label = batch[4]
            # now_hidden_state = outputs[2][-1][:, 0, :].detach().cpu().numpy()

        if labels is None:
            labels = label.detach().cpu().numpy()
            prediction = outputs[0].detach().cpu().numpy()
            # hidden_states = now_hidden_state
        else:
            labels = np.append(labels, label.detach().cpu().numpy(), axis=0)
            prediction = np.append(prediction, outputs[0].detach().cpu().numpy(), axis=0)
            # hidden_states =  np.append(hidden_states, now_hidden_state, axis=0)

    # print(f'label: {labels.shape}, pred: {prediction.shape}')

    # my_ans = np.argmax(prediction, axis=1)
    # tmp = my_ans == labels
    # my_pred = list(map(lambda i: labels[i] if tmp[i] else labels[i]+6 , range(len(tmp))))

    return labels, prediction
