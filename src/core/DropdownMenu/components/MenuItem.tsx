import * as React from 'react';

import classnames from 'classnames';
import { RenderableContent } from '../../../util';

export interface MenuItemProps {
    id?: string;
    title: RenderableContent;
    icon?: JSX.Element;
    disabled?: boolean;
    onClick: (e: React.MouseEvent<HTMLLIElement>) => void;
    toggled?: boolean;
    forceClose?: boolean;
    // Used internally by DropdownMenu
    onForceClose?: () => void;
    hint?: string;
}

/**
 * Wrapper class for items that appear in a dropdown/sub menu.
 * Allows items to be toggled on/off, displaying a checkmark for when they are.
 */
export default class MenuItem extends React.Component<MenuItemProps, {}> {
    public render() {
        const { id, title, icon, disabled, toggled, hint } = this.props;
        const menuItemClass = classnames(disabled && 'disabled', toggled && 'menu-item_toggled');
        const checkedClass = toggled ? 'icon-check' : '';

        return (
            <li id={id} className={menuItemClass} onClick={disabled ? undefined : this.onClick}>
                <a className="menu-item__title" role="button" title={hint} href="/#">
                    <span className={checkedClass} />
                    {title}
                    {icon && <span className="menu-item__key">{icon}</span>}
                </a>
            </li>
        );
    }

    private onClick = (e: React.MouseEvent<HTMLLIElement>) => {
        const { forceClose, onForceClose, onClick, disabled } = this.props;
        if (disabled) {
            return;
        }

        if (forceClose) {
            if (onForceClose) {
                onForceClose();
            }
            onClick(e);
        } else {
            onClick(e);
        }
        e.stopPropagation();
    };
}
