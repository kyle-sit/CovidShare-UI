import * as React from 'react';
import { RenderableContent } from '../../../util';

interface DataTableCellProps {
    content: RenderableContent;
    hidden: boolean;
    onClick: () => void;
    onDoubleClick: () => void;
}

/**
 * Used to render row-column content
 */
export const DataTableCell: React.FC<DataTableCellProps> = ({ content, hidden, onClick, onDoubleClick }) => {
    return (
        <div
            className={`dt__cell ${hidden ? 'hidden' : ''}`}
            onClick={() => onClick()}
            onDoubleClick={() => onDoubleClick}
        >
            {content}
        </div>
    );
};
DataTableCell.displayName = 'DataTableCell';
