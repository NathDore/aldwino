import { minutesToPx, type RowLayout } from "./useRowLayout";

export function useSlotPosition(
  startTime: string,
  endTime: string,
  rowLayout: RowLayout
): { topPx: number; heightPx: number } {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutesRaw = end.getHours() * 60 + end.getMinutes();
  const endMinutes = Math.max(endMinutesRaw, startMinutes + 15);

  const topPx = minutesToPx(startMinutes, rowLayout);
  const bottomPx = minutesToPx(endMinutes, rowLayout);

  return { topPx, heightPx: bottomPx - topPx };
}
