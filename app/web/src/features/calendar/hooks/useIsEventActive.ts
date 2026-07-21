import { useEffect, useState } from "react";

const CHECK_INTERVAL_MS = 15_000;

function computeIsActive(startTime: string, endTime: string): boolean {
  const now = Date.now();
  return now >= new Date(startTime).getTime() && now < new Date(endTime).getTime();
}

export function useIsEventActive(startTime: string, endTime: string): boolean {
  const [isActive, setIsActive] = useState(() => computeIsActive(startTime, endTime));

  useEffect(() => {
    setIsActive(computeIsActive(startTime, endTime));
    const interval = setInterval(() => setIsActive(computeIsActive(startTime, endTime)), CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [startTime, endTime]);

  return isActive;
}
