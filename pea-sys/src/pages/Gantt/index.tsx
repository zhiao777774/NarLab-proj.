import {useCallback, useEffect, useState, useContext, forwardRef, useRef} from 'react';
import {Card, Row, Col, InputGroup, FormControl, Button} from 'react-bootstrap';
import MultiSelect from 'multiselect-react-dropdown';
import DatePicker, {registerLocale} from 'react-datepicker';
import {InfoPanel} from '../../components/InfoPanel';
import GanttChart from '../../components/GanttChart';
import {loadData, filterBy} from '../../utils/dataLoader';
import {
    SearchPopupPanelContext,
    SearchDataContext,
    DatasetContext,
    SidebarCollapsedContext
} from '../../helpers/contexts';
import {Project, Task} from '../../constants/types';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import tw from 'date-fns/locale/zh-TW';

registerLocale('zh-TW', tw);

export default function Gantt() {
    const sidebarCollapsed = useContext(SidebarCollapsedContext);
    const {setOpenPanel} = useContext(SearchPopupPanelContext);
    const {searchData, setSearchData} = useContext(SearchDataContext);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    //const [allTasks, setAllTasks] = useState<Task[]>(loadData());
    const [displayTasks, setDisplayTasks] = useState<Task[]>([]);
    const [curTask, setCurTask] = useState<Task>();
    const [departments, setDepartments] = useState<string[]>([]);
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

    // const minYearInData = allTasks.reduce(
    //     (prev, curr) => prev.start_date < curr.start_date ? prev : curr).start;
    // const minDataYear = minYearInData.toRepublicYear().getFullYear();
    // const maxYearInData = allTasks.reduce(
    //     (prev, curr) => prev.end < curr.end ? curr : prev).end;
    // const maxDataYear = maxYearInData.toRepublicYear().getFullYear();
    // const [displayedDate, setDisplayedDate] = useState<{ start: Date, end: Date }>({
    //     start: new Date(minDataYear, 0),
    //     end: new Date(maxDataYear, 0)
    // });
    const [minDataYear, setMinDataYear] = useState<number>(new Date().getFullYear());
    const [maxDataYear, setMaxDataYear] = useState<number>(new Date().getFullYear());
    const [displayedDate, setDisplayedDate] = useState<{ start: Date, end: Date }>({
        start: new Date(),
        end: new Date()
    });

    useEffect(() => {
        const initData = async () => {
            setLoading(true);
            const allTasks = await loadData();
            const minYearInData = allTasks.reduce(
                (prev, curr) => prev.start_date < curr.start_date ? prev : curr).start;
            const minDataYear = minYearInData.toRepublicYear().getFullYear();
            const maxYearInData = allTasks.reduce(
                (prev, curr) => prev.end < curr.end ? curr : prev).end;
            const maxDataYear = maxYearInData.toRepublicYear().getFullYear();

            setAllTasks(allTasks);
            setMinDataYear(minDataYear);
            setMaxDataYear(maxDataYear);
            setDisplayedDate({
                start: new Date(minDataYear, 0),
                end: new Date(maxDataYear, 0)
            });
            setLoading(false);
        };
        initData();
    }, []);

    const getProjects = useCallback(() => {
        return allTasks.filter((t) => t.type === 'project');
    }, [allTasks]);

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
        getDepartmentTasks().then((searchTasks) => {
            setDisplayTasks(searchTasks);
        });
    }, [selectedDepartments]);

    useEffect(() => {
        getDepartments();
        if (searchData) {
            const getSearchData = async () => {
                setLoading(true);
                const data = filterBy(allTasks, searchData)
                setDisplayTasks(data);
                setLoading(false);
            };
            getSearchData();
        } else {
            reset();
        }
    }, [allTasks, getProjects, searchData]);

    const handleExpanderClick = (task: Task | string, parentId: string) => {
        let target: Task | string;
        if (typeof task === 'string') {
            target = allTasks.filter((t) => t.id === task)[0];
        } else {
            target = task;
        }

        setCurTask(target);
        setLoading(false);
    };

    const changeDepartments = (selectedList: string[]) => {
        setSelectedDepartments(selectedList);
        setSearchData(null);
    };

    const getDepartmentTasks = async (): Promise<Task[]> => {
        const isDepEmpty = selectedDepartments.length === 0;
        if (isDepEmpty && searchInputRef.current?.value) {
            const searchArray = searchInputRef.current.value.replace(/\s\s+/g, ' ').split(' ');
            setLoading(true);
            const data = filterBy(allTasks, searchArray);
            setLoading(false);
            return data;
        }
        if (isDepEmpty) return getProjects();

        let searchTasks: Task[];
        if (searchInputRef.current?.value) {
            const searchArray = searchInputRef.current.value.replace(/\s\s+/g, ' ').split(' ');
            setLoading(true);
            searchTasks = filterBy(allTasks, searchArray);
            setLoading(false);
        } else {
            searchTasks = allTasks;
        }

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

    const searchTaskName = async (searchInput: string) => {
        if (!searchInput) {
            alert('請輸入欲搜尋值\r\n基礎查詢功能會針對「計畫名稱」、「描述」、「關鍵字」及「類別」進行字串搜索。 並且能以「空白字符」做為分隔符號，進行多關鍵字的聯集查詢');
            return;
        }

        setLoading(true);
        const searchArray = searchInput.replace(/\s\s+/g, ' ').split(' ');

        function searchDepartment(task: Task) {
            /*if (task.type === 'task') {
                return selectedDepartments.includes(task.data.department);
            } else */
            if (task.level === 2) {
                return selectedDepartments.includes(task.data[0].data.department); // TODO: 只看第一筆計畫的部會是否相符
            }

            return false;
        }

        let searchTasks = filterBy(allTasks, searchArray);
        if (selectedDepartments.length) searchTasks = searchTasks.filter(searchDepartment);
        setDisplayTasks(searchTasks);
        setLoading(false);
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
        setSelectedDepartments([]);
        setDisplayTasks(getProjects()); // TODO: 會影響第一次與重置後的資料
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
        <DatasetContext.Provider value={allTasks}>
            <Row className="card-margin-top m-auto align-self-center">
                {
                    !loading ?
                        <Col>
                            <Card className="m-auto" style={{width: "auto"}}>
                                {
                                    <Row style={{margin: "30px 20px 10px 5px"}}>
                                        <Col xs={2}>
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
                                        </Col>
                                        <Col xs={5}>
                                            <InputGroup>
                                                <div>
                                                    <SearchInput
                                                        ref={searchInputRef}
                                                        handleSearchEvent={searchTaskName}
                                                        handleResetEvent={reset}
                                                    />
                                                </div>
                                                <Button className="ms-4 rounded-2" variant="warning"
                                                        onClick={() => setOpenPanel(true)}>
                                                    More Filters
                                                </Button>
                                            </InputGroup>
                                        </Col>
                                    </Row>
                                }
                                <Card.Body className="m-auto  align-self-center">
                                    <div className="p-auto" style={{width: 'auto', minWidth: '70vw', maxWidth: '80vw'}}>
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
                                                        sidebarCollapsed={sidebarCollapsed}
                                                    />
                                            )
                                        }
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        :
                        <span>資料載入 / 查詢中...</span>
                }
                <span>
                {
                    (curTask != null && curTask.level === 2) ?
                        <InfoPanel
                            task={curTask}
                            setCurTask={setCurTask}
                        /> : null
                }
            </span>
            </Row>
        </DatasetContext.Provider>
    )
}

const SearchInput = forwardRef<HTMLInputElement, { onSearchStringChange?: Function, handleSearchEvent: Function, handleResetEvent: Function }>(
    ({
         onSearchStringChange,
         handleSearchEvent, handleResetEvent
     }, ref) => {
        const [searchString, setSearchString] = useState<string>('');

        useEffect(() => {
            if (onSearchStringChange) onSearchStringChange(searchString);
        }, [searchString]);

        return (
            <InputGroup>
                <FormControl
                    ref={ref}
                    placeholder="Search"
                    aria-label="Search"
                    aria-describedby="Search"
                    value={searchString}
                    onChange={e => setSearchString(e.target.value)}
                />
                <Button id="Search" variant="primary"
                        onClick={() => handleSearchEvent(searchString)}>
                    Search
                </Button>
                <Button variant="dark" onClick={() => {
                    setSearchString('');
                    handleResetEvent();
                }}>
                    Reset
                </Button>
            </InputGroup>
        );
    }
);