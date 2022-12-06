## this file is use for extract each part of a data record
import re
import nar.util
import pickle
from tqdm import tqdm

def data_dict_creator(data):
    data_id_extracter = re.compile(r'<ID>(.*?)</ID>')
    GRB_tag = re.compile(r'<GRB系統編號>(.*?)</GRB系統編號>')
    chinese_name_tag = re.compile(r'<中文計畫名稱>(.*?)</中文計畫名稱>')
    english_name_tag = re.compile(r'<英文計畫名稱>(.*?)</英文計畫名稱>')
    year_tag = re.compile(r'<計畫年度>(.*?)</計畫年度>')
    english_description_tag = re.compile(r'<英文摘要>(.*?)</英文摘要>')
    chinese_description_tag = re.compile(r'<中文摘要>(.*?)</中文摘要>')
    chinese_keyword_tag = re.compile(r'<中文關鍵詞>(.*?)</中文關鍵詞>')
    english_keyword_tag = re.compile(r'<英文關鍵詞>(.*?)</英文關鍵詞>')
    data_dict = {}
    for data in tqdm(raw_data):
        tmp = data_id_extracter.findall(data)[0]
        data_dict[tmp] = {}
        try:
            data_dict[tmp]['GRB_tag'] = GRB_tag.findall(data)[0]
        except:
            data_dict[tmp]['GRB_tag'] = ''
        try:
            data_dict[tmp]['chinese_name_tag'] = chinese_name_tag.findall(data)[0]
        except:
            data_dict[tmp]['chinese_name_tag'] = ''
        try:
            data_dict[tmp]['english_name_tag'] = english_name_tag.findall(data)[0]
        except:
            data_dict[tmp]['english_name_tag'] = ''
        try:
            data_dict[tmp]['year_tag'] = year_tag.findall(data)[0]
        except:
            data_dict[tmp]['year_tag'] = ''
        try:
            data_dict[tmp]['english_description_tag'] = english_description_tag.findall(data)[0]
        except:
            data_dict[tmp]['english_description_tag'] = ''
        try:
            data_dict[tmp]['chinese_description_tag'] = chinese_description_tag.findall(data)[0]
        except:
            data_dict[tmp]['chinese_description_tag'] = ''
        try:
            data_dict[tmp]['chinese_keyword_tag'] = chinese_keyword_tag.findall(data)[0]
        except:
            data_dict[tmp]['chinese_keyword_tag'] = ''
        try:
            data_dict[tmp]['english_keyword_tag'] = english_keyword_tag.findall(data)[0]
        except:
            data_dict[tmp]['english_keyword_tag'] = ''
    return data_dict

if __name__=="__main__":
    f = open(f'{nar.util.DATA_PATH}/data.pickle', 'rb')
    raw_data = pickle.load(f)
    f.close()

    finished_dataset = data_dict_creator(raw_data)
    data_file = open(f'{nar.util.DATA_PATH}/data_dict.pickle', 'wb')
    pickle.dump(finished_dataset, data_file)
    data_file.close()
