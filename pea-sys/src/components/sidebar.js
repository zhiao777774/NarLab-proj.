import {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {Button, FormControl, InputGroup} from 'react-bootstrap';
import {Menu, MenuItem, Sidebar, SubMenu, useProSidebar} from 'react-pro-sidebar';
import {BsBarChartSteps, BsToggle2On, BsToggle2Off} from 'react-icons/bs';
import {BiAnalyse, BiLineChart, BiSearchAlt2} from 'react-icons/bi';
import {MdOutlineBubbleChart} from 'react-icons/md';
import {RiBarChartHorizontalFill} from 'react-icons/ri';
import {AiOutlineEdit} from 'react-icons/ai';
import {RouterMap} from '../constants/route';
import {PopupPanel} from './popupPanel';
import {SidebarCollapsedContext, SearchPopupPanelContext, SearchDataContext} from '../helpers/context';
import styles from './sidebar.module.css';

export default function SidebarContainer({children}) {
    const {collapseSidebar, collapsed} = useProSidebar();
    const navigate = useNavigate();

    const [openPanel, setOpenPanel] = useState(false);
    const searchPopupPanelContextValue = {openPanel, setOpenPanel};

    const [searchData, setSearchData] = useState(null);
    const searchDataContextValue = {searchData, setSearchData};

    useEffect(() => {
        if (searchData !== null) {
            navigate('/Gantt');
            setOpenPanel(false);
        }
    }, [searchData]);

    return (
        <SearchDataContext.Provider value={searchDataContextValue}>
            <SearchPopupPanelContext.Provider value={searchPopupPanelContextValue}>
                <SidebarCollapsedContext.Provider value={collapsed}>
                    <PopupPanel/>
                    <div style={{display: 'flex', height: '100%' /*direction: isRTL ? 'rtl' : 'ltr'*/}}>
                        <Sidebar className={styles.sidebarContainer} defaultCollapsed={false} collapsedWidth="100px"
                                 width="260px"
                                 backgroundColor="#112040" color="white"
                                 rootStyles={{color: 'white', fontWeight: 'bolder'}}>
                            <div className="m-4 fs-5">
                                <Link to="/" className="text-decoration-none text-white">
                                    {collapsed ? '' : '計畫演變分析系統'}
                                </Link>
                                <div className="mt-3" onClick={() => setOpenPanel(true)}>
                                    {
                                        collapsed ?
                                            <BiSearchAlt2 role="button" className={styles.searchIcon}/>
                                            :
                                            <InputGroup className="mb-3">
                                                <FormControl
                                                    placeholder="Search"
                                                    readOnly={true}
                                                    role="button"
                                                />
                                                <Button variant="warning">
                                                    <BiSearchAlt2/>
                                                </Button>
                                            </InputGroup>
                                    }
                                </div>
                            </div>
                            {collapsed ? null : <hr style={{width: '80%', margin: '0 auto'}}/>}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                margin: '20px 12px 15px 10px',
                                textAlign: 'start'
                            }}>
                                <Typography collapsed={collapsed}>General</Typography>
                                <Menu>
                                    <MenuItem className={styles.sidebarItem} icon={<BsBarChartSteps/>}
                                              component={<Link to="/Gantt"/>}>
                                        {collapsed ? '' : 'Gantt'}
                                    </MenuItem>
                                    <MenuItem className={styles.sidebarItem} icon={<BiLineChart/>}
                                              component={<Link to="/TimeAnalysis"/>}>
                                        {collapsed ? '' : 'Time Analysis'}
                                    </MenuItem>
                                    <SubMenu className={styles.sidebarItem} icon={<BiAnalyse/>}
                                             label={collapsed ? '' : 'BERTopic'}
                                             defaultOpen={true}>
                                        {
                                            RouterMap.BERTopic.map((path, i) => {
                                                const {text, icon} = [
                                                    {
                                                        text: 'Bar Chart',
                                                        icon: <RiBarChartHorizontalFill/>,
                                                    },
                                                    {
                                                        text: 'Topics over time',
                                                        icon: <BiLineChart/>,
                                                    },
                                                    {
                                                        text: 'Cluster',
                                                        icon: <MdOutlineBubbleChart/>
                                                    }
                                                ][i];
                                                return (
                                                    <MenuItem className={styles.sidebarItem}
                                                              key={`link-BERTopic-${path}`}
                                                              icon={icon} component={<Link to={`/BERTopic/${path}`}/>}
                                                              rootStyles={{backgroundColor: '#112040'}}>
                                                        {text}
                                                    </MenuItem>
                                                );
                                            })
                                        }
                                    </SubMenu>
                                </Menu>
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                margin: '10px 12px 15px 10px',
                                textAlign: 'start'
                            }}>
                                <Typography collapsed={collapsed}>Extra</Typography>
                                <Menu>
                                    <MenuItem className={`${styles.sidebarItem} ${styles.sidebarItemExtra}`}
                                              icon={<AiOutlineEdit/>}
                                              component={<Link to="/Labeling-Platform"/>}>
                                        {collapsed ? '' : 'Labeling Platform'}
                                    </MenuItem>
                                </Menu>
                            </div>
                            <div
                                className={'m-4 fs-6 bottom-0 position-absolute w-75 d-flex ' + (collapsed ? '' : 'justify-content-center')}>
                                <div className="d-flex align-items-center">
                                    {collapsed ? <BsToggle2Off size={40} onClick={() => collapseSidebar()}/> :
                                        <BsToggle2On size={40} onClick={() => collapseSidebar()}/>}
                                    {!collapsed ? <span className="ms-3">Collapse</span> : null}
                                </div>
                            </div>
                        </Sidebar>
                        {children}
                    </div>
                </SidebarCollapsedContext.Provider>
            </SearchPopupPanelContext.Provider>
        </SearchDataContext.Provider>
    )
}


const Typography = ({collapsed, children}) => {
    return (
        <div style={{padding: '0 24px', marginBottom: '8px'}}>
            <div
                className={styles.typography}
                style={{opacity: collapsed ? 0 : 0.7}}
            >
                {children}
            </div>
        </div>
    )
};