import * as React from 'react';
import classNames from 'classnames';

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
    buttonRef?: React.MutableRefObject<HTMLButtonElement>;
    divRef?: React.MutableRefObject<HTMLDivElement>;
    /** children to render in button */
    children?: React.ReactNode;
}

export const Button: React.FC<Props> = ({
    className,
    useDiv,
    children,
    disabled,
    buttonRef,
    divRef,
    ...remainingProps
}) => {
    const classes = classNames(className, disabled && 'disabled');

    const allProps = {
        className: classes,
        disabled,
        ...remainingProps,
    };

    const button = useDiv ? (
        <div ref={divRef} {...allProps}>
            {children}
        </div>
    ) : (
        <button ref={buttonRef} {...allProps}>
            {children}
        </button>
    );
    return button;
};
