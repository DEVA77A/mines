import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Optional clustering package. Install in frontend before use:
// npm install react-leaflet-markercluster
let MarkerClusterGroup;
try {
  // dynamically require so the app still runs if package not installed
  MarkerClusterGroup = require('react-leaflet-markercluster');
  MarkerClusterGroup = MarkerClusterGroup && MarkerClusterGroup.default ? MarkerClusterGroup.default : MarkerClusterGroup;
} catch (e) {
  MarkerClusterGroup = null;
}

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

const MineMap = ({ mines = [], selectedMine = null, onMineSelect, onExportVisible, onFilterChange, className = "" }) => {
  const [mapCenter, setMapCenter] = useState([11.1271, 78.6569]); // Tamil Nadu center
  const [mapZoom, setMapZoom] = useState(7);
  const [fullscreen, setFullscreen] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [districtFilter, setDistrictFilter] = useState('');

  // Normalizes mine objects coming from different API shapes so the map
  // component works with both old and new backends without breaking clicks.
  const normalize = (mine) => {
    if (!mine) return null;
    return {
      id: mine.id ?? mine.mine_id ?? null,
      name: mine.name ?? mine.mine_name ?? mine.mine_title ?? 'Unknown',
      latitude: mine.latitude ?? mine.lat ?? mine.location?.lat ?? null,
      longitude: mine.longitude ?? mine.lon ?? mine.lng ?? mine.location?.lng ?? null,
      district: mine.district ?? mine.district_name ?? '',
      type: mine.type ?? mine.mine_type ?? mine.mineral ?? '',
      status: mine.status ?? 'Unknown',
      risk_level: mine.risk_level ?? mine.risk_assessment?.risk_level ?? mine.risk?.level ?? 'Unknown',
      risk_score: mine.risk_score ?? mine.risk_assessment?.risk_score ?? mine.risk?.score ?? null,
      operational_data: mine.operational_data ?? mine.ops ?? {},
      description: mine.description ?? mine.summary ?? ''
    };
  };

  useEffect(() => {
    const s = normalize(selectedMine);
    if (s && s.latitude && s.longitude) {
      setMapCenter([s.latitude, s.longitude]);
      setMapZoom(12);
    }
  }, [selectedMine]);

  const handleMarkerClick = (mine) => {
    const n = normalize(mine);
    if (onMineSelect) {
      onMineSelect(n);
    }
  };

  const exportVisibleAsCSV = () => {
    if (!mapInstance) return;
    const bounds = mapInstance.getBounds();
    const visible = mines.map(normalize).filter(m => m && m.latitude != null && m.longitude != null && bounds.contains([m.latitude, m.longitude]));
    if (visible.length === 0) {
      alert('No mines are visible in the current map view.');
      return;
    }
    if (typeof window === 'undefined') return;
    // If parent provided handler via prop, use it
    if (typeof onExportVisible === 'function') {
      onExportVisible(visible);
      return;
    }
    // Fallback: build CSV and download
    const headers = ['id','name','latitude','longitude','district','type','status','risk_level','risk_score'];
    const rows = visible.map(m => headers.map(h => JSON.stringify(m[h] ?? '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visible_mines_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        className="rounded-instagram shadow-card"
        whenCreated={setMapInstance}
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

        {MarkerClusterGroup ? (
          <MarkerClusterGroup>
            {mines.filter(m=> !(districtFilter && districtFilter.length>0) || (String(m.district || m.district_name || m.district_name)?.toLowerCase().indexOf(districtFilter.toLowerCase())>-1)).map((mine) => {
              const m = normalize(mine);
              if (!m || m.latitude == null || m.longitude == null) return null;
              return (
                <Marker
                  key={m.id ?? `${m.latitude}-${m.longitude}`}
                  position={[m.latitude, m.longitude]}
                  icon={createRiskIcon(m.risk_level || 'Unknown')}
                  eventHandlers={{ click: () => handleMarkerClick(mine) }}
                >
                  <Popup className="custom-popup">
                    <div className="p-2 min-w-[200px]">
                      <h3 className="font-semibold text-gray-900 mb-2">{m.name}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">District:</span> {m.district}</p>
                        <p><span className="font-medium">Mineral:</span> {m.type}</p>
                        <p><span className="font-medium">Area:</span> {m.operational_data?.area_hectares ?? m.operational_data?.area} ha</p>
                        <p><span className="font-medium">Status:</span> 
                          <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                            m.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {m.status}
                          </span>
                        </p>
                        {m.risk_level && (
                          <p><span className="font-medium">Risk:</span>
                            <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                              m.risk_level === 'High' ? 'bg-red-100 text-red-700' :
                              m.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {m.risk_level}
                            </span>
                          </p>
                        )}
                        {typeof m.risk_score === 'number' && (
                          <p><span className="font-medium">Score:</span> {Number(m.risk_score).toFixed(1)}%</p>
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
              );
            })}
          </MarkerClusterGroup>
        ) : (
          mines.filter(m=> !(districtFilter && districtFilter.length>0) || (String(m.district || m.district_name || m.district_name)?.toLowerCase().indexOf(districtFilter.toLowerCase())>-1)).map((mine) => {
            const m = normalize(mine);
            if (!m || m.latitude == null || m.longitude == null) return null;
            return (
              <Marker
                key={m.id ?? `${m.latitude}-${m.longitude}`}
                position={[m.latitude, m.longitude]}
                icon={createRiskIcon(m.risk_level || 'Unknown')}
                eventHandlers={{ click: () => handleMarkerClick(mine) }}
              >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-gray-900 mb-2">{m.name}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">District:</span> {m.district}</p>
                    <p><span className="font-medium">Mineral:</span> {m.type}</p>
                    <p><span className="font-medium">Area:</span> {m.operational_data?.area_hectares ?? m.operational_data?.area} ha</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                        m.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {m.status}
                      </span>
                    </p>
                    {m.risk_level && (
                      <p><span className="font-medium">Risk:</span>
                        <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                          m.risk_level === 'High' ? 'bg-red-100 text-red-700' :
                          m.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {m.risk_level}
                        </span>
                      </p>
                    )}
                    {typeof m.risk_score === 'number' && (
                      <p><span className="font-medium">Score:</span> {Number(m.risk_score).toFixed(1)}%</p>
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
            );
          })
        )}
      </MapContainer>

      {/* Quick district filter (top-left) */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow p-2">
        <label className="text-xs text-gray-700 font-medium">Filter district</label>
        <div className="mt-1 flex space-x-2">
          <input
            value={districtFilter}
            onChange={(e) => {
              setDistrictFilter(e.target.value);
              if (typeof onFilterChange === 'function') onFilterChange(e.target.value);
            }}
            placeholder="Type district name"
            className="px-2 py-1 border rounded text-sm w-40"
          />
          <button
            onClick={() => { setDistrictFilter(''); if (typeof onFilterChange === 'function') onFilterChange(''); }}
            className="px-2 py-1 bg-gray-100 rounded text-sm"
          >
            Clear
          </button>
        </div>
      </div>

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

        {/* Fullscreen toggle */}
        <button
          onClick={() => setFullscreen(true)}
          className="mt-2 bg-white text-gray-700 p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-200"
          title="Fullscreen"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3H5a2 2 0 00-2 2v3m0 8v3a2 2 0 002 2h3m8-16h3a2 2 0 012 2v3M16 21h3a2 2 0 002-2v-3" />
          </svg>
        </button>

        {/* Export visible */}
        <button
          onClick={exportVisibleAsCSV}
          className="mt-2 bg-white text-gray-700 p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-200"
          title="Export visible mines"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div className="fixed inset-0 z-[2000] bg-white">
          <div className="absolute top-4 right-4 z-[2100]">
            <button
              onClick={() => setFullscreen(false)}
              className="bg-white text-gray-700 p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-200"
              title="Close fullscreen"
            >
              ✕
            </button>
          </div>
          <div className="w-full h-full">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100vh', width: '100%' }}
            >
              <MapUpdater center={mapCenter} zoom={mapZoom} />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {mines.map((mine) => {
                const m = normalize(mine);
                if (!m || m.latitude == null || m.longitude == null) return null;
                return (
                  <Marker
                    key={`fs-${m.id ?? (m.latitude + '-' + m.longitude)}`}
                    position={[m.latitude, m.longitude]}
                    icon={createRiskIcon(m.risk_level || 'Unknown')}
                    eventHandlers={{ click: () => handleMarkerClick(mine) }}
                  />
                );
              })}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default MineMap;