import React from 'react';
import { usePerfectData } from '../contexts/PerfectDataContext';

const BasicDashboard = () => {
  const { mines, loading, error } = usePerfectData();

  if (loading) {
    return <div className="p-8">Loading mines...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Tamil Nadu Mines Dashboard</h1>
      <p className="mb-4">Total Mines: {mines?.length || 0}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mines?.slice(0, 6).map((mine) => (
          <div key={mine.id} className="border p-4 rounded">
            <h3 className="font-bold">{mine.name}</h3>
            <p>Location: {mine.location}</p>
            <p>Risk: {mine.risk_level}</p>
            <p>Type: {mine.mine_type}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BasicDashboard;