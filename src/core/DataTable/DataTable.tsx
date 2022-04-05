import './DataTable.scss';

import * as React from 'react';

import { fill, sum, sumBy, throttle, includes } from 'lodash';
import * as elementResizeEvent from 'element-resize-event';

import { RenderableContent } from '../../util';

import { DataTableRow, DataTableColumn, DataTableSortOrder, DataTableSortOption } from './types';
import { DataTableColumn as Column } from './components/DataTableColumn';
import { DataTableRow as Row } from './components/DataTableRow';
import { DataTableCell as Cell } from './components/DataTableCell';
import { DataTableHeader as Header } from './components/DataTableHeader';
import { DataTableBody as Body } from './components/DataTableBody';

// Width of select input columns when multiselect is true
const SEL_COL_WIDTH = 35;
// Minimim width a column can be
const MIN_COL_WIDTH = 20;
// Default max height to use for body
const DEFAULT_BODY_HEIGHT = 500;

const noop = () => {};

interface DataTableProps {
    id?: string;
    // Columns of the datatable, must be at least one
    columns: DataTableColumn[];
    // Rows with data that maps to the provided columns
    rows: DataTableRow[];
    // The index of the selected row
    selectedRow?: number;
    // Indeces of selected rows when multiselect is true
    selectedRows?: number[];
    // Whether to display a checkbox column to allow selecting multiple rows
    multiSelect?: boolean;
    // Called when a row is clicked by the user
    onRowClick?: (row: number, col: number, colKey: string) => void;
    // Called when a row is double clicked by user
    onRowDoubleClick?: (row: number, col: number, colKey: string) => void;
    // Called when a user selects a row using the checkbox when multiselect is true
    onRowsSelected?: (selectedRows: number[]) => void;
    // The minimum height of the table
    minHeight?: string | number;
    // Maximum height of the table
    maxHeight?: string | number;
    // Called when a user toggles a column on/off using the table's context menu
    onColumnToggled?: (colKey: string, toggled: boolean) => void;
    // Called when pixel withs for columns have been determined or user resizes a column
    onColumnsResized?: (widths: number[]) => void;
    // Whether to disable all interaction with the table and give it a disabled style
    disabled?: boolean;
    // Placeholder content for when no rows are present
    placeholderContent?: RenderableContent;
    // Default pixel widths for all columns
    defaultWidths?: number[];
    // Dynamically sizes the data table to fit the container, when false, the table fits the size of its contents
    grow?: boolean;
}

/**
 * Displays a collection of data through rows and columns.
 * Supports:
 * * sorting rows by column
 * * resizing columns
 * * toggling column visibility
 * * selecting multiple rows
 */
