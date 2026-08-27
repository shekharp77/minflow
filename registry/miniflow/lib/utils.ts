import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/*
 * miniflow's font-size tokens (text-body) and color tokens (text-text-2)
 * share the text-* prefix. Without this, tailwind-merge treats them as the
 * same group and silently drops one when a component sets both.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["caption", "body", "emphasis", "section", "title", "display"] },
      ],
      "text-color": [
        {
          text: [
            "bg",
            "bg-2",
            "fg",
            "fg-2",
            "text",
            "text-2",
            "accent",
            "on-accent",
            "border",
            "border-strong",
            "hover",
            "ok",
            "warn",
            "err",
            "id-1",
            "id-2",
            "id-3",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
