import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, HashRouter} from 'react-router-dom';
import {ProSidebarProvider} from 'react-pro-sidebar';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './extensions';
import './index.css';


ReactDOM.render(
    <React.StrictMode>
        <ProSidebarProvider>
            <HashRouter>
                <App/>
            </HashRouter>
        </ProSidebarProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

reportWebVitals();
