import re

def get_num_dict(filename):    
    with open(filename) as f:
        lines = f.readlines()
        
    trans_dict = {}

    iline = 0
    while iline < len(lines):
        line = lines[iline]
        research = re.search(r"\d+", line)
        if (research != None):
            iline += 1
            newvalue = lines[iline].replace("\n", "")
            if newvalue == "不須修改":
                newvalue = lines[iline-1].replace(research.group(), '').replace(' ', '').replace('（原本的類別名稱）', '').replace("\n", "").replace('.', '')

            trans_dict[research.group()]['name'] = newvalue
            
        iline += 1
    
    return trans_dict

def get_name_dict(filename):
    
    with open(filename) as f:
        lines = f.readlines()
        
    trans_dict = {}

    iline = 0
    while iline < len(lines):
        line = lines[iline]
        research = re.search(r"\d+", line)                
        if (research != None):
            key = lines[iline].replace(research.group(), '').replace(' ', '').replace('（原本的類別名稱）', '').replace("\n", "").replace('.', '')
            iline += 1
            newvalue = lines[iline].replace("\n", "")
            if newvalue == "不須修改":
                newvalue = key

            trans_dict[key]['name'] = newvalue
            
        iline += 1
    
    return trans_dict