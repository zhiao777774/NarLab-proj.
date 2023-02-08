import {Routes} from 'react-router-dom';
import {GanttRoutes} from './GanttRoutes';
import {TimeAnalysisRoutes} from './TimeAnalysisRoutes';
import {BERTopicRoutes} from './BERTopicRoutes';


export const PublicRoutes = (
    <Routes>
        {GanttRoutes}
        {TimeAnalysisRoutes}
        {BERTopicRoutes}
    </Routes>
);