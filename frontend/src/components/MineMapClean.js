import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Minimal, stable MineMap used while original is repaired
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

function createRiskIcon(riskLevel, size = 20, border = 3) {
  var colors = { Low: '#10b981', Medium: '#f97316', High: '#ef4444', Unknown: '#64748b' };
  var color = colors[riskLevel] || colors.Unknown;
  var glow = riskLevel === 'High' ? 'box-shadow: 0 0 15px rgba(239, 68, 68, 0.6);' : 
             riskLevel === 'Medium' ? 'box-shadow: 0 0 10px rgba(249, 115, 22, 0.5);' : 
             'box-shadow: 0 2px 6px rgba(0,0,0,0.2);';
             
  var html = `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:${border}px solid white;${glow}transform:translate(-50%,-50%);transition:all 0.3s ease;"></div>`;
  return L.divIcon({ className: 'custom-marker', html: html, iconSize: [size, size], iconAnchor: [size/2, size/2], popupAnchor: [0, -size/2] });
}

const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, zoom); }, [map, center, zoom]);
  return null;
};

function normalize(m) {
  if (!m) return null;
  return {
    id: (m.id || m.mine_id) || null,
    name: (m.name || m.mine_name || m.mine_title) || 'Unknown',
    latitude: (m.latitude || m.lat || (m.location && m.location.lat)) || null,
    longitude: (m.longitude || m.lon || m.lng || (m.location && m.location.lng)) || null,
    district: (m.district || m.district_name) || '',
    risk_level: (m.risk_level || (m.risk_assessment && m.risk_assessment.risk_level)) || 'Unknown',
    risk_score: (m.risk_score || (m.risk && m.risk.score)) || null
  };
}

export default function MineMapClean({ mines = [], selectedMine = null, onMineSelect, className = '' }) {
  const [mapCenter, setMapCenter] = useState([11.1271, 78.6569]);
  const [mapZoom, setMapZoom] = useState(7);
  const [mapInstance, setMapInstance] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const s = normalize(selectedMine);
    if (s && s.latitude && s.longitude) {
      // Smoothly fly to the selected mine when set from outside
      if (mapInstance && typeof mapInstance.flyTo === 'function') {
        mapInstance.flyTo([s.latitude, s.longitude], 12, { duration: 1.0 });
      } else {
        setMapCenter([s.latitude, s.longitude]);
        setMapZoom(12);
      }
    }
  }, [selectedMine, mapInstance]);

  const normalized = useMemo(() => (mines || []).map((m) => ({ raw: m, norm: normalize(m) })).filter(x => x && x.norm), [mines]);

  return (
    <div className={`relative w-full h-full rounded-2xl overflow-hidden shadow-inner border border-slate-200/50 ${className}`}>
      <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }} whenCreated={(m) => setMapInstance(m)}>
        <MapUpdater center={mapCenter} zoom={mapZoom} />
        <TileLayer 
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {normalized.map((entry, idx) => {
          const m = entry.norm;
          const raw = entry.raw;
          if (!m || m.latitude == null || m.longitude == null) return null;
          const key = m.id || `${m.latitude}-${m.longitude}-${idx}`;
          const isHovered = hoveredId === key;
          const size = isHovered ? 32 : 18;
          const icon = createRiskIcon(m.risk_level, size, isHovered ? 3 : 2);

          return (
            <Marker
              key={key}
              position={[m.latitude, m.longitude]}
              icon={icon}
              eventHandlers={{
                click: (e) => {
                  // fly to marker smoothly
                  if (mapInstance && typeof mapInstance.flyTo === 'function') {
                    mapInstance.flyTo([m.latitude, m.longitude], 12, { duration: 0.8 });
                  }
                  onMineSelect && onMineSelect(raw);
                },
                mouseover: (e) => {
                  setHoveredId(key);
                  try { e.target.openPopup(); } catch (err) {}
                },
                mouseout: (e) => {
                  setHoveredId(null);
                  try { e.target.closePopup(); } catch (err) {}
                }
              }}
            >
              <Popup closeButton={false} autoClose={false} closeOnClick={false} className="glass-popup">
                <div className="min-w-[220px] p-1">
                  <div className="flex items-center justify-between mb-2">
                    <strong className="text-slate-800 text-sm font-bold">{raw?.mine_name || m.name}</strong>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                      (raw?.risk_category || m.risk_level) === 'High' ? 'bg-red-100 text-red-700' :
                      (raw?.risk_category || m.risk_level) === 'Medium' ? 'bg-orange-100 text-orange-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {raw?.risk_category || (raw?.risk_assessment && raw.risk_assessment.risk_level) || m.risk_level}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center text-xs text-slate-600">
                      <span className="w-4 text-center mr-2">📍</span>
                      <span>{raw?.district || m.district}</span>
                    </div>
                    
                    { (raw?.risk_score || raw?.risk_assessment?.risk_score || m.risk_score) && (
                      <div className="flex items-center text-xs text-slate-600">
                        <span className="w-4 text-center mr-2">📊</span>
                        <span>Risk Score: <span className="font-mono font-bold text-blue-600">{ (raw?.risk_score ?? raw?.risk_assessment?.risk_score ?? m.risk_score) }</span></span>
                      </div>
                    ) }
                    
                    { raw?.mineral_type && (
                      <div className="flex items-center text-xs text-slate-600">
                        <span className="w-4 text-center mr-2">💎</span>
                        <span>{raw.mineral_type}</span>
                      </div>
                    ) }
                    
                    { raw?.status && (
                      <div className="flex items-center text-xs text-slate-600">
                        <span className="w-4 text-center mr-2">ℹ️</span>
                        <span className="capitalize">{raw.status}</span>
                      </div>
                    ) }
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        {/* Fullscreen toggle button */}
        <div className="absolute right-3 top-3 z-[1000]">
          <button
            onClick={() => {
              const el = mapInstance ? mapInstance.getContainer() : null;
              if (!el) return;
              if (!document.fullscreenElement) {
                el.requestFullscreen?.();
                setIsFullscreen(true);
              } else {
                document.exitFullscreen?.();
                setIsFullscreen(false);
              }
            }}
            className="bg-white/90 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-white/50 text-slate-600 hover:text-blue-600 hover:bg-white transition-all hover:scale-105 active:scale-95"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </div>
      </MapContainer>
    </div>
  );
}
