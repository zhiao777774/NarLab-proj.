import React, {Component} from 'react';
import {gantt} from 'dhtmlx-gantt';
import {Tooltip} from './Tooltip';
import {loadDataByCategory} from '../utils/dataLoader';
import {SidebarCollapsedContext} from '../helpers/contexts';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import {lightGreen} from "@mui/material/colors";

export default class GanttChart extends Component {
    static contextType = SidebarCollapsedContext;

    constructor(props) {
        super(props);

        this.ganttContainer = null;
        this.activeID = null;
        this.event = {};
        this.state = {
            display: false,
            tooltip: null
        };
        this.renderChart = this.renderChart.bind(this);
    }

    renderChart(tasks = this.props.tasks, init) {
        const {startYear, endYear, clickEvent, projects} = this.props;

        gantt.plugins({tooltip: false});
        gantt.templates.tooltip_text = function (start, end, task) {
            return `<div>${task.type === 'task' ? (task.start.toRepublicYear().getFullYear() + '年度:') : ''} ${task.name}</div>`;
        }

        if (!init) gantt.detachEvent(this.event.onMouseMove);

        this.event.onTemplatesReady = gantt.attachEvent('onTemplatesReady', () => {
            // 顯示年份在標題
            gantt.templates.date_scale = function (date) {
                const y = date.toRepublicYear().getFullYear();
                const cy = '<div style="color: black; font-weight: 600; font-size:0.9em; height:15px; line-height:15px;">'
                    + y + '</div>';
                return '<div style="padding:10px 0; background-color: rgba(53, 50, 30, 0.5);">' + cy + '</div>';
            };

            gantt.templates.task_text = function (start, end, task) {
                if (task.level === 1) return task.text;
                return '<span style="margin-left: 10%;">' + task.text+ '</span>';
            };
        });

        this.event.onTaskClick = gantt.attachEvent('onTaskClick', (id) => {
            if (id.startsWith('main_')) {
                const project = tasks.filter((t) => t.id === id)[0];
                const hasChildren = gantt.getChildren(id).length > 0;
                if (project.isOpen) {
                    project.isOpen = false;
                    gantt.close(id);
                } else {
                    project.isOpen = true;
                    if (!hasChildren) {
                        const children = loadDataByCategory(project.name);
                        children.map((t) => {
                            if (t.level === 2) {
                                const {duration, ...data} = t;
                                return {
                                    duration: t.data.length / 4,
                                    ...data
                                };
                            }
                            return t;
                        }).forEach((t) => {
                            gantt.addTask(t, t.parent);
                        });
                    }
                    gantt.open(id);
                }
            }
            clickEvent(id);
            return false;
        });

        this.event.onMouseMove = gantt.attachEvent('onMouseMove', (id, e) => {
            if (!id && this.activeID) {
                this.activeID = null;
                this.setState({
                    display: false,
                    tooltip: null
                });
            }

            if (id && !this.activeID && e.target.className === 'gantt_task_content') {
                const task = gantt.getTask(id);
                const showTask = !tasks.every(({type}) => type === 'project');
                if (showTask && task.type === 'project') return false;

                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.pageX - e.offsetX;
                const y = e.pageY - e.offsetY;
                const targetWidth = e.currentTarget.offsetWidth;
                if (this.context) {
                    if (showTask) {
                        const {offsetLeft} = e.target.offsetParent;

                        if (e.x > window.innerWidth / 2)
                            task.x = offsetLeft - rect.left + e.offsetX - 220;
                        else
                            task.x = offsetLeft + rect.left + e.offsetX - 130;
                    } else {
                        if (e.x > window.innerWidth / 2)
                            task.x = x - rect.left + (e.x - window.innerWidth / 2) - 200;
                        else if (e.x > window.innerWidth / 3)
                            task.x = x - rect.left + (e.x - window.innerWidth / 3) + 200;
                        else
                            task.x = x + rect.left + (e.x - window.innerWidth / 3) - 90;
                    }
                } else {
                    if (showTask) {
                        const {offsetLeft} = e.target.offsetParent;

                        if (e.x > targetWidth / 2)
                            task.x = offsetLeft - rect.left + e.offsetX - 150;
                        else
                            task.x = offsetLeft + rect.left + e.offsetX - 200;
                    } else {
                        if (e.offsetX > targetWidth * (2 / 3))
                            task.x = x - rect.left + (e.offsetX - targetWidth * (2 / 3)) + 50;
                        else if (e.offsetX > targetWidth * (1 / 3) && e.x > window.innerWidth / 2)
                            task.x = x - rect.left + (e.offsetX - targetWidth * (2 / 3)) + 50;
                        else if (e.offsetX > targetWidth * (1 / 3) && e.x <= window.innerWidth / 2)
                            task.x = x + rect.left + (e.offsetX - targetWidth / 2) + 80;
                        else
                            task.x = x + rect.left + (e.offsetX - targetWidth / 3) - 100;
                    }
                }

                if (y > window.innerHeight / 2)
                    task.y = y + rect.top - (window.innerHeight / 2) - 90;
                else
                    task.y = y - rect.top - 90;


                this.activeID = id;
                this.setState({
                    display: true,
                    tooltip: task
                });
            }

            return false;
        });

        gantt.config.start_date = new Date(startYear, 0);
        gantt.config.end_date = new Date(endYear, 0);

        gantt.config.show_grid = false;
        gantt.config.readonly = true;
        gantt.config.open_tree_initially = false;
        gantt.config.open_split_tasks = true;

        gantt.config.scale_unit = 'year';
        gantt.config.date_format = '%Y-%m-%d';
        gantt.config.duration_unit = 'year';
        gantt.config.duration_step = 4;
        gantt.config.row_height = 50;

        gantt.clearAll();
        if (init) {
            gantt.init(this.ganttContainer);
            gantt.parse({data: tasks});
        } else {
            let prevProject = undefined;
            tasks.map((t) => {
                if (t.level === 2) {
                    const {duration, ...data} = t;
                    return {
                        duration: t.data.length / 4,
                        ...data
                    };
                }
                return t;
            }).forEach((t) => {
                const isAllProject = tasks.every((t) => t.type === 'project');
                if (t.parent) {
                    if (!prevProject || t.parent !== prevProject.id) {
                        const parent = projects.filter((p) => p.id === t.parent)[0];
                        if (!parent || !parent.id) return;
                        gantt.addTask({
                            isOpen: true,
                            ...parent
                        });
                        gantt.open(parent.id);
                        prevProject = parent;
                    }
                    gantt.addTask(t, t.parent);
                } else {
                    if (isAllProject) {
                        gantt.addTask(t);
                    } else {
                        if (t.type === 'project') {
                            if (tasks.some((temp) => temp.parent === t.id))
                                gantt.addTask(t);
                        } else {
                            gantt.addTask(t);
                        }
                    }
                }
            });
        }
    }

    componentDidMount() {
        this.renderChart(this.props.tasks, true);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.tasks !== this.props.tasks) {
            this.renderChart(this.props.tasks, false);
        }
    }

    render() {
        const {display, tooltip} = this.state;
        return (
            <div>
                <div
                    ref={(input) => {
                        this.ganttContainer = input
                    }}
                    style={{width: '100%', height: '80vh', overflow: 'scroll'}}
                />
                {
                    display ?
                        <div style={{
                            position: 'absolute',
                            left: tooltip.x + 'px',
                            top: tooltip.y + 'px',
                        }}>
                            <Tooltip task={tooltip}/>
                        </div>
                        : null
                }
            </div>
        );
    }
}