type TaskType = 'task' | 'project';

export interface ProjectData {
    readonly years: string[];
    readonly series: string[];
}

export interface TaskData extends ProjectData {
    readonly keyword: string;
    readonly tfidf: {
        CH: string[];
        EN: string[]
    };
    readonly description: string;
    readonly department: string;
    readonly category: string[];
    readonly categoryProb: number[];
}

export interface Task {
    start: Date;
    end: Date;
    start_date: string;
    duration: number;
    readonly name: string;
    readonly text: string;
    readonly id: string;
    readonly code: string;
    readonly level: number;
    readonly type: TaskType;
    progress: number;
    color: string;
    readonly data: TaskData | any;
    project?: string;
    parent?: string;
}

export interface Project extends Task {
    isOpen: boolean;
    render: string;
}

export type SearchType = 'basic' | 'advance' | 'auto-complete';

export type AutocompleteSearchSource = {
    [key: string]: {
        text: string,
        selected: boolean
    };
};