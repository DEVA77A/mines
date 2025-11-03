import React from 'react';

const TestDashboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        🏔️ Perfect AI-Powered Rockfall System v4.0
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        Tamil Nadu Mining Risk Assessment Dashboard
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="text-3xl font-bold text-blue-600">423</div>
          <div className="text-gray-600">Total Mines</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="text-3xl font-bold text-red-600">45</div>
          <div className="text-gray-600">High Risk</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="text-3xl font-bold text-orange-500">128</div>
          <div className="text-gray-600">Medium Risk</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="text-3xl font-bold text-green-500">250</div>
          <div className="text-gray-600">Low Risk</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">System Status</h2>
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span>Backend API: Connected</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span>Database: 423 mines loaded</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span>All Tamil Nadu districts covered</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span>Perfect mine placement (no sea locations)</span>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-500">
          System is ready for full functionality testing!
        </p>
      </div>
    </div>
  );
};

export default TestDashboard;