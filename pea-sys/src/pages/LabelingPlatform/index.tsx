import React, {useState} from 'react';
import {Row, Col, Button, Card} from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import * as XLSX from 'xlsx';
import DataTable from '../../components/DataTable';
import {loadData} from '../../utils/dataLoader';
import {Task} from '../../constants/types';

export default function LabelingPlatform() {
    const [data, setData] = useState<Task[]>(
        loadData().filter(({type, level}) => type !== 'project' && level !== 2)
    );
    const [file, setFile] = useState<File>();
    const fileReader = new FileReader();

    const csvFileToArray = (str: string) => {
        const csvHeader = str.slice(0, str.indexOf('\n')).split(',');
        const csvRows = str.slice(str.indexOf('\n') + 1).split('\n');

        const array = csvRows.map(i => {
            const values = i.split(',');
            const obj = csvHeader.reduce((obj, header, index) => {
                // @ts-ignore
                obj[header] = values[index];
                return obj;
            }, {});
            return obj;
        });

        console.log(array);
    };

    const handleFileUpload = async (file: File) => {
        const extIndex = file.name.lastIndexOf('.');
        const extName = file.name.substring(extIndex + 1);
        if (extName === 'csv') {
            fileReader.onload = (event) => {
                const textRes = event.target?.result;
                console.log(textRes);
                // @ts-ignore
                csvFileToArray(textRes);
            };

            fileReader.readAsText(file);
        } else if (extName === 'xlsx' || extName === 'xls') {
            const xlsxData = await file.arrayBuffer();
            const workbook = XLSX.read(xlsxData);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            console.log(jsonData)
        }
    };

    const handleExport = () => {

    };

    const handleTraining = () => {
        if (!window.confirm('確定要訓練嗎?')) return;

        console.log(file);
    };

    return (
        <Row className="card-margin-top m-auto align-self-center">
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
                                               handleFileUpload(e.target.files[0]);
                                           }}/>
                                    {file?.name} 匯入資料
                                </label>
                            </Button>
                            <Button variant="outline-dark" className="me-2" onClick={handleExport}>匯出資料</Button>
                            <Button variant="danger" onClick={handleTraining}>訓練</Button>
                        </Col>
                    </Row>
                    <Card.Body className="mx-5 align-self-center">
                        <DataTable user="undefined" dataset={data}/>
                    </Card.Body>
                </Card>
            </Col>
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
                            variant="dark">
                {
                    items.map((text: string) =>
                        <Dropdown.Item key={`dropdown-${config.id}-${text}`} eventKey={text}>{text}</Dropdown.Item>)
                }
            </DropdownButton>
        );
    };