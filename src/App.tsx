import React from 'react';
import logo from './logo.svg';
import './App.css';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';

function App() {
    return (
        <div className="App">
            <ErrorBoundary>
                <header className="App-header">COVID SHARE</header>
            </ErrorBoundary>
        </div>
    );
}

export default App;
