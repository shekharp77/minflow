/*
 * The custom palette layer: five user-set colour slots compiled into a token
 * override that both the pre-hydration boot script and the live picker use.
 *
 * One rule governs this file: it emits COLOUR AND NOTHING ELSE. The property
 * list below is the whole contract, so no palette a user picks can ever reach
 * typography, spacing, radii, or motion. Theming the colours must never
 * restyle the site's fonts, and the only way to guarantee that is for the
 * generator to be structurally incapable of writing a font declaration.
 */

export const PALETTE_STORAGE_KEY = "mf-theme-custom";
export const PALETTE_STYLE_ID = "mf-theme-custom";

export type SlotKey = "bg" | "fg" | "bg2" | "fg2" | "accent";

export const DEFAULT_PALETTE: Record<SlotKey, string> = {
  bg: "#ffffff",
  fg: "#0f1011",
  bg2: "#f7f8f8",
  fg2: "#6b6f76",
  accent: "#5e6ad2",
};

export const PALETTE_SLOTS: Array<{ key: SlotKey; label: string }> = [
  { key: "bg", label: "Primary bg" },
  { key: "fg", label: "Primary foreground" },
  { key: "bg2", label: "Secondary bg" },
  { key: "fg2", label: "Secondary foreground" },
  { key: "accent", label: "Accent" },
];

/**
 * Compile the five slots into `:root` and `.dark` colour overrides. Dark is
 * derived in oklch (flip lightness, keep hue, de-glow chroma).
 *
 * Deliberately self-contained, with its helpers nested rather than imported:
 * it is serialised with `toString()` into the pre-hydration boot script, so it
 * cannot reference anything in module scope. That is also what keeps the boot
 * script and the live picker from drifting apart, since both run this exact
 * function.
 */
export function buildPaletteCss(c: Record<SlotKey, string>): string {
  const luminance = (hex: string): number => {
    const n = parseInt(hex.slice(1), 16);
    const channel = (v: number) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return (
      0.2126 * channel((n >> 16) & 255) +
      0.7152 * channel((n >> 8) & 255) +
      0.0722 * channel(n & 255)
    );
  };

  const contrast = (a: string, b: string): number => {
    const l1 = luminance(a);
    const l2 = luminance(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  /* --on-accent: the page bg or white, whichever reads better on the accent */
  const onAccent =
    contrast(c.bg, c.accent) >= contrast("#ffffff", c.accent) ? c.bg : "#ffffff";

  return [
    ":root {",
    `  --bg: ${c.bg};`,
    `  --bg-2: ${c.bg2};`,
    `  --fg: ${c.fg};`,
    `  --fg-2: ${c.fg2};`,
    `  --text: ${c.fg};`,
    `  --text-2: ${c.fg2};`,
    `  --accent: ${c.accent};`,
    `  --on-accent: ${onAccent};`,
    "}",
    ".dark {",
    `  --bg: oklch(from ${c.bg} 0.13 c h);`,
    `  --bg-2: oklch(from ${c.bg2} 0.17 c h);`,
    `  --fg: oklch(from ${c.fg} 0.95 calc(c * 0.9) h);`,
    `  --fg-2: oklch(from ${c.fg2} 0.72 c h);`,
    `  --text: oklch(from ${c.fg} 0.95 calc(c * 0.9) h);`,
    `  --text-2: oklch(from ${c.fg2} 0.65 c h);`,
    `  --accent: oklch(from ${c.accent} 0.68 calc(c * 0.9) h);`,
    `  --on-accent: oklch(from ${c.bg} 0.13 c h);`,
    "}",
  ].join("\n");
}

export function applyPaletteCss(css: string) {
  let node = document.getElementById(PALETTE_STYLE_ID);
  if (!node) {
    node = document.createElement("style");
    node.id = PALETTE_STYLE_ID;
    document.head.appendChild(node);
  }
  node.textContent = css;
}
