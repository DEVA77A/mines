import React, { useEffect, useState } from 'react';

export default function ModelMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/model-metrics')
      .then((r) => {
        if (!r.ok) throw new Error('Metrics not available');
        return r.json();
      })
      .then((data) => {
        setMetrics(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-8 bg-white/60 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <span className="text-slate-500 font-medium">Loading model metrics...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8 bg-red-50/80 backdrop-blur-md rounded-2xl shadow-xl border border-red-100 flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center space-y-2 text-center">
        <span className="text-3xl">⚠️</span>
        <span className="text-red-600 font-bold">Unable to load metrics</span>
        <span className="text-red-400 text-sm">{error}</span>
      </div>
    </div>
  );

  const results = metrics.results || {};

  return (
    <div className="p-8 bg-white/60 backdrop-blur-md rounded-2xl shadow-xl border border-white/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">Model Performance</h3>
          <p className="text-slate-500">Real-time accuracy metrics for AI models</p>
        </div>
        <div className="px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Features</span>
          <div className="text-2xl font-bold text-slate-800">{metrics.feature_columns_count}</div>
        </div>
      </div>

      {results.multiclass ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(results.multiclass).map(([name, r]) => (
            <div key={name} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-3">
                <strong className="text-slate-700 font-bold capitalize">{name.replace('_', ' ')}</strong>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  (r.accuracy || 0) > 0.8 ? 'bg-emerald-100 text-emerald-600' : 
                  (r.accuracy || 0) > 0.6 ? 'bg-orange-100 text-orange-600' : 
                  'bg-red-100 text-red-600'
                }`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Accuracy</span>
                    <span className="font-bold text-slate-700">{(r.accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        (r.accuracy || 0) > 0.8 ? 'bg-emerald-500' : 
                        (r.accuracy || 0) > 0.6 ? 'bg-orange-500' : 
                        'bg-red-500'
                      }`}
                      style={{ width: `${(r.accuracy || 0) * 100}%` }}
                    />
                  </div>
                </div>
                
                {r.precision !== undefined && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                    <div>
                      <span className="text-xs text-slate-400 block">Precision</span>
                      <span className="text-sm font-bold text-slate-600">{(r.precision * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Recall</span>
                      <span className="text-sm font-bold text-slate-600">{(r.recall * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <span className="text-4xl mb-3 block">📉</span>
          <h4 className="text-slate-600 font-bold">No Training Results</h4>
          <p className="text-slate-400 text-sm">Train the model to see performance metrics here.</p>
        </div>
      )}
    </div>
  );
}
