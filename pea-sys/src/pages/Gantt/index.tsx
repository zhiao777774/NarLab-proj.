import {useCallback, useEffect, useState, useContext} from 'react';
import {Card, Row, Col, InputGroup, FormControl, Button} from 'react-bootstrap';
import MultiSelect from 'multiselect-react-dropdown';
import DatePicker, {registerLocale} from 'react-datepicker';
import {InfoPanel} from '../../components/InfoPanel';
import GanttChart from '../../components/GanttChart';
import {loadData} from '../../utils/dataLoader';
import {SearchPopupPanelContext, SearchDataContext} from '../../helpers/contexts';
import {Project, Task} from '../../constants/types';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import tw from 'date-fns/locale/zh-TW';

registerLocale('zh-TW', tw);

export default function Gantt() {
    const {setOpenPanel} = useContext(SearchPopupPanelContext);
    const {searchData, setSearchData} = useContext(SearchDataContext);

    const [allTasks, setAllTasks] = useState<Task[]>(loadData());
    const [displayTasks, setDisplayTasks] = useState<Task[]>([]);
    const [curTask, setCurTask] = useState<Task>();
    const [searchString, setSearchString] = useState<string>('');

    const [departments, setDepartments] = useState<string[]>([]);
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

    const minDataYear = 2014 - 1911;
    const maxDataYear = new Date().toRepublicYear().getFullYear() + 3;
    const [displayedDate, setDisplayedDate] = useState<{ start: Date, end: Date }>({
        start: new Date(minDataYear, 0),
        end: new Date(maxDataYear, 0)
    });

    const getProjects = useCallback(() => {
        return allTasks.filter((t) => t.type === 'project');
    }, [allTasks]);

    const getTasksByProject = useCallback((project: Project): Task[] => {
        const tasks = [];
        if (project !== undefined) {
            for (let i = 0; i < allTasks.length; i++) {
                if (allTasks[i].project === project.id) {
                    tasks.push(allTasks[i]);
                }
            }
        }
        return tasks;
    }, [allTasks])

    const getDepartments = useCallback(() => {
        let _departments: string[] = []

        for (let i = 0; i < allTasks.length; i++) {
            let temp: Task = allTasks[i];
            if (temp.type === 'project') continue;
            _departments.push(temp.data.department || temp.data[0].data.department); // TODO: 針對部會過濾設定條件
        }
        _departments = [...Array.from(new Set(_departments))];
        _departments = _departments.sort();
        setDepartments(_departments);
    }, [allTasks])

    useEffect(() => {
        let searchTasks: Task[] = getDepartmentTasks();
        setDisplayTasks(searchTasks);
    }, [selectedDepartments]);

    useEffect(() => {
        setSearchString('');
        getDepartments();
        if (searchData) {
            setDisplayTasks(loadData(searchData));
        } else {
            reset();
        }
    }, [allTasks, getProjects, searchData]);

    // 控制展開項
    // useEffect(() => {
    //     let displayed: Task[] = [...getProjects()];
    //     for (let p = 0; p < collapsedProj.length; ++p) {
    //         let temp: Task[] = getTasks(collapsedProj[p]);
    //         Array.prototype.push.apply(displayed, temp);
    //     }
    //     setDisplayTasks(displayed);
    // }, [collapsedProj, getProjects, getTasks]);


    const handleExpanderClick = (task: Task | string) => {
        let target: Task | string;
        if (typeof task === 'string') {
            target = allTasks.filter((t) => t.id === task)[0];
        } else {
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

    const changeDepartments = (selectedList: string[]) => {
        setSelectedDepartments(selectedList);
        setSearchString('');
        setSearchData(null);
    };

    const getDepartmentTasks = (): Task[] => {
        const isDepEmpty = selectedDepartments.length === 0;
        if (isDepEmpty && !searchString) return getProjects().filter((t) => t.level === 1); // TODO: 會影響第一次與重置後的資料
        if (isDepEmpty) return allTasks;

        let searchTasks: Task[] = allTasks;

        function searchDepartment(task: Task) {
            /*if (task.type === 'task') {
                return selectedDepartments.includes(task.data.department);
            } else */
            if (task.level === 2) {
                return selectedDepartments.includes(task.data[0].data.department); // TODO: 只看第一筆計畫的部會是否相符
            }

            return false;
        }

        searchTasks = searchTasks.filter(searchDepartment);
        searchTasks = tasksWithProj(searchTasks);
        return searchTasks;
    };

    const searchTaskName = (searchInput: string) => {
        if (!searchInput) return;

        const searchArray = searchInput.replace(/\s\s+/g, ' ').split(' ');
        setDisplayTasks(loadData(searchArray));
    };

    function tasksWithProj(searchTasks: Task[]) {
        const searchTaskId: any = [];
        const searchProjId: any = [];

        for (let i = 0; i < searchTasks.length; ++i) {
            if (!searchProjId.includes(searchTasks[i].project)) {
                searchProjId.push(searchTasks[i].project)
            }
            searchTaskId.push(searchTasks[i].id)
        }

        const searchProj = allTasks.filter(p =>
            searchProjId.includes(p.id) && !searchTaskId.includes(p.id)
        );
        Array.prototype.push.apply(searchTasks, searchProj);
        return searchTasks;
    }

    const reset = () => {
        setSearchString('');
        // if (selectedDepartments.length) {
        //     setDisplayTasks(getDepartmentTasks());
        // } else {
        //     setDisplayTasks(getProjects());
        // }
        setSelectedDepartments([]);
        setDisplayTasks(getProjects().filter((t) => t.level === 1)); // TODO: 會影響第一次與重置後的資料
    };

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
    };

    const startYear = new Date(displayedDate.start).getFullYear();
    const endYear = new Date(displayedDate.end || new Date(maxDataYear, 0)).getFullYear();
    const ceStartYear = startYear + 1911;
    const ceEndYear = endYear + 1911;

    // TODO: 剩餘Bug為無法將搜尋結果與部會選項結合，以及進行搜尋選擇時部會選項不會初始化
    //       試過在resetDisplayedTask放入setSelectedDepartments([])，但會因為各種effect連動的關係導致搜尋結果跳掉
    return (
        <Row className="card-margin-top m-auto align-self-center">
            <Col>
                <Card className="m-auto" style={{width: "auto"}}>
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
                                                        {`${startYear} - ${endYear}`}
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
                                    showArrow={true}
                                    selectedValues={selectedDepartments}
                                    onSelect={(selectedList) => changeDepartments(selectedList)}
                                    onRemove={(selectedList) => changeDepartments(selectedList)}
                                    placeholder={selectedDepartments.length ? "選擇更多部會" : "未選擇部會"}
                                    emptyRecordMsg="找不到部會"
                                    style={{
                                        inputField: {
                                            height: '100%'
                                        }
                                    }}
                                />
                                {/*<Button variant="dark"*/}
                                {/*        onClick={() => changeDepartments([])}>Reset</Button>*/}
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
                                    <Button variant="dark" onClick={() => reset()}>
                                        Reset
                                    </Button>
                                    <Button variant="warning" onClick={() => setOpenPanel(true)}>
                                        More Filters
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
                                                        t.start >= new Date(ceStartYear, 0)
                                                    )
                                            }).map((t) => {
                                                if (t.level === 1) {
                                                    return {
                                                        ...t,
                                                        start_date: `${ceStartYear}-1-1`,
                                                        duration: new Date(ceStartYear, 0)
                                                            .diffYear(new Date(ceEndYear, 0))
                                                    };
                                                } else {
                                                    const {start, end, ...data} = t;
                                                    return {
                                                        ...data,
                                                        start,
                                                        end,
                                                        start_date: `${start.getFullYear()}-1-1`,
                                                        duration: start.diffYear(end)
                                                    };
                                                }
                                            })}
                                            projects={getProjects()}
                                            startYear={ceStartYear}
                                            endYear={ceEndYear + 1}
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
                        (curTask != null && /*curTask.type === "task" || */curTask.level === 2) ?
                            <InfoPanel
                                task={curTask}
                                setCurTask={setCurTask}
                            /> : null
                    }
                </span>
        </Row>
    )
}