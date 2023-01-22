import React from 'react';
import {ReactSearchAutocomplete} from 'react-search-autocomplete';


export type keywordItem = {
    id: string | number;
    name: string;
};

export const AutoComplete: React.FC<{ items: keywordItem[] }> = ({items}) => {
    // @ts-ignore
    const handleOnSearch = (string, result) => {
        console.log(string)
        console.log(result);
    };

    return (
        <div>
            <ReactSearchAutocomplete<keywordItem>
                items={items}
                onSearch={handleOnSearch}
                autoFocus
            />
        </div>
    );
};