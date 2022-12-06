import transformers

def get_tokenizer(model_name):
    return transformers.BertTokenizer.from_pretrained(model_name)
