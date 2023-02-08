import React, {useState, forwardRef, useContext, useEffect} from 'react';
import {Button, InputGroup, FormControl, Form} from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import {AiFillExclamationCircle} from 'react-icons/ai';
import {AutoComplete, keywordItem} from './autoComplete';
import {advanceFormCMPT, conditionOperator, conditionType, CondTypeMapping} from '../constants/formComponents';
import {SearchDataContext} from '../helpers/context';
import {loadKeywords} from '../helpers/dataLoader';
import styles from './myComponents.module.css';

export const SearchForm = forwardRef<any, { searchType: 'basic' | 'advance' | 'auto-complete' }>(
    ({searchType}, ref) => {
        const {setSearchData} = useContext(SearchDataContext);
        const [inputCmpts, setInputCmpts] = useState(advanceFormCMPT[0]);
        const [searchString, setSearchString] = useState<string[]>(advanceFormCMPT[0].map(() => ''));
        const [condOperatorSelected, setCondOperatorSelected] = useState<string[]>(advanceFormCMPT[0].map(() => conditionOperator[0]));
        const [condTypeSelected, setCondTypeSelected] = useState<string[]>(advanceFormCMPT[0].map(() => conditionType[0]));
        const [searchSelected, setSearchSelected] = useState<any>({
            name: {
                text: '計畫名稱',
                selected: true
            },
            category: {
                text: '計畫類別',
                selected: true
            }
        });
        const searchKeywords: keywordItem[] = loadKeywords(searchSelected);

        const search = (event: any) => {
            event.preventDefault();

            const {target} = event;
            const input = target['keyword-1'] || target[0];
            if (!input.value.replace(/ /g, '')) {
                alert('請輸入檢索詞');
                return;
            }

            switch (searchType) {
                default:
                case 'basic':
                    setSearchData(target['keyword-1'].value.trim().split(' '));
                    break;
                case 'advance': {
                    const keyword: object[] = [];
                    inputCmpts.forEach(({componentName}, i) => {
                        const text = target[componentName].value;
                        if (text) {
                            keyword.push({
                                text,
                                type: CondTypeMapping(condTypeSelected[i]),
                                operator: condOperatorSelected[i]
                            });
                        }
                    });
                    setSearchData(keyword);
                    break;
                }
                case 'auto-complete':
                    setSearchData(target[0].value.trim().split(' '));
                    break;
            }
        };

        return (
            <div>
                {
                    searchType === 'basic' || searchType === 'auto-complete' ?
                        <Form onSubmit={search}>
                            {
                                searchType === 'basic' ?
                                    <InputGroup>
                                        <FormControl
                                            placeholder="Search"
                                            aria-label="Search"
                                            aria-describedby="Search"
                                            name='keyword-1' id='keyword-1'
                                            value={searchString[0]}
                                            onChange={(e) => setSearchString([e.target.value])}
                                            required
                                        />
                                        <Button variant="dark" onClick={() => setSearchString([''])}>Reset</Button>
                                    </InputGroup>
                                    :
                                    <AutoComplete items={searchKeywords}/>
                            }
                            <Form.Group className="mt-3">
                                {
                                    searchType === 'basic' ?
                                        <Form.Label
                                            className={`d-block fw-bold text-secondary ${styles.searchTips}`}
                                            style={{fontSize: '14px'}}
                                            htmlFor='keyword-1'>
                                            <AiFillExclamationCircle className="me-2 mb-1"/>
                                            <span>
                                            基礎查詢功能會針對「計畫名稱」、「描述」、「關鍵字」及「類別」進行字串搜索。
                                            並且能以「空白字符」做為分隔符號，進行多關鍵字的<span>聯集查詢</span>
                                        </span>
                                        </Form.Label>
                                        :
                                        Object.keys(searchSelected).map((name) => {
                                            return (
                                                <Form.Check
                                                    style={{marginLeft: '3px', fontSize: '15px'}}
                                                    inline
                                                    type="checkbox"
                                                    id={`search-chk-${name}`}
                                                    name="search-chk"
                                                    label={searchSelected[name].text}
                                                    checked={searchSelected[name].selected}
                                                    onChange={() => {
                                                        const temp = {...searchSelected};
                                                        temp[name].selected = !searchSelected[name].selected;
                                                        setSearchSelected(temp);
                                                    }}
                                                />
                                            );
                                        })
                                }
                            </Form.Group>
                            <button ref={ref} type="submit" style={{display: 'none'}}/>
                        </Form>
                        :
                        <Form onSubmit={search}>
                            {
                                inputCmpts.map(({fieldName, componentName}, i) => {
                                    return (
                                        <Form.Group className="mb-3" key={`form-component-${componentName}`}>
                                            <Form.Label className="d-block fw-bold mb-2" style={{fontSize: '14px'}}
                                                        htmlFor={componentName}>
                                                {fieldName}
                                            </Form.Label>
                                            <InputGroup>
                                                {
                                                    i ?
                                                        <DropdownList config={{
                                                            id: `condition-operator-${i}`,
                                                            title: condOperatorSelected[i],
                                                            onSelected: (key: string) => {
                                                                const temp = [...condOperatorSelected];
                                                                temp[i] = key;
                                                                setCondOperatorSelected(temp);
                                                            }
                                                        }} items={conditionOperator}/>
                                                        : null
                                                }
                                                <FormControl
                                                    placeholder="Search"
                                                    aria-label={componentName}
                                                    aria-describedby={componentName}
                                                    name={componentName} id={componentName}
                                                    value={searchString[i]}
                                                    onChange={({target}) => {
                                                        const temp = [...searchString];
                                                        temp[i] = target.value;
                                                        setSearchString(temp);
                                                    }}
                                                    required={i === 0}
                                                />
                                                <DropdownList config={{
                                                    id: `condition-type-${i}`,
                                                    title: condTypeSelected[i],
                                                    onSelected: (key: string) => {
                                                        const temp = [...condTypeSelected];
                                                        temp[i] = key;
                                                        setCondTypeSelected(temp);
                                                    }
                                                }} items={conditionType}/>
                                            </InputGroup>
                                        </Form.Group>
                                    );
                                })
                            }
                            <div className="mt-4">
                                <Button variant="outline-success" type="button" size="sm"
                                        className="me-2"
                                        onClick={() => {
                                            const n = inputCmpts.length + 1;
                                            const temp = [...inputCmpts, {
                                                fieldName: `條件${n}`, componentName: `condition-${n}`
                                            }];
                                            setInputCmpts(temp);
                                            setCondOperatorSelected([...condOperatorSelected, conditionOperator[0]]);
                                            setCondTypeSelected([...condTypeSelected, conditionType[0]]);
                                        }}>
                                    新增條件
                                </Button>
                                <Button variant="outline-danger" type="button" size="sm"
                                        onClick={() => {
                                            if (inputCmpts.length > 3) {
                                                const temp = inputCmpts.slice(0, inputCmpts.length - 1)
                                                setInputCmpts(temp);
                                            } else {
                                                alert('最少要有三個條件欄位存在');
                                            }
                                        }}>
                                    移除條件
                                </Button>
                            </div>
                            <div className="flex-col flex flex-wrap">
                                {
                                    //TODO: 目前沒有其他型態的選項，需要想看看有沒有要加進去的條件（例如部會？）
                                    //      如果有加額外選項，search裡的內容要修改
                                    advanceFormCMPT.slice(1).map(({
                                                                      //@ts-ignore
                                                                      fieldName,
                                                                      //@ts-ignore
                                                                      componentName,
                                                                      //@ts-ignore
                                                                      inputType = 'text',
                                                                      //@ts-ignore
                                                                      placeholder = '',
                                                                      //@ts-ignore
                                                                      defaultChecked = '',
                                                                      //@ts-ignore
                                                                      elements
                                                                  }) => {
                                        return (
                                            <div key={`form-component-${componentName}`} className="flex-auto mb-6">
                                                <label className="block text-gray-700 text-sm font-bold mb-2"
                                                       htmlFor={componentName}>
                                                    {fieldName}
                                                </label>
                                                {
                                                    elements.map(({ //@ts-ignore
                                                                      elementTitle,
                                                                      //@ts-ignore
                                                                      elementName
                                                                  }, i: number) =>
                                                        <label key={`form-${componentName}-${elementName}`}
                                                               className={`inline-flex items-center ${i ? 'ml-6' : ''}`}>
                                                            <input type={inputType} id={elementName}
                                                                   name={componentName}
                                                                   value={elementTitle}
                                                                   className={`form-${inputType} text-indigo-600 border border-gray-400`}
                                                                   defaultChecked={defaultChecked === elementName}
                                                                   required={inputType !== 'checkbox'}/>
                                                            <label htmlFor={elementName}
                                                                   className="ml-2">{elementTitle}</label>
                                                        </label>
                                                    )
                                                }
                                            </div>
                                        );
                                    })
                                }
                            </div>
                            <button ref={ref} type="submit" style={{display: 'none'}}/>
                        </Form>
                }
            </div>
        )
    });


const DropdownList: React.FC<{ config: any, items: string[] }> =
    ({config, items}) => {
        return (
            <DropdownButton id={config.id} title={config.title + ' '} onSelect={config.onSelected}
                            variant="dark">
                {
                    items.map((text: string) =>
                        <Dropdown.Item className={styles.darkDropdown} key={`dropdown-${config.id}-${text}`}
                                       eventKey={text}>{text}</Dropdown.Item>)
                }
            </DropdownButton>
        );
    };