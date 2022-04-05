import * as React from 'react';

interface DataTableRowProps {
    selected: boolean;
    disabled?: boolean;
    multiSelect: boolean;
    checked: boolean;
    backgroundColor: string;
    // 0-100 as percentage
    progress: number;
    onRowCheck: (checked: boolean) => void;
}

/**
 * Renders a row and optionally creates a cell for the 'multiSelect' checkbox input,
 * which allows the user to select multiple rows.
 * The 'progress' prop renders a transparent progress bar across the row.
 */
export const DataTableRow: React.FC<DataTableRowProps> = ({
    selected,
    disabled,
    checked,
    multiSelect,
    backgroundColor,
    progress,
    onRowCheck,
    children,
}) => {
    return (
        <div className={`dt__row_border ${selected ? 'dt__row--selected' : ''}`}>
            <div
                className={`dt__row ${selected ? 'dt__row--selected' : ''} ${disabled ? 'dt__row_disabled' : ''}`}
                style={{ backgroundColor }}
            >
                <div className="dt__row_progress" style={{ right: 100 - progress + '%' }} />
                {multiSelect && (
                    <div key={'multiselect'} className={'dt__cell'}>
                        <input
                            type="checkbox"
                            className="dt__row_selector"
                            checked={checked}
                            disabled={disabled}
                            onChange={(e) => (disabled ? () => {} : onRowCheck(e.target.checked))}
                        />
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};
DataTableRow.displayName = 'DataTableRow';
