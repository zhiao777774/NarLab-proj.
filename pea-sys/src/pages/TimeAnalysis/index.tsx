import {useEffect, useState} from 'react';
import Chart from 'react-apexcharts';
import {loadData} from '../../utils/dataLoader';

export default function TimeAnalysis() {
    const defaultChartConfig = {
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
            categories: ['103']
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

    const [chartConfig, setChartConfig] = useState<object>(defaultChartConfig);
    const [countData, setCountData] = useState<object[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const initData = async () => {
            setLoading(true);
            const data = await loadData();
            const projectTasks = data.filter((t) => t.type === 'project');
            setCountData(projectTasks.map((proj) => {
                return {
                    name: String(proj.name),
                    data: proj.data.series
                };
            }));
            const chartConfig = {...defaultChartConfig};
            chartConfig.xaxis.categories = projectTasks[0].data.years;
            setChartConfig(chartConfig);
            setLoading(false);
        }
        initData();
    }, []);

    return (
        <div style={{margin: 'auto', backgroundColor: 'white', padding: '45px'}}>
            {
                !loading ?
                    <Chart
                        // @ts-ignore
                        options={chartConfig}
                        series={countData}
                        type="line"
                        width="1000"
                        height="700"
                    />
                    :
                    <span>圖表載入中...</span>
            }
        </div>
    );
}