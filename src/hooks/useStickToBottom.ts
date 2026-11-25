'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const THRESHOLD_PX = 72;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Keep a scroll container pinned to its bottom while content grows
 * (streamed tokens, cards, images loading) — but only while the user is
 * already at the bottom. Scrolling up detaches; `jumpToLatest` re-attaches.
 *
 * A ResizeObserver on the content element catches every height change,
 * including async image loads that never touch React state.
 *
 * Returns callback refs so it works when the containers mount late.
 */
export function useStickToBottom() {
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);
  const [contentEl, setContentEl] = useState<HTMLElement | null>(null);
  const scrollElRef = useRef<HTMLElement | null>(null);
  scrollElRef.current = scrollEl;
  const [atBottom, setAtBottom] = useState(true);
  const stickRef = useRef(true);
  /** Ignore scroll events we caused ourselves. */
  const programmaticRef = useRef(false);

  const scrollToBottom = useCallback(
    (smooth: boolean) => {
      const el = scrollElRef.current;
      if (!el) return;
      programmaticRef.current = true;
      el.scrollTo({ top: el.scrollHeight, behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto' });
      // Release on the next frame (instant) or after the smooth scroll settles.
      window.setTimeout(() => {
        programmaticRef.current = false;
      }, smooth ? 400 : 50);
    },
    [],
  );

  useEffect(() => {
    const el = scrollEl;
    if (!el) return;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      const bottom = distance <= THRESHOLD_PX;
      if (programmaticRef.current && !bottom) return;
      stickRef.current = bottom;
      setAtBottom(bottom);
    };
    // A wheel/touch/key gesture upward always wins over auto-follow.
    const onUserIntent = () => {
      programmaticRef.current = false;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('wheel', onUserIntent, { passive: true });
    el.addEventListener('touchstart', onUserIntent, { passive: true });
    el.addEventListener('keydown', onUserIntent);
    return () => {
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('wheel', onUserIntent);
      el.removeEventListener('touchstart', onUserIntent);
      el.removeEventListener('keydown', onUserIntent);
    };
  }, [scrollEl]);

  useEffect(() => {
    const content = contentEl;
    if (!content || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      if (stickRef.current) scrollToBottom(false);
    });
    ro.observe(content);
    return () => ro.disconnect();
  }, [contentEl, scrollToBottom]);

  /** Re-attach and scroll to the newest message. */
  const jumpToLatest = useCallback(() => {
    stickRef.current = true;
    setAtBottom(true);
    scrollToBottom(true);
  }, [scrollToBottom]);

  /** Re-attach without animation (e.g. right after the user sends). */
  const stick = useCallback(() => {
    stickRef.current = true;
    setAtBottom(true);
    scrollToBottom(false);
  }, [scrollToBottom]);

  return { scrollRef: setScrollEl, contentRef: setContentEl, atBottom, jumpToLatest, stick };
}
