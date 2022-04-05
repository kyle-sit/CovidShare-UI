import * as React from 'react';

export interface DividerProps {
    style?: React.CSSProperties;
}

export default class Divider extends React.Component<DividerProps, {}> {
    public render() {
        const { style } = this.props;
        return <li className="divider" style={style} />;
    }
}
