"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Moon, Palette, Sun, Zap, ZapOff } from "lucide-react";
import { IconButton } from "@/registry/miniflow/ui/icon-button";
import { IconSwap } from "@/registry/miniflow/ui/icon-swap";
import { Popover } from "@/registry/miniflow/ui/popover";
import { ThemePicker } from "@/components/site/theme-picker";
import { useMotionSetting, useTheme } from "@/lib/theme";
import { morph } from "@/lib/motion";
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
    <header className="sticky top-0 z-40 bg-bg/85 backdrop-blur">
      {/*
        * The gap tightens on narrow viewports: at 390px the wordmark, both
        * destinations and three 40px controls do not fit at the desktop gap,
        * and the control cluster ends up sitting on top of the nav.
        */}
      <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-3 px-4 sm:gap-8 sm:px-6">
        <Link
          href="/"
          className="shrink-0 font-display text-section font-bold text-text outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          miniflow
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
                      "flex h-8 items-center whitespace-nowrap rounded-control px-2 text-body outline-none transition-colors duration-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
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
