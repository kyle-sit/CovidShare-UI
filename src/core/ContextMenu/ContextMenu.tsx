import * as React from 'react';

import { Omit } from '../../util';

import { DropdownMenu, DropdownMenuProps } from '../DropdownMenu/DropdownMenu';
import Portal from '../Portal/Portal';

export interface ContextMenuProps extends Omit<DropdownMenuProps, 'title'> {
    x: number;
    y: number;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, closeOnOutsideClick, children, ...rest }) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [size, setSize] = React.useState({ x: 0, y: 0 });
    const numChildren = React.Children.count(children);

    // Re-calculate menu size if the number of child MenuItems changes
    React.useEffect(() => {
        const dropdownMenu = ref.current.getElementsByClassName('dropdown-menu').item(0);
        if (dropdownMenu) {
            setSize({ x: dropdownMenu.clientWidth, y: dropdownMenu.clientHeight });
        } else {
            console.warn('Warning: Could not find dropdownmenu nested under context menu', ref.current);
        }
    }, [numChildren]);

    // Prevent context menu from being clipped by the document boundaries
    if (x + size.x > document.body.clientWidth) {
        x = document.body.clientWidth - size.x;
    }
    if (y + size.y > document.body.clientHeight) {
        y = document.body.clientHeight - size.y;
    }

    return (
        <Portal>
            <div
                style={{
                    position: 'fixed',
                    display: 'block',
                    top: y + 'px',
                    left: x + 'px',
                    zIndex: 99999, // this must be bigger than the 'model-overlay' z-index
                }}
                ref={ref}
            >
                <DropdownMenu
                    title=""
                    noToggleElement
                    onClose={onClose}
                    closeOnOutsideClick={closeOnOutsideClick}
                    {...rest}
                >
                    {children}
                </DropdownMenu>
            </div>
        </Portal>
    );
};

ContextMenu.defaultProps = {
    closeOnOutsideClick: true,
};

export default ContextMenu;
