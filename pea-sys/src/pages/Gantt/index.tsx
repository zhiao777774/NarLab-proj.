import {useCallback, useEffect, useState} from 'react';
import {Card, Row, Col, InputGroup, FormControl, Button} from 'react-bootstrap';
import MultiSelect from 'multiselect-react-dropdown';
import DatePicker, {registerLocale} from 'react-datepicker';
import {MyInfo} from '../../components/myInfo';
import GanttChart from '../../components/ganttChart';
import {loadData} from '../../helpers/dataLoader';
import {CategoryContext} from '../../helpers/context';
import {Task} from '../../constants/taskPropType';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import tw from 'date-fns/locale/zh-TW';

registerLocale('zh-TW', tw);

export default function Gantt() {
    // 讀取在背景的資料
    const [allTasks, setAllTasks] = useState<any[]>(loadData());
    const projectTasks = allTasks.filter((t) => t.type === 'project');

    // 顯示的資料
    const [displayTasks, setDisplayTasks] = useState<Task[]>([]);

    // 未展開的計畫id
    const [collapsedProj, setCollapsedProj] = useState<Task[]>([]);
    const [curTask, setCurTask] = useState<Task>();

    const [searchString, setSearchString] = useState<string>('');

    const [categoryNum, setCategoryNum] = useState<string>('10');

    const [departments, setDepartments] = useState<string[]>([]);
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
    const [countData, setCountData] = useState<any>();

    const minDataYear = 2014;
    const maxDataYear = new Date().getFullYear() + 3;
    const [displayedDate, setDisplayedDate] = useState<any>({
        start: new Date(minDataYear, 0),
        end: new Date(maxDataYear, 0)
    });

    // 只有在更換category的狀況下，allTasks才會變動。當allTask變動時，從新設定顯示的tasks
    const getProjects = useCallback(() => {
        const temp = [];
        for (var i = 0; i < allTasks.length; i++) {
            if (allTasks[i].type === "project") {
                temp.push(allTasks[i]);
            }
        }
        return temp;
    }, [allTasks])

    const getProjectsCount = useCallback(() => {
        let proj = getProjects();
        let allCount = []
        let id = []
        for (let i = 0; i < proj.length; i++) {
            let temp = proj[i] as any;

            id.push(temp.name)
            allCount.push({
                name: String(temp.name),
                data: temp.data.series
            })
        }
        id.sort(function (a, b) {
            return a - b
        })
        setCountData(allCount)
    }, [getProjects])

    // 以 project 取得底下的 task
    const getTasks = useCallback((project: Task): Task[] => {
        const tasks = [];
        if (project !== undefined) {
            for (var i = 0; i < allTasks.length; i++) {
                if (allTasks[i].project === project.id) {
                    tasks.push(allTasks[i]);
                }
            }
        }
        return tasks;
    }, [allTasks])


    // 取得部會資料
    const getDepartments = useCallback(() => {
        let _departments: string[] = []

        for (var i = 0; i < allTasks.length; i++) {
            let temp: any = allTasks[i];
            if (temp.type === "project") continue
            _departments.push(temp.data.department)
        }
        _departments = [...Array.from(new Set(_departments))];
        _departments = _departments.sort();
        setDepartments(_departments);
    }, [allTasks])

    useEffect(() => {
        setSearchString("");
        resetDisplayedTask();
        getProjectsCount();
        getDepartments()
    }, [allTasks, getProjects]);

    useEffect(() => {
        let searchTasks: Task[] = getDepartmentTasks();
        setDisplayTasks(searchTasks);
    }, [selectedDepartments]);

    // 控制展開項
    useEffect(() => {
        let diplayed: Task[] = [...getProjects()];
        for (let p = 0; p < collapsedProj.length; ++p) {
            let temp: Task[] = getTasks(collapsedProj[p])
            Array.prototype.push.apply(diplayed, temp);
        }
        setDisplayTasks(diplayed);

    }, [collapsedProj, getProjects, getTasks]);


    const handleExpanderClick = (task: Task | String) => {
        let target: Task;
        if (typeof task === 'string') {
            target = allTasks.filter((t) => t.id === task)[0];
        } else {
            // @ts-ignore
            target = task;
        }

        // if (target.type === "project") {
        //     if (collapsedProj.filter(ep => ep.id === target.id).length > 0) {
        //         const tempid = collapsedProj.map(e => e.id);
        //         const temp = [...collapsedProj]
        //         let rmProjIndex = tempid.indexOf(target.id);
        //         temp.splice(rmProjIndex, 1);
        //         setCollapsedProj(temp);
        //     } else {
        //         if (!collapsedProj.includes(target)) {
        //             const temp = [...collapsedProj];
        //             temp.push(target);
        //             setCollapsedProj(temp);
        //         }
        //     }
        // }
        setCurTask(target);
    };

    const changeCategory = (event: any) => {
        setCountData([]);
        setCollapsedProj([]);
        setCategoryNum(event.target.value);
        setSelectedDepartments([]);
        setAllTasks(loadData(event.target.value));
    }

    const changeDepartments = (selectedList: any) => {
        setSelectedDepartments(selectedList);
        setSearchString('');
    }

    const getDepartmentTasks = (): Task[] => {
        const isDepEmpty = selectedDepartments.length === 0;
        if (isDepEmpty && searchString === "") return getProjects();
        if (isDepEmpty) return allTasks;

        let searchTasks: Task[] = allTasks;

        function searchDepartment(t: Task) {
            let temp: any = t;
            if (temp.type !== "task") return false;
            if (selectedDepartments.includes(temp.data.department)) {
                console.log(temp.data.department)
                return true;
            }
            return false;
        }

        searchTasks = searchTasks.filter(searchDepartment);
        searchTasks = tasksWithProj(searchTasks);
        return searchTasks;
    }


    const searchTaskName = (searchInput: string) => {
        let notPrefix = "not", andPrefix = "and", orPrefix = "or";
        let searchKeys = {} as any;
        let prefixs = [andPrefix, notPrefix, orPrefix];
        let searchArray = searchInput.replace(/\s\s+/g, ' ').split(' ');

        searchKeys[notPrefix] = [];
        searchKeys[andPrefix] = [];
        searchKeys[orPrefix] = [];

        // 生技 and 藥 or 氣候 not 政策
        for (let i = 0; i < searchArray.length; ++i) {
            if (i === 0) {
                searchKeys[andPrefix].push(searchArray[i]);
                continue;
            }
            if (prefixs.includes(searchArray[i])) searchKeys[searchArray[i]].push(searchArray[++i]);
        }
        let searchTasks: any[] = getDepartmentTasks();

        // step1. search and
        function andSearch(t: any) {
            for (let i = 0; i < searchKeys[andPrefix].length; ++i) {
                if (String(t.name).includes(searchKeys[andPrefix][i])) return true;
                if (String(t.data.desp).includes(searchKeys[andPrefix][i])) return true;

            }
            return false;
        }

        searchTasks = searchTasks.filter(andSearch);

        // step2. search or
        for (let i = 0; i < searchKeys[orPrefix].length; ++i) {
            searchTasks = searchTasks.concat(allTasks.filter(t => String(t.name).includes(searchKeys[orPrefix][i])));
        }

        // step3. exclude not
        for (let i = 0; i < searchKeys[notPrefix].length; ++i) {
            console.log(searchTasks)
            searchTasks = searchTasks.filter(t =>
                (!String(t.name).includes(searchKeys[notPrefix][i]) && !String(t.data.desp).includes(searchKeys[notPrefix][i])
                ));
        }

        searchTasks = tasksWithProj(searchTasks);
        setDisplayTasks(searchTasks);
    }

    function tasksWithProj(searchTasks: Task[]) {
        let searchTaskId: any[] = [];
        let searchProjId: any[] = [];

        for (let i = 0; i < searchTasks.length; ++i) {
            if (!searchProjId.includes(searchTasks[i].project)) {
                searchProjId.push(searchTasks[i].project)
            }
            searchTaskId.push(searchTasks[i].id)
        }

        let searchProj = allTasks.filter(p =>
            searchProjId.includes(p.id) && !searchTaskId.includes(p.id)
        );
        Array.prototype.push.apply(searchTasks, searchProj);
        return searchTasks;
    }

    const resetDisplayedTask = () => {
        setSearchString('');
        if (!selectedDepartments.length) {
            setDisplayTasks(getDepartmentTasks());
        } else {
            setDisplayTasks(getProjects());
        }
    }


    const handleDateChange = (dates: any) => {
        const isSameDay = (d1: Date, d2: Date) => {
            return d1.getFullYear() === d2.getFullYear() &&
                d1.getDate() === d2.getDate() &&
                d1.getMonth() === d2.getMonth();
        }

        const [start, end] = dates;
        const isSame = isSameDay(new Date(start), new Date(end));

        setDisplayedDate({
            start,
            end: isSame ? new Date() : end
        });
    }

    const startYear = new Date(displayedDate.start).getFullYear();
    const endYear = new Date(displayedDate.end || new Date(maxDataYear, 0)).getFullYear();

    return (
        <CategoryContext.Provider value={categoryNum}>
            <Row className="card-margin-top m-auto align-self-center">
                <Col>
                    <Card className="m-auto" style={{width: "auto"}}>
                        {/*<Row style={{margin: "20px 20px 10px"}} xs="auto">
                            <Col>
                                <Form.Select aria-label="" style={{maxWidth: "200px", margin: "auto"}}
                                             onChange={changeCategory}>
                                    <option value="10">10 Category</option>
                                    <option value="20">20 Category</option>
                                    <option value="30">30 Category</option>
                                    <option value="40">40 Category</option>
                                    <option value="50">50 Category</option>
                                </Form.Select>
                            </Col>
                        </Row>*/}
                        {
                            <Row style={{margin: "30px 20px 10px -3px"}}>
                                <Col>
                                    <div className="d-inline-block">
                                        <DatePicker selectsRange closeOnScroll
                                                    locale="zh-TW"
                                                    showYearPicker={true}
                                                    withPortal={false}
                                                    selected={displayedDate.start}
                                                    startDate={displayedDate.start}
                                                    endDate={displayedDate.end}
                                                    onChange={handleDateChange}
                                                    minDate={new Date(minDataYear, 0)}
                                                    maxDate={new Date(maxDataYear, 0)}
                                                    yearItemNumber={9}
                                                    shouldCloseOnSelect={false}
                                                    customInput={
                                                        <button className="btn btn-outline-dark"
                                                                style={{
                                                                    borderTopRightRadius: 0,
                                                                    borderBottomRightRadius: 0
                                                                }}
                                                        >
                                                            {`${startYear - 1911} - ${endYear - 1911}`}
                                                        </button>
                                                    }
                                        />
                                    </div>
                                    <Button variant="dark" onClick={() => setDisplayedDate({
                                        start: new Date(minDataYear, 0),
                                        end: new Date(maxDataYear, 0)
                                    })}
                                            style={{
                                                borderTopLeftRadius: 0,
                                                borderBottomLeftRadius: 0
                                            }}>
                                        Reset
                                    </Button>
                                </Col>
                                <Col xs={5}>
                                    <MultiSelect
                                        options={departments}
                                        isObject={false}
                                        showCheckbox={true}
                                        selectedValues={selectedDepartments}
                                        onSelect={(selectedList) => changeDepartments(selectedList)}
                                        onRemove={(selectedList) => changeDepartments(selectedList)}
                                        placeholder={selectedDepartments.length ? "選擇更多部會" : "未選擇部會"}
                                    />
                                </Col>
                                <Col xs={5}>
                                    <InputGroup className="mb-3">
                                        <FormControl
                                            placeholder="Search"
                                            aria-label="Search"
                                            aria-describedby="Search"
                                            value={searchString}
                                            onChange={e => setSearchString(e.target.value)}
                                        />
                                        <Button id="Search" variant="primary"
                                                onClick={() => searchTaskName(searchString)}>
                                            Search
                                        </Button>
                                        <Button variant="dark" onClick={e => {
                                            resetDisplayedTask();
                                        }}>
                                            Reset
                                        </Button>
                                    </InputGroup>
                                </Col>
                            </Row>
                        }
                        <Card.Body className="m-auto  align-self-center">
                            <div className="p-auto" style={{width: "auto", minWidth: "100vh", maxWidth: "1350px"}}>
                                {
                                    (displayTasks.length === 0 ? "empty" :
                                            <GanttChart
                                                tasks={displayTasks.filter((t) => {
                                                    return t.type === 'project' ||
                                                        (
                                                            t.start >= new Date(displayedDate.start.getFullYear(), 0)
                                                        )
                                                }).map((t) => {
                                                    if (t.type === 'project') {
                                                        const {start, end, ...data} = t;
                                                        return {
                                                            ...data,
                                                            start,
                                                            end,
                                                            start_date: `${displayedDate.start.getFullYear()}-1-1`,
                                                            duration: new Date(displayedDate.start.getFullYear(), 0)
                                                                // @ts-ignore
                                                                .diffYear(new Date(endYear, 0))
                                                        }
                                                    } else {
                                                        const {start, end, ...data} = t;
                                                        return {
                                                            ...data,
                                                            start,
                                                            end,
                                                            start_date: `${start.getFullYear()}-1-1`,
                                                            // @ts-ignore
                                                            duration: start.diffYear(end)
                                                        }
                                                    }
                                                })}
                                                projects={projectTasks}
                                                startYear={startYear}
                                                endYear={endYear + 1}
                                                clickEvent={handleExpanderClick}
                                            />
                                    )
                                }
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <span>
                    {
                        (curTask != null && curTask.type === "task") ?
                            <MyInfo
                                task={curTask}
                                setCurTask={setCurTask}
                            /> : null
                    }
                </span>
            </Row>
        </CategoryContext.Provider>
    )
}