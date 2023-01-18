import {numberRange} from '../utils/range';

const advanceFormCMPT = [
    numberRange(1, 3, true).map((n) => ({
        fieldName: `條件${n}`, componentName: `keyword-${n}`
    }))
];

const conditionTypeMap = {
    '計畫名稱': 'name',
    //'計畫年份': 'startDate',
    //'部會': 'department',
    '計畫類別': 'category',
    '關鍵字': 'keyword',
    '計畫描述': 'description',
};
const conditionType = Object.keys(conditionTypeMap);
const conditionOperator = ['and', 'or', 'not'];
const CondTypeMapping = (key) => conditionTypeMap[key];


export {advanceFormCMPT};
export {conditionType, conditionOperator, conditionTypeMap, CondTypeMapping};