import React, {Component} from 'react';
import {Button, FormControl, InputGroup} from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import {InfoPanel} from './InfoPanel';
import {numberRange} from '../utils/range';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faChevronLeft,
    faChevronRight,
    faSortDown,
    faSortUp,
    faPenToSquare,
    faEye
} from '@fortawesome/free-solid-svg-icons';
import styles from './DataTable.module.css';

export default class DataTable extends Component {
    constructor(props) {
        super(props);

        this.data = this.props.dataset;
        this.dataSize = this.data.length;
        this.editRecord = {};

        this.state = {
            start: 0,
            end: 100 <= this.dataSize ? 99 : this.dataSize - 1,
            pageSize: 100,
            page: 1,
            orderby: '年份',
            asc: false,
            curTask: null,
            editedID: null,
            editRecord: {}
        };
    }

    _setSelected = (eventKey) => {
        const pageSize = Number(eventKey);

        if (this.state.selected !== eventKey) {
            this.setState({
                start: 0,
                end: pageSize <= this.dataSize ? pageSize - 1 : this.dataSize - 1,
                pageSize,
                page: 1
            });
        }
    };

    _switchPage = ({target}) => {
        const event = target.getAttribute('d-event') ||
            target.parentNode.getAttribute('d-event');
        const {start, end, pageSize, page} = this.state;

        if (event === 'next' && start + pageSize <= this.dataSize) {
            this.setState({
                start: start + pageSize,
                end: end + pageSize > this.dataSize ? this.dataSize - 1 : end + pageSize,
                page: page + 1
            });
        } else if (event === 'prev' && start - pageSize >= 0) {
            this.setState({
                start: start - pageSize,
                end: start - 1,
                page: page - 1
            });
        }
    };

    _changePage = ({target}) => {
        const page = Number(target.innerText);

        if (page !== this.state.page) {
            const {pageSize} = this.state;
            this.setState({
                start: page * pageSize - pageSize,
                end: page * pageSize - 1 > this.dataSize ? this.dataSize - 1 : page * pageSize - 1,
                page
            });
        }
    };

    _sort = ({target}) => {
        const orderby = target.getAttribute('d-val') ||
            target.parentNode.getAttribute('d-val') ||
            target.parentNode.parentNode.getAttribute('d-val');
        this.setState({
            orderby,
            asc: !this.state.asc
        });
    };

    _setCurTask = (task) => {
        this.setState({curTask: task});
    };

