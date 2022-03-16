import './ResizableContainer.css';

import * as React from 'react';

import ResizablePane from './ResizablePane/ResizablePane';
import ResizeListeners from './ResizeEvents';
import Resizer from './Resizer/Resizer';
import { pauseEvent } from '../../util/function';

export interface ResizableContainerProps {
    // ID of this container
    id: string;
    // Width of container (can be px or %)
    width: string;
    // Height of container (can be px or %)
    height: string;
    // Min width any component can be resized to (in pixels)
    minWidth?: number;
    // Min height any component can be resized to (in pixels)
    minHeight?: number;
    // Max width any component can be resized to (in pixels)
    maxWidth?: number;
    // Max height any component can be resized to (in pixels)
    maxHeight?: number;
    // Width or height of the resizing handle (in pixels)
    handleSize?: number;
    // Color of the resizing handle
    handleColor?: string;
    // Custom style for the resizing handle
    handleStyles?: any;
    // Alignment of the panes
    alignment: 'vertical' | 'horizontal';
    // Called on each resize
    onResize?: (sizes: Size[]) => void;
    // Called when a resize starts (mouse starts dragging)
    onResizeStart?: (sizes: Size[]) => void;
    // Called when resize stops (mouse stops dragging)
    onResizeStop?: (sizes: Size[]) => void;
    // Which panes are visible
    hiddenPanes?: boolean[];
    // If this container needs to update its size when other resize containers are resized, this pane must know the
    // IDs of the panes it is dependent upon
    connectedTo?: string[];
    style?: React.CSSProperties;
}

export interface ResizeableContainerState {
    sizes: Size[];
}

export interface Size {
    width: string;
    height: string;
}

interface Origin {
    x: number;
    y: number;
}

const noop = () => {};

export default class ResizableContainer extends React.Component<ResizableContainerProps, ResizeableContainerState> {
    public static defaultProps: Partial<ResizableContainerProps> = {
        handleColor: 'black',
        handleSize: 1,
        minWidth: 0,
        minHeight: 0,
        onResize: noop,
        onResizeStart: noop,
        onResizeStop: noop,
        connectedTo: [],
        hiddenPanes: [],
    };

    private container: HTMLElement | null = null;
    private mouseMoveListener: any;
    private mouseUpListener: any;
    private fireResizeEvent: any;
    private fireResizeEventInv: any;

    /**
     * Prevents children components from rendering
     * We do not render children on first render - our size is not initialize on component mount
     */
    private preventChildRender: boolean;

    constructor(props: ResizableContainerProps) {
        super(props);

        /**
         * Default is to fire the event for the left/top pane
         * If the child is in the right/bottom, use the inverse event
         */
        this.fireResizeEvent = ResizeListeners.register(props.id, this);
        this.fireResizeEventInv = ResizeListeners.register(props.id + '-inv', this);

        const numChildren = this.props.children ? (this.props.children as any).length : 0;
        this.state = {
            sizes: Array.from(Array(numChildren), () => ({ width: '0', height: '0' })),
        };

        this.preventChildRender = true;
    }

    public componentDidMount() {
        // If this pane is dependent upon other resizable containers to determine its width,
        // subscribe to those containers' resize events
        this.props.connectedTo!.map((id) => ResizeListeners.subscribe(id, this.resize, this));
        const computedStyle = this.container ? getComputedStyle(this.container) : null;
        const width = parseFloat(computedStyle && computedStyle.width !== null ? computedStyle.width : '0');
        const height = parseFloat(computedStyle && computedStyle.height !== null ? computedStyle.height : '0');
        this.initializeSize(width, height);

        // Child components now have dimensions to work with
        this.preventChildRender = false;
    }

    public componentWillUnmount() {
        this.stopResize();
    }

    public componentDidUpdate() {
        this.fireResizeCallback(this.state.sizes);
    }

    public componentWillReceiveProps() {}

    public resetSizes() {
        const computedStyle = this.container ? getComputedStyle(this.container) : null;
        const width = parseFloat(computedStyle && computedStyle.width !== null ? computedStyle.width : '0');
        const height = parseFloat(computedStyle && computedStyle.height !== null ? computedStyle.height : '0');
        this.initializeSize(width, height);
    }

    /**
     * Sets the initial size of the panes after this component has been mounted
     * @param width Container width
     * @param height Container height
     */
    private initializeSize(width: number, height: number, props: ResizableContainerProps = this.props) {
        const presetSizes = React.Children.map(
            this.props.children as React.ReactElement[],
            this.getUserDefinedSize.bind(this, props)
        ) as number[];

        this.updateSize(width, height, presetSizes, props.hiddenPanes);
    }

