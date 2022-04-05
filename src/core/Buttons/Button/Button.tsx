import * as React from 'react';
import classnames from 'classnames';

interface Props {
    /** callbacks for button events */
    onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => void;
    onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => void;
    onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => void;
    /** css classname */
    className?: string;
    /** css styles to be applied */
    style?: React.CSSProperties;
    /** whether or not button is disabled */
    disabled?: boolean;
    /** title to display on hover */
    title?: string;
    /** html id */
    id?: string;
    /** Uses a div element instead of button (some browsers are picky about what elements can 
        be children of a buttons) */
    useDiv?: boolean;
    /** ref to the button element */
    callbackRef?: (el: HTMLButtonElement | HTMLDivElement) => void;
}

export const Button: React.FC<Props> = (
    { className, useDiv, children, disabled, callbackRef, ...remainingProps },
    forwardedRef
) => {
    const classes = classnames(className, disabled && 'disabled');

    const allProps = {
        className: classes,
        disabled,
        ref: callbackRef || (forwardedRef as any),
        ...remainingProps,
    };

    const button = useDiv ? <div {...allProps}>{children}</div> : <button {...allProps}>{children}</button>;
    return button;
};
