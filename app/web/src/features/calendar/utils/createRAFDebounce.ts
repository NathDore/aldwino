export function createRAFDebounce<T extends (...args: any[]) => void>(
  callback: T
): { debounced: T; cancel: () => void } {
  let rafId: number | null = null;

  const debounced = ((...args: any[]) => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(() => {
      callback(...args);
      rafId = null;
    });
  }) as T;

  const cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  return { debounced, cancel };
}
