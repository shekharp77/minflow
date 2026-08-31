"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { CodeXml, Moon, Palette, Sun, Zap, ZapOff } from "lucide-react";
import { IconButton } from "@/registry/minflow/ui/icon-button";
import { IconSwap } from "@/registry/minflow/ui/icon-swap";
import { Popover } from "@/registry/minflow/ui/popover";
import { Tooltip } from "@/registry/minflow/ui/tooltip";
import { ThemePicker } from "@/components/site/theme-picker";
import { useMotionSetting, useTheme } from "@/lib/theme";
import { morph } from "@/lib/motion";
import { REPO_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

/*
 * Sticky chrome: wordmark, the top-level destinations, and the theming
 * controls. The order is the reading order: understand the system, install it,
 * then browse its parts.
 */
const NAV = [
  { href: "/introduction", label: "Introduction" },
  { href: "/installation", label: "Install" },
  { href: "/#components", label: "Components" },
];

export function SiteHeader() {
  const { dark, toggle: toggleTheme } = useTheme();
  const { enabled: motionOn, toggle: toggleMotion } = useMotionSetting();
  const pathname = usePathname();

  /* Each guide marks itself; everything else counts as Components. */
  const isActive = (href: string) =>
    href.startsWith("/#")
      ? pathname !== "/introduction" && pathname !== "/installation"
      : pathname === href;

  return (
    <header className="sticky top-0 z-header bg-bg/85 backdrop-blur">
      {/*
        * The gap tightens on narrow viewports: at 390px the wordmark, both
        * destinations and three 40px controls do not fit at the desktop gap,
        * and the control cluster ends up sitting on top of the nav.
        */}
      <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-3 px-4 sm:gap-8 sm:px-6">
        {/*
          * The name is two ideas -- min (the restraint) and flow (the motion)
          * -- so the mark carries the seam as a tonal step rather than a
          * second colour. Hovering resolves the halves into one word, which is
          * the whole thesis in one 150ms colour change. No transform, so it
          * needs no hover-capability gate and nothing moves under a reader who
          * asked for less motion.
          */}
        <Link
          href="/"
          className="group shrink-0 font-display text-section font-bold text-text outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          min
          <span className="text-text-2 transition-colors duration-150 group-hover:text-text">
            flow
          </span>
        </Link>

        <nav
          aria-label="Main"
          className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ul className="flex items-center gap-1">
            {NAV.map((item) => {
              const on = isActive(item.href);
              return (
                <li key={item.href} className="relative shrink-0">
                  <Link
                    href={item.href}
                    aria-current={on ? "page" : undefined}
                    className={cn(
                      "flex h-8 items-center whitespace-nowrap rounded-control px-2 text-body outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
                      on ? "text-text" : "text-text-2 hover:text-text"
                    )}
                  >
                    {item.label}
                  </Link>
                  {on && (
                    <motion.span
                      aria-hidden
                      layoutId="nav-ink"
                      transition={morph}
                      className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-accent"
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center">
          {/*
            * An anchor rather than IconButton, which renders a hardcoded
            * <button>. A repo link has to be a real anchor so it is crawlable
            * and opens in a new tab on the usual gestures; the class recipe is
            * IconButton's, kept in step by hand because the library has no
            * icon-link variant yet.
            */}
          <Tooltip label="Source on GitHub">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Source on GitHub"
              className="inline-flex size-10 items-center justify-center rounded-control text-fg-2 outline-none transition-colors duration-150 hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&_svg]:size-4 [&_svg]:shrink-0"
            >
              <CodeXml />
            </a>
          </Tooltip>
          <Popover
            align="end"
            className="w-auto"
            trigger={
              <IconButton label="Theme colors">
                <Palette />
              </IconButton>
            }
          >
            <p className="text-caption font-medium uppercase tracking-[0.08em] text-text-2">
              Palette
            </p>
            <div className="mt-3">
              <ThemePicker />
            </div>
          </Popover>
          <IconButton
            label={motionOn === false ? "Enable motion" : "Reduce motion"}
            onClick={toggleMotion}
          >
            <IconSwap id={motionOn === false ? "off" : "on"}>
              {motionOn === false ? <ZapOff /> : <Zap />}
            </IconSwap>
          </IconButton>
          <IconButton
            label={dark ? "Light theme" : "Dark theme"}
            onClick={toggleTheme}
          >
            <IconSwap id={dark ? "dark" : "light"}>
              {dark ? <Sun /> : <Moon />}
            </IconSwap>
          </IconButton>
        </div>
      </div>
    </header>
  );
}
