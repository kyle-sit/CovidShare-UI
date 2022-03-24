import * as React from 'react';

interface Props {}

interface State {
    hasError: boolean;
    error: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: { name: 'None', message: 'No Error' } };
    }

    public static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    public componentDidCatch(error, errorInfo) {
        console.log('Error caught', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div>
                    <h1>An Error Has Occured</h1>
                    <textarea
                        style={{ color: 'black', width: 500, height: 500 }}
                        value={`------ NAME ------
                    ${this.state.error.name}
                    ------ MESSAGE ------
                    ${this.state.error.message}
                    ------ STACK ------
                    ${this.state.error.stack}`}
                    />
                </div>
            );
        }

        return this.props.children;
    }
}
