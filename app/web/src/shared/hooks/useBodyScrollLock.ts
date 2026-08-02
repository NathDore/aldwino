import { useEffect } from "react";

let lockCount = 0;
let previousOverflow: string | null = null;

export function useBodyScrollLock() {
  useEffect(() => {
    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    lockCount++;

    return () => {
      lockCount--;
      if (lockCount === 0) {
        document.body.style.overflow = previousOverflow ?? "";
        previousOverflow = null;
      }
    };
  }, []);
}
