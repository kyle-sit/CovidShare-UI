import './DropdownMenu.css';

import * as React from 'react';

import classnames from 'classnames';
import autobind from 'autobind-decorator';

import { RenderableContent } from '../../util';
import { Divider, MenuHeader, MenuItem, Submenu } from './components';
import { Button } from '../Buttons';

export const DROPDOWN_LISTENERS: any[] = [];

export interface DropdownMenuProps {
    id?: string;
    title: RenderableContent;
    className?: string;
    disabled?: boolean;
    openOnHover?: boolean;
    dropup?: boolean;
    alignment?: 'left' | 'right';
    // Whether the dropdown should be toggled on and off by an element
    noToggleElement?: boolean;
    // Optional callback for when the menu closes
    onClose?: () => void;
    // Optional styles to apply to toggle element
    style?: React.CSSProperties;
    // Renders a checkmark on the left side of the menu
    checkmark?: boolean;
    isButton?: boolean;
    minMenuWidth?: string;
    forceToggle?: boolean;
    scroll?: boolean;
    scrollHeight?: number;
    closeOnOutsideClick?: boolean;
    hint?: string;
    onForceClose?: () => void;
    onClick?: () => void;
    forwardedRef?: React.MutableRefObject<HTMLElement>;
}

export interface DropDownMenuState {
    toggled: boolean;
    boundMenu: boolean;
}

/**
 * Displays a list of menu items when toggled on via clicking its toggle element.
 */
@autobind
export class DropdownMenu extends React.Component<DropdownMenuProps, DropDownMenuState> {
    // Subcomponents for exporting
    public static Divider = Divider;
    public static MenuHeader = MenuHeader;
    public static MenuItem = MenuItem;
    public static Submenu = Submenu;

    static defaultProps = {
        closeOnOutsideClick: true,
    };

    // Used to prevent dropdown from closing when the submenu is hovered (when props.openOnHover is true)
    private willPreventClose: boolean;
    // Used to close the dropdown when the cursor leaves the submenu (when props.openOnHover is true)
    private pendingClose: boolean;
    private dropdownButton: any;
    private dropdown: HTMLElement | null;
    private notifyID = '' + Date.now();

    constructor(props: DropdownMenuProps) {
        super(props);

        this.state = {
            toggled: !!props.noToggleElement,
            boundMenu: false,
        };

        this.willPreventClose = false;
        this.pendingClose = false;
    }

    public componentDidMount(): void {
        if (this.props.closeOnOutsideClick) {
            window.addEventListener('mouseup', this.handleClose);
        }

        if (this.props.forwardedRef) {
            this.props.forwardedRef.current = this.dropdown;
        }
    }

    public componentDidUpdate(): void {
        // Prevents context menu from going off screen
        if (this.dropdown!.getBoundingClientRect().bottom > document.body.clientHeight && !this.state.boundMenu) {
            this.setState({ boundMenu: true } as DropDownMenuState);
        }
    }

    public componentWillUnmount(): void {
        if (this.props.closeOnOutsideClick) {
            window.removeEventListener('mouseup', this.handleClose);
        }
    }

    public render() {
        const {
            dropup,
            className,
            disabled,
            alignment,
            forceToggle,
            noToggleElement,
            scroll,
            scrollHeight,
            minMenuWidth,
            id,
            isButton,
            style,
            openOnHover,
            hint,
            title,
            checkmark,
            onClick,
        } = this.props;

        const { toggled, boundMenu } = this.state;

        const checkedClass = checkmark ? 'icon-check' : '';

        let nestedMenuStyles: React.CSSProperties = {};

        if (boundMenu) {
            // Work around for making sure context menu doesn't go off screen
            const bbox = this.dropdown!.getBoundingClientRect();
            const bDiff = document.body.clientHeight - bbox.bottom - 15;
            const currTop = parseInt(window.getComputedStyle(this.dropdown!).top as any, 10);
            const newTop = currTop + bDiff;
            nestedMenuStyles = {
                top: newTop + 'px',
            };
        }

        if (scroll && scrollHeight) {
            nestedMenuStyles.overflowY = 'auto';
            nestedMenuStyles.maxHeight = scrollHeight + 'px';
        }

        if (noToggleElement) {
            nestedMenuStyles = { top: '0px' };
        }

        if (minMenuWidth) {
            nestedMenuStyles.minWidth = minMenuWidth;
        }

        const children = React.Children.map(this.props.children, (child) => {
            if (child) {
                return React.cloneElement(child as React.ReactElement<any>, {
                    onForceClose: this.toggle.bind(this, false, true),
                });
            }
            return undefined;
        });

        const classes = {
            dropdown: classnames(
                'dropdown',
                dropup ? 'dropup' : '',
                toggled || forceToggle ? 'open' : '',
                disabled ? 'disabled' : '',
                className || ''
            ),
            toggle: classnames('dropdown-toggle'),
            title: classnames(alignment ? 'dropdown-menu__title_full' : ''),
            caret: classnames(
                'caret',
                alignment ? 'caret-right' : '',
                noToggleElement ? 'dropdown-menu__caret--hidden' : ''
            ),
            nestedMenu: classnames('dropdown-menu', alignment ? `dropdown-menu__${alignment}` : ''),
        };

        return isButton ? (
            <Button
                callbackRef={(el) => (this.dropdownButton = el)}
                className="btn"
                onClick={(e) => {
                    this.toggle();
                    if (!disabled && onClick) {
                        onClick();
                    }
                    e.stopPropagation();
                }}
                disabled={disabled}
                style={style || {}}
                onMouseEnter={openOnHover ? this.onMouseEnter : undefined}
                onMouseLeave={openOnHover ? this.onMouseLeave : undefined}
                useDiv
                id={id}
                title={hint}
            >
                <span className={checkedClass} />
                <span className={classes.title}>{title}</span>
                <span className={classes.caret} />
                <ul
                    className={classes.nestedMenu}
                    onMouseEnter={this.onSubmenuEnter}
                    onMouseLeave={this.onSubmenuLeave}
                    style={nestedMenuStyles}
                    ref={(el) => (this.dropdown = el)}
                >
                    {children}
                </ul>
            </Button>
        ) : (
            <li
                className={classes.dropdown}
                id={id}
                style={noToggleElement ? { listStyle: 'none' } : {}}
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <a
                    ref={(el) => (this.dropdownButton = el)}
                    className={classes.toggle}
                    data-toggle="dropdown"
                    role="button"
                    aria-haspopup="true"
                    onMouseEnter={openOnHover ? this.onMouseEnter : undefined}
                    onMouseLeave={openOnHover ? this.onMouseLeave : undefined}
                    onClick={() => {
                        this.toggle();
                        if (!disabled && onClick) {
                            onClick();
                        }
                    }}
                    aria-expanded={toggled}
                    style={noToggleElement ? { display: 'none', ...style } : style}
                    title={hint}
                    href="/#"
                >
                    <span className={checkedClass} />
                    <span className={classes.title}>{title}</span>
                    <span className={classes.caret} />
                </a>
                <ul
                    className={classes.nestedMenu}
                    onMouseEnter={this.onSubmenuEnter}
                    onMouseLeave={this.onSubmenuLeave}
                    style={nestedMenuStyles}
                    ref={(el) => (this.dropdown = el)}
                >
                    {children}
                </ul>
            </li>
        );
    }

