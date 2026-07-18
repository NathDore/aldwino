import { useEffect, useState } from "react";
import { minutesToPx, type RowLayout } from "../hooks/useRowLayout";

function getNowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

interface CurrentTimeIndicatorProps {
  rowLayout: RowLayout;
}

export function CurrentTimeIndicator({ rowLayout }: CurrentTimeIndicatorProps) {
  const [nowMinutes, setNowMinutes] = useState(getNowMinutes);

  useEffect(() => {
    const interval = setInterval(() => setNowMinutes(getNowMinutes()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const topPx = minutesToPx(nowMinutes, rowLayout);

  return (
    <div
      className="absolute left-0 right-0 h-0.5 bg-red-500 z-20 pointer-events-none transition-all duration-300 ease-in-out"
      style={{ top: topPx }}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-red-500 -mt-[2px] -ml-0.5" />
    </div>
  );
}
