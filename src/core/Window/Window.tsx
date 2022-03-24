import './Window.css';

import * as React from 'react';

import { RenderableContent } from '../../util/react';
import { Portal, Button, IconButton } from '..';
import { Rnd } from 'react-rnd';

interface WindowProps {
    // ID of the window container element
    id?: string;
    // Title of the window
    title?: RenderableContent;
    // Should window be centered in page, will remain centered until manually dragged by user
    center?: boolean;
    // Should window be modal (prevents interaction with app while window is open)
    modal?: boolean;
    // Should window be resizable by user
    resizable?: boolean;
    // Should window be draggable my user
    draggable?: boolean;
    // Where window should appear in screen space
    defaultPosition?: { x: number; y: number };
    // Initial width of window until resized
    defaultWidth?: number | string;
    // Initial height of window until resized
    defaultHeight?: number | string;
    // Minimum width of window
    minWidth?: number | string;
    // Minimum height of window
    minHeight?: number | string;
    // Should window have transparent background
    transparent?: boolean;
    // Should a close icon appear in window header
    showCloseIcon?: boolean;
    // Callback for when close icon is clicked
    onClose?: () => void;
    // Content that should appear in the footer, anchored on the right side
    footerContent?: FooterButton[] | RenderableContent;
    // Callback for when the window is dragged
    onDrag?: (pos: { x: number; y: number }) => void;
    // Callback for when the window is resized
    onResize?: (size: { width: number; height: number }) => void;
    // Ref to the window container
    forwardRef?: (el: HTMLElement | null) => void;
}

// Prevents the user from resizing the window to a point thats too small
const RESIZE_BUFFER = 20;

const Window: React.FC<WindowProps> = (props) => {
    const rndRef = React.useRef<Rnd>();
    const manuallyPositioned = React.useRef<boolean>(false);
    const [draggable, setDraggable] = React.useState(false);
    const [headerDimensions, setHeaderDimensions] = useDimensions();
    const [footerDimensions, setFooterDimensions] = useDimensions();
    const headerVisible = !!props.title || props.showCloseIcon;

    // Centers window when 'center' prop is specified and the user hasn't manually positioned the window
    React.useLayoutEffect(() => {
        if (props.center && !manuallyPositioned.current) {
            const midpoint = [window.innerWidth / 2, window.innerHeight / 2];
            const dimensions = rndRef.current.getSelfElement().getBoundingClientRect();
            const x = midpoint[0] - dimensions.width / 2;
            const y = midpoint[1] - dimensions.height / 2;
            rndRef.current.updatePosition({ x: x < 0 ? 0 : x, y: y < 0 ? 0 : y });
        }
    });
    // Ensures the window remains within the bounds of the screen
    React.useLayoutEffect(() => {
        const dimensions = rndRef.current.getSelfElement().getBoundingClientRect();
        const { width, height, x, y } = constrainDimensions(dimensions);
        if (Number.isFinite(width) || Number.isFinite(height)) {
            rndRef.current.updateSize({ width, height });
        }
        if (Number.isFinite(x) || Number.isFinite(y)) {
            rndRef.current.updatePosition({
                x: Number.isFinite(x) ? x : dimensions.left,
                y: Number.isFinite(y) ? y : dimensions.top,
            });
        }
    });

    return (
        <Portal>
            <div className="window-boundary" />
            <Modal active={props.modal}>
                <Rnd
                    ref={(ref) => {
                        rndRef.current = ref;
                        props.forwardRef(ref ? ref.getSelfElement() : null);
                    }}
                    className={'window-container'}
                    default={{
                        x: props.defaultPosition.x < 0 ? 0 : props.defaultPosition.x,
                        y: props.defaultPosition.y < 0 ? 0 : props.defaultPosition.y,
                        width: constrainWidth(props.defaultWidth),
                        height: constrainHeight(props.defaultHeight),
                    }}
                    disableDragging={(!headerVisible && !props.draggable) || (headerVisible && !draggable)}
                    bounds=".window-boundary"
                    minHeight={props.minHeight || headerDimensions.height + footerDimensions.height + RESIZE_BUFFER}
                    minWidth={props.minWidth || footerDimensions.width + RESIZE_BUFFER}
                    onDragStart={() => {
                        manuallyPositioned.current = true;
                    }}
                    onResizeStart={() => {
                        manuallyPositioned.current = true;
                    }}
                    onDrag={(e, data) => {
                        props.onDrag({ x: data.x, y: data.y });
                    }}
                    onResize={(e, dir, ref) => {
                        props.onResize({ width: ref.clientWidth, height: ref.clientHeight });
                    }}
                >
                    <WindowHeader
                        visible={headerVisible}
                        title={props.title}
                        showClose={props.showCloseIcon}
                        onClose={props.onClose}
                        forwardRef={setHeaderDimensions}
                        setDraggable={setDraggable}
                    />
                    <div
                        className="window-content"
                        style={{
                            height: `calc(100% - ${headerDimensions.height}px - ${footerDimensions.height}px)`,
                            maxHeight: `calc(${window.innerHeight}px - ${headerDimensions.height}px - ${footerDimensions.height}px)`,
                        }}
                    >
                        {props.children}
                    </div>
                    <WindowFooter content={props.footerContent} forwardRef={setFooterDimensions} />
                </Rnd>
            </Modal>
        </Portal>
    );
};

