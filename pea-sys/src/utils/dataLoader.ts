import category from '../constants/category';
import {AutocompleteSearchSource, Task} from '../constants/types';
import {numberRange} from './range';
import {AutocompleteResourceItem} from '../components/Autocomplete';

const COLOR_LIST = [
    '#010221', '#010221', '#010221', '#0A7373',
    '#0A7373', '#0A7373', '#B7BF99', '#B7BF99',
    '#B7BF99', '#EDAA25', '#EDAA25', '#EDAA25',
    '#2E4159', '#2E4159', '#2E4159', '#C43302',
    '#C43302', '#C43302'
];

const PROJECT_COLOR = '#0A7373';
const TASK_COLOR = '#2E4E78';

export function loadData(condition: Array<any> | null = null): Task[] {
    const projectData = require('../data/revised/dataset.json');
    const catSeries = require('../data/revised/category_statistic.json');
    const catProb = require('../data/revised/category_probability.json');
    const tfIdf = require('../data/revised/tfidf_revised.json');

    const tasks: Task[] = [];
    const yearRange = numberRange(103, 110, true);
    for (let i = 0; i < category.length; ++i) {
        const start = new Date(103, 0, 1).toCE();
        const end = new Date(110, 0, 1).toCE();

        const temp = {
            start,
            end,
            start_date: `${start.getFullYear()}-1-1`,
            duration: end.diffYear(start),
            name: category[i],
            text: category[i],
            id: `main_${i}`,
            level: 1,
            type: 'project',
            progress: 1,
            color: PROJECT_COLOR,
            data: {
                years: yearRange.map((n) => String(Math.round(n))),
                series: yearRange.map((year) => catSeries[category[i]][year] || 0)
            }
        } as Task;

        tasks.push(temp);
    }

    for (let i = 0; i < projectData.length; ++i) {
        const proj = projectData[i];
        if (!proj.code) continue;

        const start = new Date(proj.startDate, 0, 1).toCE();
        const end = new Date(proj.endDate, 0, 1).toCE();

        // TODO: 目前多標籤只取第一個，可能要做修改
        const catIndex = category.indexOf(proj.category.split(';')[0]);
        const parent = `main_${catIndex}`;
        const project = {
            start,
            end,
            start_date: `${start.getFullYear()}-1-1`,
            duration: end.diffYear(start),
            name: proj.name,
            text: proj.name,
            id: `proj_${i}`,
            level: 2,
            type: 'task',
            project: parent,
            parent,
            progress: 1,
            color: TASK_COLOR,
            data: {
                keyword: proj.chineseKeyword,
                tfidf: {
                    ...tfIdf[proj.code].tfidf
                },
                description: proj.description.replaceAll('_x000D_', '\n'),
                department: proj.department,
                // 目前只取前三高的類別與機率
                category: catProb[proj.code]['predictCategoryTop5'].split(';').slice(0, 3),
                categoryProb: catProb[proj.code]['predictProbabilityTop5'].split(';').slice(0, 3)
                    .map((prob: string) => Number(prob))
            }
        } as Task;

        tasks.push(project);
    }

    return filter(tasks, condition);
}


function filter(tasks: Task[], condition: Array<any> | null = null) {
    if (!condition) return tasks;

    let tempTasks = [...tasks];
    if (typeof condition[0] === 'string') {
        return tempTasks.filter((task) => {
            return task.type === 'project' ||
                condition.some((s: string) => {
                    return task.name.includes(s) ||
                        task.data.description.includes(s) ||
                        (task.data.keyword && task.data.keyword.includes(s)) ||
                        task.data.category.includes(s);
                });
        });
    }

    let datasets: Task[] = [];
    condition.filter(({operator}, i) => operator === 'or' || !i)
        .forEach(({text, type}) => {
            const tempDS = tempTasks.filter((task) => {
                if (task.type === 'project') return true;

                //@ts-ignore
                const target = task[type] || task.data[type];
                return target.includes(text);
            });

            //@ts-ignore
            datasets = [...new Set([...datasets, ...tempDS].map(JSON.stringify))].map(JSON.parse);
        });

    condition.slice(1).filter(({operator}) => operator !== 'or')
        .forEach(({text, type, operator}) => {
            datasets = datasets.filter((task) => {
                if (task.type === 'project') return true;

                //@ts-ignore
                const target = task[type] || task.data[type];
                if (operator === 'and') {
                    return target.includes(text);
                } else if (operator === 'not') {
                    return !target.includes(text);
                }
            });
        });

    const onlyTasks = datasets.filter(({type}) => type === 'task');
    datasets = datasets.filter(({id, type}) => {
        return type === 'task' || onlyTasks.some(({project}) => project === id);
    }).map(({start, end, ...data}) => {
        if (data.type === 'project')
            return {
                ...data,
                isOpen: true,
                start: new Date(start),
                end: new Date(end)
            };

        return {
            ...data,
            start: new Date(start),
            end: new Date(end)
        };
    });

    return datasets;
}

export function loadKeywords(searchSelected: AutocompleteSearchSource): AutocompleteResourceItem[] {
    const projectData = require('../data/revised/dataset.json');
    const catProb = require('../data/revised/category_probability.json');
    const keywords: AutocompleteResourceItem[] = [];

    if (searchSelected.name.selected) {
        const keywordsByName = Array.from(new Set(
            projectData.flatMap((proj: { name: string }) => {
                if (!proj.name) return [];
                const splitIndex = proj.name.lastIndexOf('(');
                return proj.name.substring(0, splitIndex);
            })
        )).map((name, i) => {
            return {id: `proj-name-${i}`, name};
        }) as AutocompleteResourceItem[];

        keywords.push(...keywordsByName);
    }

    if (searchSelected.category.selected) {
        const keywordsByCategory = Array.from(new Set(
            projectData.flatMap((proj: { code: string }) => {
                if (!proj.code) return [];
                return catProb[proj.code]['predictCategoryTop5'].split(';').slice(0, 3);
            }).flat()
        )).map((name, i) => {
            return {id: `proj-cat-${i}`, name, type: '類別'};
        }) as AutocompleteResourceItem[];

        keywords.push(...keywordsByCategory);
    }

    return keywords;
}