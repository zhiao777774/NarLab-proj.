r"""檢測每個 checkpoint 的分數。"""
import argparse
import os

import nar.util
import nar.dset

import torch


def get_args():
    r"""Parse arguments from CLI."""
    # Create parser
    parser = argparse.ArgumentParser()

    # Required arguments.
    parser.add_argument(
        '--experiment',
        default='nar_2_no_dup',
        help='Current experiment name.',
        type=str
    )
    parser.add_argument(
        '--batch_size',
        default=8,
        help='Training batch size.',
        type=int
    )

    return parser.parse_args()

if __name__ == '__main__':
    # Parse command-line argument.
    args = get_args()

    print(args.experiment)
    # Load config.
    config = nar.util.MyConfig.load(experiment=args.experiment)

    # Get device.
    device = config.device

    # Set random seed.
    nar.util.set_seed(config.seed)

    # Load pre-trained tokenizer.
    tokenizer = nar.util.get_tokenizer(config.model_name)

    # Modify batch size.
    config.batch_size = args.batch_size

    # Load train data.
    dset = nar.dset.NarDataset(config.max_seq_len, tokenizer)
    dset.load_data(config.train_file_path)

    # Store the datasets needed to be evaluated.
    dataloader_list = []

    if config.train_all:
        all_dataloader = dset.get_dataloader(
            contents=dset.data,
            aspect=dset.labels,
            batch_size=config.batch_size,
            is_shuffled=False
        )

        # The total number of checkpoint.
        ckpt_num = len(all_dataloader) * config.epochs // (config.accumulation_steps * config.save_steps)

        # Store the dataset which will be evaluated.
        dataloader_list.append((all_dataloader, 'train'))

    else:
        # Split the dataset into train & test.
        x_train, x_test, y_train, y_test = dset.split_data(
            contents=dset.data,
            aspects=dset.labels,
            seed=config.seed,
            ratio=0.25
        )
        train_dataloader = dset.get_dataloader(
            contents=x_train,
            aspects=y_train,
            batch_size=config.batch_size,
            is_shuffled=True
        )
        test_dataloader = dset.get_dataloader(
            contents=x_test,
            aspects=y_test,
            batch_size=config.batch_size,
            is_shuffled=True
        )

        # The total number of checkpoint.
        ckpt_num = len(train_dataloader) * config.epochs // (config.accumulation_steps * config.save_steps)

        # Store the dataset which will be evaluated.
        dataloader_list.append((train_dataloader, 'train'))
        dataloader_list.append((test_dataloader, 'test'))


    # ckpt_num = int(ckpt_num)
    # print('checkpoint num: ', ckpt_num)


    all_ckpt = []
    for file in os.listdir(config.output_path):
        if file.startswith('ckpt'):
            all_ckpt.append(int(file[5:]))

    all_ckpt = sorted(all_ckpt)

    # Start to evalulate the dataset from `start_ckpt` to `ckpt_num`, interval `ckpt_interval`.
    for ckpt in all_ckpt:
        print(f'Now checkpoint is {ckpt}')
        model_path = f'{config.output_path}/ckpt-{ckpt}'
        config.num_labels = 10
        # Load fine-tuned model.
        model = nar.util.load_ckpt(config.num_labels, model_path, device)

        # Set model to evaluation model.
        model = model.eval()

        log_path = f'{config.output_path}/log'

        # Evaluate each dataset in the `dataloader_list`.
        for dataloader, stage in dataloader_list:
            if not os.path.exists(f'{log_path}/{stage}'):
                os.makedirs(f'{log_path}/{stage}')
            labels, my_pred, acc = nar.util.evaluate(
                dataloader=dataloader,
                device=device,
                model=model,
                ckpt=ckpt,
                log_path=f'{log_path}/{stage}',
            )

            nar.util.save_pickle(my_pred, f'{log_path}/{stage}_ckpt{ckpt}_pred_result.pkl')

        nar.util.save_pickle(labels, f'{log_path}/{stage}_label.pkl')

    torch.cuda.empty_cache()
