import {Link} from 'react-router-dom';
import {Button, FormControl, InputGroup} from 'react-bootstrap';
import {Menu, MenuItem, Sidebar, SubMenu, useProSidebar} from 'react-pro-sidebar';
import {BsBarChartSteps, BsToggle2On, BsToggle2Off} from 'react-icons/bs';
import {BiAnalyse, BiLineChart, BiSearchAlt2} from 'react-icons/bi';
import {MdOutlineBubbleChart} from 'react-icons/md';
import {RiBarChartHorizontalFill} from 'react-icons/ri';
import {RouterMap} from '../constants/route';
import {SidebarCollapsedContext} from '../helpers/context';
import styles from './sidebar.module.css';


export default function SidebarContainer({children}) {
    const {collapseSidebar, collapsed} = useProSidebar();

    return (
        <SidebarCollapsedContext.Provider value={collapsed}>
            <div style={{display: 'flex', height: '100%' /*direction: isRTL ? 'rtl' : 'ltr'*/}}>
                <Sidebar className={styles.sidebarContainer} defaultCollapsed={false} collapsedWidth="100px"
                         width="260px"
                         backgroundColor="#112040" color="white"
                         rootStyles={{color: 'white', fontWeight: 'bolder'}}>
                    <div className="m-4 fs-5">
                        <Link to="/" className="text-decoration-none text-white">
                            {collapsed ? '' : '計畫演變分析系統'}
                        </Link>
                        <div className="mt-3" onClick={() => console.log('click')}>
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
                        margin: '15px 12px 15px 10px',
                        textAlign: 'start'
                    }}>
                        <Menu>
                            <MenuItem className={styles.sidebarItem} icon={<BsBarChartSteps/>}
                                      component={<Link to="/Gantt"/>}>
                                Gantt
                            </MenuItem>
                            <MenuItem className={styles.sidebarItem} icon={<BiLineChart/>}
                                      component={<Link to="/TimeAnalysis"/>}>
                                Time Analysis
                            </MenuItem>
                            <SubMenu className={styles.sidebarItem} icon={<BiAnalyse/>} label="BERTopic"
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
                                            <MenuItem className={styles.sidebarItem} key={`link-BERTopic-${path}`}
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
    )
}