    private resize(width: number, height: number) {
        if (!this.container) {
            return;
        }

        const colSizes = this.state.sizes.map((size, i, arr) => {
            if (i === this.getVisibleChildren().length - 1) {
                return 0;
            }
            if (this.isVertical()) {
                return this.getPixelSize(size.height, height);
            }
            return this.getPixelSize(size.width, width);
        });

        this.updateSize(width, height, colSizes, this.props.hiddenPanes);
    }

    private updateSize(width: number, height: number, colSizes: number[], hiddenPanes?: boolean[]) {
        hiddenPanes = hiddenPanes || this.props.hiddenPanes;
        const totalResizerSize =
            (this.getVisibleChildren(this.props.children, hiddenPanes).length - 1) * this.props.handleSize!;
        const totalSize = (this.isVertical() ? height : width) - totalResizerSize;
        const remainingSize = colSizes.reduce((acc, size) => acc - size, totalSize);
        const numZeroSizes = colSizes.filter((size, i) => size < 1 && (!hiddenPanes || !hiddenPanes[i])).length;
        const defaultSize = remainingSize / numZeroSizes;
        const sizes = colSizes
            .map((size, i) => (size < 1 && (!hiddenPanes || !hiddenPanes[i]) ? defaultSize : size))
            .map((size) => size + 'px')
            .map((size) => (this.isVertical() ? { width: '100%', height: size } : { width: size, height: '100%' }));

        this.setState({ sizes } as ResizeableContainerState);
        this.fireResizeCallback(sizes);
    }

    /**
     * If the user defined a size for the passed in pane, get pixel value of that size
     */
    private getUserDefinedSize(props, child: React.ReactElement<any>, childIndex: number) {
        const numVisible = this.getVisibleChildren(props.children, props.hiddenPanes).length;
        if (childIndex !== numVisible - 1) {
            // The last child element always takes up all the available room
            if (this.isVertical() && child.props.height) {
                return this.getPixelSize(child.props.height, this.container ? this.container.clientHeight : 0);
            } else if (child.props.width) {
                return this.getPixelSize(child.props.width, this.container ? this.container.clientWidth : 0);
            }
        }
        return 0;
    }

    private startResize(pane1Index: number, e: React.MouseEvent<HTMLDivElement>) {
        const origin = { x: e.pageX, y: e.pageY };

        this.stopResize();

        // Compute the current sizes of pane1 and pane2
        const container = this.container || { clientWidth: 0, clientHeight: 0 };
        const pane1Width = this.getPixelSize(this.state.sizes[pane1Index].width, container.clientWidth);
        const pane1Height = this.getPixelSize(this.state.sizes[pane1Index].height, container.clientHeight);
        const pane2Width = this.getPixelSize(this.state.sizes[pane1Index + 1].width, container.clientWidth);
        const pane2Height = this.getPixelSize(this.state.sizes[pane1Index + 1].height, container.clientHeight);

        this.mouseMoveListener = this.isVertical()
            ? this.onMouseMoveVertical.bind(this, pane1Index, origin, pane1Height, pane2Height)
            : this.onMouseMoveHorizontal.bind(this, pane1Index, origin, pane1Width, pane2Width);
        this.mouseUpListener = this.stopResize.bind(this);

        document.addEventListener('mousemove', this.mouseMoveListener);
        document.addEventListener('mouseup', this.mouseUpListener);
        window.addEventListener('blur', this.mouseUpListener);

        this.props.onResizeStart!([...this.state.sizes]);

        // Prevent the cursor dragging from highlighting text
        pauseEvent(e);
    }

    private onMouseMoveVertical(
        pane1Index: number,
        origin: Origin,
        pane1Size: number,
        pane2Size: number,
        e: MouseEvent
    ) {
        const deltaY = e.pageY - origin.y;
        this.updateHeight(pane1Index, pane1Size + deltaY, pane1Size + pane2Size + this.props.handleSize!);
    }

    private onMouseMoveHorizontal(
        pane1Index: number,
        origin: Origin,
        pane1Size: number,
        pane2Size: number,
        e: MouseEvent
    ) {
        const deltaX = e.pageX - origin.x;
        this.updateWidth(pane1Index, pane1Size + deltaX, pane1Size + pane2Size + this.props.handleSize!);
    }

    private updateWidth(pane1Index: number, requestedPaneWidth: number, totalWidth: number) {
        const maxWidth = (this.props.maxWidth || totalWidth) - this.props.minWidth!;
        const pane1Width = Math.max(
            Math.min(requestedPaneWidth, maxWidth - this.props.handleSize!),
            this.props.minHeight!
        );
        const pane2Width = totalWidth - this.props.handleSize! - pane1Width;

        const sizes = [...this.state.sizes];
        sizes[pane1Index].width = pane1Width + 'px';
        sizes[pane1Index + 1].width = pane2Width + 'px';

        this.setState({ sizes } as ResizeableContainerState);
    }

