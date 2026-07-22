import { useMemo } from "react";

export const HOUR_ROW_HEIGHT = 80;

export interface RowLayout {
  rowHeights: number[];
  rowOffsets: number[];
  totalHeight: number;
}

export function minutesToPx(minutes: number, rowLayout: RowLayout): number {
  const hour = Math.min(Math.floor(minutes / 60), 23);
  const minuteInHour = minutes - hour * 60;
  return rowLayout.rowOffsets[hour] + (minuteInHour / 60) * rowLayout.rowHeights[hour];
}

export function useRowLayout(): RowLayout {
  return useMemo(() => {
    const rowHeights = Array.from({ length: 24 }, () => HOUR_ROW_HEIGHT);

    const rowOffsets: number[] = [];
    let cumulative = 0;
    for (let hour = 0; hour < 24; hour++) {
      rowOffsets[hour] = cumulative;
      cumulative += rowHeights[hour];
    }

    return { rowHeights, rowOffsets, totalHeight: cumulative };
  }, []);
}
