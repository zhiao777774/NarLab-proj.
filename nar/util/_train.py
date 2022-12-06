import os
import pathlib

import torch
from torch.utils.tensorboard import SummaryWriter
from tqdm import tqdm

def train_model(config, dataloader, device, model, optimizer, scheduler, log_path, save_path):
    # train model
    model.zero_grad()
    model.train()

    writer = SummaryWriter(log_path)
    # writer = torch.utils.tensorboard.SummaryWriter(f"{config.output_path}/log")
    global_step = 0
    checkpoint = 0
    total_loss = 0.0
    for epoch in range(int(config.epochs)):
        epoch_iterator = tqdm(dataloader, total=len(dataloader), desc=f'Epoch {epoch}, loss: {total_loss:.4f}', position=0)
        for step, train_batch in enumerate(epoch_iterator):
            train_batch = tuple(t.to(device) for t in train_batch)
            train_inputs = {
                'input_ids': train_batch[0], 'attention_mask': train_batch[1],
                'token_type_ids': train_batch[2], 'position_ids': train_batch[3],
                'labels': train_batch[4]
            }

            train_outputs = model(**train_inputs)
            loss = train_outputs.loss

            # Normalize the loss.
            loss = loss / config.accumulation_steps
            total_loss += loss.item()

            # Backpropagation.
            loss.backward()

            # Wait for several backward steps.
            if (step + 1) % config.accumulation_steps == 0:
                optimizer.step()
                if config.scheduler != 'none':
                    scheduler.step()
                model.zero_grad()
                optimizer.zero_grad()
                global_step += 1

                # Save model.
                if global_step and global_step % config.save_steps == 0:
                    output_dir = f'{save_path}/ckpt-{checkpoint}'
                    # output_dir = f'{config.output_path}/ckpt-{checkpoint}'
                    checkpoint += 1
                    if not os.path.exists(output_dir):
                        os.makedirs(output_dir)
                    model_to_save = model.module if hasattr(model, 'module') else model
                    model_to_save.save_pretrained(output_dir)

                    # Log on tensorboard.
                    total_loss /= config.save_steps
                    writer.add_scalar('Loss', total_loss, global_step)
                    epoch_iterator.set_description(f'Epoch: {epoch}, loss: {total_loss:.6f}')

                    # Refresh log loss.
                    total_loss = 0.0

    output_dir = f'{save_path}/ckpt-{checkpoint+1}'
    model_to_save.save_pretrained(output_dir)
    writer.close()

def train_model_with_weights(config, dataloader, device, model, optimizer, scheduler, log_path, save_path, loss_fn):
    # train model
    model.zero_grad()
    model.train()

    writer = SummaryWriter(log_path)
    # writer = torch.utils.tensorboard.SummaryWriter(f"{config.output_path}/log")
    global_step = 0
    checkpoint = 0
    total_loss = 0.0
    for epoch in range(int(config.epochs)):
        epoch_iterator = tqdm(dataloader, total=len(dataloader), desc='Train', position=0)
        for step, train_batch in enumerate(epoch_iterator):
            train_batch = tuple(t.to(device) for t in train_batch)
            train_inputs = {
                'input_ids': train_batch[0], 'attention_mask': train_batch[1],
                'token_type_ids': train_batch[2], 'position_ids': train_batch[3],
            }
            labels = train_batch[4]

            train_outputs = model(**train_inputs)
            logits = train_outputs.logits

            loss = loss_fn(input=logits, target=labels)

            # Normalize the loss.
            loss = loss / config.accumulation_steps
            total_loss += loss.item()

            # Backpropagation.
            loss.backward()

            # Wait for several backward steps.
            if (step + 1) % config.accumulation_steps == 0:
                # Gradient bound to avoid gradient explosion.
                # torch.nn.utils.clip_grad_norm_(
                #     model.parameters(),
                #     max_norm=3,
                # )
                optimizer.step()
                if config.scheduler != 'none':
                    scheduler.step()
                model.zero_grad()
                global_step += 1

                # Save model.
                if global_step and global_step % config.save_steps == 0:
                    output_dir = f'{save_path}/ckpt-{checkpoint}'
                    # output_dir = f'{config.output_path}/ckpt-{checkpoint}'
                    checkpoint += 1
                    if not os.path.exists(output_dir):
                        os.makedirs(output_dir)
                    model_to_save = model.module if hasattr(model, 'module') else model
                    model_to_save.save_pretrained(output_dir)

                    # Log on tensorboard.
                    total_loss /= config.save_steps
                    writer.add_scalar('Loss', total_loss, global_step)
                    epoch_iterator.set_description(f'epoch: {epoch}, loss: {total_loss:.6f}')

                    # Refresh log loss.
                    total_loss = 0.0

    writer.close()