export const DataTable: React.FC<DataTableProps> = ({
    id,
    columns,
    rows,
    selectedRow,
    selectedRows,
    multiSelect,
    onRowClick,
    onRowDoubleClick,
    onRowsSelected,
    minHeight,
    maxHeight,
    onColumnToggled,
    onColumnsResized,
    disabled,
    placeholderContent,
    defaultWidths,
    grow,
}) => {
    if (!columns.length) {
        console.warn('Invalid Data Table: 0 columns specified');
        return <div />;
    }

    // Ref to table div - used to calculate height of body
    const table = React.useRef<HTMLDivElement>();
    // Ref to header div - used to calculate pixel widths for columns
    const header = React.useRef<HTMLDivElement>();
    // Ref to body div - used to determine if scrollbar is present
    const body = React.useRef<HTMLDivElement>();
    // Size of the header element's parent as a result of a resize - used to trigger resize effects
    const containerSize = useContainerResize(header.current);
    // The pixel widths of the columns
    const [widths, setWidths] = React.useState(() => getDefaultWidths(defaultWidths, columns));
    // Used to scale columns when resizing table after user adjustments
    const [totalWidth, setTotalWidth] = React.useState(0);
    // The column used to sort rows
    const [sortCol, setSortCol] = React.useState(() => getDefaultSortColumn(columns));
    // The order in which to sort columns
    const [sortOrder, setSortOrder] = React.useState(columns[sortCol].sortOrder);
    // Which columns are currently hidden
    const [hiddenCols, setHiddenCols] = React.useState(fill(Array(columns.length), false));
    // Whether pixel widths need to be reset due to a column being toggled or by user request
    const [resetWidths, setResetWidths] = React.useState(false);

    // On first render hide columns specified by user
    React.useEffect(() => setHiddenCols(columns.map((c) => c.hidden)), []);

    // If the user hasn't specified any default column pixel widths, calculate them here using percentages.
    // Also, if the header resizes, calculate the new column pixel widths
    React.useLayoutEffect(() => {
        // If there is no header width to worth with, bail out
        const headerWidth = header.current ? header.current.getBoundingClientRect().width : 0;
        if (!headerWidth) {
            return;
        }
        let requestedWidths;
        if (!widths.some((width) => !!width)) {
            // No default pixel widths specified - determine pixel widths by using the requested percentage widths
            // This should only be called once on mount
            requestedWidths = getRequestedWidths(header.current, body.current, columns, multiSelect);
        } else {
            // Header resized, calculate the new widths by scaling the old widths.
            // If the user manually adjusted or toggled any columns, preserve those adjustments but scale them.
            requestedWidths = getScaledWidths(
                header.current,
                body.current,
                widths,
                totalWidth,
                hiddenCols,
                multiSelect
            );
        }
        onColumnsResized(requestedWidths);
        setWidths(requestedWidths);
        setTotalWidth(getTotalWidth(header.current, body.current, multiSelect));
    }, [containerSize.width]);

    // User opted to reset columns widths - equally distribute header width amongst all visible columns
    React.useLayoutEffect(() => {
        if (resetWidths) {
            const equalWidths = getEqualWidths(header.current, body.current, columns, hiddenCols, multiSelect);
            onColumnsResized(equalWidths);
            setWidths(equalWidths);
            setTotalWidth(getTotalWidth(header.current, body.current, multiSelect));
            setResetWidths(false);
        }
    }, [resetWidths]);

    // Manually update the DOM width of every column/row cell
    React.useLayoutEffect(() => assignWidths(header.current, body.current, widths, multiSelect));

    // Used to align the header with the body as the user scrolls horizontally
    const scrollHeader = () => {
        header.current.style.left = `-${body.current.scrollLeft}px`;
    };

    // Sets the sort column and order to be used after the user clicks a column name
    const setSort = (col: number) => {
        if (col === sortCol) {
            setSortOrder(
                sortOrder === DataTableSortOrder.DESCENDING
                    ? DataTableSortOrder.ASCENDING
                    : DataTableSortOrder.DESCENDING
            );
        } else {
            setSortCol(col);
            setSortOrder(DataTableSortOrder.ASCENDING);
        }
    };

    // Handles checking/unchecking a row and propagating the results to the parent component
    const onRowChecked = (rowIndex: number, checked: boolean) => {
        const newSelectedRows = [...selectedRows];
        checked ? newSelectedRows.push(rowIndex) : newSelectedRows.splice(newSelectedRows.indexOf(rowIndex), 1);
        onRowsSelected(newSelectedRows);
    };

    // Handles updating column widths as the user resizes the column
    const handleColumnsResize = (newWidths) => {
        setWidths(newWidths);
        setTotalWidth(getTotalWidth(header.current, body.current, multiSelect));
        onColumnsResized(newWidths);
    };

    const handleColumnToggled = (colIndex) => {
        const newHiddenCols = [...hiddenCols];
        newHiddenCols[colIndex] = !newHiddenCols[colIndex];
        setHiddenCols(newHiddenCols);
        setResetWidths(true);
        onColumnToggled(columns[colIndex].colKey, newHiddenCols[colIndex]);
    };

    // Calculate the body height by subtracting the header height from the table height
    const bodyHeight = grow ? getBodyHeight(table.current, header.current) : undefined;

    return (
        <div id={id} ref={table} className={'dt__table'} style={{ height: grow ? '100%' : undefined }}>
            <Header
                forwardRef={(el) => (header.current = el)}
                columns={columns}
                hiddenColumns={hiddenCols}
                columnWidths={widths}
                onColumnsResized={handleColumnsResize}
                onColumnToggled={handleColumnToggled}
                onResetColumns={() => setResetWidths(true)}
            >
                {(resizing, startResize) => (
                    <>
                        {multiSelect && (
                            <Column
                                content={
                                    <input
                                        type="checkbox"
                                        className="dt__row_selector"
                                        checked={selectedRows.length === rows.length}
                                        disabled={disabled}
                                        onChange={
                                            disabled
                                                ? noop
                                                : (e) => onRowsSelected(e.target.checked ? rows.map((r, i) => i) : [])
                                        }
                                    />
                                }
                                sortable={false}
                                sortOrder={sortOrder}
                                resizable={false}
                                isSorted={false}
                                hidden={false}
                                onSort={noop}
                                onResize={noop}
                            />
                        )}
                        {columns.map((c, i) => (
                            <Column
                                key={i}
                                content={getColumnDisplay(c)}
                                sortable={isSortable(c) && !resizing}
                                sortOrder={sortOrder}
                                resizable={!resizing}
                                hidden={hiddenCols[i]}
                                isSorted={i === sortCol}
                                onSort={() => setSort(i)}
                                onResize={(e) => startResize(e, i)}
                            />
                        ))}
                    </>
                )}
            </Header>
            <Body
                ref={body}
                rows={rows}
                sortOptions={{ colKey: columns[sortCol].colKey, sortFn: columns[sortCol].sortFn, sortOrder }}
                placeholderContent={placeholderContent}
                onScroll={scrollHeader}
                minHeight={minHeight}
                maxHeight={maxHeight || bodyHeight}
            >
                {(row, rowIndex, sortedIndex) => (
                    <Row
                        key={sortedIndex}
                        selected={rowIndex === selectedRow}
                        disabled={disabled || row.disabled}
                        checked={includes(selectedRows, rowIndex)}
                        backgroundColor={row.backgroundColor}
                        progress={row.progress}
                        onRowCheck={disabled || row.disabled ? noop : (checked) => onRowChecked(rowIndex, checked)}
                        multiSelect={multiSelect}
                    >
                        {columns.map(({ colKey }, colIndex) => (
                            <Cell
                                key={colIndex}
                                content={row.cells[colKey]}
                                hidden={hiddenCols[colIndex]}
                                onClick={disabled || row.disabled ? noop : () => onRowClick(rowIndex, colIndex, colKey)}
                                onDoubleClick={
                                    disabled || row.disabled ? noop : () => onRowDoubleClick(rowIndex, colIndex, colKey)
                                }
                            />
                        ))}
                    </Row>
                )}
            </Body>
        </div>
    );
};
DataTable.defaultProps = {
    columns: [],
    rows: [],
    selectedRows: [],
    onRowClick: noop,
    onRowDoubleClick: noop,
    onRowsSelected: noop,
    onColumnToggled: noop,
    onColumnsResized: noop,
};
DataTable.displayName = 'DataTable';

