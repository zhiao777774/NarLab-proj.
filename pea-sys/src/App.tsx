import { MyNav } from './components/myNav';
import { GanttCard } from './components/ganttCard';
import './App.css';
import "gantt-task-react/dist/index.css";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
 
  return (
    <div className="App" >
      <header className="App-header"></header>
      <MyNav/>      
      <GanttCard></GanttCard>
    </div>    
  );
}

export default App;