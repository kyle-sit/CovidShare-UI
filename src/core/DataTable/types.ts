import { RenderableContent } from '../../util';

/**
 * Schema used to map row cells to columns.
 * The key is the column's key, the value is the cell's content.
 */
export type DataTableSchema = {
    [index: string]: RenderableContent;
};

/**
 * Function used to sort rows
 */
export type DataTableSortFn = DataTableSortOption | ((a: DataTableRow, b: DataTableRow) => number);

/**
 * Properties for a data table column.
 * Passing a DataTableSchema as a generic argument allows for type-safety when defining
 * column keys and mapping back to them when creating rows.
 */
export interface DataTableColumn<Schema = DataTableSchema> {
    // Display name of the column.  If renderable content is used, a fallback string should be provided
    name: string | { display: RenderableContent; fallback: string };
    // The key of the column that a row cell will map to
    colKey: Extract<keyof Schema, string>;
    // The percentage width the column should occupy in the datatable header (0-100%)
    width?: number;
    // Whether the column can be sorted
    sortable?: boolean;
    // Whether the column should be the default column to sort by (only 1 column should have this set to true)
    sorted?: boolean;
    // Function used to sort rows
    sortFn?: DataTableSortFn;
    // Whether ascending or descending sort
    sortOrder?: DataTableSortOrder;
    // Whether this column should be hidden
    hidden?: boolean;
}

/**
 * Properties for the data table row.
 * Passing a DataTableSchema ensures type-safety and that all columns are accounted for when mapping
 * cells to columns.
 */
export interface DataTableRow<Schema = DataTableSchema> {
    // The cells to display.  The keys of the object should be column keys ('colKey'), and the values are to display
    cells: {
        [index in keyof Schema]: RenderableContent;
    };
    // Whether to disable the row and prevent interaction
    disabled?: boolean;
    // Background color of the row
    backgroundColor?: string;
    // Percent progress of the row (0-100) - displays a laoding bar background that fills up along width of row
    progress?: number;
}

/**
 * Order in which rows are sorted
 */
export enum DataTableSortOrder {
    // lowest value is at top
    ASCENDING,
    // greatest value is at top
    DESCENDING,
}

/**
 * Built in sort functions that can be used to sort rows
 */
export enum DataTableSortOption {
    // Based on cell's numerical value
    NUMERIC,
    // Based off the cell's lowercase string value
    LEXICAL,
    // Based off the cell's data value
    DATE,
}
