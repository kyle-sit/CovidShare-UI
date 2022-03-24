import './IconButton.css';

import * as React from 'react';
import classnames from 'classnames';

export interface IconButtonProps {
    id?: string;
    iconSrc?: string;
    iconClass?: string;
    title?: string;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    width?: string;
    height?: string;
    toggled?: boolean;
    disabled?: boolean;
    disabledTitle?: string;
}

export const IconButton: React.FC<IconButtonProps> = (props) => {
    const classNames = classnames(
        'icon-button__icon',
        props.disabled && 'icon-button__icon_disabled',
        props.toggled && 'icon-button__toggled'
    );

    const size = {
        width: props.width || '20px',
        height: props.height || '20px',
    };

    const commonProps = {
        onClick: props.disabled ? () => {} : props.onClick,
        title: props.disabled && props.disabledTitle ? props.disabledTitle : props.title,
    };

    return (
        <div id={props.id || undefined} className="icon-button" style={props.iconClass ? {} : size}>
            {props.iconSrc ? (
                <img className={`${classNames}`} style={size} src={props.iconSrc} {...commonProps} />
            ) : (
                <span className={`${classNames} ${props.iconClass}`} {...commonProps} />
            )}
        </div>
    );
};
