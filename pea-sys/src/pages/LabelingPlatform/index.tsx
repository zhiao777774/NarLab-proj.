import React, {useEffect, useRef, useState} from 'react';
import {Button, Card, Col, Row} from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import {CSVLink} from 'react-csv';
import * as XLSX from 'xlsx';
import DataTable from '../../components/DataTable';
import {loadData} from '../../utils/dataLoader';
import {Task} from '../../constants/types';

export default function LabelingPlatform() {
    const [loading, setLoading] = useState<boolean>(true);
    const [data, setData] = useState<Task[]>([]);
    const [isRevision, setIsRevision] = useState<boolean>(true);
    const [file, setFile] = useState<File>();
    const csvLinkRef = useRef<any>();
    const dataTableRef = useRef<any>();
    const fileReader = new FileReader();

    useEffect(() => {
        const initData = async () => {
            setLoading(true);
            const data = await loadData();
            setData(data.filter(({type, level}) => type !== 'project' && level !== 2));
            setLoading(false);
        }
        initData();
    }, []);

    const csvFileToArray = (str: string) => {
        const csvHeader = str.slice(0, str.indexOf('\n')).split(',');
        const csvRows = str.slice(str.indexOf('\n') + 1).split('\n');

        const resArray = csvRows.map(i => {
            const values = i.split(',');
            const obj = csvHeader.reduce((obj, header, index) => {
                // @ts-ignore
                obj[header] = values[index];
                return obj;
            }, {});
            return obj;
        });

        return resArray;
    };

    const beforeExportData = () => {
        return data.map((project) => {
            return {
                '系統編號': project.code,
                '計畫完整中文名稱': project.name,
                '年度': project.start.toRepublicYear().getFullYear(),
                '部會': project.data.department,
                '類別': project.data.category.join(';'),
                '中文關鍵字': project.data.keyword,
                'TF-IDF': project.data.tfidf.CH.join(';'),
                '英文斷詞': project.data.tfidf.EN.join(';'),
                '計畫重點描述': project.data.description
            };
        });
    };

    const handleFileUpload = async (file: File) => {
        const extIndex = file.name.lastIndexOf('.');
        const extName = file.name.substring(extIndex + 1);
        let jsonData = null;

        if (extName === 'csv') {
            fileReader.onload = (event) => {
                const textRes = event.target?.result;
                // @ts-ignore
                jsonData = csvFileToArray(textRes);
            };

            fileReader.readAsText(file);
        } else if (extName === 'xlsx' || extName === 'xls') {
            const xlsxData = await file.arrayBuffer();
            const workbook = XLSX.read(xlsxData);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            jsonData = XLSX.utils.sheet_to_json(worksheet);
        }

        const res = await fetch('/api/preprocess', {
            method: 'POST',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({data: jsonData})
        });
        const result = await res.json();
        return Object.values(result).flat().map((item: any) => {
            const {code, name, startDate, ...others} = item;
            const {category, chineseKeyword, ...data} = others;
            return {
                id: code,
                name,
                start: new Date(Number(startDate) + 1911, 0, 0),
                level: 3,
                type: 'task',
                data: {
                    category: category.split(';'),
                    ...data,
                    keyword: chineseKeyword,
                    tfidf: {
                        CH: [],
                        EN: []
                    }
                }
            } as Task;
        }) as Task[];
    };

    const handleRunModel = async () => {
        if (!window.confirm('確定要儲存資料嗎?')) return;

        const jsonData = isRevision ?
            Object.entries(dataTableRef.current.state.editRecord).map(([key, value]) => {
                return {
                    // @ts-ignore
                    [key]: value.map((stack: any) => stack.peek())
                };
            })
            : data.map((project: Task) => {
                const {id, name, start, data} = project;
                const {tfidf, category, keyword, ...reservedData} = data;
                return {
                    code: id,
                    name,
                    startDate: start.toRepublicYear().getFullYear(),
                    chineseKeyword: keyword,
                    category: category[0],
                    ...reservedData,
                };
            });
        const res = await fetch('/api/store', {
            method: isRevision ? 'PATCH' : 'POST',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({data: jsonData})
        });
        const result = await res.json();

        if (result.ok) {
            alert('資料變更成功');
            if (!isRevision) {
                // POST
                setData(Object.values(result.result).flat().map((item: any, i) => {
                        const {code, name, startDate, ...others} = item;
                        const {category, chineseKeyword, ...data} = others;
                        return {
                            id: code,
                            name,
                            start: new Date(Number(startDate) + 1911, 0, 0),
                            level: 3,
                            type: 'task',
                            data: {
                                category: category.split(';'),
                                ...data,
                                keyword: chineseKeyword,
                                tfidf: {
                                    CH: [],
                                    EN: []
                                }
                            }
                        } as Task;
                    }) as Task[]
                );
            }
            setIsRevision(false);
        } else {
            alert('資料變更失敗');
        }
    };

    return (
        <Row className="card-margin-top m-auto align-self-center">
            {
                !loading ?
                    <Col>
                        <Card className="m-auto">
                            <Row className="mx-5 my-4">
                                <Col>
                                    <Button variant="outline-dark" className="me-2">
                                        <label htmlFor="file-uploader" style={{cursor: 'pointer'}}>
                                            <input id="file-uploader" type="file" accept=".csv,.xlsx" className="d-none"
                                                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                       if (!e.target.files) return;
                                                       setFile(e.target.files[0]);
                                                       handleFileUpload(e.target.files[0]).then((data) => {
                                                           // @ts-ignore
                                                           setData(data);
                                                           alert('匯入成功');
                                                           setIsRevision(false);
                                                           setFile(undefined);
                                                       });
                                                   }}/>
                                            {file?.name ? `${file?.name} 匯入中...` : '匯入資料'}
                                        </label>
                                    </Button>
                                    <CSVLink data={beforeExportData()}
                                             filename="data.csv"
                                             className="btn btn-outline-dark me-2 d-none"
                                             target="_blank"
                                             ref={csvLinkRef}>
                                        匯出資料
                                    </CSVLink>
                                    <div className="d-inline-block me-2">
                                        <DropdownList
                                            config={{
                                                id: 'dropdown-export-data',
                                                title: '匯出資料',
                                                onSelected: (eventKey: 'csv' | 'json') => {
                                                    if (eventKey === 'json') {
                                                        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
                                                            JSON.stringify(beforeExportData())
                                                        )}`;
                                                        const link = document.createElement('a');
                                                        link.href = jsonString;
                                                        link.download = 'data.json';
                                                        link.click();
                                                    } else {
                                                        if (csvLinkRef && csvLinkRef.current) {
                                                            csvLinkRef.current?.link.click();
                                                        }
                                                    }
                                                }
                                            }}
                                            items={['csv', 'json']}
                                        />
                                    </div>
                                    <Button variant="danger" onClick={handleRunModel}>儲存</Button>
                                </Col>
                            </Row>
                            <Card.Body className="mx-5 align-self-center">
                                <DataTable ref={dataTableRef} user="undefined" dataset={Array.from(data)}/>
                            </Card.Body>
                        </Card>
                    </Col>
                    :
                    <span>資料載入中...</span>
            }
        </Row>
    );
}

type DropdownListConfig = {
    id: string;
    title: string;
    onSelected: any;
};
const DropdownList: React.FC<{ config: DropdownListConfig; items: string[]; }> =
    ({config, items}) => {
        return (
            <DropdownButton id={config.id} title={config.title + ' '} onSelect={config.onSelected}
                            variant="outline-dark">
                {
                    items.map((text: string) =>
                        <Dropdown.Item key={`dropdown-${config.id}-${text}`} eventKey={text}>{text}</Dropdown.Item>)
                }
            </DropdownButton>
        );
    };