import { useLayoutEffect, type RefObject } from "react";
import { minutesToPx, type RowLayout } from "./useRowLayout";

const COMFORTABLE_VIEWPORT_FRACTION = 1 / 3;

function getNowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

interface UseScrollToNowOnMountOptions {
  bodyRef: RefObject<HTMLDivElement | null>;
  rowLayout: RowLayout;
  enabled: boolean;
}

export function useScrollToNowOnMount({ bodyRef, rowLayout, enabled }: UseScrollToNowOnMountOptions) {
  useLayoutEffect(() => {
    if (!enabled) return;
    const bodyEl = bodyRef.current;
    if (!bodyEl) return;

    const nowOffsetWithinBody = minutesToPx(getNowMinutes(), rowLayout);
    const desiredOffsetWithinViewport = bodyEl.clientHeight * COMFORTABLE_VIEWPORT_FRACTION;

    const maxScroll = Math.max(bodyEl.scrollHeight - bodyEl.clientHeight, 0);
    const target = Math.min(Math.max(nowOffsetWithinBody - desiredOffsetWithinViewport, 0), maxScroll);

    bodyEl.scrollTo({ top: target, behavior: "auto" });
  }, []);
}
