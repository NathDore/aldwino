import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from "react";

const EPSILON_PX = 0.5;
const ITEM_GAP_PX = 4;
const INDICATOR_HEIGHT_PX = 16;

export function useFittingAssignments(
  containerRef: RefObject<HTMLElement | null>,
  headerRef: RefObject<HTMLElement | null>,
  itemCount: number,
  invalidateOn: unknown[]
): { getItemRef: (index: number) => (el: HTMLDivElement | null) => void; visibleCount: number } {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleCount, setVisibleCount] = useState(itemCount);

  const getItemRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      itemRefs.current[index] = el;
    },
    []
  );

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      itemRefs.current.length = itemCount;
      const containerBottom = container.getBoundingClientRect().top + container.clientHeight;

      let fit = 0;
      for (let i = 0; i < itemCount; i++) {
        const el = itemRefs.current[i];
        if (!el) break;
        if (el.getBoundingClientRect().bottom <= containerBottom + EPSILON_PX) {
          fit = i + 1;
        } else {
          break;
        }
      }

      if (fit < itemCount) {
        // Reserve room for the "+N hidden" indicator, which renders right after the
        // last visible card. Back off further if even that card + the indicator don't fit.
        while (fit >= 0) {
          const anchorEl = fit > 0 ? itemRefs.current[fit - 1] : headerRef.current;
          const anchorBottom = anchorEl ? anchorEl.getBoundingClientRect().bottom : containerBottom;
          if (anchorBottom + ITEM_GAP_PX + INDICATOR_HEIGHT_PX <= containerBottom + EPSILON_PX) break;
          fit--;
        }
        fit = Math.max(fit, 0);
      }

      setVisibleCount((prev) => (prev === fit ? prev : fit));
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    for (const el of itemRefs.current) {
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [containerRef, headerRef, itemCount, ...invalidateOn]);

  return { getItemRef, visibleCount };
}
