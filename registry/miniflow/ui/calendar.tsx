"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Popover } from "@/components/ui/popover";
import {
  FieldBoundary,
  FieldChevron,
  FieldValue,
  fieldBoxRow,
} from "@/registry/miniflow/ui/field";
import { enter } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Calendar picker: months slide horizontally in the direction of travel,
 * the chosen day fills in ink. Weeks start Monday. The date picker wraps
 * it in a popover behind an input-like trigger.
 */
export interface CalendarProps {
  value?: Date | null;
  onChange?: (date: Date) => void;
  className?: string;
}

const DAY_NAMES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function monthLabel(d: Date) {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(d);
}

function sameDay(a: Date | null | undefined, b: Date) {
  return (
    !!a &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function Calendar({ value, onChange, className }: CalendarProps) {
  const [month, setMonth] = React.useState(() => {
    const base = value ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [dir, setDir] = React.useState(1);
  const today = new Date();

  const move = (delta: number) => {
    setDir(delta);
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  };

  const firstOffset = (month.getDay() + 6) % 7;
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0
  ).getDate();
  const cells: Array<number | null> = [
    ...Array.from({ length: firstOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className={cn("w-64 select-none", className)}>
      <div className="flex items-center justify-between">
        <span className="pl-1 text-body font-medium text-text">
          {monthLabel(month)}
        </span>
        <span className="flex items-center">
          <IconButton label="Previous month" className="size-8" onClick={() => move(-1)}>
            <ChevronLeft />
          </IconButton>
          <IconButton label="Next month" className="size-8" onClick={() => move(1)}>
            <ChevronRight />
          </IconButton>
        </span>
      </div>
      <div className="mt-2 grid grid-cols-7 text-center">
        {DAY_NAMES.map((d) => (
          <span key={d} className="py-1 text-caption text-text-2">
            {d}
          </span>
        ))}
      </div>
      <div className="relative overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={`${month.getFullYear()}-${month.getMonth()}`}
            initial={{ x: dir * 32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: dir * -32, opacity: 0 }}
            transition={enter}
            className="grid grid-cols-7"
          >
            {cells.map((day, i) =>
              day === null ? (
                <span key={`b${i}`} />
              ) : (
                <button
                  key={day}
                  type="button"
                  onClick={() =>
                    onChange?.(
                      new Date(month.getFullYear(), month.getMonth(), day)
                    )
                  }
                  className={cn(
                    "mx-auto flex size-8 items-center justify-center rounded-full text-body outline-none transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
                    sameDay(value, new Date(month.getFullYear(), month.getMonth(), day))
                      ? "bg-fg font-medium text-bg"
                      : cn(
                          "text-text hover:bg-hover",
                          sameDay(today, new Date(month.getFullYear(), month.getMonth(), day)) &&
                            "font-semibold text-accent"
                        )
                  )}
                >
                  {day}
                </button>
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export interface DatePickerProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  value,
  defaultValue,
  onChange,
  placeholder = "Pick a date",
  className,
}: DatePickerProps) {
  const [internal, setInternal] = React.useState<Date | null>(
    defaultValue ?? null
  );
  const isControlled = value !== undefined;
  const date = isControlled ? value : internal;
  const [open, setOpen] = React.useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      className="w-auto p-3"
      trigger={
        <button
          type="button"
          className={cn(fieldBoxRow, "w-44 border border-border", className)}
        >
          <FieldValue filled={!!date}>
            {date
              ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date)
              : placeholder}
          </FieldValue>
          <FieldChevron open={open} />
          <FieldBoundary active={open} />
        </button>
      }
    >
      <Calendar
        value={date}
        onChange={(d) => {
          if (!isControlled) setInternal(d);
          onChange?.(d);
          setOpen(false);
        }}
      />
    </Popover>
  );
}
