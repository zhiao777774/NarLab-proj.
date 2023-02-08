import React from 'react';
import {Route} from 'react-router-dom';
import TimeAnalysis from '../../pages/TimeAnalysis';

export const TimeAnalysisRouter = () => {
    return (
        <React.Fragment>
            <Route path="/TimeAnalysis" element={<TimeAnalysis/>}/>
        </React.Fragment>
    )
};