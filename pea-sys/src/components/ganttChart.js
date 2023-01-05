import React, {Component} from 'react';
import {gantt} from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';

export default class GanttChart extends Component {
    constructor(props) {
        super(props);

        this.ganttContainer = null;
        this.renderChart = this.renderChart.bind(this);
    }

    renderChart(tasks = this.props.tasks, init) {
        const {startYear, endYear, clickEvent, projects, TooltipContent} = this.props;

        gantt.plugins({
            tooltip: true
        });
        gantt.templates.tooltip_text = function (start, end, task) {
            return '<TooltipContent task={task} />';
        }

        gantt.attachEvent('onTemplatesReady', () => {
            // 顯示年份在標題
            gantt.templates.date_scale = function (date) {
                const y = gantt.date.date_to_str('%Y')(date);
                const cy = '<div style="color: black; font-weight: 600; font-size:0.9em; height:15px; line-height:15px;">'
                    + y + '</div>';
                return '<div style="padding:10px 0; background-color: rgba(53, 50, 30, 0.5)">' + cy + '</div>';
            }
        });

        gantt.attachEvent('onTaskClick', (id) => {
            if (id.startsWith('main_')) {
                const tmpTask = tasks.filter((t) => t.id === id)[0];
                if (tmpTask.hasOwnProperty('isOpen')) {
                    if (tmpTask.isOpen) {
                        tmpTask.isOpen = false;
                        gantt.close(id);
                    } else {
                        tmpTask.isOpen = true;
                        gantt.open(id);
                    }
                } else {
                    tmpTask.isOpen = false;
                    gantt.close(id);
                }
            }
            clickEvent(id);
            return false;
        });

        gantt.config.start_date = new Date(startYear, 0);
        gantt.config.end_date = new Date(endYear, 0);

        gantt.config.show_grid = false;
        gantt.config.readonly = true;
        gantt.config.open_tree_initially = true;

        gantt.config.scale_unit = 'year';
        gantt.config.date_format = '%Y-%m-%d';
        gantt.config.duration_unit = 'year';
        gantt.config.duration_step = 4;
        gantt.config.row_height = 50;

        if (init) {
            gantt.init(this.ganttContainer);
            gantt.parse({
                data: tasks
            });
        } else {
            gantt.clearAll();
            let prevProject = undefined;
            tasks.forEach((t) => {
                if (t.parent) {
                    if (!prevProject || t.parent !== prevProject.id) {
                        const parent = projects.filter((p) => p.id === t.parent)[0]
                        gantt.addTask({
                            isOpen: true,
                            ...parent
                        });
                        gantt.open(parent.id);
                        prevProject = parent;
                    }
                    gantt.addTask(t, t.parent);
                } else {
                    gantt.addTask(t);
                }
            });
        }
    }

    componentDidMount() {
        this.renderChart(this.props.tasks, true);
    }

    componentDidUpdate(prevProps) {
        this.renderChart(this.props.tasks, false);
    }

    render() {
        return (
            <div
                ref={(input) => {
                    this.ganttContainer = input
                }}
                style={{width: '1330px', height: '600px'}}
            />
        );
    }
}