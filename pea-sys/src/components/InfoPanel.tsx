import React, {useState} from 'react';
import {Alert, Row, Col, CloseButton, Button, InputGroup} from 'react-bootstrap';
import {AiOutlineKey} from 'react-icons/ai'
import {HiDocumentMagnifyingGlass} from 'react-icons/hi2';
import {Task} from '../constants/types';
import styles from './InfoPanel.module.css';

export const InfoPanel: React.FC<{ task: Task; setCurTask: Function; }> = ({task, setCurTask}) => {
    const [phase, setPhase] = useState<number>(0);
    if (task === undefined) return null;

    const isTask = (task.level === 3 && task.type === 'task');
    const target = isTask ? task : task.data[phase];

    return (
        <Row className={styles.infoPanelContainer}>
            <Row>
                <CloseButton onClick={() => setCurTask(null)}/>
            </Row>
            <Row style={{padding: '5px', textAlign: 'center', marginTop: '8px', marginBottom: '5px'}}>
                <h4>{target.name}</h4>
            </Row>
            <Row>
                {
                    (!isTask && task.data.length > 1) ?
                        <InputGroup className="mb-4 justify-content-center">
                            {task.data.map((t: any, i: number) =>
                                <Button key={`${t.name}-${i}`} variant="outline-dark" size="sm"
                                        onClick={() => setPhase(i)}>
                                    第 {i + 1} 期
                                </Button>
                            )}
                        </InputGroup>
                        : null
                }
            </Row>
            <Col xs={7}>
                <h5>年度 </h5> <p>{target.start.toRepublicYear().getFullYear()}</p>
                <h5>部會 </h5> <p>{target.data.department}</p>
                {
                    target.data.implementer ?
                        <><h5>預定執行機關 </h5><p>{target.data.implementer}</p></>
                        : null
                }
                {
                    target.data.quotaCategory ?
                        <><h5>額度類別 </h5><p>{target.data.quotaCategory}</p></>
                    : null
                }
                <h5>計畫描述</h5>
                <div className={styles.infoPanelDesp}>
                    <p>{target.data.description}</p>
                </div>
                {
                    target.data.OKR ?
                        <><h5>OKR </h5><p>{target.data.OKR}</p></>
                        : null
                }
            </Col>
            <Col>
                {
                    <div className={styles.infoPanelTag}>
                        {
                            target.data?.keyword && (
                                <Alert variant="warning">
                                    <Alert.Heading>
                                        <AiOutlineKey className="me-1"/>
                                        Keyword
                                    </Alert.Heading>
                                    <hr/>
                                    <div className="mb-0 text-black overflow-auto">
                                        {target.data.keyword.split(/[;,，、]/).map((kw: string, i: number) => {
                                                if (!kw.trim()) return null;
                                                return (
                                                    <div key={`${target.id}_keyword_${i}`}
                                                         className="d-inline-block rounded-2 bg-warning bg-opacity-50 py-1 px-2 m-2">{kw}</div>
                                                );
                                            }
                                        )}
                                    </div>
                                </Alert>
                            )
                        }
                        {
                            target.data.tfidf.CH && target.data.tfidf.CH.length ?
                                <Alert variant="primary">
                                    <Alert.Heading>
                                        <HiDocumentMagnifyingGlass className="me-1"/>
                                        TF-IDF
                                    </Alert.Heading>
                                    <hr/>
                                    <div className="mb-0 text-black overflow-auto">
                                        {
                                            target.data.tfidf.CH.map((tfidf: string, i: number) =>
                                                <div key={`${target.id}_tfidf_ch${i}`}
                                                     className="d-inline-block rounded-2 bg-info bg-opacity-50 py-1 px-2 m-2">{tfidf}</div>
                                            )
                                        }
                                    </div>
                                </Alert>
                                : null
                        }
                        {
                            target.data.tfidf.EN && target.data.tfidf.EN.length ?
                                <Alert variant="danger">
                                    <Alert.Heading>
                                        <HiDocumentMagnifyingGlass className="me-1"/>
                                        英文斷詞
                                    </Alert.Heading>
                                    <hr/>
                                    <div className="mb-0 text-black overflow-auto">
                                        {
                                            target.data.tfidf.EN.map((tfidf: string, i: number) =>
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