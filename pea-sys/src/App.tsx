import {Route, Routes} from 'react-router-dom';
import SidebarContainer from './components/sidebar';
import Gantt from './pages/Gantt';
import TimeAnalysis from './pages/TimeAnalysis';
import BERTopic from './pages/BERTopic';
import LabelingPlatform from './pages/LabelingPlatform';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';


function App() {
    return (
        <div className="App">
            <header className="App-header"/>
            <SidebarContainer>
                <Routes>
                    <Route path="/" element={<Gantt/>}/>
                    <Route path="/Gantt" element={<Gantt/>}/>
                    <Route path="/TimeAnalysis" element={<TimeAnalysis/>}/>
                    <Route path="/BERTopic" element={<BERTopic/>}/>
                    <Route path="/BERTopic/:figId" element={<BERTopic/>}/>
                    <Route path="/Labeling-Platform" element={<LabelingPlatform/>}/>
                </Routes>
            </SidebarContainer>
        </div>
    );
}

export default App;