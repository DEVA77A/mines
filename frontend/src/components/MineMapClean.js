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

function createRiskIcon(riskLevel) {
  var colors = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444', Unknown: '#6b7280' };
  var color = colors[riskLevel] || colors.Unknown;
  var html = '<div style="background:' + color + ';width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.2);"></div>';
  return L.divIcon({ className: 'custom-marker', html: html, iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -10] });
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

  useEffect(() => {
    const s = normalize(selectedMine);
    if (s && s.latitude && s.longitude) { setMapCenter([s.latitude, s.longitude]); setMapZoom(12); }
  }, [selectedMine]);

  const normalized = useMemo(() => (mines || []).map(normalize).filter(Boolean), [mines]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }} whenCreated={(m) => setMapInstance(m)}>
        <MapUpdater center={mapCenter} zoom={mapZoom} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {normalized.map((m) => (!m || m.latitude == null || m.longitude == null) ? null : (
          <Marker key={m.id || (m.latitude + '-' + m.longitude)} position={[m.latitude, m.longitude]} icon={createRiskIcon(m.risk_level)} eventHandlers={{ click: () => onMineSelect && onMineSelect(m) }}>
            <Popup>
              <div style={{ minWidth: 180 }}>
                <strong>{m.name}</strong>
                <div style={{ fontSize: 13 }}>{m.district}</div>
                <div style={{ fontSize: 13 }}>{m.risk_level}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
