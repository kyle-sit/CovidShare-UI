import * as React from 'react';

import { RenderableContent } from '../../../util';

export interface MenuHeaderProps {
    header: RenderableContent;
    style?: React.CSSProperties;
}

export default class MenuHeader extends React.Component<MenuHeaderProps, {}> {
    public render() {
        const { style, header } = this.props;
        return (
            <li className="dropdown-header" style={style}>
                {header}
            </li>
        );
    }
}
