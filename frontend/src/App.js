import React, { useState } from 'react';
import PerfectDashboard from './components/PerfectDashboard';
import { PerfectDataProvider } from './contexts/PerfectDataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import CustomCursor from './components/CustomCursor';
import Topbar from './components/Topbar';
import { ViewModeContext } from './contexts/ViewModeContext';

function App() {
  const [viewMode, setViewMode] = useState('grid');

  return (
    <ThemeProvider>
      <PerfectDataProvider>
        <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
          <div className="app-with-custom-cursor">
            <CustomCursor />
            <Topbar />
            <main className="max-w-7xl mx-auto px-4 py-6">
              <PerfectDashboard />
            </main>
          </div>
        </ViewModeContext.Provider>
      </PerfectDataProvider>
    </ThemeProvider>
  );
}

export default App;