import './App.css';

import React from 'react';

import { useNumbersAndStrings } from './state/state.hooks';

import { Banner, ErrorBoundary, PortalContainer, ResizableContainer, ResizablePane } from './core';

import { Size } from './core/ResizableContainer/ResizableContainer';

function App() {
    // Get ref to the resize container so we can forcibly update its panes when the user resizes window
    const resizeContainer = React.useRef<ResizableContainer>(null);

    // Set up window resize listener so resizable panes will scale accordingly
    React.useEffect(() => {
        const resetSizes = () => resizeContainer.current?.resetSizes();
        window.addEventListener('resize', resetSizes);

        return () => {
            window.removeEventListener('resize', resetSizes);
        };
    }, []);

    // Hook to access redux state numbers and strings
    const [numbers, strings, setNumbers, setStrings] = useNumbersAndStrings();

    const resizeCallback = (sizes: Size[]) => {
        setNumbers(sizes.map((s) => parseInt(s.width, 10)));
        setStrings(sizes.map((s) => s.height));
    };

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
                <ResizableContainer
                    id={'app-container'}
                    alignment="horizontal"
                    width="100%"
                    height="100%"
                    ref={resizeContainer}
                    onResizeStop={resizeCallback}
                >
                    <ResizablePane width="20%" height="100%">
                        <div>{numbers}</div>
                    </ResizablePane>
                    <ResizablePane>
                        <div>{strings}</div>
                    </ResizablePane>
                </ResizableContainer>
            </ErrorBoundary>

            {/* Popup windows will be rendered here no matter how deep in component tree they are declared */}
            <PortalContainer />
        </div>
    );
}

export default App;
