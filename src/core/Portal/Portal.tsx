import * as React from 'react';
import * as ReactDom from 'react-dom';

export interface PortalProps {
    portalId?: string;
}

export const PORTAL_ID = 'portalContainer';

/**
 * Utility class used to render components directly onto the document body
 */
export default class Portal extends React.Component<PortalProps, {}> {
    public static defaultProps = {
        portalId: PORTAL_ID,
    };

    private container: HTMLElement | null;

    constructor(props: PortalProps) {
        super(props);

        this.container = document.getElementById(props.portalId);

        if (!this.container) {
            console.warn(`No element with an id of "${props.portalId}" found.`);
            this.container = document.createElement('div');
        }
    }

    public render() {
        return ReactDom.createPortal(this.props.children, this.container);
    }
}

/**
 * Simple component using the deafult PORTAL_ID for rendering portals into.
 * Should be placed near root of your application
 */
export const PortalContainer = () => <div id={PORTAL_ID} />;
