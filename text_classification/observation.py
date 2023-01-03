from collections import defaultdict
from dataset import load_data

file_name = 'new_data.xlsx'
X, y = load_data(file_name)
statistics = defaultdict(list)
for i in range(len(X)):
    label = y[i]
    num_cls = len(label.split(";"))
    statistics[num_cls].append(i)

for num in statistics.keys():
    print(f"只有 {num} 個類別的有 {len(statistics[num])} 篇")