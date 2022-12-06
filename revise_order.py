import pandas as pd
import nar.util
import argparse
import json

def read_convert_json(json_filename: str):
    with open(json_filename, "r") as jf:
        convert_dict = json.load(jf)

    name_dict = {}
    sort_dict = {}

    for i in convert_dict:
        name_dict[i] = convert_dict[i]['name']
        sort_dict[i] = convert_dict[i]['sort']

    sort_dict = list(dict(sorted(sort_dict.items(), key=lambda item: item[1])).keys())

    # print(name_dict)
    # print(sort_dict)
    
    return name_dict, sort_dict

def get_args():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--total_label',
        default=10,
        help='The labels that you clustered.',
        type=int
    )
    return parser.parse_args()

def revise(df, change_name : dict, label : list):
    count = 1
    for i in range(len(label)):
        for key in df.keys():
            if df[key]['label'] == int(label[i]):
                df[key]['order'] = count
                df[key]['label'] = change_name[str(df[key]['label'])]
                count += 1 
        count += 1
    # print(count - len(df.keys()))
    return df

if __name__=="__main__":
    args = get_args()
    args = args.__dict__

    test_filename = f'{nar.util.XML_PATH}/test_convert_{args["total_label"]}.json'
    name, labels = read_convert_json(test_filename)

    df = pd.read_csv(f'{nar.util.XML_PATH}/revise_length_{args["total_label"]}.csv', index_col = False)
    df.label = df.num_label
    df = df.sort_values(by = 'tmp', ignore_index = True)
    df = df.to_dict("index")
    # print(labels)
    # print(name)
    # print(set(name.values()))
    # print(f'labels : {len(set(name.values()))}')
    df = pd.DataFrame([x for x in revise(df, name, labels).values()])
    df = df[['year', 'name' , 'label', 'year_start', 'year_end', 'keyword', 'ner', 'tf_idf', 'description', 'order', 'num_label', 'department']]
    df.to_csv(f'{nar.util.XML_PATH}/revise_length_{args["total_label"]}_newest.csv', index = False)
    