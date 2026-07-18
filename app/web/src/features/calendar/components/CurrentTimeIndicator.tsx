import { useEffect, useState } from "react";
import { HOUR_ROW_HEIGHT } from "../hooks/useSlotPosition";

function getTopPx(): number {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  return (minutes / 60) * HOUR_ROW_HEIGHT;
}

export function CurrentTimeIndicator() {
  const [topPx, setTopPx] = useState(getTopPx);

  useEffect(() => {
    const interval = setInterval(() => setTopPx(getTopPx()), 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute left-0 right-0 h-0.5 bg-red-500 z-20 pointer-events-none"
      style={{ top: topPx }}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-red-500 -mt-[2px] -ml-0.5" />
    </div>
  );
}
