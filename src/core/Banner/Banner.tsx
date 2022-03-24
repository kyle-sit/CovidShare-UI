import './Banner.css';
import * as React from 'react';

interface Props {
    title: string;
    message: string;
    color: string;
    gradient?: boolean;
    secondColor?: string;
}

export const Banner: React.FC<Props> = ({ title, message, color, gradient, secondColor }) => {
    const bannerColor = gradient
        ? {
              backgroundImage: `linear-gradient(to right, ${color}, ${secondColor})`,
          }
        : {
              backgroundColor: `${color}`,
          };

    return (
        <div className="banner" style={bannerColor}>
            <h1>{title.toUpperCase()}</h1>
            <p>{message}</p>
        </div>
    );
};
