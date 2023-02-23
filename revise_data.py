import re
import json

import numpy as np
import pandas as pd

import nar.util

dataset_path = f'{nar.util.XML_PATH}/103-110_full.xlsx'
df = pd.read_excel(dataset_path)
df.head()

with open(f'{nar.util.XML_PATH}/feature_mapping.json', 'r') as f:
    feature_mapper = json.load(f)
    df = df.rename(feature_mapper, axis=1)

df = df.dropna(how='all')
# df = df.astype({'startDate': int})
df = df[df.columns.drop(list(df.filter(regex='None')))]
pattern = re.compile(r'\(\d/\d\)')
df['name'] = df['name'].str.replace(':', '：').replace('（', '(').replace('）', ')')
df['name'] = df.apply(lambda x: re.sub(r'\s+', '', str(x['name'])), axis=1)
df['project'] = df.apply(lambda x: pattern.sub('', str(x['name'])), axis=1)
df = df.sort_values(by=['project', 'startDate', 'name'])

end_dates = []
prev_project = None
combined_data = df.set_index('project').replace(np.nan, ' ')
for i, row in df.iterrows():
    name = pattern.sub('', str(row['name']))
    # if name not in combined_data:
    #     combined_data[name] = [row.to_dict()]

    if prev_project is not None:
        prev_name = pattern.sub('', str(prev_project['name']))
        if prev_name == name:
            end_dates.append(row['startDate'])
        else:
            end_dates.append(prev_project['startDate'])

    prev_project = row

end_dates.append(prev_project['startDate'])
combined_data['endDate'] = end_dates
combined_data = combined_data.dropna()
combined_data = combined_data.astype({'startDate': 'int64', 'endDate': 'int64'})

with open(f'{nar.util.XML_PATH}/dataset_combine2.json', 'w', encoding='UTF-8') as f:
    json.dump(combined_data.groupby(level=0).apply(
        lambda x: x.to_dict('records')).to_dict(), f, ensure_ascii=False)
