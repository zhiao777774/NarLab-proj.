import React from 'react';
import {Route, Routes} from 'react-router-dom';
import BERTopic from '../../pages/BERTopic';

export const BERTopicRouter = () => {
    return (
        <Routes>
            <Route path="/BERTopic/:figId" element={<BERTopic/>}/>
        </Routes>
    )
};