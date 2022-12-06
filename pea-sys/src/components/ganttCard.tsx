import { useCallback, useEffect, useState }  from 'react';
import { Card, Row, Col, Form, InputGroup, FormControl, Button} from 'react-bootstrap';
import { MyToolTipContent } from './myTooltip';
import { MyInfo } from './myInfo';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import { loadData, } from '../helpers/dataLoader';
import '../App.css';
import "gantt-task-react/dist/index.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import {CategoryContext} from "../helpers/CategoryContext"

import Chart from "react-apexcharts";
// import { selectClasses } from '@mui/material';

export const GanttCard = () => {    
    // 讀取在背景的資料
    const [allTasks, setAllTasks] = useState<Task[]>(loadData());
            
    // 顯示的資料
    const [displayTasks, setDisplayTasks] = useState<Task[]>([]);  

    // 展開的計畫id
    const [expandedProj, setexpandedProj] = useState<Task[]>([]);
    const [curTask, setCurTask] = useState<Task>();

    const [searchString, setSearchString] = useState<string>('');  

    const [categoryNum, setCategoryNum] = useState<string>('10');

    const [options, ] = useState<any>({              
        plotOptions: {bar: {
            horizontal: true
        }},
        xaxis: {
          categories: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021]
        },
        title: { text:'該類別各年份數量統計' }
    })
    
    const [departments, setDepartments] = useState<string[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<string>("");

    const [countData, setCountData] = useState<any>();
    const [extendGantt, setExtendGantt] = useState<boolean>(true);
    const [ganttColumnWidth, setGanttColumnWidth] = useState<number>(10);
    
    
    // 只有在更換category的狀況下，allTasks才會變動。當allTask變動時，從新設定顯示的tasks
    const getProjects = useCallback(()=>{
      const temp = [];
      for (var i=0; i< allTasks.length; i++){
          if (allTasks[i].type === "project"){
            temp.push(allTasks[i]);
          }
      }
      return temp;
    }, [allTasks])
  
    const getProjectsCount = useCallback(()=>{
      let proj = getProjects();      
      let allCount = []
      let id = []      
      for (let i=0; i < proj.length; i++){
        let temp = proj[i] as any;
        
        id.push(temp.name)
        allCount.push({
          name: String(temp.name),
          data : temp.data.series
        })        
      }
      id.sort(function(a, b){return a - b})      
      setCountData(allCount)
    }, [getProjects])

    // 以 project 取得底下的 task
    const getTasks = useCallback((project: Task): Task[] => {
        const tasks = [];
        if (project !== undefined){
          for (var i=0; i< allTasks.length; i++){
              if (allTasks[i].project === project.id) {
                tasks.push(allTasks[i]);
              };
          }
        }
        return tasks;
    }, [allTasks])

    
    // 取得部會資料
    const getDepartments = useCallback(() => {    
      let _departments: string[] = []
      
      for (var i=0; i< allTasks.length; i++){
          let temp: any = allTasks[i];
          if (temp.type === "project") continue
          _departments.push(temp.data.department)
      }
      _departments = [...Array.from(new Set(_departments))];
      _departments =_departments.sort();
      setDepartments(_departments);      
    }, [allTasks])


    useEffect(()=>{
      if (extendGantt){
        setGanttColumnWidth(10);
      } else {
        setGanttColumnWidth(25);
      }
    }, [extendGantt])

    useEffect(()=>{        
        setSearchString("");
        resetDisplayedTask();
        getProjectsCount();
        getDepartments()
    }, [allTasks, getProjects]);

    useEffect(()=>{
      let searchTasks: Task[] = getDepartmentTasks()
      setDisplayTasks(searchTasks);
    }, [selectedDepartment]);

    // 控制展開項
    useEffect(()=> {    
        let diplayed: Task[] = [...getProjects()];      
        for (let p=0; p < expandedProj.length; ++p){
          let temp: Task[] = getTasks(expandedProj[p])
          Array.prototype.push.apply(diplayed, temp);
        }      
        setDisplayTasks(diplayed);
    }, [expandedProj, getProjects, getTasks]);



    const handleExpanderClick = (task: Task) => {    
        if (task.type === "project"){
        if (expandedProj.filter(ep=> ep.id === task.id).length > 0){            
            const tempid = expandedProj.map(e => e.id);
            const temp = [...expandedProj]
            let rmProjIndex = tempid.indexOf(task.id);        
            temp.splice(rmProjIndex  , 1);
            setexpandedProj(temp);
        } else {
            if (!expandedProj.includes(task)){
            const temp = [...expandedProj];
            temp.push(task);
            setexpandedProj(temp);          
            }
        }
        
        };
        setCurTask(task);
    };

    const changeCategory = (event: any) => {
        setCountData([])
        setexpandedProj([])
        setCategoryNum(event.target.value)
        setSelectedDepartment("")
        setAllTasks(loadData(event.target.value))
    }

    const changeDepartment = (event: any) => {      
      setSelectedDepartment(event.target.value);
      setSearchString('');
    }

    const getDepartmentTasks = (): Task[]=>{
      if (selectedDepartment === "" && searchString === "") return getProjects();
      if (selectedDepartment === "") return allTasks;

      let searchTasks: Task[] = allTasks;
      function searchDepartment(t:Task){
        let temp :any = t;
        if (temp.type !== "task") return false;
        if (temp.data.department === selectedDepartment) {
          console.log(temp.data.department)
          console.log(selectedDepartment)
          return true;
        }
        return false;
      }
      searchTasks = searchTasks.filter(searchDepartment);
      searchTasks = tasksWithProj(searchTasks);
      return searchTasks;
    }

    


    const searchTaskName = (searchInput: string) => {
        let notPrefix="not", andPrefix="and", orPrefix="or";        
        let searchKeys = {} as any;
        let prefixs = [andPrefix, notPrefix, orPrefix];
        let searchArray = searchInput.replace(/\s\s+/g, ' ').split(' ');
        
        searchKeys[notPrefix] = [];
        searchKeys[andPrefix] = [];
        searchKeys[orPrefix] = [];

        // 生技 and 藥 or 氣候 not 政策        
        for (let i=0; i<searchArray.length; ++i){
          if ( i === 0 ){
            searchKeys[andPrefix].push(searchArray[i]); continue;
          };
          if (prefixs.includes(searchArray[i])) searchKeys[searchArray[i]].push(searchArray[++i]);
        }
        let searchTasks: any[] = getDepartmentTasks();
        // if (selectedDepartment !== "") searchTasks = 
        
        // step1. search and 
        function andSearch(t: any){          
          for (let i=0; i<searchKeys[andPrefix].length; ++i){
            if (String(t.name).includes(searchKeys[andPrefix][i])) return true;
            if (String(t.data.desp).includes(searchKeys[andPrefix][i])) return true;

          }
          return false;
        }
        searchTasks = searchTasks.filter(andSearch);
        
        // step2. search or
        for (let i=0; i< searchKeys[orPrefix].length; ++i){
          searchTasks = searchTasks.concat(allTasks.filter(t=> String(t.name).includes(searchKeys[orPrefix][i])));
        }

        // step3. exclude not
        for (let i=0; i< searchKeys[notPrefix].length; ++i){
          console.log(searchTasks)
          searchTasks = searchTasks.filter(t=>
            (!String(t.name).includes(searchKeys[notPrefix][i]) && !String(t.data.desp).includes(searchKeys[notPrefix][i])
          ));
        }
                
        searchTasks = tasksWithProj(searchTasks);
        setDisplayTasks(searchTasks);
    }

    function tasksWithProj(searchTasks: Task[]){
      let searchTaskId: any[] = [];
      let searchProjId: any[] = [];
      
      for (let i=0; i< searchTasks.length; ++i){
        if (!searchProjId.includes(searchTasks[i].project)){
            searchProjId.push(searchTasks[i].project)
        }
        searchTaskId.push(searchTasks[i].id)
      }
          
      let searchProj = allTasks.filter(p=> 
      searchProjId.includes(p.id) && !searchTaskId.includes(p.id)
      );
      Array.prototype.push.apply(searchTasks, searchProj);
      return searchTasks;
    }

    const resetDisplayedTask = ()=>{      
      setSearchString('');
      if (selectedDepartment !== ""){
        setDisplayTasks(getDepartmentTasks());
      } else {
        setDisplayTasks(getProjects());
      }      
    }

    const [mode, setMode] = useState<String>("Gantt");
    const [topicFigWidth, setTopicFigWidth] = useState<number>(1050);
    const [topicFigHeight, setTopicFigHeight] = useState<number>(550);
    const TopicHtmls = ["bar_fig", "tot_fig", "topic_fig"]
    const [topicFig, setTopicFig] = useState<string>(TopicHtmls[0]);
    
    const toggleBertopic = ()=>{      
      setMode("BERTopic")      
      setTopicFigWidth(1050)
      setTopicFigHeight(550)
    }

    const toggleTimeSeries = () => {
      setMode("TS")
    }

    const toggleGantt = () => {
      setMode("Gantt")
    }

    return (
        <CategoryContext.Provider value={categoryNum}>
        <Row className="card-margin-top m-auto align-self-center">
          <Col style={{paddingTop:'2vh'}}>
            <Card className="m-auto" style={{ width:"auto", maxWidth:"1400px"}}>
              <Row style={{margin:"20px 0px 10px 40px"}}>
                <Col>
                  { mode === "Gantt" || mode === "TS"  ? <Row>                    
                    <Col>
                      <Form.Select aria-label="" style={{maxWidth:"1100px", margin: "auto"}} onChange={changeCategory}>
                        <option value="10">10 Category</option>
                        <option value="20">20 Category</option>
                        <option value="30">30 Category</option>
                        <option value="40">40 Category</option>
                        <option value="50">50 Category</option>
                      </Form.Select>
                    </Col>
                    <Col>
                      { mode == "Gantt" ? <Form.Select aria-label="" style={{maxWidth:"1100px", margin: "auto"}} onChange={changeDepartment} value={selectedDepartment}>
                          <option value="">未設定部會</option>
                          {departments.map((x, _) =>                            
                            <option value={x}>{x}</option>
                          )}
                      </Form.Select> : null}                      
                    </Col>
                  </Row> : null}
                </Col>
                <Col>
                  { mode === "Gantt" ? 
                    <InputGroup className="mb-3">
                      
                      <FormControl                        
                        placeholder="Search"
                        aria-label="Search"
                        aria-describedby="Search"
                        value={searchString}
                        onChange={e=>setSearchString(e.target.value)}
                      />
                      <Button id="Search" variant="primary" onClick={()=>searchTaskName(searchString)}>
                        Search
                      </Button>
                      <Button variant="dark" onClick={e=>{ resetDisplayedTask();
                        
                      }}>
                        Reset
                      </Button>
                      
                    </InputGroup>
                  : null }
                  
                </Col>
                <Col xs={4}>
                  { mode === "Gantt" ? <Button variant="warning" onClick={()=>setExtendGantt(!extendGantt)} style={{  margin:"3px"}}>
                    Switch
                  </Button> : null
                  }
                  
                  <Button variant="info" onClick={()=>toggleGantt()} style={{color:"white"}} disabled={ mode==="Gantt" }>
                    Gantt
                  </Button>
                  <Button variant="info" onClick={()=>toggleTimeSeries()} style={{color:"white", margin:"3px"}} disabled={ mode==="TS" }>
                    Time Analysis
                  </Button>
                  <Button variant="info" onClick={()=>toggleBertopic()} style={{color:"white"}} disabled={ mode==="BERTopic" }>
                    BERTopic
                  </Button>                  
                </Col>
              </Row>
              <Card.Body className="m-auto  align-self-center">
                { mode === "BERTopic" ? 
                  <div >
                    <iframe 
                      src={process.env.PUBLIC_URL + "/" + topicFig + ".html"} 
                      width={topicFigWidth} 
                      height={topicFigHeight}
                    ></iframe>
                    <br/>
                    <Button variant="outline-info" onClick={() => {
                      setTopicFig(TopicHtmls[0])
                      setTopicFigWidth(1050)
                      setTopicFigHeight(550)}
                      }>
                      Bar Chart
                    </Button>
                    <Button variant="outline-info" onClick={()=>{
                      setTopicFig(TopicHtmls[1])
                      setTopicFigWidth(1050)
                      setTopicFigHeight(550)
                    }}
                      style={{margin:"10px"}}
                    >
                      Topics over Time
                    </Button>                    
                    <Button variant="outline-info" onClick={()=>{
                      setTopicFig(TopicHtmls[2])
                      setTopicFigWidth(1050)
                      setTopicFigHeight(700)
                      
                    }}>
                      Cluster
                    </Button>
                    <p> This result uses Bertopic and CKIP's bert-base-chinese-ws </p>
                  </div> : null
                }
                { mode === "Gantt" ? 
                  <div className="p-auto" style={{width:"auto", minWidth:"100eh", maxWidth:"1350px"}}>
                    {
                      (displayTasks.length === 0 ? "empty": <Gantt
                        tasks={displayTasks}
                        viewMode={ViewMode.Month}
                        columnWidth={ganttColumnWidth}
                        handleWidth={40}
                        listCellWidth={""}
                        TooltipContent={MyToolTipContent}
                        onDoubleClick={handleExpanderClick}
                        ganttHeight={550}
                      />)
                    }
                  </div> : null
                }
                { mode === "TS" ?
                  <div>
                    <Chart
                      options={options}
                      series={countData}
                      type="line"
                      width="1000"
                    />
                  </div> : null
                }
                              
              </Card.Body>
            </Card>
          </Col>
          
          <span>
              {
                (curTask != null && curTask.type==="task")? <MyInfo
                  task={curTask}
                  setCurTask={setCurTask}
                />:null
              }
          </span>
        </Row>
        </CategoryContext.Provider>
    )
}