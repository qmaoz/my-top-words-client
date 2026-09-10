import { useEffect, useState } from 'react';

/**
 * How many CSS pixels of the layout viewport are covered by the browser chrome
 * (mobile Chrome toolbar, etc.). Desktop stays 0.
 */
export default function useVisualViewportBottomInset() {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return undefined;

    const update = () => {
      const overlap = window.innerHeight - (viewport.height + viewport.offsetTop);
      setInset(Math.max(0, Math.round(overlap)));
    };

    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    window.addEventListener('resize', update);

    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return inset;
}
