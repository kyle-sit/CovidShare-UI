import React from 'react';
import './App.css';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { Banner } from './components/Banner/Banner';

function App() {
    return (
        <div className="App">
            <Banner
                title="COVID-SHARE"
                message={'Got Covid? Get Better.'}
                gradient={true}
                color={'#a62828'}
                secondColor={'#d6722b'}
            />
            <ErrorBoundary>
                <div></div>
            </ErrorBoundary>
        </div>
    );
}

export default App;