Window.defaultProps = {
    defaultPosition: { x: 0, y: 0 },
    onClose: () => {},
    onDrag: () => {},
    onResize: () => {},
    forwardRef: () => {},
};

interface ModalProps {
    active: boolean;
}
const Modal: React.FC<ModalProps> = (props) =>
    props.active ? <div className="window-modal">{props.children}</div> : <>{props.children}</>;

interface WindowHeaderProps {
    visible: boolean;
    title?: RenderableContent;
    showClose?: boolean;
    onClose?: () => void;
    closeClass?: string;
    setDraggable: (draggable: boolean) => void;
    forwardRef: (element: HTMLElement) => void;
}
const WindowHeader: React.FC<WindowHeaderProps> = (props) => {
    if (!props.visible) {
        return null;
    }

    return (
        <div
            className="window-header"
            ref={props.forwardRef}
            onMouseEnter={() => props.setDraggable(true)}
            onMouseLeave={() => props.setDraggable(false)}
        >
            <div className="window-header--left">{props.title}</div>
            <div className="window-header--right">
                {props.showClose && (
                    <IconButton onClick={props.onClose} iconClass={`${props.closeClass} icon-close`} title="Close" />
                )}
            </div>
        </div>
    );
};

interface FooterButton {
    id?: string;
    text: string;
    onClick: () => void;
}
interface WindowFooterProps {
    content: FooterButton[] | RenderableContent;
    forwardRef: (element: HTMLElement) => void;
}
const WindowFooter: React.FC<WindowFooterProps> = (props) => {
    return (
        !!props.content && (
            <div className="window-footer">
                <div className="window-footer--placeholder">
                    {/* forces buttons to be on the right side with flex aligment in css */}
                </div>
                <div className="window-footer--inner" ref={props.forwardRef}>
                    {renderFooterContent(props.content)}
                </div>
            </div>
        )
    );
};

function renderFooterContent(content: FooterButton[] | RenderableContent) {
    if (Array.isArray(content) && content.every(isFooterButton)) {
        return content.map((fb) => (
            <Button key={fb.text} id={fb.id} onClick={fb.onClick}>
                {fb.text}
            </Button>
        ));
    } else {
        return content;
    }
}

function isFooterButton(obj: any): obj is FooterButton {
    return obj.text && obj.onClick;
}

function useDimensions(): [DOMRect, (element: HTMLElement) => void] {
    const [dimensions, setDimensions] = React.useState({
        bottom: 0,
        top: 0,
        left: 0,
        right: 0,
        width: 0,
        height: 0,
    } as DOMRect);

    const measureDimensions = React.useCallback((element: HTMLElement) => {
        if (element !== null) {
            setDimensions(element.getBoundingClientRect());
        }
    }, []);

    return [dimensions, measureDimensions];
}

function constrainDimensions(dimensions: DOMRect) {
    const constrained = {
        width: undefined,
        height: undefined,
        x: undefined,
        y: undefined,
    };
    constrained.width = constrainWidth(dimensions.width);
    constrained.height = constrainHeight(dimensions.height);

    if (dimensions.left < 0 || dimensions.right > window.innerWidth) {
        constrained.x = 0;
    }
    if (dimensions.top < 0 || dimensions.bottom > window.innerHeight) {
        constrained.y = 0;
    }
    return constrained;
}

function constrainWidth(width: number | string) {
    return width > window.innerWidth ? window.innerWidth : width;
}

function constrainHeight(height: number | string) {
    return height > window.innerHeight ? window.innerHeight : height;
}

export default Window;
