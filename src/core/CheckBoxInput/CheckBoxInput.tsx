import './CheckBoxInput.css';

import * as React from 'react';
import classnames from 'classnames';
import autobind from 'autobind-decorator';

import { RenderableContent, renderContent } from '../../util';

export interface CheckBoxInputProps {
    // Whether or not the checkbox is checked
    checked: boolean;
    // Callback for when checkbox is toggled
    onChange: (checked: boolean) => void;
    // Optional label to put next to checkbox
    label?: RenderableContent;
    // Hover title
    title?: string;
    // Disable the checkbox
    disabled?: boolean;
    // Custom classname
    className?: string;
    // Custom style
    style?: React.CSSProperties;
    // Custom id
    id?: string;
}

@autobind
export default class CheckBoxInput extends React.Component<CheckBoxInputProps, {}> {
    public static defaultProps = {
        className: '',
        indeterminate: false,
    };

    public render() {
        const { checked, label, title, disabled, className, id, style } = this.props;
        const checkboxClassName = classnames([className, 'checkbox', 'checkbox-inline']);

        return (
            <div className={checkboxClassName} style={style}>
                <label title={title}>
                    <input
                        id={id ? `${id}-checkbox` : undefined}
                        type="checkbox"
                        className="checkbox"
                        checked={checked}
                        onChange={this.handleChange}
                        disabled={disabled}
                    />

                    {/* Placeholder span used for rendering custom checkbox styling */}
                    <span id={id ? `${id}-toggle` : undefined} />

                    {label && typeof label === 'string' ? (
                        <span id={id ? `${id}-label` : undefined} className="noselect">
                            {label}
                        </span>
                    ) : (
                        renderContent(label)
                    )}
                </label>
            </div>
        );
    }

    private handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        this.props.onChange(e.target.checked);
    }
}