// Returns the displayable name of a column
const getColumnDisplay = (column: DataTableColumn) => {
    return typeof column.name === 'string' ? column.name : column.name.display;
};

// Determines whether the input default pixel widths should be used
function getDefaultWidths(defaultWidths: number[] = [], columns: DataTableColumn[] = []) {
    return defaultWidths.length === columns.length ? defaultWidths : [];
}

/**
 * Determins the pixel widths for each input column by diving the header's width among columns based on their
 * requested percentag width.
 * For example, if the header width is 200px and cols 1, 2, 3 request 50%, 30%, 20% respectively, the values
 * 100, 60, 40 will be returned.
 * If the total requested percentage exceeds the width of the header, they will be divided equally.
 * If a column does not specify its requested width, it will receive an equal portion of the leftover width.
 * If a column is hidden, it will not included in calculation.
 */
function getRequestedWidths(
    header: HTMLDivElement,
    body: HTMLDivElement,
    columns: DataTableColumn[],
    multiSelect: boolean
) {
    const headerWidth = header.getBoundingClientRect().width;
    const requestedCount = columns.filter((c) => c.width && !c.hidden).length;

    const scrollBarWidth = body.offsetWidth - body.clientWidth; // scrollbar reduces total header width
    const multiSelectWidth = multiSelect ? SEL_COL_WIDTH : 0;
    const totalWidth = headerWidth - scrollBarWidth - multiSelectWidth;

    const visible = columns.filter((c) => !c.hidden);

    const minWidth = MIN_COL_WIDTH / totalWidth;
    const bypass = sumBy(visible, (c) => c.width || minWidth) > 100;
    const pixelWidths = columns.map((c) => (c.width && !c.hidden ? (c.width / 100) * totalWidth : 0));

    // Equally distributed width that is leftover after requested widths
    const leftOverWidth = bypass
        ? totalWidth / visible.length
        : (totalWidth - sum(pixelWidths)) / (visible.length - requestedCount);
    const distributedWidths = fill(Array(columns.length), leftOverWidth);

    // Designate each column with either its requested pixel width or equally distributed width
    const correctedWidths = bypass
        ? distributedWidths
        : distributedWidths.map((w, i) => (pixelWidths[i] ? pixelWidths[i] : w));

    return correctedWidths;
}

