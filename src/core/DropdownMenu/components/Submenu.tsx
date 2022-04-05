import * as React from 'react';

import { RenderableContent } from '../../../util';
// import DropdownMenu from '../DropdownMenu';

export interface SubmenuProps {
    title: RenderableContent;
    onForceClose?: () => void;
    alignment?: 'left' | 'right';
    disabled?: boolean;
}

export default class Submenu extends React.Component<SubmenuProps, {}> {
    public render() {
        // const { title, children, onForceClose, disabled } = this.props;
        return (
            <div></div>
            // <DropdownMenu title={title} alignment="right" openOnHover disabled={disabled} onForceClose={onForceClose}>
            //     {children}
            // </DropdownMenu>
        );
    }
}
