import './Toast.css';

import * as React from 'react';
import classnames from 'classnames';

import { Omit } from '../../util';
import autobind from 'autobind-decorator';

export interface ToastProps
    extends Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'ref'> {
    onFadeOut: () => void;
    displayTime?: number;
    type?: 'error' | 'success';
}

export interface ToastState {
    mounted: boolean;
    unmounting: boolean;
}

const noop = () => {};

@autobind
export class Toast extends React.Component<ToastProps, ToastState> {
    public static defaultProps = {
        displayTime: 5000,
    };

    private timeoutID: number;

    constructor(props: ToastProps) {
        super(props);
        this.state = {
            mounted: false,
            unmounting: false,
        };
    }

    public componentDidMount(): void {
        this.timeoutID = window.setTimeout(() => {
            this.setState({ mounted: true } as ToastState);
        }, 10);
    }

    public componentDidUpdate(): void {
        if (this.state.mounted) {
            this.timeoutID = window.setTimeout(this.close, this.props.displayTime);
        }
    }

    public componentWillUnmount(): void {
        window.clearTimeout(this.timeoutID);
    }

    public render() {
        const { className, onFadeOut, children, type, displayTime, ...divProps } = this.props;
        const { mounted, unmounting } = this.state;

        return (
            <div
                className={classnames(
                    'toast',
                    className,
                    type && `toast--${type}`,
                    mounted && !unmounting && 'toast--open'
                )}
                onTransitionEnd={unmounting ? onFadeOut : noop}
                {...divProps}
            >
                <div className="toast__body">
                    <span className="close toast__close" onClick={this.close}>
                        &times;
                    </span>
                    {children}
                </div>
            </div>
        );
    }

    private close() {
        if (this.state.mounted) {
            this.setState({ unmounting: true, mounted: false });
        }
    }
}

export default Toast;
