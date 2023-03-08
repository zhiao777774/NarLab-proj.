import {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {Button} from 'react-bootstrap';
import {BERTopicFigureMap, RouterMap} from '../../constants/route';

export default function BERTopic() {
    const {figId = RouterMap.BERTopic[0]} = useParams();
    const navigate = useNavigate();
    const redirect = (path: string) => navigate('/BERTopic/' + path);

    const [figure, setFigure] = useState<string>(figId);

    const style = {
        [RouterMap.BERTopic[0]]: {
            width: 1300,
            height: 700
        },
        [RouterMap.BERTopic[1]]: {
            width: 1050,
            height: 550
        },
        [RouterMap.BERTopic[2]]: {
            width: 1050,
            height: 600
        }
    };

    useEffect(() => {
        setFigure(figId);
        setFigContainerWidth(style[figId].width);
        setFigContainerHeight(style[figId].height);
    }, [figId]);

    const [figContainerWidth, setFigContainerWidth] = useState<number>(style[figId].width);
    const [figContainerHeight, setFigContainerHeight] = useState<number>(style[figId].height);

    return (
        <div style={{margin: 'auto', backgroundColor: 'white'}}>
            <iframe
                src={process.env.PUBLIC_URL + '/' + BERTopicFigureMap[figure as keyof typeof BERTopicFigureMap] + '.html'}
                width={figContainerWidth}
                height={figContainerHeight}
            />
            <br/>
            <Button variant="outline-info" onClick={() => redirect(RouterMap.BERTopic[0])}>
                Bar Chart
            </Button>
            <Button variant="outline-info" onClick={() => redirect(RouterMap.BERTopic[1])}
                    style={{margin: "10px"}}>
                Topics over Time
            </Button>
            <Button variant="outline-info" onClick={() => redirect(RouterMap.BERTopic[2])}>
                Cluster
            </Button>
            <p> This result uses Bertopic and CKIP's bert-base-chinese-ws </p>
        </div>
    );
}