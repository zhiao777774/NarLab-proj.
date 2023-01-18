import {createContext} from 'react';

export const CategoryContext = createContext('');

export const SidebarCollapsedContext = createContext(false);

export const SearchPopupPanelContext = createContext({
    openPanel: false,
    setOpenPanel: (openPanel: boolean) => {}
});

export const SearchDataContext = createContext({
    searchData: null,
    setSearchData: (searchData: any) => {}
});