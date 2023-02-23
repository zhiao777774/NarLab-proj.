import React, {useState} from 'react';
import {Row, Col, InputGroup, Button} from 'react-bootstrap';
import Chart from 'react-apexcharts';
import {Task} from '../constants/types';
import styles from './Tooltip.module.css';

export const Tooltip: React.FC<{ task: Task; type?: string; }> = ({task, type = task.type}) => {
    const [phase, setPhase] = useState<number>(0);
    // const isProject = (type === 'project');
    const isProject = (task.level === 1);
    const config: any = {
        options: {
            chart: {
                id: task.id
            },
            dataLabels: {
                enabled: true
            },
            plotOptions: {
                bar: {
                    horizontal: true
                }
            },
            xaxis: {
                categories: isProject ? task.data.years : task.data[phase].data.category
            },
            title: {text: isProject ? '該類別各年份總計畫數量統計' : '計畫前幾大類別與機率'}
        },
        series: [{
            name: isProject ? '數量' : '機率',
            data: isProject ? task.data.series : task.data[phase].data.categoryProb
        }],
    };

    return (
        <div style={{zIndex: 100, fontSize: 12}}>
            <Row className={styles.tooltipContainer}>
                <Col>
                    {
                        !isProject ?
                            <p>{task.data[phase].start.toRepublicYear().getFullYear()}年度: {task.name}</p> : null
                    }
                    {
                        !isProject ?
                            <Row>
                                {
                                    task.data.length > 1 ?
                                        <InputGroup className="mb-4 justify-content-center">
                                            {task.data.map((t: any, i: number) =>
                                                <Button key={`${t.name}-${i}`} variant="outline-dark" size="sm" onClick={() => setPhase(i)}>
                                                    第 {i + 1} 期
                                                </Button>
                                            )}
                                        </InputGroup>
                                        : null
                                }
                            </Row>
                            : null
                    }
                    <Chart className={styles.barChart} type="bar" options={config.options}
                           series={config.series}/>
                </Col>
                {
                    isProject ?
                        <Col>
                            <p className={styles.tooltipComponent}>
                                {task.name}
                            </p>
                            <img className={styles.tooltipComponent} alt={`wordcloud-${task.name}`}
                                 src={require(`../data/wordcloud/${task.id.replace('main_', '')}.png`)}/>
                        </Col>
                        : null
                }
            </Row>
        </div>
    );
};