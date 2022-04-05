import * as React from 'react';

import { isIE } from '../../util';

export interface LoaderProps {
    className?: string;
    style?: React.CSSProperties;
    id?: string;
    size?: 'sm' | 'md' | 'lg';
    useSvg?: boolean;
}

const sizes = {
    sm: '14px',
    md: '28px',
    lg: '48px',
};

export interface SvgLoaderProps {
    size: string;
    className?: string;
    style?: React.CSSProperties;
    id?: string;
}

const SvgLoader: React.FC<SvgLoaderProps> = ({ size, className, style, id }) => {
    return (
        <svg
            width={size}
            height={size}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid"
            className={`uil-ring-alt ${className}`}
            style={style}
            id={id}
        >
            <rect x="0" y="0" width="100" height="100" fill="none" className="bk" />
            <circle
                cx="50"
                cy="50"
                r="40"
                stroke="rgba(100%, 100%, 100%, 0)"
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
            />
            <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#b5b5ff"
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                transform="matrix(-1 0 0 1 100 0)"
            >
                <animate attributeName="stroke-dashoffset" dur="2s" repeatCount="indefinite" from="0" to="502" />
                <animate
                    attributeName="stroke-dasharray"
                    dur="2s"
                    repeatCount="indefinite"
                    values="150.6 100.4;1 250;150.6 100.4"
                />
            </circle>
        </svg>
    );
};

const Loader: React.FC<LoaderProps> = ({ id, className, size, style, useSvg }) => {
    const width = sizes[size];
    const styleWithSize = { width, ...style };
    if (useSvg) {
        return <SvgLoader id={id} className={className} size={width} style={styleWithSize} />;
    }
    return <img id={id} className={className} style={styleWithSize} src="images/loader.gif" alt="" />;
};

Loader.displayName = 'Loader';
Loader.defaultProps = {
    size: 'lg',
    useSvg: !isIE(),
};

export default Loader;
