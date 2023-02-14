import React from 'react';
import {Alert, Row, Col, CloseButton} from 'react-bootstrap';
import {AiOutlineKey} from 'react-icons/ai'
import {HiDocumentMagnifyingGlass} from 'react-icons/hi2';
import {Task} from '../constants/types';
import styles from './InfoPanel.module.css';

export const InfoPanel: React.FC<{ task: Task; setCurTask: Function; }> = ({task, setCurTask}) => {
    if (task === undefined) return null;

    return (
        <Row className={styles.infoPanelContainer}>
            <Row>
                <CloseButton onClick={() => setCurTask(null)}/>
            </Row>
            <Row style={{padding: '5px', textAlign: 'center', marginTop: '8px', marginBottom: '15px'}}>
                <h4>{task.name}</h4>
            </Row>
            <Col xs={7}>
                <h5>年度 </h5> <p>{task.start.toRepublicYear().getFullYear()}</p>
                <h5>部會 </h5> <p>{task.data.department}</p>
                <h5>計畫描述</h5>
                <div className={styles.infoPanelDesp}>
                    <p>{task.data.description}</p>
                </div>
            </Col>
            <Col>
                {
                    <div className={styles.infoPanelTag}>
                        {
                            task.data.keyword && (
                                <Alert variant="warning">
                                    <Alert.Heading>
                                        <AiOutlineKey className="me-1"/>
                                        Keyword
                                    </Alert.Heading>
                                    <hr/>
                                    <div className="mb-0 text-black overflow-auto" style={{maxHeight: '160px'}}>
                                        {task.data.keyword.split(/[;,，、]/).map((kw: string, i: number) =>
                                            <div key={`${task.id}_keyword_${i}`}
                                                 className="d-inline-block rounded-2 bg-warning bg-opacity-50 py-1 px-2 m-2">{kw}</div>
                                        )}
                                    </div>
                                </Alert>
                            )
                        }
                        <Alert variant="primary">
                            <Alert.Heading>
                                <HiDocumentMagnifyingGlass className="me-1"/>
                                TF-IDF
                            </Alert.Heading>
                            <hr/>
                            <div className="mb-0 text-black overflow-auto" style={{maxHeight: '160px'}}>
                                {
                                    task.data.tfidf.CH.map((tfidf: string, i: number) =>
                                        <div key={`${task.id}_tfidf_ch${i}`}
                                             className="d-inline-block rounded-2 bg-info bg-opacity-50 py-1 px-2 m-2">{tfidf}</div>
                                    )
                                }
                            </div>
                        </Alert>
                        {
                            task.data.tfidf.EN.length ?
                                <Alert variant="danger">
                                    <Alert.Heading>
                                        <HiDocumentMagnifyingGlass className="me-1"/>
                                        英文斷詞
                                    </Alert.Heading>
                                    <hr/>
                                    <div className="mb-0 text-black overflow-auto" style={{maxHeight: '160px'}}>
                                        {
                                            task.data.tfidf.EN.map((tfidf: string, i: number) =>
                                                <div key={`${task.id}_tfidf_en${i}`}
                                                     className="d-inline-block rounded-2 bg-danger bg-opacity-50 py-1 px-2 m-2">{tfidf}</div>
                                            )
                                        }
                                    </div>
                                </Alert>
                                : null
                        }
                    </div>
                }
            </Col>
        </Row>
    );
};