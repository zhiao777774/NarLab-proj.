import math

import transformers

def get_scheduler(config, train_data_size, optimizer):
    # apply warm up learning rate schedule
    total_steps = train_data_size // config.accumulation_steps * config.epochs
    warmup_steps = math.ceil(total_steps * config.warmup_ratio)
    config.warmup_steps = warmup_steps if warmup_steps != 0 else config.warmup_steps

    if config.scheduler == 'linear':
        return transformers.get_linear_schedule_with_warmup(
            optimizer=optimizer,
            num_warmup_steps=warmup_steps,
            num_training_steps=total_steps
        )
    if config.scheduler == 'constant':
        return transformers.get_constant_schedule_with_warmup(
            optimizer=optimizer,
            num_warmup_steps=warmup_steps
        )
    if config.scheduler == 'cosine':
        return transformers.get_cosine_schedule_with_warmup(
            optimizer=optimizer,
            num_warmup_steps=warmup_steps,
            num_training_steps=total_steps
        )
    if config.scheduler == 'cosine_restart':
        scheduler = transformers.get_cosine_with_hard_restarts_schedule_with_warmup(
            optimizer=optimizer,
            num_warmup_steps=warmup_steps,
            num_training_steps=total_steps,
            num_cycles=4,
        )

    return None