import nar.util
import pickle
import pandas as pd
import re
import numpy as np
from collections import Counter

def load_data(path):
    f = open(path, 'rb')
    data = pickle.load(f)
    f.close()
    return data

def combine_bert(data, data_vector):
    for key in data.keys():
        data[key]['vector'] = data_vector[key]['chinese_description_tag']
    return data

def combine_with_result(result, data):
    for key in result.keys():
        for data_key in data.keys():
            if result[key]['name'] == data[data_key]['計畫完整中文名稱']:
                result[key]['vector'] = data[data_key]['vector']
        result[key]['new_name'] = re.sub('\([0-9]/[0-9]\)', '', result[key]['name'])
    return result

# calculate similarity
def sim(result_with_vector : dict, label_sim : dict):
    count = 0
    sim_dict = {}
    for_store = []
    # print([x[0] for x in label_sim])
    for label in [x[0] for x in label_sim]:
        flag = False
        base = 0
        sim_dict[str(label)] = []
        for key in result_with_vector.keys():
            if str(result_with_vector[key]['label']) == label:
                if flag : 
                    # print(f'Label {label} : {np.dot(base, np.array(np.array(result_with_vector[key]["vector"])))}')
                    sim_dict[str(label)].append(np.dot(base, np.array(np.array(result_with_vector[key]["vector"]))))
                    result_with_vector[key]['similarity'] = np.dot(base, np.array(np.array(result_with_vector[key]["vector"])))
                else :
                    flag = True
                    base = np.array(result_with_vector[key]['vector'])
                    sim_dict[str(label)].append(np.dot(base, np.array(np.array(result_with_vector[key]["vector"]))))
                    result_with_vector[key]['similarity'] = np.dot(base, np.array(np.array(result_with_vector[key]["vector"])))
    
    for key in sim_dict.keys():
        sim_dict[key] = list(sorted(set(sim_dict[key]), reverse = True))
        # print(list(sorted(set(sim_dict[key]), reverse = True)))
    
    result_with_vector = dict(sorted(list(result_with_vector.items()), key = lambda x : x[1]['year']))

    f = open(f'{nar.util.XML_PATH}/sim.txt', 'w')
    for sim_key in sim_dict.keys():
        count += 1
        f.write(f'label {sim_key} starts from {count}\n')
        for sim in sim_dict[sim_key]:
            for key in result_with_vector.keys():
                if result_with_vector[key]['similarity'] == sim and str(result_with_vector[key]['label']) == sim_key:
                    count += 1
                    result_with_vector[key]['order'] = count
    f.close()
    
    for val in result_with_vector.values():
        for_store.append(val)
    for_store = pd.DataFrame(for_store)
    for_store = for_store[['year', 'name' , 'label', 'year_start', 'year_end', 'keyword', 'ner', 'tf_idf', 'description', 'order']]
    for_store.to_csv(f'{nar.util.XML_PATH}/final20.csv', index = False)
    # print(for_store)
    return sim_dict

# revise the result
def get_correct_vector(result):
    find = []
    for key_base in result.keys():
        # If the vector has changed, we don't need to calcualte again.
        if key_base in find :
            continue
        label = []
        project_list = []
        project_vector = []
        for key_cur in result.keys():
            # 比較 name
            count = 0
            for i in range(len(result[key_base]['new_name'])):
                try:
                    if result[key_base]['new_name'][i] != result[key_cur]['new_name'][i]:
                        count += 1
                    if abs(len(result[key_base]['new_name']) - len(result[key_cur]['new_name'])) > 0:
                        count = 3
                except:
                    count = 3
                    break
                if count > 0:
                    break
            if count <= 0:
                try :
                    project_list.append(key_cur)
                    project_vector.append(result[key_cur]['vector'])
                    label.append(result[key_cur]['label'])
                except :
                    print(key_cur)
        mean = np.mean(np.array(project_vector), axis = 0).tolist()
        if len(Counter(label)) > 1:
            # print(result[key_base]['name'])
            print(f'Vector list : {project_list}')
            # print(Counter(label).most_common(1)[0][0])
        revised_label = Counter(label).most_common(1)[0][0]
        for key in project_list:
            result[key]['vector'] = mean
            result[key]['label'] = revised_label
            find.append(key)
        print(project_list)
    return result

def label_sim(result, total):
    similarity = {}
    count = 0
    tmp = list(set([str(x[1]['label']) for x in result.items()]))
    for label in tmp:
        vector_list = []
        for key in result.keys():
            if result[key]['label'] == label:
                vector_list.append(result[key]['vector'])
        count += len(vector_list)
        similarity[str(label)] = np.mean(np.array(vector_list), axis = 0).tolist()
    base = np.array(similarity[tmp[0]])
    for key in similarity.keys():
        similarity[key] = np.dot(base, np.array(similarity[key]))
    
    similarity = sorted(list(similarity.items()), key = lambda x : x[1], reverse = True)
    
    # print(similarity)
    return similarity

if __name__ =="__main__":
    dataset_path = f'{nar.util.DATA_PATH}/new_dataset_chinese.pickle'
    print('start loading')
    print('-'*30)
    data = load_data(dataset_path)
    df = pd.read_excel(f'{nar.util.XML_PATH}/combined_data.xlsx')
    df = df[['計畫完整中文名稱']]
    df = df.to_dict('index')
    data = combine_bert(df, data)
    combined_result = pd.read_csv(f'{nar.util.XML_PATH}/result20.csv')
    combined_result = combined_result.to_dict('index')
    combined_result = combine_with_result(combined_result, data)
    combined_result = get_correct_vector(combined_result)
    label_similarity = label_sim(combined_result, 20)
    final_result = sim(combined_result, label_similarity)