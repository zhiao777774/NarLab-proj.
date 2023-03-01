from sklearn.metrics import multilabel_confusion_matrix,classification_report,ConfusionMatrixDisplay
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
print(matplotlib.get_data_path())  # 数据路径
def observe(y_pred,y_true,labels):
    plt.rcParams['font.sans-serif']=['SimHei']
    plt.rcParams['axes.unicode_minus'] = False
    y_pred=np.array(y_pred)
    y_true=np.array(y_true)
    cm=multilabel_confusion_matrix(y_true, y_pred)
    cr=classification_report(y_pred,y_true)
    f, axes = plt.subplots(10, 5, figsize=(25, 15))
    axes = axes.ravel()
    for e,i in enumerate(cm):
        disp=ConfusionMatrixDisplay(i,display_labels=['N','Y'])
        disp.plot(ax=axes[e], values_format='.4g')
        if e<40:
            disp.ax_.set_xlabel('')
        if e%5!=0:
            disp.ax_.set_ylabel('')
        disp.ax_.set_title(labels[e])
        

    plt.subplots_adjust(wspace=0.10, hspace=0.1)
    f.colorbar(disp.im_, ax=axes)
    plt.show()

