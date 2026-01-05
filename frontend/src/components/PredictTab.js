import React, { useState } from 'react';
import toast from 'react-hot-toast';

import { API_BASE_URL } from '../services/apiBaseUrl';

export default function PredictTab() {
  const [form, setForm] = useState({
    latitude: '',
    longitude: '',
    elevation_m: '',
    slope_degrees: '',
    avg_rainfall_mm: '',
    avg_temp_c: '',
    mineral_type: '',
    lease_area_ha: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        latitude: parseFloat(form.latitude) || 0,
        longitude: parseFloat(form.longitude) || 0,
        elevation_m: parseFloat(form.elevation_m) || 0,
        slope_degrees: parseFloat(form.slope_degrees) || 0,
        avg_rainfall_mm: parseFloat(form.avg_rainfall_mm) || 0,
        avg_temp_c: parseFloat(form.avg_temp_c) || 0,
        mineral_type: form.mineral_type || 'Unknown',
        lease_area_ha: parseFloat(form.lease_area_ha) || 0
      };

      const res = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Prediction failed');
      }

      const json = await res.json();
      setResult(json);
      toast.success('Prediction completed');
    } catch (err) {
      console.error('Predict error', err);
      toast.error('Prediction failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 bg-white/60 backdrop-blur-md rounded-2xl shadow-xl border border-white/50">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Predict Risk for a Mine</h3>
        <p className="text-slate-500">Enter mine parameters to generate an AI-powered risk assessment.</p>
      </div>
      
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Latitude</label>
          <input 
            name="latitude" 
            onChange={onChange} 
            value={form.latitude} 
            placeholder="e.g. 11.0168" 
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Longitude</label>
          <input 
            name="longitude" 
            onChange={onChange} 
            value={form.longitude} 
            placeholder="e.g. 76.9558" 
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Elevation (m)</label>
          <input 
            name="elevation_m" 
            onChange={onChange} 
            value={form.elevation_m} 
            placeholder="e.g. 350" 
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Slope (degrees)</label>
          <input 
            name="slope_degrees" 
            onChange={onChange} 
            value={form.slope_degrees} 
            placeholder="e.g. 25" 
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Rainfall (mm)</label>
          <input 
            name="avg_rainfall_mm" 
            onChange={onChange} 
            value={form.avg_rainfall_mm} 
            placeholder="e.g. 120" 
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Temp (°C)</label>
          <input 
            name="avg_temp_c" 
            onChange={onChange} 
            value={form.avg_temp_c} 
            placeholder="e.g. 32" 
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mineral Type</label>
          <input 
            name="mineral_type" 
            onChange={onChange} 
            value={form.mineral_type} 
            placeholder="e.g. Granite" 
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lease Area (ha)</label>
          <input 
            name="lease_area_ha" 
            onChange={onChange} 
            value={form.lease_area_ha} 
            placeholder="e.g. 50" 
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" 
          />
        </div>

        <div className="col-span-1 md:col-span-2 flex items-center gap-4 mt-4">
          <button 
            type="submit" 
            disabled={loading} 
            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing...</span>
              </span>
            ) : 'Predict Risk'}
          </button>
          <button 
            type="button" 
            onClick={() => { setForm({latitude:'',longitude:'',elevation_m:'',slope_degrees:'',avg_rainfall_mm:'',avg_temp_c:'',mineral_type:'',lease_area_ha:''}); setResult(null); }} 
            className="px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-all shadow-sm"
          >
            Reset
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-8 p-6 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 shadow-inner animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-slate-800">Prediction Result</h4>
            <div className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide ${
              result.risk_category === 'High' ? 'bg-red-100 text-red-700' :
              result.risk_category === 'Medium' ? 'bg-orange-100 text-orange-700' :
              'bg-emerald-100 text-emerald-700'
            }`}>
              {result.risk_category} Risk
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <p className="text-sm text-slate-500 mb-1">Confidence Score</p>
              <div className="flex items-end space-x-2">
                <span className="text-3xl font-bold text-slate-800">{(result.confidence*100).toFixed(1)}%</span>
                <span className="text-sm text-slate-400 mb-1">certainty</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-1000" 
                  style={{ width: `${result.confidence*100}%` }}
                />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <p className="text-sm text-slate-500 mb-3">Risk Probabilities</p>
              <div className="space-y-2">
                {Object.entries(result.risk_probability || {}).map(([k,v]) => (
                  <div key={k} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-600">{k}</span>
                    <div className="flex items-center space-x-3 flex-1 ml-4">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full ${
                            k === 'High' ? 'bg-red-500' : k === 'Medium' ? 'bg-orange-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${v*100}%` }}
                        />
                      </div>
                      <span className="w-12 text-right font-bold text-slate-700">{(v*100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Risk Factors Analysis</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {result.risk_factors && Object.entries(result.risk_factors).map(([k,v]) => (
                <div key={k} className="bg-white p-3 rounded-lg border border-slate-100 text-center">
                  <div className="text-xs text-slate-500 uppercase mb-1">{k.replace('_', ' ')}</div>
                  <div className="font-mono font-bold text-blue-600">
                    {typeof v === 'number' ? v.toFixed(3) : String(v)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
