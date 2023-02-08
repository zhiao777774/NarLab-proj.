import {Routes, Route} from 'react-router-dom';
import BERTopic from '../../pages/BERTopic';

export const BERTopicRoutes = (
    <Routes>
        <Route path="/BERTopic" element={<BERTopic/>}/>
        <Route path="/BERTopic/:figId" element={<BERTopic/>}/>
    </Routes>
);