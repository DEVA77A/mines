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

  if (loading) return <div className="p-4">Loading model metrics...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  const results = metrics.results || {};

  return (
    <div className="card p-4">
      <h3 className="text-lg font-medium mb-2">Model Metrics</h3>
      <div className="text-sm text-gray-600 mb-2">Feature columns: {metrics.feature_columns_count}</div>
      {results.multiclass ? (
        <div>
          {Object.entries(results.multiclass).map(([name, r]) => (
            <div key={name} className="mb-2">
              <strong className="block">{name}</strong>
              <div className="text-sm">Accuracy: {r.accuracy?.toFixed(3) ?? 'N/A'}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500">No training results found.</div>
      )}
    </div>
  );
}
