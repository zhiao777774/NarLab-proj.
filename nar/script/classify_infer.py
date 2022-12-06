import nar.util
import transformers
import pandas as pd
import pickle
import re
import torch
from tqdm import tqdm

def load_data(data_path, xml = True):
    tmp = {}
    if xml:
        f = open(data_path, 'rb')
        data = pickle.load(f)
        f.close()
    else:
        df = pd.read_excel(f'{nar.util.XML_PATH}/0324_combine.xlsx')
        df = df[['系統編號', '計畫完整中文名稱', '計畫重點描述', '中文關鍵詞', '系統編號', '年度']]
        df = df.to_dict('index')

        for key, value in df.items():
            tmp[key] = {}
            # tmp[key]['chinese_keyword_tag'] = value['中文關鍵詞']
            tmp[key]['chinese_name_tag'] = value['計畫完整中文名稱']
            tmp[key]['chinese_description_tag'] = re.sub('(\n|\uf06e|\uf0d82|\t|\uf06dm|\u3000|\uf06c3|\uf06c5|_x000D_|\uf06c5)','',value['計畫重點描述'])
            tmp[key]['system_number'] = value['系統編號']
            tmp[key]['year'] = value['年度']
            # if type(tmp[key]['chinese_keyword_tag']) == float:
            #     tmp[key]['chinese_keyword_tag'] = ''
            if type(tmp[key]['chinese_name_tag']) == float:
                tmp[key]['chinese_name_tag'] = ''
            if type(tmp[key]['chinese_description_tag']) == float:
                tmp[key]['chinese_description_tag'] = ''
        # f = open(f'{nar.util.DATA_PATH}/xlsx_data_{args["language"]}.pickle', 'wb')
        # pickle.dump(tmp,f)
        # f.close()

    return tmp

def combine_label_with_data(data):
    df = pd.read_excel(f'{nar.util.XML_PATH}/0324_combine.xlsx')
    df = df[['主題1', '主題2', '主題3', '主題4', '主題5', '主題6', '主題7', '主題8', '主題9', '主題10']]
    df = df.to_dict('index')
    for key in data.keys():
        for topic in df[key].keys():
            if type(df[key][topic]) == float:
                data[key]['topic'] = '其他'
            else:
                data[key]['topic'] = df[key][topic]
    
    f = open(f'{nar.util.XML_PATH}/data_for_shiuwen_website.pickle', 'wb')
    pickle.dump(data, f)
    f.close()
    # print(data)
    pass
if __name__=='__main__':
    combine_label_with_data(load_data(nar.util.XML_PATH, False))
    DEVICE = 'cuda:0'
    model = transformers.BertForSequenceClassification.from_pretrained(f'/home/NE6101050/nar/exp/0324_data_1_seed_123/ckpt-4', num_labels=10, output_hidden_states = True)
    tokenizer = nar.util.get_tokenizer('bert-base-chinese')
    data = load_data(nar.util.XML_PATH, False)

    model = model.to(DEVICE)
    model.eval()
    
    for_store = []
    with torch.no_grad():
        for key, value in tqdm(data.items()):
            output = model(
                **(tokenizer(data[key]['chinese_description_tag'], return_tensors="pt", max_length = 512, truncation='only_first').to(DEVICE))
            )
            logits = output['logits']
            # print(logits.size())
            # print('---')

            logits = logits.cpu()
            logits = torch.nn.functional.softmax(logits, dim=-1)
            prediction = logits.argmax(dim=-1).item()
            data[key]['logits'] = logits
            data[key]['label'] = prediction

        for value in data.values():
            tmp = {}
            tmp['year'] = value['year']
            tmp['name'] = value['chinese_name_tag']
            tmp['label'] = value['label']
            for_store.append(tmp)
        
        for_store = pd.DataFrame(for_store)
        for_store.to_csv(f'{nar.util.XML_PATH}/classify_label.csv', index = False)
        f = open(f'{nar.util.XML_PATH}/data_for_shiuwen_website.pickle', 'wb')
        print(data)
        pickle.dump(data, f)
        f.close()