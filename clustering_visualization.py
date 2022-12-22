import argparse
import numpy as np
import pickle
import matplotlib.pyplot as plt
from sklearn.manifold import TSNE
from mpl_toolkits.mplot3d import Axes3D

import nar.util


def get_args():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        '--language',
        default='chinese',
        help='tokenized data.',
        type=str
    )

    return parser.parse_args()


def load_data(path):
    f = open(path, 'rb')
    data = pickle.load(f)
    f.close()
    return data


def keep_description(dataset, language):
    data = []
    for key in dataset.keys():
        data.append(dataset[key][f'{language}_description_tag'])
    return np.array(data, dtype=float)


def display_scatter(vectors, dim=2):
    word_vectors = np.array([v['data'] for v in vectors])
    labels = [v['label'] for v in vectors]
    embedded = TSNE(n_components=dim).fit_transform(word_vectors)[:, :dim]

    fig = plt.figure(figsize=(6, 6))
    if dim == 3:
        ax = Axes3D(fig)
        for l in set(labels):
            x = [embedded[i, 0] for i in range(len(embedded)) if labels[i] == l]
            y = [embedded[i, 1] for i in range(len(embedded)) if labels[i] == l]
            z = [embedded[i, 2] for i in range(len(embedded)) if labels[i] == l]
            ax.plot(x, y, z, 'o', label=l, markeredgecolor='black')
    elif dim == 2:
        for l in set(labels):
            x = [embedded[i, 0] for i in range(len(embedded)) if labels[i] == l]
            y = [embedded[i, 1] for i in range(len(embedded)) if labels[i] == l]
            plt.plot(x, y, 'o', label=l, markeredgecolor='black')

    plt.tick_params(left=False, right=False, labelleft=False,
                    labelbottom=False, bottom=False)
    plt.legend(bbox_to_anchor=(0.95, 0.99))

    plt.savefig(nar.util.DATA_PATH + f'/{dim}d_tsne_cluster.png')
    plt.show()


if __name__ == '__main__':
    np.random.seed(0)
    args = get_args()

    dataset_path = f'{nar.util.DATA_PATH}/new_dataset_{args.language}.pickle'
    labeled_path = f'{nar.util.DATA_PATH}/xlsx_description_{args.language}.pickle'
    data = load_data(dataset_path)
    label = load_data(labeled_path)
    dataset = keep_description(data, 'chinese')

    mapping = []
    for l, d in zip(label.values(), dataset):
        mapping.append({
            'data': d,
            'label': l['label']
        })

    display_scatter(mapping)
