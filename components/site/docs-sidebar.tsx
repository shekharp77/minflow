"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { CATEGORIES, COMPONENTS } from "@/lib/catalog";
import { morph } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Docs navigation: introduction and installation first, then every component
 * grouped by category. The active row is marked with an accent rail that
 * slides between entries rather than a filled block, so the list stays quiet
 * while still saying exactly where you are.
 */
const GUIDES = [
  { href: "/introduction", label: "Introduction" },
  { href: "/installation", label: "Installation" },
];

function Row({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex h-8 items-center rounded-control pl-3 pr-2 text-body outline-none transition-colors duration-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
        active ? "font-medium text-text" : "text-text-2 hover:text-text"
      )}
    >
      {active && (
        <motion.span
          aria-hidden
          layoutId="docs-rail"
          transition={morph}
          className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-accent"
        />
      )}
      {label}
    </Link>
  );
}

export function DocsSidebar() {
  return (
    <nav aria-label="Documentation" className="flex flex-col gap-8">
      <div className="flex flex-col">
        {GUIDES.map((g) => (
          <Row key={g.href} {...g} />
        ))}
      </div>

      {CATEGORIES.map((category) => {
        const items = COMPONENTS.filter((c) => c.category === category);
        if (!items.length) return null;
        return (
          <div key={category} className="flex flex-col">
            <h2 className="mb-2 pl-3 text-caption font-medium uppercase tracking-[0.08em] text-text-2">
              {category}
            </h2>
            {items.map((c) => (
              <Row key={c.slug} href={`/${c.slug}`} label={c.name} />
            ))}
          </div>
        );
      })}
    </nav>
  );
}
