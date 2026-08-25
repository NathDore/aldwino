export const ASSIGNMENT_ROW_GRID = "grid grid-cols-[minmax(0,1fr)_7rem_7rem_6rem_9rem]";
export const ASSIGNMENT_ROW_HEIGHT = "h-9";

export const ASSIGNMENT_LIST_VISIBLE_ROWS = 8;

// Must match ASSIGNMENT_ROW_HEIGHT (h-9 = 2.25rem) — rows use a fixed height rather than
// content-driven padding so this stays pixel-exact regardless of cell content (badges, buttons).
const ROW_HEIGHT_PX = 36;
const ROW_DIVIDER_PX = 1;

export function getAssignmentListBodyHeightPx(visibleRows: number = ASSIGNMENT_LIST_VISIBLE_ROWS): number {
  return visibleRows * ROW_HEIGHT_PX + (visibleRows - 1) * ROW_DIVIDER_PX;
}
