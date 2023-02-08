import React from 'react';
import {Route} from 'react-router-dom';
import Gantt from '../../pages/Gantt';

export const GanttRouter = () => {
    return (
        <React.Fragment>
            <Route path="/Gantt" element={<Gantt/>}/>
        </React.Fragment>
    );
};