    private onSubmenuEnter(e: any) {
        this.willPreventClose = true;
        if (this.props.openOnHover) {
            this.pendingClose = false;
        }
    }

    private onSubmenuLeave(e: any) {
        this.willPreventClose = false;
        if (this.props.openOnHover) {
            this.pendingClose = true;
            e.persist();
            setTimeout(() => {
                if (this.pendingClose) {
                    this.onMouseLeave(e);
                }
            }, 0);
        }
    }

    private onMouseEnter() {
        if (!this.props.disabled) {
            this.setState({ toggled: true }, () => this.notify(this.notifyID, true));
            this.pendingClose = false;
        }
    }

    private onMouseLeave(e: any) {
        const { disabled, onClose } = this.props;
        // Firefox sometimes fires mouseleave event when it shouldn't
        const rect = this.dropdownButton.parentElement.getBoundingClientRect();
        if (
            e.clientX > Math.floor(rect.left) &&
            e.clientX < Math.floor(rect.right) &&
            e.clientY > Math.floor(rect.top) &&
            e.clientY < Math.floor(rect.bottom)
        ) {
            return;
        }

        // Wait to close the submenu in case we are mousing over from the submenu to the dropdown button
        if (!disabled) {
            setTimeout(() => {
                if (!this.willPreventClose) {
                    this.setState({ toggled: false }, () => this.notify(this.notifyID, false));
                    if (onClose) {
                        onClose();
                    }
                }
            }, 0);
        }
    }

    private toggle(toggled: boolean = !this.state.toggled, force?: boolean) {
        const { disabled, openOnHover, onClose, onForceClose } = this.props;
        if (disabled || (openOnHover && !force)) {
            return;
        }

        this.setState({ toggled }, () => this.notify(this.notifyID, toggled));

        if (toggled) {
            window.addEventListener('mouseup', this.handleClose);
        } else {
            window.removeEventListener('mouseup', this.handleClose);
            this.setState({ boundMenu: false }, () => {
                if (onClose) {
                    onClose();
                }
                if (onForceClose && force) {
                    onForceClose();
                }
            });
        }
    }

    private handleClose(e: MouseEvent) {
        const { openOnHover } = this.props;

        // Don't handle the close if clicking on the button since it is already handled in the click listener
        if (
            !openOnHover &&
            this.dropdownButton &&
            (this.dropdownButton === e.target || this.dropdownButton.contains(e.target))
        ) {
            return;
        }

        // Don't handle the close if clicking on any part of the dropdown menu
        if (this.dropdown && (this.dropdown === e.target || this.dropdown.contains(e.target as any))) {
            return;
        }

        if (this.willPreventClose) {
            this.willPreventClose = false;
            setTimeout(() => (this.willPreventClose = true), 0);
        } else {
            this.toggle(false);
        }
    }

    private notify(id: string, toggle: boolean) {
        const bb = this.dropdown!.getBoundingClientRect();
        DROPDOWN_LISTENERS.forEach((listener) =>
            listener(id, toggle, this.dropdown!.clientHeight, this.dropdown!.clientWidth, bb.left, bb.top, '998')
        );
    }
}

DropdownMenu.Divider = Divider;
DropdownMenu.MenuHeader = MenuHeader;
DropdownMenu.MenuItem = MenuItem;
DropdownMenu.Submenu = Submenu;

export default DropdownMenu as typeof DropdownMenu & {
    Divider: typeof Divider;
    MenuHeader: typeof MenuHeader;
    MenuItem: typeof MenuItem;
    Submenu: typeof Submenu;
};
