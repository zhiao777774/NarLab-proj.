import React from 'react';
import {ReactSearchAutocomplete} from 'react-search-autocomplete';

export interface AutocompleteResourceItem {
    id: string | number;
    name: string;
    type?: string;
}

type AutocompleteProps = {
    resourceList: AutocompleteResourceItem[];
};

export const Autocomplete: React.FC<AutocompleteProps> = ({resourceList}) => {
    const _format = (item: AutocompleteResourceItem) => {
        const {type, name} = item;
        const typeStr = type ? (type + ': ') : '';
        return (
            <span className="d-block text-start">
                {typeStr}{name}
            </span>
        );
    };

    return (
        <div>
            <ReactSearchAutocomplete<AutocompleteResourceItem>
                items={resourceList}
                formatResult={_format}
                maxResults={100}
                showNoResultsText="找不到符合的資料"
                autoFocus={true}
            />
        </div>
    );
};