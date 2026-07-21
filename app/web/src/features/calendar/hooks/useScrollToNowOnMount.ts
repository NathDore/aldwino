import { useLayoutEffect, type RefObject } from "react";
import { minutesToPx, type RowLayout } from "./useRowLayout";

const COMFORTABLE_VIEWPORT_FRACTION = 1 / 3;

function getNowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

interface UseScrollToNowOnMountOptions {
  headerRef: RefObject<HTMLDivElement | null>;
  bodyRef: RefObject<HTMLDivElement | null>;
  rowLayout: RowLayout;
  enabled: boolean;
}

export function useScrollToNowOnMount({ headerRef, bodyRef, rowLayout, enabled }: UseScrollToNowOnMountOptions) {
  useLayoutEffect(() => {
    if (!enabled) return;
    const headerEl = headerRef.current;
    const bodyEl = bodyRef.current;
    if (!headerEl || !bodyEl) return;

    const stickyTop = parseFloat(getComputedStyle(headerEl).top) || 0;
    const stickyZoneHeight = stickyTop + headerEl.offsetHeight;

    const nowOffsetWithinBody = minutesToPx(getNowMinutes(), rowLayout);
    const nowAbsoluteY = bodyEl.getBoundingClientRect().top + window.scrollY + nowOffsetWithinBody;

    const visibleContentHeight = Math.max(window.innerHeight - stickyZoneHeight, 0);
    const desiredOffsetWithinViewport = stickyZoneHeight + visibleContentHeight * COMFORTABLE_VIEWPORT_FRACTION;

    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    const target = Math.min(Math.max(nowAbsoluteY - desiredOffsetWithinViewport, 0), maxScroll);

    window.scrollTo({ top: target, behavior: "auto" });
  }, []);
}
