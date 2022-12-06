import transformers

from nar.util._path import *

def get_model(model_name, num_labels, device):
    model_config = transformers.BertConfig.from_pretrained(model_name, num_labels=num_labels)
    model = transformers.BertForSequenceClassification.from_pretrained(model_name, config=model_config)

    return model.to(device)

def load_ckpt(num_labels, path, device):
    model = transformers.BertForSequenceClassification.from_pretrained(path, num_labels=num_labels)
    return model.to(device)
