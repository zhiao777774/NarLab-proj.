import React from 'react';
import {ReactSearchAutocomplete} from 'react-search-autocomplete';


export type keywordItem = {
    id: string | number,
    name: string,
    type?: string
};

export const AutoComplete: React.FC<{ items: keywordItem[] }> = ({items}) => {
    const format = (item: keywordItem) => {
        return (
            <>
                <span style={{
                    display: 'block',
                    textAlign: 'left'
                }}>{item.type ? (item.type + ': ') : null}{item.name}</span>
            </>
        )
    };

    return (
        <div>
            <ReactSearchAutocomplete<keywordItem>
                items={items}
                formatResult={format}
                maxResults={100}
                showNoResultsText="找不到符合的資料"
                autoFocus
            />
        </div>
    );
};