    render() {
        const {start, end, pageSize, page, orderby, asc, curTask, editedID} = this.state;
        const pageSizes = [100, 50, 20];
        const pageable = this.dataSize / pageSize > 1;
        const lastPageNumber = Math.ceil(this.dataSize / pageSize);

        const data = this.data.slice(start, end + 1);
        data.sort((item1, item2) => {
            switch (orderby) {
                case '年份':
                default:
                    return (item1.start > item2.start) * (asc ? 1 : -1);
                case '名稱':
                    const [n1, n2] = [item1.name.toUpperCase(), item2.name.toUpperCase()];
                    return (n1 < n2 ? -1 : 1) * (asc ? 1 : -1);
            }
        });

        return (
            <div className="overflow-hidden">
                <div className="fw-bold fs-6 position-relative"
                     style={{marginTop: '5vh', marginBottom: '6vh', bottom: '4vh', left: 0}}>
                    <span className={styles.dtPageText}>顯示 {this.dataSize} 中的 {start + 1}-{end + 1}</span>
                    <span className={styles.dtBtnPageContainer}>
                            <FontAwesomeIcon icon={faChevronLeft} size='lg'
                                             className={styles.dtBtnPagePrev}
                                             style={{display: pageable ? '' : 'none'}} d-event="prev"
                                             onClick={pageable ? this._switchPage : undefined}/>
                            <Button variant={page === 1 ? 'primary' : 'outline-dark'} size="sm"
                                    className={styles.dtBtnPage}
                                    onClick={this._changePage}>1</Button>
                        {
                            page - 3 > 1 ?
                                <div className="d-inline me-3">...</div> :
                                null
                        }
                        {
                            numberRange(page - 3 >= 2 ? 3 + page - 5 : 2, page <= 3 ? 7 : 7 + page - 4).map((i) => {
                                if (i !== 1 && i >= lastPageNumber) return null;
                                return <Button key={`page-${i}`} variant={i === page ? 'primary' : 'outline-dark'}
                                               size="sm"
                                               className={styles.dtBtnPage}
                                               onClick={this._changePage}>{i}</Button>;
                            })
                        }
                        {
                            this.dataSize / pageSize > page + 3 ?
                                <div className="d-inline me-3">...</div> :
                                null
                        }
                        {
                            lastPageNumber !== 1 ?
                                <Button variant={lastPageNumber === page ? 'primary' : 'outline-dark'} size="sm"
                                        className={styles.dtBtnPage}
                                        onClick={this._changePage}>{lastPageNumber}</Button> :
                                null
                        }
                        <FontAwesomeIcon icon={faChevronRight} size='lg' className={styles.dtBtnPageNext}
                                         style={{display: pageable ? '' : 'none'}} d-event="next"
                                         onClick={pageable ? this._switchPage : undefined}/>
                        </span>
                    <span className={styles.dtPageSelector}>
                        <span className="me-2">每頁顯示：</span>
                        <DropdownList config={{
                            id: 'page-selector',
                            title: pageSize,
                            onSelected: this._setSelected,
                        }} items={pageSizes}/>
                        </span>
                </div>
                <div className="table-responsive" style={{height: '70vh'}}>
                    <table className={'position-relative bg-white table table-hover ' + styles.dataTable}>
                        <thead className={styles.dtHeader}>
                        <tr className="position-sticky mt-5 top-0 fs-6 border-bottom border-secondary text-black table-light">
                            <th d-val="年份" onClick={this._sort}>
                                年份
                                {
                                    orderby === '年份' ?
                                        <FontAwesomeIcon icon={asc ? faSortUp : faSortDown} size="lg"
                                                         className={'ms-1 ' + (asc ? 'pt-1' : 'pb-1')}
                                                         onClick={this._sort}/> :
                                        null
                                }
                            </th>
                            <th d-val="名稱" onClick={this._sort}>
                                名稱
                                {
                                    orderby === '名稱' ?
                                        <FontAwesomeIcon icon={asc ? faSortUp : faSortDown} size="lg"
                                                         className={'ms-1 ' + (asc ? 'pt-1' : 'pb-1')}
                                                         onClick={this._sort}/> :
                                        null
                                }
                            </th>
                            <th>類別</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody className="fw-normal fs-6">
                        {
                            data.map(((datasetInfo, idx) => {
                                const {id, name, start, data} = datasetInfo;
                                const {category} = data;
                                const editing = editedID === id;
                                if (editing)
                                    this.editRecord[id] = this.editRecord[id] || category;

                                return (
                                    <tr key={id} className={((idx % 2) ? 'bg-secondary bg-opacity-25' : 'bg-white')}>
                                        <td className="p-3 text-left" style={{width: '5vw'}}>
                                            <div className="d-flex align-items-center">
                                                <div>{start.toRepublicYear().getFullYear()}</div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-left" style={{width: '30vw'}}>
                                            <div className="d-flex align-items-center">
                                                <div className={styles.dtName}
                                                     onClick={() => this.setState({curTask: datasetInfo})}>
                                                    {name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-left">
                                            <div className="d-flex align-items-center">
                                                <div className="text-white">
                                                    {
                                                        editing ?
                                                            <InputGroup>
                                                                {
                                                                    category.map((name, i) =>
                                                                        <FormControl
                                                                            size="sm"
                                                                            key={`${id}-cat-edited-${i}}`}
                                                                            className="me-2"
                                                                            style={{maxWidth: '150px'}}
                                                                            value={this.editRecord[id][i]}
                                                                            onChange={({target}) => {
                                                                                this.editRecord[id][i] = target.value;
                                                                                console.log(target.value)
                                                                            }}
                                                                        />
                                                                    )
                                                                }
                                                            </InputGroup>
                                                            :
                                                            category.map((name, i) =>
                                                                <span key={`${id}-cat-${i}}`}
                                                                      className="d-inline-block p-1 px-2 me-2 mb-2 rounded bg-success"
                                                                      style={{fontSize: '14px'}}>
                                                                    {name.trim()}
                                                                </span>
                                                            )
                                                    }
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3" style={{width: editing ? '11vw' : '8vw'}}>
                                            <div className="d-flex align-items-center">
                                                {
                                                    editing ?
                                                        <div>
                                                            <Button variant="danger" size="sm"
                                                                    onClick={() => this.setState({editedID: null})}>儲存</Button>
                                                            <Button variant="dark" size="sm" className="ms-2"
                                                                    onClick={() => this.setState({editedID: null})}>取消</Button>
                                                        </div>
                                                        :
                                                        <Button variant="outline-danger" size="sm"
                                                                onClick={() => this.setState({editedID: id})}>
                                                            <FontAwesomeIcon icon={faPenToSquare}/>
                                                        </Button>

                                                }
                                                <Button variant="outline-dark" size="sm" className="ms-2"
                                                        onClick={() => this.setState({curTask: datasetInfo})}>
                                                    <FontAwesomeIcon icon={faEye}/>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }))
                        }
                        </tbody>
                    </table>
                </div>
                <div>
                    {
                        curTask != null ?
                            <InfoPanel
                                task={curTask}
                                setCurTask={this._setCurTask}
                            /> : null
                    }
                </div>
            </div>
        );
    }
}

const DropdownList = ({config, items}) => {
    return (
        <DropdownButton className="d-inline-block" id={config.id} title={config.title + ' '}
                        onSelect={config.onSelected} variant="dark">
            {
                items.map((text) =>
                    <Dropdown.Item key={`dropdown-${config.id}-${text}`} eventKey={text}>{text}</Dropdown.Item>)
            }
        </DropdownButton>
    );
};