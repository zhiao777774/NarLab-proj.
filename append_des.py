import pandas as pd
import nar.util
import re
import argparse

def get_args():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--total_label',
        default=-1,
        help='label all file',
        type=int
    )
    
    return parser.parse_args()

if __name__=="__main__":
    args = get_args()
    args = args.__dict__
    # read classified data
    data = pd.read_csv(f"{nar.util.XML_PATH}/final_{args['total_label']}.csv")
    # keyword_{args['total_label']}.csv should be placed in ./data/folder_nar/
    # keyword_{args['total_label']}.csv is created by the tf-idf code
    label = pd.read_csv(f"{nar.util.XML_PATH}/keyword_{args['total_label']}.csv")

    data = data.to_dict('index')
    label = label.to_dict('index')

    for project in data.values():
        for labeled_data in label.values():
            if project['name'] == labeled_data['name']:
                project['tf_idf'] = re.sub(r'[\[\]\']', '', labeled_data['tf-idf'])
                project['keyword'] = re.sub(r'[\[\]\']', '', labeled_data['keyword'])
                project['tf_idf'] = re.sub(r'\s+', '', project['tf_idf'])
                project['keyword'] = re.sub(r'\s+', '', project['keyword'])

    for_store = []

    labels = {x : x for x in range(args["total_label"])}

    for key in data.keys():
        for_store.append(data[key])
    # for project in for_store:
    #     project['length'] = int(re.findall(r'\([0-9]+/([0-9]+)\s*\)',project["name"])[0])
    #     project['name'] = re.sub(r'\([0-9]+/([0-9]+)\s*\)', '', project['name'])
    #     project['year_start'] = project['year']
    #     project['year_end'] = project['year_start'] + project['length']
    #     if project['year_end'] > 110:
    #         project['year_end'] = 110

    combined = []
    revised = []

    for i in range(len(for_store)):
        if i in combined :
            continue
        count = 1
        combined.append(i)
        try:
            for_store[i]['description'] = f'\n{for_store[i]["year"]} 年度\n\n' + for_store[i]['description']
        except: 
            for_store[i]['description'] = f'\n{for_store[i]["year"]} 年度\n\n'
        for_store[i]['year_start'] = for_store[i]['year']
        for_store[i]['year_end'] = for_store[i]['year'] + 1
        for j in range(len(for_store)):
            # if count >= for_store[i]['length']:
            #     break
            if for_store[i]['name'] == for_store[j]['name'] and j not in combined:
                count += 1
                combined.append(j)
                for_store[i]['year_end'] = for_store[j]['year'] + 1
                for_store[i]['description'] += f'\n\n{for_store[j]["year"]} 年度\n\n' + for_store[j]['description']
                try:
                    for_store[i]['keyword'] += ',' + for_store[j]['keyword']
                except:
                    for_store[i]['keyword'] = for_store[i]['keyword']
                try:
                    for_store[i]['tf_idf'] += ',' + for_store[j]['tf_idf']
                except:
                    for_store[i]['tf_idf'] = for_store[i]['tf_idf'] 
        try:
            for_store[i]['keyword'] = ','.join(list(set(for_store[i]['keyword'].split(','))))
        except:
            print(f'{for_store[i]["name"]} : keyword column is NULL')
            # print(for_store[i]['keyword'])
        try:
            for_store[i]['tf_idf'] = ','.join(list(set(for_store[i]['tf_idf'].split(','))))
        except:
            print(f'{for_store[i]["name"]} : tf-idf column is NULL')
            # print(for_store[i]['tf_idf'])
        for_store[i]['num_label'] = int(labels[for_store[i]['label']])
        try:
            for_store[i]['label'] = label_for_display[for_store[i]['label']]
        except:
            for_store[i]['label'] = for_store[i]['label']
        for_store[i]['tmp'] = re.findall(r'\([^)]*\)(.*)',for_store[i]['name'])[0]
        revised.append(for_store[i])

    revised = pd.DataFrame(revised)
    revised = revised[['year', 'name' , 'label', 'year_start', 'year_end', 'keyword', 'ner', 'tf_idf', 'description', 'order', 'num_label', 'department', 'tmp']]
    revised.to_csv(f'{nar.util.XML_PATH}/revise_length_{args["total_label"]}.csv', index = False)