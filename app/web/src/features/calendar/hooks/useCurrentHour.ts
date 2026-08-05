import { useEffect, useState } from "react";

function getCurrentHour(): number {
  return new Date().getHours();
}

export function useCurrentHour(): number {
  const [hour, setHour] = useState(getCurrentHour);

  useEffect(() => {
    const interval = setInterval(() => setHour(getCurrentHour()), 60_000);
    return () => clearInterval(interval);
  }, []);

  return hour;
}