// Scales column widths to the header's current width using the header's old width
function getScaledWidths(
    header: HTMLDivElement,
    body: HTMLDivElement,
    widths: number[],
    prevTotalWidth: number,
    hiddenCols: boolean[],
    multiSelect: boolean
) {
    const headerWidth = header.getBoundingClientRect().width;
    const scrollBarWidth = body.offsetWidth - body.clientWidth;
    const multiSelectWidth = multiSelect ? SEL_COL_WIDTH : 0;
    const totalWidth = headerWidth - scrollBarWidth - multiSelectWidth;
    const prevWidths = widths.map((w, i) => (hiddenCols[i] ? 0 : w));
    const ratios = prevWidths.map((w) => w / (prevTotalWidth || totalWidth)); // Get each width as a percentage of the old header width
    const newWidths = ratios.map((ratio) => ratio * totalWidth); // Using percentages to calculate new column pixel widths
    return newWidths;
}

// Equally distributes header width among all visible columns
function getEqualWidths(
    header: HTMLDivElement,
    body: HTMLDivElement,
    columns: DataTableColumn[],
    hiddenColumns: boolean[],
    multiSelect: boolean
) {
    const headerWidth = header.getBoundingClientRect().width;
    if (headerWidth === 0) {
        return columns.map((c) => MIN_COL_WIDTH);
    }
    const scrollBarWidth = body.offsetWidth - body.clientWidth;
    const multiSelectWidth = multiSelect ? SEL_COL_WIDTH : 0;
    const hiddenColsCount = hiddenColumns.filter((hidden) => hidden).length;
    const width = (headerWidth - scrollBarWidth - multiSelectWidth) / (columns.length - hiddenColsCount);
    const newWidths = fill(Array(columns.length), width);
    return newWidths;
}

// Assigns the calculated pixl widths to each column and row cell element
function assignWidths(header: HTMLDivElement, body: HTMLDivElement, widths: number[], includeSelectors: boolean) {
    const columns = getChildren(header, '.dt__col');
    if (includeSelectors) {
        const selCol = columns.shift();
        selCol.style.width = `${SEL_COL_WIDTH}px`;
    }
    columns.forEach((col, i) => (col.style.width = `${widths[i]}px`));
    const rows = getChildren(body, '.dt__row');
    widths.forEach((width, i) => {
        rows.forEach((row) => {
            const cells = getChildren(row, '.dt__cell');
            if (includeSelectors) {
                const selCell = cells.shift();
                selCell.style.width = `${SEL_COL_WIDTH}px`;
            }
            cells[i].style.width = `${width}px`;
        });
    });
}

// Utility function for getting an array of elements using a selector
function getChildren(element: HTMLElement, selector: string) {
    const children: HTMLElement[] = [];
    if (!element) {
        return [];
    }
    const queried = element.querySelectorAll(selector);
    for (let i = 0; i < queried.length; i++) {
        const child = queried.item(i);
        if (isHTMLElement(child)) {
            children.push(child);
        }
    }
    return children;
}

function isHTMLElement(element: Element): element is HTMLElement {
    return !!(element as HTMLElement).style;
}

function isSortable(col: DataTableColumn) {
    return col.sortable === undefined || !!col.sortable;
}

function getDefaultSortColumn(columns: DataTableColumn[]) {
    const index = columns.findIndex((col) => col.sorted);
    return index === -1 ? 0 : index;
}

function useContainerResize(element: Element) {
    const [size, setSize] = React.useState({ width: 0, height: 0 });
    React.useLayoutEffect(() => {
        if (!element) {
            // @ts-ignore
            return;
        }
        const parent = element.parentElement;
        if (!parent) {
            // @ts-ignore
            return;
        }
        elementResizeEvent(
            parent,
            throttle(
                () => {
                    const { width, height } = parent.getBoundingClientRect();
                    setSize({ width, height });
                },
                10,
                { leading: true, trailing: true }
            )
        );
        return () => {
            try {
                elementResizeEvent.unbind(parent);
            } catch (e) {}
        };
    }, [element]);
    return size;
}

function getTotalWidth(header: HTMLDivElement, body: HTMLDivElement, multiSelect: boolean) {
    const headerWidth = header.getBoundingClientRect().width;
    const scrollBarWidth = body.offsetWidth - body.clientWidth;
    const multiSelectWidth = multiSelect ? SEL_COL_WIDTH : 0;
    const totalWidth = headerWidth - scrollBarWidth - multiSelectWidth;
    return totalWidth;
}

function getBodyHeight(table: HTMLDivElement, header: HTMLDivElement) {
    if (!table || !header) {
        return DEFAULT_BODY_HEIGHT;
    }
    return table.getBoundingClientRect().height - header.getBoundingClientRect().height;
}
