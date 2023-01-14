import category from '../constants/category';
import {Task} from '../constants/taskPropType';
import {numberRange} from '../utils/range';

const COLOR_LIST = [
    '#010221', '#010221', '#010221', '#0A7373',
    '#0A7373', '#0A7373', '#B7BF99', '#B7BF99',
    '#B7BF99', '#EDAA25', '#EDAA25', '#EDAA25',
    '#2E4159', '#2E4159', '#2E4159', '#C43302',
    '#C43302', '#C43302'
];

const PROJECT_COLOR = '#0A7373';
const TASK_COLOR = '#2E4E78';

export function loadData(catNum: string = '10'): Task[] {
    const projectData = require(`../data/revised/dataset.json`);
    const catSeries = require(`../data/revised/category_statistic.json`);
    const catProb = require(`../data/revised/category_probability.json`);

    const tasks: Task[] = [];
    const yearRange = numberRange(103, 110, true);
    for (let i = 0; i < category.length; ++i) {
        // @ts-ignore
        const start = new Date(103, 0, 1).toCE();
        // @ts-ignore
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
        // @ts-ignore
        const start = new Date(proj.startDate, 0, 1).toCE();
        // @ts-ignore
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
                desp: proj.description.replaceAll('_x000D_', '\n'),
                department: proj.department,
                category: catProb[proj.code]['predictCategoryTop5'].split(';'),
                categoryProb: catProb[proj.code]['predictProbabilityTop5'].split(';')
                    .map((prob: string) => Number(prob))
            }
        } as Task;

        tasks.push(project);
    }

    return tasks;
}