import React from 'react';
import './App.css';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { Banner } from './components/Banner/Banner';
import ResizableContainer from './components/ResizableContainer/ResizableContainer';

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
                <ResizableContainer id={'app-container'} alignment="horizontal">
                    <div>what</div>
                </ResizableContainer>
            </ErrorBoundary>
        </div>
    );
}

export default App;
