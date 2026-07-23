import { useLayoutEffect, useState, type RefObject } from "react";
import { createRAFDebounce } from "../utils/createRAFDebounce";

const CHIP_SIZE_PX = 20; // must match CompactAssignmentChip's h-5/w-5
const CHIP_GAP_PX = 4; // matches gap-1 on the chip row
const INDICATOR_WIDTH_PX = 20; // reserved width for the "+N" pill

export function useFittingChips(
  containerRef: RefObject<HTMLElement | null>,
  itemCount: number
): { visibleCount: number } {
  const [visibleCount, setVisibleCount] = useState(itemCount);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const width = container.clientWidth;
      const perChip = CHIP_SIZE_PX + CHIP_GAP_PX;
      const fitAll = Math.floor((width + CHIP_GAP_PX) / perChip);

      const fit =
        fitAll >= itemCount ? itemCount : Math.max(0, Math.floor((width - INDICATOR_WIDTH_PX) / perChip));

      setVisibleCount((prev) => (prev === fit ? prev : fit));
    };

    measure();

    const { debounced: debouncedMeasure, cancel } = createRAFDebounce(measure);
    const observer = new ResizeObserver(() => debouncedMeasure());
    observer.observe(container);

    return () => {
      observer.disconnect();
      cancel();
    };
  }, [containerRef, itemCount]);

  return { visibleCount };
}
