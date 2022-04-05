import * as React from 'react';

import { DataTableColumn } from '../types';
import ContextMenu from '../../ContextMenu/ContextMenu';
import DropdownMenu, { MenuItem } from '../../DropdownMenu';

const MIN_COL_WIDTH = 20;

interface DataTableHeaderProps {
    columns: DataTableColumn[];
    hiddenColumns: boolean[];
    columnWidths: number[];
    onColumnsResized: (widths: number[]) => void;
    onColumnToggled: (colIndex: number) => void;
    onResetColumns: () => void;
    forwardRef: (el: HTMLDivElement) => void;
    children: (
        resizing: boolean,
        startResize: (e: React.MouseEvent<HTMLDivElement>, colIndex: number) => void
    ) => JSX.Element;
}

/**
 * Handles logic for resizing and toggling columns.
 * A context menu is rendered to allow the user to toggle columns.
 * Callbacks for showing the context menu and resizing are passed through render props.
 *
 * `forwardedRef` is needed as a prop so we can pass the header reference to the parent
 * and also use it locally within this component.
 */
export const DataTableHeader: React.FC<DataTableHeaderProps> = ({
    columns,
    hiddenColumns,
    columnWidths,
    onColumnsResized,
    onColumnToggled,
    onResetColumns,
    forwardRef,
    children,
}) => {
    const header = React.useRef<HTMLDivElement>();
    const resizer = React.useRef<HTMLDivElement>();
    // Whether a column is being resized
    const [resizing, setResizing] = React.useState(false);
    // Props used to render the context menu
    const [contextMenu, setContextMenu] = React.useState({ x: 0, y: 0, visible: false });

    /**
     * Callback for resizing a column.
     * When resizing starts, the resizer appears and can be dragged while holding the mouse down.
     * Once the mouse is released, the column will be resized.
     * Sets up and tears down mouse listeners via closure.
     */
    const startResize = (startEvent: React.MouseEvent<HTMLDivElement>, col: number) => {
        startEvent.stopPropagation();
        startEvent.preventDefault();

        // Hide the mouse so it doesn't obscure the resizer
        resizer.current.style.display = 'block';
        document.body.style.cursor = 'none';

        const startX = startEvent.pageX;
        const headX = header.current.getBoundingClientRect().left;
        // Make sure the user doesn't resize the column to an unusable size
        const minX = startX - headX - columnWidths[col] + MIN_COL_WIDTH;

        // Moves the resizer to the position of the mouse
        const mouseMoveListener = (ev: MouseEvent) => {
            ev.stopPropagation();
            ev.preventDefault();
            resizer.current.style.left = `${Math.max(minX, ev.pageX - headX)}px`;
        };

        // Notifies parent of new width for resized column
        const mouseUpListener = (ev: MouseEvent) => {
            ev.stopPropagation();
            ev.preventDefault();
            resizer.current.style.display = 'none';
            document.body.style.cursor = 'default';
            const x = ev.pageX;
            const diff = x - startX;
            const newWidths = [...columnWidths];
            const newWidth = newWidths[col] + diff;
            newWidths[col] = Math.max(newWidth, MIN_COL_WIDTH);
            setResizing(false);
            onColumnsResized(newWidths);
            window.removeEventListener('mousemove', mouseMoveListener);
            window.removeEventListener('mouseup', mouseUpListener);
        };

        window.addEventListener('mousemove', mouseMoveListener);
        window.addEventListener('mouseup', mouseUpListener);
        setResizing(true);
    };

    // Callback for rendering context menu at the mouse event's location
    const showContextMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setContextMenu({ x: e.pageX, y: e.pageY, visible: true });
    };

    /**
     * Returns context menu items that:
     * * displays which columns have been toggled visible
     * * an option to reset all column sizes
     */
    const getContextMenuItems = () => {
        const visibleCount = hiddenColumns.filter((hidden) => !hidden).length;
        const menuItems = columns.map((c, i) => (
            <MenuItem
                key={i}
                disabled={!hiddenColumns[i] && visibleCount === 1}
                title={getColumnName(columns[i])}
                toggled={!hiddenColumns[i]}
                onClick={() => onColumnToggled(i)}
            />
        ));

        const alignment = contextMenu.x > document.body.clientWidth / 2 ? 'left' : 'right';

        return (
            <>
                <DropdownMenu title="Columns" alignment={alignment} openOnHover scroll scrollHeight={800}>
                    {menuItems}
                </DropdownMenu>
                <MenuItem title="Reset Column Sizes" onClick={() => onResetColumns()} forceClose />
            </>
        );
    };

    return (
        <div
            className="dt__head"
            ref={(el) => {
                header.current = el;
                forwardRef(el);
            }}
            onContextMenu={showContextMenu}
        >
            {children(resizing, startResize)}
            <div className="dt__resize_guide" ref={resizer} />
            {contextMenu.visible && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu({ x: 0, y: 0, visible: false })}
                >
                    {getContextMenuItems()}
                </ContextMenu>
            )}
        </div>
    );
};
DataTableHeader.displayName = 'DataTableHeader';

const getColumnName = (column: DataTableColumn) => {
    return typeof column.name === 'string' ? column.name : column.name.fallback;
};
