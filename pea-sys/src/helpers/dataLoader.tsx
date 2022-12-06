import { Task } from 'gantt-task-react';

const color_list = [
    '#010221', '#010221', '#010221', '#0A7373',
    '#0A7373', '#0A7373', '#B7BF99', '#B7BF99',
    '#B7BF99', '#EDAA25', '#EDAA25', '#EDAA25',
    '#2E4159', '#2E4159', '#2E4159', '#C43302',
    '#C43302', '#C43302'
];

const taskColor="#2E4E78";

export function loadData(catNum: string = '10', prefixStr="revise_length_"){
    var availableCatNumbers = ['10', '20', '30', '40', '50']
    if (availableCatNumbers.includes(catNum)){
        var data = require(`../data/main_${prefixStr}${catNum}.json`);    
        var proj_data = require(`../data/proj_${prefixStr}${catNum}.json`);
    } else {
        alert("Data not available...")
        return []
    } 

    const tasks: Task[] = [];
    
    for (let i=0; i<data.length; ++i){        
        const temp = {
            start: new Date(data[i].start, 1, 1),
            end: new Date(data[i].end + 4, 1, 1),
            name: data[i].name,
            id: data[i].id,
            displayOrder: data[i].displayOrder,
            type: "project",
            progress: 100,
            styles: { 
                backgroundColor:color_list[i%color_list.length],
                backgroundSelectedColor:color_list[i%color_list.length],
                progressColor: color_list[i%color_list.length], 
                progressSelectedColor: color_list[i%color_list.length],
                fontSize:"32px",
                rowHeight:100
            },
            data: data[i]
        } as Task;

        tasks.push(temp);
    }

    for (let i=0; i<proj_data.length; ++i){        
        const temp = {
            start: new Date(proj_data[i].start, 1, 1),
            end: new Date(proj_data[i].end, 1, 1),
            name:  proj_data[i].name,
            id: proj_data[i].id,
            displayOrder: proj_data[i].displayOrder,
            type: "task",
            project: proj_data[i].project,
            progress: 100,
            styles: { 
                backgroundColor:taskColor,
                progressColor:taskColor, 
                progressSelectedColor:taskColor,                
            },
            data: {
                "keyword": proj_data[i].keyword,
                "ner": proj_data[i].ner,
                "tf_idf": proj_data[i].tf_idf,
                "desp": proj_data[i].desp,
                "department": proj_data[i].department,
            }
        } as Task;
        
        tasks.push(temp);
    }
    return tasks;
}


export const testHtml = `
    
`