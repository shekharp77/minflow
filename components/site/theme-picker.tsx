"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/registry/minflow/ui/button";
import { fadeScale } from "@/lib/motion";
import { startThemeTransition } from "@/lib/theme";
import {
  applyPaletteCss,
  buildPaletteCss,
  DEFAULT_PALETTE,
  PALETTE_SLOTS,
  PALETTE_STORAGE_KEY,
  PALETTE_STYLE_ID,
  type SlotKey,
} from "@/lib/palette";

/*
 * Live theming for the token layer. The user supplies the five palette slots
 * and the dark theme is derived from them; the compiler in lib/palette emits
 * colour only, so a palette can never disturb the site's typography.
 *
 * Restoring a saved palette is not this component's job: it lives in a popover
 * and would only run on the loads where a user happened to open that popover.
 * ThemeScript does it before first paint instead.
 */
export function ThemePicker() {
  const [colors, setColors] =
    React.useState<Record<SlotKey, string>>(DEFAULT_PALETTE);
  const customized = PALETTE_SLOTS.some(
    ({ key }) => colors[key] !== DEFAULT_PALETTE[key]
  );

  /* Adopt whatever ThemeScript already applied, so the swatches match the page. */
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(PALETTE_STORAGE_KEY);
      if (stored) setColors({ ...DEFAULT_PALETTE, ...JSON.parse(stored) });
    } catch {}
  }, []);

  const update = (key: SlotKey, value: string) => {
    const next = { ...colors, [key]: value };
    setColors(next);
    applyPaletteCss(buildPaletteCss(next));
    try {
      localStorage.setItem(PALETTE_STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const reset = () => {
    startThemeTransition();
    setColors(DEFAULT_PALETTE);
    document.getElementById(PALETTE_STYLE_ID)?.remove();
    try {
      localStorage.removeItem(PALETTE_STORAGE_KEY);
    } catch {}
  };

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
      {PALETTE_SLOTS.map(({ key, label }) => (
        <label
          key={key}
          className="flex cursor-pointer items-center gap-2.5 text-body text-text-2"
        >
          <input
            type="color"
            value={colors[key]}
            onChange={(event) => update(key, event.target.value)}
            aria-label={label}
            className="size-7 appearance-none rounded-full border border-border-strong bg-transparent p-0 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0"
          />
          {label}
        </label>
      ))}
      <AnimatePresence initial={false}>
        {customized && (
          <motion.span
            key="reset"
            variants={fadeScale}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Button onClick={reset}>Reset</Button>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
