import * as React from 'react';

export interface ButtonGroupProps {
    // How the buttons are aligned within the container
    btnAlignment?: 'left' | 'right' | 'center';
    // Padding around the buttons
    padding?: string;
    // Whether this is a vertical button group
    vertical?: boolean;
    // Whether to use the 100% width for this group
    fullWidth?: boolean;
}

const ButtonGroup: React.FC<ButtonGroupProps> = (props) => {
    const align = props.btnAlignment || 'center';
    const style: React.CSSProperties = { padding: props.padding || '8px 0' };
    if (props.fullWidth) {
        style.width = '100%';
    }

    // This is a wrapper component that should contain button components
    return (
        <div className={`text-${align}`}>
            <div className={props.vertical ? 'btn-group-vertical' : 'btn-group'} style={style}>
                {props.children}
            </div>
        </div>
    );
};

ButtonGroup.defaultProps = {};
ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup;
