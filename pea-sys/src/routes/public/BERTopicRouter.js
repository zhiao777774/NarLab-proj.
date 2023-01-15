import React from 'react';
import {Route} from 'react-router-dom';
import BERTopic from '../../pages/BERTopic';

export const BERTopicRouter = () => {
    return (
        <React.Fragment>
            <Route path="/BERTopic/:figId" element={<BERTopic/>}/>
        </React.Fragment>
    )
};