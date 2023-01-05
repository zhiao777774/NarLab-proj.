import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {diffDay, diffYear, toRepublicYear, toCE} from "./utils/date";


// @ts-ignore
Date.prototype.diffDay = diffDay;
// @ts-ignore
Date.prototype.diffYear = diffYear;
// @ts-ignore
Date.prototype.toRepublicYear = toRepublicYear;
// @ts-ignore
Date.prototype.toCE = toCE;

ReactDOM.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
    document.getElementById('root')
);

reportWebVitals();
