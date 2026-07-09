import { useLayoutEffect, useRef, useCallback } from 'react';

function getContentHeight(textEl) {
  const style = getComputedStyle(textEl);
  const gap = parseFloat(style.rowGap) || 0;
  const { children } = textEl;
  if (!children.length) return 0;

  let height = 0;
  for (let i = 0; i < children.length; i++) {
    height += children[i].offsetHeight;
    if (i > 0) height += gap;
  }
  return height;
}

function overflows(textEl, containerEl, sizeRem) {
  textEl.style.fontSize = `${sizeRem}rem`;
  void textEl.offsetHeight;

  const limitH = containerEl.clientHeight;
  const limitW = containerEl.clientWidth;
  if (limitH <= 0 || limitW <= 0) return true;

  if (getContentHeight(textEl) > limitH + 1) return true;

  const lines = textEl.querySelectorAll('.exercise-fit-text__line');
  for (const line of lines) {
    if (line.scrollWidth > limitW + 1) return true;
  }

  return false;
}

export default function useFitText(deps = [], { max = 2.5, min = 0.5, step = 0.05 } = {}) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const timersRef = useRef([]);

  const setRevealed = useCallback((revealed) => {
    const text = textRef.current;
    if (!text) return;
    text.classList.toggle('exercise-fit-text--ready', revealed);
  }, []);

  const fit = useCallback(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text || !text.children.length) return;

    const limitH = container.clientHeight;
    const limitW = container.clientWidth;
    if (limitH <= 0 || limitW <= 0) return;

    let best = min;

    if (!overflows(text, container, min)) {
      for (let size = min + step; size <= max + step / 2; size += step) {
        const candidate = Math.round(size / step) * step;
        if (candidate > max) break;
        if (overflows(text, container, candidate)) break;
        best = candidate;
      }
    }

    text.style.fontSize = `${best}rem`;
  }, [max, min, step]);

  const runFitPasses = useCallback((onDone) => {
    fit();
    requestAnimationFrame(() => {
      fit();
      requestAnimationFrame(() => {
        fit();
        onDone?.();
      });
    });
  }, [fit]);

  const scheduleFit = useCallback((revealWhenDone = true) => {
    setRevealed(false);
    runFitPasses(() => {
      if (revealWhenDone) setRevealed(true);
    });
  }, [runFitPasses, setRevealed]);

  useLayoutEffect(() => {
    setRevealed(false);
    runFitPasses();

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [50, 150, 300].map((ms) => setTimeout(() => {
      if (ms === 300) {
        runFitPasses(() => setRevealed(true));
      } else {
        runFitPasses();
      }
    }, ms));

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [runFitPasses, setRevealed, ...deps]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => scheduleFit(true));
    observer.observe(container);

    let parent = container.parentElement;
    while (parent) {
      observer.observe(parent);
      if (parent.classList.contains('exercise-page-content')) break;
      parent = parent.parentElement;
    }

    return () => observer.disconnect();
  }, [scheduleFit]);

  return { containerRef, textRef };
}
