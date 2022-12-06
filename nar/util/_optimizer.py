import transformers

def get_optimizer(model, weight_decay, learning_rate, adam_epsilon):
    # optimizer
    no_decay = ['bias', 'LayerNorm.weight']
    optimizer_grouped_parameters = [
        {
            'params': [param for name, param in model.named_parameters() if not any(nd in name for nd in no_decay)],
            'weight_decay': weight_decay
        },
        {
            'params': [param for name, param in model.named_parameters() if any(nd in name for nd in no_decay)],
            'weight_decay': 0.0
        }
    ] # ref: https://github.com/huggingface/transformers/issues/1218

    return transformers.AdamW(optimizer_grouped_parameters,
                                lr=learning_rate,
                                eps=adam_epsilon)

