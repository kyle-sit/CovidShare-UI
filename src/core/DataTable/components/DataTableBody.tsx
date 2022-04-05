import * as React from 'react';

import { DataTableRow, DataTableSortFn, DataTableSortOption, DataTableSortOrder } from '../types';
import { RenderableContent } from '../../../util';

interface DataTableBodyProps {
    onScroll: () => void;
    sortOptions: { colKey: string; sortOrder: DataTableSortOrder; sortFn: DataTableSortFn };
    rows: DataTableRow[];
    placeholderContent: RenderableContent;
    minHeight: React.ReactText;
    maxHeight: React.ReactText;
    children: (row: DataTableRow, rowIndex: number, sortedIndex: number) => JSX.Element;
}

/**
 * Responsible for sorting the rows of the data table.
 * It takes in rows as props and provies them in sorted order using the render prop pattern.
 * Sorting is memoized.
 */
export const DataTableBody = React.forwardRef<HTMLDivElement, DataTableBodyProps>(
    ({ rows, sortOptions, placeholderContent, onScroll, minHeight, maxHeight, children }, ref) => {
        const sortedRows = React.useMemo(
            () => sortRows(rows, sortOptions.colKey, sortOptions.sortOrder, sortOptions.sortFn),
            [rows, sortOptions.colKey, sortOptions.sortOrder, sortOptions.sortFn]
        );

        return (
            <div className="dt__body" ref={ref} onScroll={onScroll} style={{ minHeight, maxHeight }}>
                {!sortedRows.length && <div className="dt__no-content">{placeholderContent || 'No Content'}</div>}
                {sortedRows.map(({ row, index: rowIndex }, sortedIndex) => (
                    <React.Fragment key={sortedIndex}>{children(row, rowIndex, sortedIndex)}</React.Fragment>
                ))}
            </div>
        );
    }
);
DataTableBody.displayName = 'DataTableBody';

/**
 * Sorts rows along a column using the given sort options
 * @param rows Rows to sort
 * @param colKey Column to sort along
 * @param sortOrder Ascending or descending sort order
 * @param sortFn Which function to use to sort the rows (Defaults to lexical or numeric based on content)
 */
function sortRows(
    rows: DataTableRow[],
    colKey: string,
    sortOrder: DataTableSortOrder = DataTableSortOrder.ASCENDING,
    sortFn: DataTableSortOption | ((a: DataTableRow, b: DataTableRow) => number)
) {
    if (!sortFn) {
        sortFn =
            rows[0] && typeof rows[0].cells[colKey] === 'string'
                ? DataTableSortOption.LEXICAL
                : DataTableSortOption.NUMERIC;
    }
    const sort = getSortFn(colKey, sortFn);
    const rowTuples = rows.map((row, index) => ({ row, index }));
    const sorted = rowTuples.sort((a, b) => sort(a.row, b.row));
    return sortOrder === DataTableSortOrder.ASCENDING ? sorted : sorted.reverse();
}

const getSortFn = (sortCol: string, sortFn: DataTableSortOption | ((a: DataTableRow, b: DataTableRow) => number)) => {
    if (typeof sortFn === 'function') {
        return sortFn;
    } else {
        switch (sortFn) {
            case DataTableSortOption.NUMERIC:
                return createNumericCompare(sortCol);
            case DataTableSortOption.LEXICAL:
                return createLexicalCompare(sortCol);
            case DataTableSortOption.DATE:
                return createDateCompare(sortCol);
        }
    }
};

const createLexicalCompare = (colKey: string) => (a: DataTableRow, b: DataTableRow) =>
    lexicalCompare(a.cells[colKey], b.cells[colKey]);
const lexicalCompare = (a: any, b: any) => ('' + a).localeCompare('' + b);

const createNumericCompare = (colKey: string) => (a: DataTableRow, b: DataTableRow) =>
    numericCompare(a.cells[colKey], b.cells[colKey]);
const numericCompare = (a: any, b: any) => {
    let result = 0;
    try {
        result = parseFloat(a) - parseFloat(b);
    } catch (e) {}
    return result;
};

const createDateCompare = (colKey: string) => (a: DataTableRow, b: DataTableRow) =>
    dateCompare(a.cells[colKey], b.cells[colKey]);
const dateCompare = (a: any, b: any) => new Date(b).getTime() - new Date(a).getTime();
