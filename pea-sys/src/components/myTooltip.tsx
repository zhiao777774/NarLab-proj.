import React, {useState, useEffect, useContext} from 'react';
import styles from "./myComponents.module.css";
import Chart from "react-apexcharts";
import {Row, Col} from 'react-bootstrap';
import {CategoryContext} from "../helpers/CategoryContext"

export const MyToolTipContent: React.FC<{
    task: any;
}> = ({task}) => {
    const category = useContext(CategoryContext);

    var temp: any = {
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
                categories: task.data.years
            },
            title: {text: '該類別各年份數量統計'}
        },
        series: [{
            data: task.data.series
        }],
    }

    const [state, setState] = React.useState(temp)

    function checkDataSeries(task: any) {
        try {
            if (task['data']['series']) {
                temp.series[0].data = task.data.series
                let catgories = []
                for (let i = 0; i < temp.series[0].data.length; ++i) {
                    catgories.push(String(i + 103));
                }
                temp.options.xaxis.categories = catgories;
                return true;
            }
        } catch (e) {
            return false;
        }
        return false;
    }

    return (
        <div style={{zIndex: 100, fontSize: 12}}>
            {
                checkDataSeries(task) ?
                    <Row className={styles.popBox}>
                        <Col>
                            <Chart className={styles.barChart} type="bar" options={state.options}
                                   series={state.series}/>
                        </Col>
                        <Col>
                            <p className={styles.popBoxImg}>
                                {task.name}
                            </p>
                            <img className={styles.popBoxImg}
                                 src={require('./wordcloud/category50/' + task.id.replace("main_", "") + '.png')}/>
                        </Col>
                    </Row> : undefined
            }
        </div>
    );
};