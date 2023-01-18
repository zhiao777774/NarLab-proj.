import React, {useState, forwardRef} from 'react';
import {Button, InputGroup, FormControl, Form} from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import {advanceFormCMPT, conditionOperator, conditionType, CondTypeMapping} from '../constants/formComponents';

export const SearchForm = forwardRef<any, { searchType: 'basic' | 'advance' }>(
    ({searchType}, ref) => {
        const [inputCmpts, setInputCmpts] = useState(advanceFormCMPT[0]);
        const [searchString, setSearchString] = useState<string[]>(advanceFormCMPT[0].map(() => ''));
        const [condOperatorSelected, setCondOperatorSelected] = useState<string[]>(advanceFormCMPT[0].map(() => conditionOperator[0]));
        const [condTypeSelected, setCondTypeSelected] = useState<string[]>(advanceFormCMPT[0].map(() => conditionType[0]));

        // const _search = async (event) => {
        //     event.preventDefault();
        //
        //     const {target} = event;
        //     if (!target['keyword-1'].value.replace(/ /g, '')) {
        //         alert('請輸入檢索詞');
        //         return;
        //     }
        //
        //     const keyword = [];
        //     this.state.inputCmpts.forEach(({componentName}, i) => {
        //         const text = target[componentName].value;
        //         if (text) {
        //             const {type, operator} = this.inputCondDDL[i].selected;
        //             keyword.push({
        //                 text,
        //                 type: CondTypeMapping(conditionType[type]),
        //                 operator: conditionOperator[operator]
        //             });
        //         }
        //     });
        //
        //     const postData = {
        //         keyword,
        //         searchType: 'advance'
        //     };
        //
        //     advanceFormCMPT.slice(1).forEach(({componentName, inputType, elements}) => {
        //         if (inputType === 'checkbox') {
        //             postData[componentName] = {};
        //             const component = Array.from(target[componentName]);
        //             const isAllUnchecked = component.every(({checked}) => checked === false);
        //
        //             if (isAllUnchecked) {
        //                 const elementNames = elements.map(({elementName}) => elementName);
        //                 postData[componentName] = Object.fromEntries(new Map(
        //                     elementNames.map((item) => [item, true])
        //                 ));
        //             } else {
        //                 elements.forEach(({elementName}, i) => {
        //                     postData[componentName][elementName] = component[i].checked;
        //                 });
        //             }
        //         } else if (inputType === 'radio') {
        //             postData[componentName] = target[componentName].value;
        //         }
        //     });
        //
        //     this.setState({disabled: true, queryResult: null});
        //     // const res = await fetch('/api/data', {
        //     //     method: 'POST',
        //     //     headers: {'Content-Type': 'application/json'},
        //     //     body: JSON.stringify(postData)
        //     // });
        //     // const result = await res.json();
        //     //
        //     // if (!!result) {
        //     //     const db = Object.keys(postData.database).filter((db) => postData.database[db]);
        //     //     const dbMap = Object.keys(databaseMap)
        //     //         .filter((dbName) => db.includes(dbName))
        //     //         .map(((dbName) => databaseMap[dbName]));
        //     //     const queryResult = result.map((dataset, i) => {
        //     //         return dataset.map((data) => {
        //     //             const temp = {};
        //     //             Object.keys(data).forEach((item) => {
        //     //                 const keyMapped = QuerykeyMapping(item);
        //     //                 if (!keyMapped) return;
        //     //                 temp[keyMapped] = data[item];
        //     //             });
        //     //             temp['department'] = dbMap[i];
        //     //
        //     //             return temp;
        //     //         });
        //     //     });
        //     //     this.setState({disabled: false, queryResult}, () => {
        //     //         document.getElementById('retr-div')
        //     //             .scrollIntoView({behavior: 'smooth'});
        //     //     });
        //     // } else {
        //     //     alert('查詢失敗，請稍後再試');
        //     //     this.setState({disabled: false});
        //     // }
        // }

        const search = async (event: any) => {
            event.preventDefault();

            const {target} = event;
            if (!target['keyword-1'].value.replace(/ /g, '')) {
                alert('請輸入檢索詞');
                return;
            }

            if (searchType === 'basic') {

            } else {
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

                console.log(keyword);
            }
        };


        return (
            <div>
                {
                    searchType === 'basic' ?
                        <Form onSubmit={search}>
                            <FormControl
                                placeholder="Search"
                                aria-label="Search"
                                aria-describedby="Search"
                                name='keyword-1' id='keyword-1'
                                value={searchString[0]}
                                onChange={e => setSearchString([e.target.value])}
                                required
                            />
                            <button ref={ref} type="submit" style={{display: 'none'}}/>
                        </Form>
                        :
                        <Form onSubmit={search}>
                            {
                                inputCmpts.map(({fieldName, componentName}, i) => {
                                    return (
                                        <Form.Group className="mb-3" key={`form-component-${componentName}`}>
                                            <Form.Label className="d-block fw-bold col-sm-2 mb-2"
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
                            <div>
                                <Button variant="success" type="button" size="sm"
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
                                <Button variant="danger" type="button" size="sm"
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
            <DropdownButton id={config.id} title={config.title} onSelect={config.onSelected}
                            variant="primary">
                {
                    items.map((text: string) => <Dropdown.Item eventKey={text}>{text}</Dropdown.Item>)
                }
            </DropdownButton>
        );
    };