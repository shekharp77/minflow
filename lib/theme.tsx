"use client";

import Script from "next/script";
import { useCallback, useEffect, useState } from "react";
import {
  buildPaletteCss,
  PALETTE_STORAGE_KEY,
  PALETTE_STYLE_ID,
} from "@/lib/palette";

const THEME_KEY = "mf-theme";
const MOTION_KEY = "mf-motion";

/*
 * Runs before hydration: system preference is the default, a persisted choice
 * wins. Also restores the app-level "reduce motion" switch and any custom
 * palette.
 *
 * The palette has to be restored here rather than in the picker, because the
 * picker lives inside a popover and only mounts once that popover is opened,
 * so an effect there would never run on a normal page load. Doing it here also
 * means the saved colours are in place before first paint instead of flashing
 * the defaults. `buildPaletteCss` is serialised in so the boot path and the
 * live picker cannot drift apart.
 */
export function ThemeScript() {
  const js = `(function(){try{
var t=localStorage.getItem("${THEME_KEY}");
var dark=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;
document.documentElement.classList.toggle("dark",dark);
if(localStorage.getItem("${MOTION_KEY}")==="off"){document.documentElement.setAttribute("data-motion","off");}
var p=localStorage.getItem("${PALETTE_STORAGE_KEY}");
if(p){var build=${buildPaletteCss.toString()};var s=document.createElement("style");s.id="${PALETTE_STYLE_ID}";s.textContent=build(JSON.parse(p));document.head.appendChild(s);}
}catch(e){}})();`;
  return (
    <Script id="mf-theme-init" strategy="beforeInteractive">
      {js}
    </Script>
  );
}

/*
 * Briefly enables color transitions on everything so a palette flip
 * crossfades instead of hard-cutting. Removed after the tween completes.
 */
let transitionTimer: number | undefined;

export function startThemeTransition() {
  const el = document.documentElement;
  el.classList.add("theme-transition");
  window.clearTimeout(transitionTimer);
  transitionTimer = window.setTimeout(
    () => el.classList.remove("theme-transition"),
    450
  );
}

export function useTheme() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = useCallback(() => {
    startThemeTransition();
    const el = document.documentElement;
    const next = !el.classList.contains("dark");
    el.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {}
    setDark(next);
  }, []);

  return { dark, toggle };
}

export function useMotionSetting() {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    setEnabled(document.documentElement.getAttribute("data-motion") !== "off");
  }, []);

  const toggle = useCallback(() => {
    const el = document.documentElement;
    const next = el.getAttribute("data-motion") === "off";
    if (next) {
      el.removeAttribute("data-motion");
    } else {
      el.setAttribute("data-motion", "off");
    }
    try {
      localStorage.setItem(MOTION_KEY, next ? "on" : "off");
    } catch {}
    setEnabled(next);
  }, []);

  return { enabled, toggle };
}
