"use client";

import * as React from "react";
import { motion } from "motion/react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  cascade,
  durations,
  easeSoft,
  fadeRise,
  useMotionEnabled,
} from "@/lib/motion";

/*
 * Tabular data without the table.
 *
 * No borders, no zebra striping, no outer box: alignment is what makes a
 * column a column, and once the columns line up the rules are redundant. That
 * is why the numeric columns are tabular and right aligned - that alignment is
 * carrying the work the gridlines used to do.
 *
 * Sorting animates by row identity, so a re-sort is rows travelling to new
 * places rather than the whole block redrawing.
 */
export interface Column<T> {
  id: string;
  header: string;
  /** Right aligns and renders in tabular figures. */
  numeric?: boolean;
  sortable?: boolean;
  render: (row: T) => React.ReactNode;
  /** Value used when this column is sorted. Defaults to `render`'s output. */
  sortValue?: (row: T) => string | number;
}

export interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  rows: T[];
  caption?: string;
  /** Column id to sort by initially. */
  defaultSort?: string;
  onRowSelect?: (row: T) => void;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  caption,
  defaultSort,
  onRowSelect,
  className,
}: DataTableProps<T>) {
  const motionOn = useMotionEnabled();
  const [sort, setSort] = React.useState<{ id: string; dir: 1 | -1 } | null>(
    defaultSort ? { id: defaultSort, dir: 1 } : null
  );

  const sorted = React.useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.id === sort.id);
    if (!col?.sortValue) return rows;
    return [...rows].sort((a, b) => {
      const x = col.sortValue!(a);
      const y = col.sortValue!(b);
      if (x === y) return 0;
      return (x < y ? -1 : 1) * sort.dir;
    });
  }, [rows, sort, columns]);

  const toggle = (id: string) =>
    setSort((s) =>
      s?.id === id ? { id, dir: s.dir === 1 ? -1 : 1 } : { id, dir: 1 }
    );

  const grid = {
    gridTemplateColumns: columns
      .map((c) => (c.numeric ? "minmax(4rem, max-content)" : "minmax(6rem, 1fr)"))
      .join(" "),
  };

  return (
    <div className={cn("w-full min-w-0 overflow-x-auto", className)}>
      <div role="table" aria-label={caption} className="min-w-max">
        {caption ? (
          <p className="mb-3 px-2 text-caption text-text-2">{caption}</p>
        ) : null}

        <div role="row" style={grid} className="grid items-center gap-x-6 px-2 pb-2">
          {columns.map((col) => (
            <div
              key={col.id}
              role="columnheader"
              aria-sort={
                sort?.id === col.id
                  ? sort.dir === 1
                    ? "ascending"
                    : "descending"
                  : col.sortable
                    ? "none"
                    : undefined
              }
              className={cn("min-w-0", col.numeric && "text-right")}
            >
              {col.sortable ? (
                <button
                  type="button"
                  onClick={() => toggle(col.id)}
                  className={cn(
                    "inline-flex items-center gap-1 text-caption font-medium uppercase tracking-[0.08em] outline-none transition-colors duration-200 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    sort?.id === col.id ? "text-text" : "text-text-2"
                  )}
                >
                  {col.header}
                  {/* The caret rotates between directions instead of swapping,
                      so "sorted the other way" is one continuous idea. */}
                  <motion.span
                    aria-hidden
                    /* Which way the caret points is the sort direction, so it
                       is stated with motion off too - only the turn is animated. */
                    animate={{
                      rotate: sort?.id === col.id && sort.dir === -1 ? 180 : 0,
                      opacity: sort?.id === col.id ? 1 : 0,
                    }}
                    transition={{ duration: motionOn ? durations.micro : 0, ease: easeSoft }}
                    className="flex [&_svg]:size-3.5"
                  >
                    <ChevronUp />
                  </motion.span>
                </button>
              ) : (
                <span
                  className={cn(
                    "text-caption font-medium uppercase tracking-[0.08em] text-text-2"
                  )}
                >
                  {col.header}
                </span>
              )}
            </div>
          ))}
        </div>

        <motion.div
          role="rowgroup"
          variants={cascade(0.04)}
          initial={motionOn ? "hidden" : false}
          animate="visible"
          transition={motionOn ? undefined : { duration: 0 }}
        >
          {sorted.map((row) => (
            <motion.div
              key={row.id}
              role="row"
              layout={motionOn ? "position" : false}
              variants={fadeRise}
              transition={{ duration: durations.view, ease: easeSoft }}
              style={grid}
              onClick={onRowSelect ? () => onRowSelect(row) : undefined}
              tabIndex={onRowSelect ? 0 : undefined}
              onKeyDown={
                onRowSelect
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowSelect(row);
                      }
                    }
                  : undefined
              }
              className={cn(
                "grid items-center gap-x-6 rounded-control px-2 py-2.5 text-body outline-none transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                onRowSelect && "cursor-pointer hover:bg-hover"
              )}
            >
              {columns.map((col) => (
                <div
                  key={col.id}
                  role="cell"
                  className={cn(
                    "min-w-0 truncate",
                    col.numeric ? "text-right tabular-nums text-text-2" : "text-text"
                  )}
                >
                  {col.render(row)}
                </div>
              ))}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
