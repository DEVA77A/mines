import React, { useEffect, useState } from 'react';
import HeroParallax from './HeroParallax';

export default function DynamicHero() {
  const [HeroComp, setHeroComp] = useState(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let mounted = true;
    // Try to dynamically import the 3D hero. If it fails (incompatible libs), fall back.
    import('./Hero3D')
      .then((mod) => {
        if (mounted && mod && mod.default) setHeroComp(() => mod.default);
      })
      .catch((err) => {
        console.warn('Hero3D failed to load, falling back to HeroParallax:', err);
        if (mounted) setErrored(true);
      });

    return () => { mounted = false; };
  }, []);

  if (HeroComp) return <HeroComp />;
  // while loading or on error, show the CSS/Framer fallback hero
  return <HeroParallax />;
}
