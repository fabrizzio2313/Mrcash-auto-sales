"use client";

import { useEffect, useRef, useState } from "react";

type Status = "idle" | "loading" | "ready" | "failed";

/**
 * The animated 3D car in the home hero.
 *
 * Kept off the critical path: Three.js and the model are only fetched on the
 * client, after the page is idle and once the hero is near the viewport, so
 * they never delay the headline (LCP). Rendering pauses while it's scrolled
 * out of view, and the whole thing quietly disappears if WebGL is missing or
 * the model fails to load.
 *
 * It also conducts the hero headline: the words stay masked while the car
 * drifts in and rise the moment it comes to rest (see heroIntro below).
 */
export default function HeroCar({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cancelled = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const intro = heroIntro(el, reducedMotion);
    let handle: import("@/lib/heroCarScene").HeroCarHandle | null = null;
    let inView = false;
    let idleId: number | null = null;

    const start = async () => {
      if (!supportsWebGL()) {
        intro.release();
        return setStatus("failed");
      }
      setStatus("loading");
      const { mountHeroCar } = await import("@/lib/heroCarScene");
      if (cancelled) return;
      handle = mountHeroCar(el, {
        // Narrow or touch-first screens get the lighter model and no reflection.
        lite: window.matchMedia("(max-width: 1023px), (pointer: coarse)").matches,
        reducedMotion,
        onLoaded: () => {
          intro.carArrived();
          if (!cancelled) setStatus("ready");
        },
        onStop: intro.release,
        onError: () => {
          intro.release();
          if (!cancelled) setStatus("failed");
        },
      });
      handle.setVisible(inView);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (handle) {
          handle.setVisible(inView);
        } else if (inView && idleId === null) {
          idleId = onIdle(() =>
            void start().catch(() => {
              intro.release();
              if (!cancelled) setStatus("failed");
            }),
          );
        }
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (idleId !== null) cancelIdle(idleId);
      handle?.dispose();
      intro.release(); // never leave the headline hidden
    };
  }, []);

  if (status === "failed") return null;

  return (
    <div ref={ref} className={className} aria-hidden="true">
      {status !== "ready" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-amber-400 motion-reduce:animate-none" />
        </div>
      )}
    </div>
  );
}

/** How long the headline waits for the car to show up before revealing anyway. */
const CAR_WAIT_MS = 1800;

/**
 * Takes over the headline reveal from the CSS fallback (data-hero-intro on
 * the hero section; see globals.css) and holds the words hidden until
 * release() — called when the car stops, or when it's clearly not coming.
 */
function heroIntro(el: HTMLElement, reducedMotion: boolean) {
  const section = el.closest<HTMLElement>("[data-hero-intro]");
  const noop = { carArrived() {}, release() {} };
  if (!section || reducedMotion || section.dataset.heroIntro !== "pending") return noop;

  // Only take over while the CSS fallback is still in its delay; if the
  // page hydrated late and the words are already rising, leave them be.
  const fallback = section.querySelector(".hero-line > span")?.getAnimations?.()[0];
  const t = fallback?.currentTime;
  if (typeof t !== "number" || t > 2000) return noop;

  section.dataset.heroIntro = "hold";
  const release = () => {
    clearTimeout(timer);
    if (section.dataset.heroIntro === "hold") section.dataset.heroIntro = "go";
  };
  const timer = window.setTimeout(release, CAR_WAIT_MS);
  return {
    /** The car is loaded and about to drive in: wait for it to stop. */
    carArrived: () => clearTimeout(timer),
    release,
  };
}

function supportsWebGL() {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    // Free the probe context right away; browsers cap how many can exist.
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

function onIdle(cb: () => void): number {
  if ("requestIdleCallback" in window) return window.requestIdleCallback(cb, { timeout: 1500 });
  return globalThis.setTimeout(cb, 300) as unknown as number;
}

function cancelIdle(id: number) {
  if ("cancelIdleCallback" in window) window.cancelIdleCallback(id);
  else globalThis.clearTimeout(id);
}
