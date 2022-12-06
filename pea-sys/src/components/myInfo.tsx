// import { padding } from '@mui/system';
import React from 'react';
import { Alert, Row, Col, CloseButton } from 'react-bootstrap';
import styles from "./myComponents.module.css";

export const MyInfo: React.FC<{
    task: any;
    setCurTask: Function;
}> = ({ task, setCurTask}) => {
    if (task === undefined){
        return null;
    }

    // https://stackoverflow.com/questions/35351706/how-to-render-a-multi-line-text-string-in-react
    return (      
      <Row className={styles.myInfo} >
        <Row>
          <CloseButton 
              onClick={()=>setCurTask(null)} 
          >                    
          </CloseButton>
        </Row>
        <Row style={{padding:"5px", textAlign:"center"}}>
            <h4>{task.name}</h4>
        </Row>
        <Col xs={6}>
            <h5>部會  </h5> <p>{task.data.department}</p>
            <h5>計畫描述</h5>
            <div className={styles.desp}>
              <p>              
              {task.data.desp}
              </p>
            </div>
        </Col>
        <Col>
              {
                <div style={{textAlign: "left"}}>
                  <Alert variant="warning">
                    <Alert.Heading>Keyword</Alert.Heading>
                    <hr />
                    <p className="mb-0" style={{ overflowY: 'scroll', height:'200px'}}>
                      {task.data.keyword}
                    </p>
                  </Alert>
                  <Alert variant="danger">
                    <Alert.Heading>TF-IDF</Alert.Heading>
                    <hr />
                    <p className="mb-0">
                      {task.data.tf_idf}
                    </p>
                  </Alert>
                </div>
            }
        </Col>        
      </Row>
    );
  };