from tqdm import tqdm
import re
if __name__ =='__main__':
    f = open('./data/folder_nar/GRB-2.xml', 'r', encoding='utf-8')
    data = f.readlines()
    f.close()
    cur_line = 0
    for i in tqdm(range(len(data)), desc = cur_line):
        # find the ascii code to replace
        tmp = re.findall(r'\&\#([0-9]+);', data[i])
        # find the whole ascii code character to replace
        tmp2 = re.findall(r'\&\#[0-9]+;', data[i])
        ascii_2_utf = {}
        if tmp != []:

            for itr1 in range(len(tmp)):

                ascii_2_utf[tmp2[itr1]] = chr(int(tmp[itr1]))

            for ascii in ascii_2_utf.keys():
                if ascii_2_utf[ascii] == '\\':
                    ascii_2_utf[ascii] = '\\\\'
                try:
                    data[i] = re.sub(ascii, ascii_2_utf[ascii], data[i])
                except:
                    print(ascii_2_utf[ascii])
        cur_line += 1

    f = open('./data/folder_nar/GRB-3.xml', 'w')
    for i in tqdm(range(len(data))):
        try:
            f.write(str(data[i]))
        except:
            print(i)
            continue
    f.close()
