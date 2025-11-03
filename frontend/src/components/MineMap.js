import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker icons for different risk levels
const createRiskIcon = (riskLevel) => {
  const colors = {
    Low: '#10b981',
    Medium: '#f59e0b', 
    High: '#ef4444',
    Unknown: '#6b7280'
  };

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${colors[riskLevel] || colors.Unknown};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);
  
  return null;
};

const MineMap = ({ mines = [], selectedMine = null, onMineSelect, className = "" }) => {
  const [mapCenter, setMapCenter] = useState([11.1271, 78.6569]); // Tamil Nadu center
  const [mapZoom, setMapZoom] = useState(7);

  useEffect(() => {
    if (selectedMine) {
      setMapCenter([selectedMine.latitude, selectedMine.longitude]);
      setMapZoom(12);
    }
  }, [selectedMine]);

  const handleMarkerClick = (mine) => {
    if (onMineSelect) {
      onMineSelect(mine);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        className="rounded-instagram shadow-card"
      >
        <MapUpdater center={mapCenter} zoom={mapZoom} />
        
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Satellite layer option */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.arcgis.com/">ArcGIS</a>'
          opacity={0.6}
        />

        {mines.map((mine) => (
          <Marker
            key={mine.mine_id}
            position={[mine.latitude, mine.longitude]}
            icon={createRiskIcon(mine.risk_assessment?.risk_level || 'Unknown')}
            eventHandlers={{
              click: () => handleMarkerClick(mine)
            }}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-gray-900 mb-2">{mine.mine_name}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">District:</span> {mine.district}</p>
                  <p><span className="font-medium">Mineral:</span> {mine.mine_type}</p>
                  <p><span className="font-medium">Area:</span> {mine.operational_data?.area_hectares} ha</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                      mine.status === 'Active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {mine.status}
                    </span>
                  </p>
                  {mine.risk_assessment?.risk_level && (
                    <p><span className="font-medium">Risk:</span>
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                        mine.risk_assessment.risk_level === 'High' ? 'bg-red-100 text-red-700' :
                        mine.risk_assessment.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {mine.risk_assessment.risk_level}
                      </span>
                    </p>
                  )}
                  {mine.risk_assessment?.risk_score && (
                    <p><span className="font-medium">Score:</span> {mine.risk_assessment.risk_score.toFixed(1)}%</p>
                  )}
                </div>
                <button 
                  onClick={() => handleMarkerClick(mine)}
                  className="mt-3 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Risk Levels</h4>
        <div className="space-y-2">
          {[
            { level: 'Low', color: '#10b981' },
            { level: 'Medium', color: '#f59e0b' },
            { level: 'High', color: '#ef4444' }
          ].map(({ level, color }) => (
            <div key={level} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-xs text-gray-700">{level} Risk</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-4 left-4 flex flex-col space-y-2 z-[1000]">
        <button
          onClick={() => {
            setMapCenter([11.1271, 78.6569]);
            setMapZoom(7);
          }}
          className="bg-white text-gray-700 p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-200"
          title="Reset View"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MineMap;