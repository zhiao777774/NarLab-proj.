import category from '../constants/category';
import {numberRange} from "../utils/range";

const color_list = [
    '#010221', '#010221', '#010221', '#0A7373',
    '#0A7373', '#0A7373', '#B7BF99', '#B7BF99',
    '#B7BF99', '#EDAA25', '#EDAA25', '#EDAA25',
    '#2E4159', '#2E4159', '#2E4159', '#C43302',
    '#C43302', '#C43302'
];

const projectColor = '#0A7373';
const taskColor = '#2E4E78';

export function loadData(catNum: string = '10') {
    const projectData = require(`../data/revised/dataset.json`);
    const catSeries = require(`../data/revised/category_statistic.json`);
    const yearRange = numberRange(103, 110, true)

    const tasks: object[] = [];

    for (let i = 0; i < category.length; ++i) {
        // @ts-ignore
        const start = new Date(103, 0, 1).toCE();
        // @ts-ignore
        const end = new Date(110, 0, 1).toCE();

        const temp = {
            start,
            start_date: `${start.getFullYear()}-1-1`,
            end,
            duration: end.diffYear(start),
            name: category[i],
            text: category[i],
            id: `main_${i}`,
            level: 1,
            type: "project",
            progress: 1,
            color: projectColor, //color_list[i % color_list.length],
            data: {
                years: yearRange,
                series: yearRange.map((year) => catSeries[category[i]][year] || 0)
            }
        };

        tasks.push(temp);
    }

    for (let i = 0; i < projectData.length; ++i) {
        const proj = projectData[i];
        if (!proj.code) continue;
        // @ts-ignore
        const start = new Date(proj.startDate, 0, 1).toCE();
        // @ts-ignore
        const end = new Date(proj.endDate, 0, 1).toCE();

        const parent = `main_${category.indexOf(proj.category.split(',')[0])}`;
        const temp = {
            start,
            start_date: `${start.getFullYear()}-1-1`,
            end,
            duration: end.diffYear(start),
            name: proj.name,
            text: proj.name,
            id: `proj_${i}`,
            level: 2,
            type: "task",
            project: parent,
            parent,
            progress: 1,
            color: taskColor,
            data: {
                "keyword": proj.chineseKeyword,
                //"ner": proj.ner,
                //"tf_idf": proj.tf_idf,
                "desp": proj.description,
                "department": proj.department,
            }
        };

        tasks.push(temp);
    }
    return tasks;
}