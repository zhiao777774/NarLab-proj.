import {createContext} from 'react';
import {Task} from '../constants/types';

export const SidebarCollapsedContext = createContext(false);

export const SearchPopupPanelContext = createContext({
    openPanel: false,
    setOpenPanel: (openPanel: boolean) => {}
});

export const SearchDataContext = createContext({
    searchData: null,
    setSearchData: (searchData: any) => {}
});

export const DatasetContext = createContext<Task[]>([]);