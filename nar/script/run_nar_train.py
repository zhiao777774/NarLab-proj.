import argparse
import torch

import nar.util
import nar.dset

def get_args():
    r"""Parse arguments from CLI."""
    # Create parser
    parser = argparse.ArgumentParser()

    # Required arguments.
    parser.add_argument(
        '--experiment',
        default='nar_1',
        help='Current experiment name.',
        type=str
    )
    parser.add_argument(
        '--train_file',
        default='folder_nar/0324_combine.xlsx',
        help='Trainiing dataset.',
        type=str
    )
    parser.add_argument(
        '--seed',
        default=123,
        help='Control random seed.',
        type=int
    )

    # Training arguments.
    parser.add_argument(
        '--batch_size',
        default=4,
        help='Training batch size.',
        type=int
    )
    parser.add_argument(
        '--epochs',
        default=5,
        help='Number of training epochs.',
        type=int
    )
    parser.add_argument(
        '--accumulation_steps',
        default=1,
        help='Accumulation loss interval.',
        type=float
    )
    parser.add_argument(
        '--save_steps',
        default=100,
        help='Saving step.',
        type=int
    )
    parser.add_argument(
        '--train_all',
        help='Whether training all data',
        action="store_true"
    )

    # Optimizer arguments.
    parser.add_argument(
        '--weight_decay',
        default=0.01,
        help='Decide weight_decay.',
        type=float
    )
    parser.add_argument(
        '--learning_rate',
        default=1e-5,
        help='Gradient decent learning rate.',
        type=float
    )
    parser.add_argument(
        '--warmup_ratio',
        default=0.06,
        help='Decide warmup ratio.',
        type=float
    )
    parser.add_argument(
        '--scheduler',
        default='cosine',
        help='Scheduler type.',
        type=str
    )

    # Model arguments.
    parser.add_argument(
        '--model_name',
        default='bert-base-chinese',    # xlm-mlm-xnli15-1024
        help='Model name for bert.',
        type=str
    )
    parser.add_argument(
        '--max_seq_len',
        default=500,
        help='Text sample max length.',
        type=int
    )
    parser.add_argument(
        '--max_grad_norm',
        default=1.0,
        help='Gradient bound to avoid gradient explosion.',
        type=float
    )

    return parser.parse_args()

if __name__ == '__main__':
    # Parse command-line argument.
    args = get_args()

    # config
    config = nar.util.MyConfig(**args.__dict__)

    # get device
    device = config.device

    # set random seed
    nar.util.set_seed(config.seed)

    # get tokenizer
    tokenizer = nar.util.get_tokenizer(config.model_name)

    # preprocess train data and load my dataset
    dset = nar.dset.NarDataset(config.max_seq_len, tokenizer)
    dset.load_data(config.train_file_path)

    print(f'args.train_all: {args.train_all}\n')
    if args.train_all:
        train_dataloader = dset.get_dataloader(
            contents=dset.data,
            aspects=dset.labels,
            batch_size=config.batch_size
        )
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
            batch_size=config.batch_size
        )
        test_dataloader = dset.get_dataloader(
            contents=x_test,
            aspects=y_test,
            batch_size=config.batch_size
        )

    config.num_labels = 10
    # Load pre-trained model.
    model = nar.util.get_model(
        model_name=config.model_name,
        num_labels=10,
        device=device
    )

    # Get optimizer.
    optimizer = nar.util.get_optimizer(
        model=model,
        weight_decay=config.weight_decay,
        learning_rate=config.learning_rate,
        adam_epsilon=config.adam_epsilon
    )

    # Get scheduler.
    scheduler = nar.util.get_scheduler(
        config=config,
        train_data_size=len(train_dataloader),
        optimizer=optimizer
    )

    # Save config.
    config.save()

    # Log path for tensorboard.
    log_path = f'{config.output_path}/log'


    # class_weigts = torch.tensor([1.0, 10.0, 4.0, 2.0, 2.0]).to(device)
    # loss_fn = torch.nn.CrossEntropyLoss(weight=class_weigts)

    nar.util.train_model(
        config=config,
        dataloader=train_dataloader,
        device=device,
        model=model,
        optimizer=optimizer,
        scheduler=scheduler,
        log_path=log_path,
        save_path=config.output_path,
    )

    # Train model.
    # nar.util.train_model_with_weights(
    #     config=config,
    #     dataloader=train_dataloader,
    #     device=device,
    #     model=model,
    #     optimizer=optimizer,
    #     scheduler=scheduler,
    #     log_path=log_path,
    #     save_path=config.output_path,
    #     loss_fn=loss_fn
    # )

    torch.cuda.empty_cache()
