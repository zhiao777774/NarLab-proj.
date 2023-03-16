import {AutocompleteResourceItem} from '../components/Autocomplete';
import category from '../constants/category';
import {AutocompleteSearchSource, Project, Task} from '../constants/types';
import {numberRange} from './range';

const PROJECT_COLOR = '#0A7373';
const TASK_COLOR = '#2E4E78';

export async function loadData(condition: Array<any> | null = null): Promise<Task[]> {
    const tasks: Task[] = [];
    const [projectData, catSeries, catProb, tfIdf] = await Promise.all(
        ['/dataset', '/category/stat', '/category/prob', '/tfidf']
            .map(url => fetch('http://localhost:8090' + url, {
                method: 'POST',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({condition: {}})
            }).then(res => res.json()))
    );

    const yearRange = numberRange(103, 110, true);
    for (let i = 0; i < category.length; ++i) {
        const start = new Date(103, 0, 1).toCE();
        const end = new Date(110, 0, 1).toCE();

        const categoryProject = {
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
            },
            isOpen: false
        } as Project;

        tasks.push(categoryProject);
    }

    Object.keys(projectData).forEach((projectName, j) => {
        const project = {
            name: projectName,
            text: projectName,
            id: `proj_${j}`,
            level: 2,
            type: 'task',
            color: TASK_COLOR,
            data: []
        } as Project;

        for (let i = 0; i < projectData[projectName].length; ++i) {
            const proj = projectData[projectName][i];
            if (!proj.code || proj.code === ' ') continue;

            const start = new Date(proj.startDate, 0, 1).toCE();
            const end = new Date(proj.endDate, 0, 1).toCE();

            // TODO: 目前多標籤只取第一個，可能要做修改
            const catIndex = category.indexOf(proj.category.split(';')[0]);
            const parent = `main_${catIndex}`;

            if (!i) {
                project['project'] = parent;
                project['parent'] = parent;
                project['start'] = start;
                project['start_date'] = `${start.getFullYear()}-1-1`;
            } else if (i === projectData[projectName].length - 1) {
                project['duration'] = end.diffYear(project['start']);
            }

            const task = {
                start,
                end,
                start_date: `${start.getFullYear()}-1-1`,
                duration: end.diffYear(start),
                name: proj.name,
                text: proj.name,
                id: `proj_${j}_${i}`,
                code: proj.code,
                level: 3,
                type: 'task',
                project: `proj_${j}`,
                parent: `proj_${j}`,
                progress: 1,
                color: TASK_COLOR,
                data: {
                    keyword: proj.chineseKeyword.trim(),
                    tfidf: {
                        ...tfIdf[proj.code]?.data
                    },
                    description: proj.description.trim().replaceAll('_x000D_', '\n'),
                    department: proj.department,
                    // 目前只取前三高的類別與機率
                    category: catProb[proj.code] && catProb[proj.code]['predictCategoryTop5'].slice(0, 3),
                    categoryProb: catProb[proj.code] && catProb[proj.code]['predictProbabilityTop5'].slice(0, 3)
                        .map((prob: string) => Number(prob))
                }
            } as Task;

            project.data.push(task);
        }

        if (project.data.length > 0) {
            tasks.push(project);
            project.data.forEach((t: Task) => tasks.push(t));
        }
    });

    return filterBy(tasks, condition);

    // const projectData = require('../data/revised/dataset_combine.json');
    // const catSeries = require('../data/revised/category_statistic.json');
    // const catProb = require('../data/revised/category_probability.json');
    // const tfIdf = require('../data/revised/tfidf.json');

    // const tasks: Task[] = [];
    // const yearRange = numberRange(103, 110, true);
    // for (let i = 0; i < category.length; ++i) {
    //     const start = new Date(103, 0, 1).toCE();
    //     const end = new Date(110, 0, 1).toCE();
    //
    //     const categoryProject = {
    //         start,
    //         end,
    //         start_date: `${start.getFullYear()}-1-1`,
    //         duration: end.diffYear(start),
    //         name: category[i],
    //         text: category[i],
    //         id: `main_${i}`,
    //         level: 1,
    //         type: 'project',
    //         progress: 1,
    //         color: PROJECT_COLOR,
    //         data: {
    //             years: yearRange.map((n) => String(Math.round(n))),
    //             series: yearRange.map((year) => catSeries[category[i]][year] || 0)
    //         },
    //         isOpen: false
    //     } as Project;
    //
    //     tasks.push(categoryProject);
    // }
    //
    // Object.keys(projectData).forEach((projectName, j) => {
    //     const project = {
    //         name: projectName,
    //         text: projectName,
    //         id: `proj_${j}`,
    //         level: 2,
    //         type: 'task',
    //         color: TASK_COLOR,
    //         data: []
    //     } as Project;
    //
    //     for (let i = 0; i < projectData[projectName].length; ++i) {
    //         const proj = projectData[projectName][i];
    //         if (!proj.code || proj.code === ' ') continue;
    //
    //         const start = new Date(proj.startDate, 0, 1).toCE();
    //         const end = new Date(proj.endDate, 0, 1).toCE();
    //
    //         // TODO: 目前多標籤只取第一個，可能要做修改
    //         const catIndex = category.indexOf(proj.category.split(';')[0]);
    //         const parent = `main_${catIndex}`;
    //
    //         if (!i) {
    //             project['project'] = parent;
    //             project['parent'] = parent;
    //             project['start'] = start;
    //             project['start_date'] = `${start.getFullYear()}-1-1`;
    //         } else if (i === projectData[projectName].length - 1) {
    //             project['duration'] = end.diffYear(project['start']);
    //         }
    //
    //         const task = {
    //             start,
    //             end,
    //             start_date: `${start.getFullYear()}-1-1`,
    //             duration: end.diffYear(start),
    //             name: proj.name,
    //             text: proj.name,
    //             id: `proj_${j}_${i}`,
    //             code: proj.code,
    //             level: 3,
    //             type: 'task',
    //             project: `proj_${j}`,
    //             parent: `proj_${j}`,
    //             progress: 1,
    //             color: TASK_COLOR,
    //             data: {
    //                 keyword: proj.chineseKeyword,
    //                 tfidf: {
    //                     ...tfIdf[proj.code].tfidf
    //                 },
    //                 description: proj.description.replaceAll('_x000D_', '\n'),
    //                 department: proj.department,
    //                 // 目前只取前三高的類別與機率
    //                 category: catProb[proj.code]['predictCategoryTop5'].split(';').slice(0, 3),
    //                 categoryProb: catProb[proj.code]['predictProbabilityTop5'].split(';').slice(0, 3)
    //                     .map((prob: string) => Number(prob))
    //             }
    //         } as Task;
    //
    //         project.data.push(task);
    //     }
    //
    //     if (project.data.length > 0) {
    //         tasks.push(project);
    //         project.data.forEach((t: Task) => tasks.push(t));
    //     }
    // });
    //
    // return filter(tasks, condition);
}

