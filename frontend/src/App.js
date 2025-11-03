import React from 'react';
import PerfectDashboard from './components/PerfectDashboard';
import { PerfectDataProvider } from './contexts/PerfectDataContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <PerfectDataProvider>
        <PerfectDashboard />
      </PerfectDataProvider>
    </ThemeProvider>
  );
}

export default App;