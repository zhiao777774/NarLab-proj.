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
    
    return name_dict, sort_dict


if __name__ == '__main__':
    test_filename = "test_convert_10.json"
    read_convert_json(test_filename)
