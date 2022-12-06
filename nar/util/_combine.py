from cmath import nan
import pandas as pd
import nar.util

def find_year(data):
    # print(data)
    data = data.to_dict('index')
    for key in data.keys():
        year_start = data[key]['year']
        year_end = data[key]['year']
        for each_data in data.values():
            count = 0
            for i in range(len(data[key]['name']) - 5):
                # print(count)
                try:
                    if data[key]['name'][i] != each_data['name'][i] :
                        count += 1
                except:
                    count = 3
                    break
                if count > 2:
                    break
            if count <= 2:
                if each_data['year'] < year_start :
                    year_start = each_data['year']
                if each_data['year'] > year_end :
                    year_end = each_data['year']
        data[key]['year_start'] = year_start
        data[key]['year_end'] = year_end
        data[key]['keyword'] = float(nan)
        data[key]['ner'] = float(nan)
        data[key]['tf_idf'] = float(nan)
    return data

def combine_description(data, description):
    
    description['計畫重點描述'] = description['計畫重點描述'].apply(lambda x: str(x).replace('_x000D_', ''))
    project_description = description.to_dict('index')
    for key in data.keys():
        for des in project_description.values():
            if data[key]['name'] == des['計畫完整中文名稱']:
                data[key]['description'] = des['計畫重點描述']
    
    del project_description
    return data
if __name__=='__main__':
    f1 = open(f'{nar.util.XML_PATH}/labeled_data.csv', 'rb')
    data = pd.read_csv(f1)
    f1.close()
    # for i in range(103,111):
    #     print(f'{i} 年 : ' + str(len(data[data['year'].apply(lambda x : x == i)])))
    # exit()
    f1 = open(f'{nar.util.XML_PATH}/0324_combine.xlsx', 'rb')
    desc = pd.read_excel(f1)
    f1.close()
    data = find_year(data)
    # print(desc.to_dict('index').values())

    result = combine_description(data, description = desc)
    result = [x for x in result.values()]
    result = pd.DataFrame(result)
    print(result)
    f1 = open(f'{nar.util.XML_PATH}/combined_result.csv', 'wb')
    result = result.to_csv(f1, index=False)
    f1.close()
