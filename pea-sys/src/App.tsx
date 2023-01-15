import {Route, Routes} from 'react-router-dom';
import SidebarContainer from './components/sidebar';
import {MyNav} from './components/myNav';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Gantt from "./pages/Gantt";
import TimeAnalysis from "./pages/TimeAnalysis";
import BERTopic from "./pages/BERTopic";


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
                </Routes>
            </SidebarContainer>
        </div>
    );
}

export default App;