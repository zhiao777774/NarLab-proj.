## this file is use for extract each data record
import re
import nar.util
import pickle

if __name__=='__main__':

    replace_new_line = re.compile(r'[\t\n\r\f\v]')
    data_tag = re.compile(r'\<DATA\_RECORD\>.*?\<\/DATA\_RECORD\>')
    f = open(nar.util.DATA_PATH + '/folder_nar/GRB-3.xml', 'r')
    data = f.read()
    data = replace_new_line.sub('', data)
    data = data_tag.findall(data)
    f.close()
    store = open(nar.util.DATA_PATH + '/data.pickle', 'wb')
    pickle.dump(data, store)
    print(len(data))
    store.close()
