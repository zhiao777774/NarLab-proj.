import os
import sys
import pickle

from matplotlib.font_manager import FontManager
from matplotlib import pyplot as plt
import numpy as np
from sklearn.metrics import accuracy_score, classification_report


"""
********** 可用的字型 **********
Droid Sans Fallback
Noto Serif CJK JP
Noto Sans CJK JP
"""
# set font
plt.rcParams['font.sans-serif'] = ['Noto Serif CJK JP']
plt.rcParams['axes.unicode_minus'] = False


# 計算 precision, recall, f1。
def get_precision_recall_f1(labels, predictions, aspect_range=range(0, 5)):
    report = classification_report(labels, predictions, output_dict=True, zero_division=0)
    precision = [round(report[str(aspect)]['precision'], 3) for aspect in aspect_range]
    recall = [round(report[str(aspect)]['recall'], 3) for aspect in aspect_range]
    f1 = [round(report[str(aspect)]['f1-score'], 3) for aspect in aspect_range]

    return precision, recall, f1

# Plot precision, recall, f1 score of each aspect.
def plot_aspect_precision_recall_f1_bar(
    figsize=(10,6),
    x_label=None,
    precision=None,
    recall=None,
    f1=None,
    title='',
    dir_path='',
    file_name=''
):
    plt.figure(figsize = figsize)
    plt.xlabel('Aspect')
    plt.ylabel('Value')
    plt.title(title)
    axes = plt.axes()

    N = len(x_label)
    x_loc = np.arange(N)
    width = 0.25

    bar1 = plt.bar(x_loc, precision, width, label='precision')
    bar2 = plt.bar(x_loc+width, recall, width, label='recall')
    bar3 = plt.bar(x_loc+width*2, f1, width, label='f1-score')

    axes.set_xticks(x_loc+width)
    axes.set_xticklabels(x_label)
    axes.set_ylim([0, 1.0])

    def show_value(bars):
        for bar in bars:
            yval = bar.get_height()
            plt.text(bar.get_x() + width/4, yval + 0.01, "{0:.2f}".format(yval))

    show_value(bar1)
    show_value(bar2)
    show_value(bar3)

    plt.legend()
    plt.tight_layout()
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
    plt.savefig(f'{dir_path}/{file_name}')


def plot_predict_ratio_pie(label, value, title, dir_path, file_name):
    # pie plot
    plt.figure(figsize=(9, 6))
    plt.pie(value, autopct='%.2f%%')
    plt.legend(label,
                title="構面",
                loc='center left',
                bbox_to_anchor=(1, 0, 0.5, 1))

    plt.title(title)
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
#         plt.savefig(f'img_pred/預測結果分佈比例_aspect/{file_name}_構面分佈比例.jpg')
    plt.savefig(f'{dir_path}/{file_name}')


# Save pickle file.
def save_pickle(target, path):
    with open(path, 'wb') as pkl_file:
        pickle.dump(target, pkl_file)

# Load a `.pkl` file.
def load_pickle(path):
    with open(path, 'rb') as pkl_file:
        return pickle.load(pkl_file)

# 找系統可用的字型。
def find_chinese_type():
    fm = FontManager()
    mat_fonts = set(f.name for f in fm.ttflist)
    print (mat_fonts)
    output = subprocess.check_output('fc-list :lang=zh -f "%{family}\n"', shell=True)
    print ('*' * 10, '系統可用的中文字型', '*' * 10)
    print (output)
    zh_fonts = set(f.split(',', 1)[0] for f in output.decode().split('\n'))
    available = mat_fonts & zh_fonts
    print ('*' * 10, '可用的字型', '*' * 10)
    for f in available:
        print(f)