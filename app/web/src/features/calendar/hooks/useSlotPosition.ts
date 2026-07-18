export const HOUR_ROW_HEIGHT = 60;

export function useSlotPosition(startTime: string, endTime: string): { topPx: number; heightPx: number } {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const durationMinutes = Math.max(endMinutes - startMinutes, 15);

  return {
    topPx: (startMinutes / 60) * HOUR_ROW_HEIGHT,
    heightPx: (durationMinutes / 60) * HOUR_ROW_HEIGHT,
  };
}
