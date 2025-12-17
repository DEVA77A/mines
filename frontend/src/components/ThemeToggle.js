import React, { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const key = 'rf_theme_mode';
  const [on, setOn] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored === 'futuristic') {
        document.body.classList.add('futuristic-theme');
        setOn(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  function toggle() {
    const next = !on;
    setOn(next);
    try {
      if (next) {
        document.body.classList.add('futuristic-theme');
        localStorage.setItem(key, 'futuristic');
      } else {
        document.body.classList.remove('futuristic-theme');
        localStorage.setItem(key, 'default');
      }
    } catch (e) {}
  }

  return (
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      <button onClick={toggle} className="btn-secondary" aria-pressed={on} title="Toggle Futuristic Theme">
        {on ? 'Futuristic On' : 'Futuristic Off'}
      </button>
    </div>
  );
}
