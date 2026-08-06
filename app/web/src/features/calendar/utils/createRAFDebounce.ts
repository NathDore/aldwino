export function createRAFDebounce<Args extends unknown[]>(
  callback: (...args: Args) => void
): { debounced: (...args: Args) => void; cancel: () => void } {
  let rafId: number | null = null;

  const debounced = (...args: Args) => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(() => {
      callback(...args);
      rafId = null;
    });
  };

  const cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  return { debounced, cancel };
}
