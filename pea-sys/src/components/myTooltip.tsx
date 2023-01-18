import React, {useContext} from 'react';
import {Row, Col} from 'react-bootstrap';
import Chart from 'react-apexcharts';
import {CategoryContext} from '../helpers/context';
import styles from './myComponents.module.css';

export const MyTooltip: React.FC<{
    task: any;
    type: string
}> = ({task, type = task.type}) => {
    const category = useContext(CategoryContext);

    const isProject = (type === 'project');
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
                categories: isProject ? task.data.years : task.data.category
            },
            title: {text: isProject ? '該類別各年份總計畫數量統計' : '計畫前幾大類別與機率'}
        },
        series: [{
            name: isProject ? '數量' : '機率',
            data: isProject ? task.data.series : task.data.categoryProb
        }],
    };

    const [state, setState] = React.useState(config);

    return (
        <div style={{zIndex: 100, fontSize: 12}}>
            <Row className={styles.tooltipContainer}>
                <Col>
                    {
                        !isProject ? <p>{task.start.toRepublicYear().getFullYear()}年度: {task.name}</p> : null
                    }
                    <Chart className={styles.barChart} type="bar" options={state.options}
                           series={state.series}/>
                </Col>
                {
                    isProject ?
                        <Col>
                            <p className={styles.tooltipComponent}>
                                {task.name}
                            </p>
                            <img className={styles.tooltipComponent} alt='wordcloud'
                                 src={require(`./wordcloud/category50/${task.id.replace('main_', '')}.png`)}/>
                        </Col>
                        : null
                }
            </Row>
        </div>
    );
};