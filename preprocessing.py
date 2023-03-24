import re
import json
import numpy as np

import nar.util  # server 執行可能會import不到


def combine(df, save_data=False):
    df = preprocess(df)
    pattern = re.compile(r'\(\d/\d\)')
    df['project'] = df.apply(lambda x: pattern.sub('', str(x['name'])), axis=1)
    df = df.sort_values(by=['project', 'startDate', 'name'])

    end_dates = []
    prev_project = None
    combined_data = df.set_index('project').replace(np.nan, ' ')
    for i, row in df.iterrows():
        name = pattern.sub('', str(row['name']))

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
    combined_data = combined_data.groupby(level=0).apply(
        lambda x: x.to_dict('records')).to_dict()

    if save_data:
        with open(f'{nar.util.XML_PATH}/dataset_combine.json', 'w', encoding='UTF-8') as f:
            json.dump(combined_data, f, ensure_ascii=False)

    return combined_data


def preprocess(df):
    df = feature_mapping(df)
    df = df.dropna(how='all')
    # df = df.astype({'startDate': int})
    df = df[df.columns.drop(list(df.filter(regex='None')))]  # 這行在server執行會出錯
    df['name'] = df['name'].str.replace(':', '：').replace('（', '(').replace('）', ')')
    df['name'] = df.apply(lambda x: re.sub(r'\s+', '', str(x['name'])), axis=1)

    return df


def feature_mapping(df):
    with open(f'{nar.util.XML_PATH}/feature_mapping.json', 'r') as f:
        feature_mapper = json.load(f)
        df = df.rename(feature_mapper, axis=1)

    return df
