import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    const down = () => setActive(true);
    const up = () => setActive(false);

    window.addEventListener('mousemove', move);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);

    // Detect hover on interactive elements
    const handleOver = (e) => {
      const el = e.target.closest && e.target.closest('[data-cursor="pointer"]');
      if (el) setActive(true);
    };
    const handleOut = (e) => {
      const el = e.target.closest && e.target.closest('[data-cursor="pointer"]');
      if (!el) setActive(false);
    };
    window.addEventListener('mouseover', handleOver);
    window.addEventListener('mouseout', handleOut);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('mouseover', handleOver);
      window.removeEventListener('mouseout', handleOut);
    };
  }, []);

  return (
    <div aria-hidden className={`custom-cursor ${active ? 'custom-cursor--active' : ''}`} style={{ left: pos.x, top: pos.y }} />
  );
}
