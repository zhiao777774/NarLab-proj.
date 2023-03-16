import React from 'react';
import {ReactSearchAutocomplete} from 'react-search-autocomplete';

export interface AutocompleteResourceItem {
    id: string | number;
    name: string;
    type?: string;
}

type AutocompleteProps = {
    resourceList: AutocompleteResourceItem[];
    loading: boolean
};

export const Autocomplete: React.FC<AutocompleteProps> = ({resourceList, loading}) => {
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
                showNoResultsText={loading ? '資料載入中' : '找不到符合的資料'}
                autoFocus={true}
            />
        </div>
    );
};