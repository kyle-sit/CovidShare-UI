import * as React from 'react';

import { RenderableContent } from '../../../util';
import { DataTableSortOrder } from '../types';

interface DataTableColumnProps {
    content: RenderableContent;
    sortable: boolean;
    sortOrder: DataTableSortOrder;
    isSorted: boolean;
    hidden: boolean;
    resizable: boolean;
    onSort: () => void;
    onResize: (e: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * Renders column name, sort status, and resizer for the column.
 */
export const DataTableColumn: React.FC<DataTableColumnProps> = (props) => {
    const [hovering, setHovering] = React.useState(false);

    return (
        <div
            className={`dt__col ${props.hidden ? 'hidden' : ''}  ${
                hovering && props.resizable ? 'dt__col--borders' : ''
            }`}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
        >
            {props.sortable ? (
                <span className="dt__sortable" onClick={props.onSort}>
                    {props.content}
                </span>
            ) : (
                props.content
            )}
            {props.isSorted &&
                (props.sortOrder === DataTableSortOrder.DESCENDING ? (
                    <span className="dt__sort-desc" />
                ) : (
                    <span className="dt__sort-asc" />
                ))}
            {props.resizable && <div className="dt__resizer" onMouseDown={props.onResize} />}
        </div>
    );
};
DataTableColumn.displayName = 'DataTableColumn';
