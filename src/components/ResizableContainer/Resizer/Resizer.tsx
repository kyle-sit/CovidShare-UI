import './Resizer.css';

import * as React from 'react';

export interface ResizerProps {
    onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
    style?: any;
    alignment: 'horizontal' | 'vertical';
}

const Resizer: React.FC<ResizerProps> = ({ alignment, ...rest }) => {
    return <div className={`resizer resizer_${alignment}`} {...rest} />;
};

export default Resizer;