export function loadDataByCategory(cat: string): Task[] {
    const projectData = require('../data/revised/dataset_combine.json');
    const catProb = require('../data/revised/category_probability.json');
    const tfIdf = require('../data/revised/tfidf.json');

    const tasks: Task[] = [];
    Object.keys(projectData).forEach((p, j) => {
        const mainProject = {
            name: p,
            text: p,
            id: `proj_${j}`,
            level: 2,
            type: 'task',
            color: TASK_COLOR,
            data: []
        } as Project;

        for (let i = 0; i < projectData[p].length; ++i) {
            const proj = projectData[p][i];
            if (!proj.code || proj.code === ' ') continue;
            if (proj.category.split(';')[0] !== cat) continue;

            const start = new Date(proj.startDate, 0, 1).toCE();
            const end = new Date(proj.endDate, 0, 1).toCE();

            const catIndex = category.indexOf(proj.category.split(';')[0]);
            const parent = `main_${catIndex}`;
            if (!i) {
                mainProject['project'] = parent;
                mainProject['parent'] = parent;
                mainProject['start'] = start;
                mainProject['start_date'] = `${start.getFullYear()}-1-1`;
            } else if (i === projectData[p].length - 1) {
                mainProject['duration'] = end.diffYear(mainProject['start']);
            }

            const project = {
                start,
                end,
                start_date: `${start.getFullYear()}-1-1`,
                duration: end.diffYear(start),
                name: proj.name,
                text: proj.name,
                id: `proj_${j}_${i}`,
                code: proj.code,
                level: 3,
                type: 'task',
                project: `proj_${j}`,
                parent: `proj_${j}`,
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

            mainProject.data.push(project);
        }

        if (mainProject.data.length > 0) {
            tasks.push(mainProject);
            mainProject.data.forEach((t: Task) => tasks.push(t));
        }
    });

    return tasks;
}


export function filterBy(tasks: Task[], condition: Array<any> | null = null) {
    if (!condition) return tasks;

    let tempTasks = [...tasks];
    if (typeof condition[0] === 'string') {
        return tempTasks.filter((task) => {
            return task.type === 'project' ||
                condition.some((s: string) => {
                    if (Array.isArray(task.data)) {
                        return task.data.some((subTask: Task) => {
                            return subTask.name.includes(s) ||
                                subTask.data.description.includes(s) ||
                                (subTask.data.keyword && subTask.data.keyword.includes(s)) ||
                                subTask.data.category.includes(s);
                        });
                    }

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
                let target = task.data[type];
                if (target) {
                    if (operator === 'and') {
                        if (type === 'department')
                            return text.includes(target);
                        return target.includes(text);
                    } else if (operator === 'not') {
                        return !target.includes(text);
                    }
                } else {
                    return task.data.some((subTask: Task) => {
                        //@ts-ignore
                        target = subTask.data[type];
                        if (operator === 'and') {
                            if (type === 'department')
                                return text.includes(target);
                            return target.includes(text);
                        } else if (operator === 'not') {
                            return !target.includes(text);
                        }
                    });
                }
                return false;
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

export function getDepartments() {
    const projectData = require('../data/revised/dataset.json');
    const departments = Array.from(
        new Set(projectData.map(({department}: { department: string }) => department))
    );

    departments.sort();
    return departments.filter(department => department);
}