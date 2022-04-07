import './NavBar.scss';

import * as React from 'react';

interface Props {
    title: string;
    slogan: string;
    logoPath: string;
}

export const NavBar: React.FC<Props> = (props) => {
    return (
        <nav className="navbar navbar-expand-lg navbar-light">
            <div className="container-fluid">
                <div className="navbar-brand">
                    {props.title}
                    <img src={props.logoPath} alt="" width="40" height="40" style={{ marginLeft: '5px' }} />
                </div>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <div className="nav-link active" aria-current="page">
                                Home
                            </div>
                        </li>
                        <li className="nav-item">
                            <div className="nav-link">Profile</div>
                        </li>
                    </ul>
                    <span className="navbar-text">{props.slogan}</span>
                </div>
            </div>
        </nav>
    );
};
