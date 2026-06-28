import { useLayoutEffect, useRef, useCallback } from 'react';

/**
 * Dynamically adjusts font-size of `ref` so content fits within the element's height.
 * Uses clientHeight (fixed container height) as target, binary-searches for best size.
 *
 * @param {object} deps - triggers recalculation
 * @param {number} max - max font-size in rem (default 2.5)
 * @param {number} min - min font-size in rem (default 0.6)
 * @param {number} step - precision (default 0.05)
 */
export default function useFitText(deps = {}, { max = 2.5, min = 0.6, step = 0.05 } = {}) {
  const ref = useRef(null);

  const fit = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const origOverflow = el.style.overflow;
    el.style.overflow = 'hidden';

    // Target: the actual visible height of the container (fixed by flexbox)
    const targetHeight = el.clientHeight;

    // Try max first
    el.style.fontSize = `${max}rem`;
    if (el.scrollHeight <= targetHeight) {
      el.style.overflow = origOverflow;
      return;
    }

    // Binary search downwards
    let lo = min;
    let hi = max;
    let best = min;

    for (let i = 0; i < 15; i++) {
      const mid = (lo + hi) / 2;
      el.style.fontSize = `${mid}rem`;
      if (el.scrollHeight <= targetHeight) {
        best = mid;
        lo = mid + step;
      } else {
        hi = mid - step;
      }
    }

    const rounded = Math.floor(best / step) * step;
    el.style.fontSize = `${rounded}rem`;
    el.style.overflow = origOverflow;
  }, [max, min, step]);

  useLayoutEffect(() => {
    fit();
  }, [fit, deps]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => fit());
    observer.observe(el);
    return () => observer.disconnect();
  }, [fit]);

  return { ref };
}