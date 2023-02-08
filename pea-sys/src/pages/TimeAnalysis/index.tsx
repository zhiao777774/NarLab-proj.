import {useState} from 'react';
import Chart from 'react-apexcharts';
import {loadData} from '../../utils/dataLoader';

export default function TimeAnalysis() {
    const allTasks = loadData();
    const projectTasks = allTasks.filter((t) => t.type === 'project');

    const chartConfig = {
        chart: {
            animations: {
                enabled: false
            }
        },
        plotOptions: {
            bar: {
                horizontal: true
            }
        },
        xaxis: {
            categories: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021]
        },
        title: {
            text: '計畫類別各年份數量統計',
            align: 'center',
            margin: 20,
            style: {
                fontSize: '20px'
            }
        },
        legend: {
            itemMargin: {
                horizontal: 6,
                vertical: 8
            },
        }
    };

    const [countData, setCountData] = useState<object[]>(
        projectTasks.map((proj) => {
            return {
                name: String(proj.name),
                //@ts-ignore
                data: proj.data.series
            };
        })
    );

    return (
        <div style={{margin: 'auto', backgroundColor: 'white', padding: '45px'}}>
            <Chart
                // @ts-ignore
                options={chartConfig}
                series={countData}
                type="line"
                width="1000"
                height="700"
            />
        </div>
    );
}