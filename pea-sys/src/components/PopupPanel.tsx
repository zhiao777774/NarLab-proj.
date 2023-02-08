import React, {useContext, useState, useRef} from 'react';
import {Button} from 'react-bootstrap';
import Popup from 'reactjs-popup';
import {AiFillCloseCircle} from 'react-icons/ai';
import {SearchForm} from './searchForm';
import {SearchPopupPanelContext} from '../helpers/context';
import 'reactjs-popup/dist/index.css';
import styles from './popupPanel.module.css';

export const PopupPanel: React.FC = () => {
    const {openPanel, setOpenPanel} = useContext(SearchPopupPanelContext);
    const [searchType, setSearchType] = useState<'basic' | 'advance' | 'auto-complete'>('advance');
    const formRef = useRef(null);

    const closePanel = () => setOpenPanel(false);

    return (
        <Popup
            open={openPanel}
            modal
            nested
            closeOnDocumentClick={true}
            closeOnEscape={true}
            onClose={closePanel}
        >
            {() => (
                <div className={styles.modal}>
                    <div className={styles.close}>
                        <AiFillCloseCircle size={40} onClick={closePanel}/>
                    </div>
                    <div className={styles.header}>計畫查詢</div>
                    <div className={styles.content}>
                        <SearchForm ref={formRef} searchType={searchType}/>
                    </div>
                    <div className={styles.actions}>
                        <Button size="sm" variant={searchType === 'auto-complete' ? 'primary' : 'secondary'}
                                onClick={() => setSearchType('auto-complete')}>
                            自動完成
                        </Button>
                        <Button size="sm" variant={searchType === 'basic' ? 'primary' : 'secondary'}
                                onClick={() => setSearchType('basic')}>
                            基礎查詢
                        </Button>
                        <Button size="sm" variant={searchType === 'advance' ? 'primary' : 'secondary'}
                                onClick={() => setSearchType('advance')}>
                            進階查詢
                        </Button>
                        <Button type="submit" variant="success" size="sm" onClick={() => {
                            //@ts-ignore
                            formRef.current.click();
                        }}>搜尋</Button>
                        <Button variant="danger" size="sm" onClick={closePanel}>取消</Button>
                    </div>
                </div>
            )}
        </Popup>
    );
};