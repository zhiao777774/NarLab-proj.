import React from 'react';
// import {GanttRouter} from './GanttRouter';
// import {TimeAnalysisRouter} from './TimeAnalysisRouter';
// import {BERTopicRouter} from './BERTopicRouter';
import Gantt from "../../pages/Gantt";
import {Route} from "react-router-dom";
import TimeAnalysis from "../../pages/TimeAnalysis";
import BERTopic from "../../pages/BERTopic";


export const PublicRouter = () => {
    return (
        <>
            <Route path="/Gantt" element={<Gantt/>}/>
            <Route path="/TimeAnalysis" element={<TimeAnalysis/>}/>
            <Route path="/BERTopic/:figId" element={<BERTopic/>}/>
        </>
    )
};