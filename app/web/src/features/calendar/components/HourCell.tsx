import { memo } from "react";

interface HourCellProps {
  date: string;
  hour: number;
  top: number;
  height: number;
}

export const HourCell = memo(function HourCell({ top, height }: HourCellProps) {
  return <div className="absolute left-0 right-0 border-b border-slate-200" style={{ top, height }} />;
});
