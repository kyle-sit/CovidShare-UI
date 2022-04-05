import * as React from 'react';
import Loader from '../../Loader/Loader';

export const DataTableLoader: React.FC<{}> = (props) => {
    return (
        <div>
            <Loader className="dt__loader" />
            <div className="dt__loader_content">{props.children}</div>
        </div>
    );
};
