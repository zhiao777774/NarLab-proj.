import {Routes, Route} from 'react-router-dom';
import Gantt from '../../pages/Gantt';

export const GanttRoutes = (
    <Routes>
        <Route path="/" element={<Gantt/>}/>
        <Route path="/Gantt" element={<Gantt/>}/>
    </Routes>
);