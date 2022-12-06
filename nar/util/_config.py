import argparse
import os
import json

import torch

from nar.util._path import *

class MyConfig:
    def __init__(self, **args):
        args = argparse.Namespace(**args)
        self.experiment = args.experiment
        self.data_path = DATA_PATH
        self.train_file = args.train_file
        self.train_file_path = os.path.join(DATA_PATH, self.train_file)
        self.output_path = f'{SAVE_PATH}/{self.experiment}'

        if not os.path.exists(self.output_path):
            os.makedirs(self.output_path)

        # training
        self.seed = args.seed
        self.batch_size = args.batch_size
        self.epochs = args.epochs
        self.accumulation_steps = args.accumulation_steps
        self.save_steps = args.save_steps
        self.train_all = args.train_all

        # optimizer
        self.weight_decay = args.weight_decay
        self.learning_rate = args.learning_rate
        self.adam_epsilon = 1e-6
        self.scheduler = args.scheduler
        self.warmup_ratio = args.warmup_ratio
        self.warmup_steps = 0

        # models
        self.model_name = args.model_name
        self.num_labels = 5
        self.max_seq_len = args.max_seq_len
        self.max_grad_norm = args.max_grad_norm

    @property
    def device(self):
        if torch.cuda.is_available():
            return torch.device('cuda:0')
        return torch.device('cpu')

    def save(self):
        if not os.path.exists(self.output_path):
            os.mkdir(self.output_path)

        file_path = f'{self.output_path}/config.json'
        if not os.path.exists(file_path):
            with open(file_path, 'w') as f:
                json.dump(dict(self), f)

    @classmethod
    def load(cls, experiment, path=None):
        file_path = os.path.join(SAVE_PATH, experiment, 'config.json')
        if path != None:
            file_path = path

        if not os.path.exists(file_path):
            raise FileNotFoundError(f'File {file_path} does not exist.')

        with open(file_path, 'r', encoding='utf-8') as input_file:
            return cls(**json.load(input_file))


    def __iter__(self):
        yield 'experiment', self.experiment
        yield 'data_path', self.data_path
        yield 'train_file', self.train_file
        yield 'train_file_path', self.train_file_path
        yield 'output_path', self.output_path
        # training
        yield 'seed', self.seed
        yield 'batch_size', self.batch_size
        yield 'epochs', self.epochs
        yield 'accumulation_steps', self.accumulation_steps
        yield 'save_steps', self.save_steps
        yield 'train_all', self.train_all
        # optimizer
        yield 'weight_decay', self.weight_decay
        yield 'learning_rate', self.learning_rate
        yield 'adam_epsilon', self.adam_epsilon
        yield 'scheduler', self.scheduler
        yield 'warmup_ratio', self.warmup_ratio
        yield 'warmup_steps', self.warmup_steps
        # models
        yield 'model_name', self.model_name
        yield 'num_labels', self.num_labels
        yield 'max_seq_len', self.max_seq_len
        yield 'max_grad_norm', self.max_grad_norm
