declare type TaskType = 'task' | 'project';

export interface Task {
    start: Date,
    end: Date,
    start_date: string,
    duration: number,
    name: string,
    text: string,
    id: string,
    level: number,
    type: TaskType,
    progress: number,
    color: string,
    data: object
    project?: string
    parent?: string
}