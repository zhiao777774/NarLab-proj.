import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {ProSidebarProvider} from 'react-pro-sidebar';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {diffDay, diffYear, toRepublicYear, toCE} from './utils/date';
import './index.css';


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
        <ProSidebarProvider>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </ProSidebarProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

reportWebVitals();