    private updateHeight(pane1Index: number, requestedPaneHeight: number, totalHeight: number) {
        const maxHeight = (this.props.maxHeight || totalHeight) - this.props.minHeight!;
        const pane1Height = Math.max(
            Math.min(requestedPaneHeight, maxHeight - this.props.handleSize!),
            this.props.minHeight!
        );
        const pane2Height = totalHeight - this.props.handleSize! - pane1Height;

        const sizes = [...this.state.sizes];
        sizes[pane1Index].height = pane1Height + 'px';
        sizes[pane1Index + 1].height = pane2Height + 'px';

        this.setState({ sizes } as ResizeableContainerState);
    }

    private stopResize() {
        if (this.mouseMoveListener) {
            document.removeEventListener('mousemove', this.mouseMoveListener);
            document.removeEventListener('mouseup', this.mouseUpListener);
            window.removeEventListener('blur', this.mouseUpListener);
            this.mouseMoveListener = null;
            this.mouseUpListener = null;
            this.props.onResizeStop!([...this.state.sizes]);
        }
    }

    private panesHaveChanged(nextProps: ResizableContainerProps) {
        const hiddenPanes = this.props.hiddenPanes || [];
        return nextProps.hiddenPanes && nextProps.hiddenPanes.some((hidden, i) => hidden !== hiddenPanes[i]);
    }

    private fireResizeCallback(newSizes: any) {
        const container = this.container || { clientWidth: 0, clientHeight: 0 };
        const sizes = newSizes.map((size) => ({
            width: this.getPixelSize(size.width, container.clientWidth),
            height: this.getPixelSize(size.height, container.clientHeight),
        }));
        this.fireResizeEvent(sizes[0].width, sizes[0].height);
        this.fireResizeEventInv(sizes[1].width - this.props.handleSize!, sizes[1].height);
        this.props.onResize!(sizes);
    }

    /**
     * Inserts a resizer after a pane in a pane array (but not after last pane)
     * This method is intended to be used as a callback when performing reduce on the child panes
     * @param acc Array of all current child components
     * @param pane Resisable pane component
     * @param i Index of pane
     * @returns New array of child components composed of both resizers and panes
     */
    private insertResizer(acc: JSX.Element[], pane: JSX.Element, i: number) {
        return i === this.getVisibleChildren().length - 1 ? acc.concat(pane) : acc.concat(pane, this.createResizer(i));
    }

    /**
     * Creates a resizable pane from child component
     * @param child The child component
     * @param childIndex Index of the child component
     * @returns
     */
    private createPane(child: React.ReactElement<any>, childIndex: number) {
        const width = this.state.sizes[childIndex].width;
        const height = this.state.sizes[childIndex].height;
        const key = 'child' + childIndex;
        const props = { key, width, height };

        return <ResizablePane {...props}>{child}</ResizablePane>;
    }

    /**
     * Creates a resizer handle at the specified index
     * @param paneIndex The index of the resiavle pane ton the left/top of this resizer
     */
    private createResizer(paneIndex: number) {
        const handleSize = this.isVertical()
            ? { height: this.props.handleSize! + 10 }
            : { width: this.props.handleSize! + 10 };
        return (
            <Resizer
                key={'resizer' + paneIndex}
                style={{ ...handleSize, ...this.props.handleStyles }}
                alignment={this.props.alignment}
                onMouseDown={this.startResize.bind(this, paneIndex)}
            />
        );
    }

    /**
     * Compute the pixel size from a size string.  If the size is a percent, this will
     * compute the corresponding pixel value based on available width/height
     * @param size The size (i.e. '100%' or '500px')
     * @param maxSize Upper bound on size
     * @returns The pixel value that corresponds to size string
     */
    private getPixelSize(size: string, maxSize: number) {
        if (this.endsWith(size, '%')) {
            const numChildren = this.getVisibleChildren().length;
            const availableSize = maxSize - (numChildren - 1) * this.props.handleSize!;
            return Math.min(maxSize, (availableSize * parseInt(size.substring(0, size.length - 1), 10)) / 100);
        }
        if (this.endsWith(size, 'px')) {
            return Math.min(maxSize, parseInt(size.substring(0, size.length - 2), 10));
        }
        return parseInt(size, 10);
    }

    /**
     * Utility functin to check if a string ends with a certain value
     */
    private endsWith(str: string, suffix: string) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    /**
     * Returns a list of all child components that are visible
     */
    private getVisibleChildren(children: React.ReactNode = this.props.children, hiddenPanes?: boolean[]) {
        hiddenPanes = hiddenPanes || this.props.hiddenPanes;
        return React.Children.toArray(children).filter((child, i) => !hiddenPanes || !hiddenPanes[i]);
    }

    /**
     * Returns true if the alignment for this container is in y direction
     */
    private isVertical() {
        return this.props.alignment === 'vertical';
    }
}
