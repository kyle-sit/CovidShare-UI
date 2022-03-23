import './ResizablePane.css';

import * as React from 'react';

export interface ResizablePaneProps {
    width?: string | number;
    height?: string | number;
    hidden?: boolean;
    className?: string;
}

const ResizablePane: React.FC<ResizablePaneProps> = ({ width, height, className, children }) => {
    return (
        <div
            className={`resizable-pane ${className || ''}`}
            style={{ width, height, display: width !== '0px' ? undefined : 'none' }}
        >
            {children}
        </div>
    );
};

export default ResizablePane;
