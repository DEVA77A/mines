import React, { useContext } from 'react';
import { Compass, Layers, Cpu } from 'lucide-react';
import { ViewModeContext } from '../contexts/ViewModeContext';

export default function Topbar() {
  const { setViewMode } = useContext(ViewModeContext) || {};

  return (
    <header className="w-full bg-white shadow-sm border-b" style={{borderColor:'var(--border)'}}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold">RF</div>
          <div>
            <div className="text-lg font-semibold" style={{color:'var(--text)'}}>Rockfall Dashboard</div>
            <div className="text-sm" style={{color:'var(--muted)'}}>Tamil Nadu mine monitoring</div>
          </div>
        </div>

        <nav className="flex items-center gap-3">
          <button onClick={() => setViewMode && setViewMode('grid')} className="px-3 py-2 rounded-md btn-secondary flex items-center gap-2"><Layers className="w-4 h-4"/> Dashboard</button>
          <button onClick={() => setViewMode && setViewMode('map')} className="px-3 py-2 rounded-md btn-secondary flex items-center gap-2"><Compass className="w-4 h-4"/> Map</button>
          <button onClick={() => setViewMode && setViewMode('predict')} className="px-3 py-2 rounded-md btn-primary flex items-center gap-2"><Cpu className="w-4 h-4"/> Predict</button>
        </nav>
      </div>
    </header>
  );
}
