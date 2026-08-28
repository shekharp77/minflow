"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/registry/miniflow/ui/button";
import { Checkbox } from "@/registry/miniflow/ui/checkbox";
import { IconButton } from "@/registry/miniflow/ui/icon-button";
import { Popover } from "@/registry/miniflow/ui/popover";
import { Portal, useDismiss } from "@/registry/miniflow/ui/overlay";
import { Segmented } from "@/registry/miniflow/ui/segmented";
import {
  cascade,
  enter,
  exit,
  fadeRise,
  morph,
  roll,
  useMotionEnabled,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * The scheduling calendar: seven projections of one set of events.
 *
 * Every view here is the same data on a different coordinate system, which is
 * why there is one time-grid rather than three. Week, day and resource-day all
 * hand `TimeGrid` a different set of columns; the timeline is that same grid
 * turned on its side. Month and year work in whole days and skip it entirely.
 *
 * Two rules of the design language get argued with on a calendar, so both are
 * settled here once:
 *
 * - Calendars and resources are told apart by a glyph, never by a colour
 *   swatch. Position already says which resource a row belongs to, and an icon
 *   survives dark mode, printing, and colour blindness in a way a dot does not.
 * - Hour rules exist because a time is read off them, which makes them the
 *   axis of a chart rather than decoration. They stay at the hairline token and
 *   go no darker. The month grid, which nobody measures against, has none.
 *
 * The one accent in the view is spent on now: the current time line and the
 * marker on today. Nothing else competes for it.
 */

export interface CalendarResource {
  id: string;
  name: string;
  /** Short qualifier under the name, e.g. a room's capacity or a role. */
  detail?: string;
  /** Identity glyph. Resources are told apart by icon, never by colour. */
  icon: LucideIcon;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  /** Sits in the pinned row above the hour grid rather than on the axis. */
  allDay?: boolean;
  resourceId?: string;
  location?: string;
}

export type CalendarViewId =
  | "day"
  | "week"
  | "month"
  | "year"
  | "agenda"
  | "timeline"
  | "resources";

/* ------------------------------------------------------------------ dates */

const MS_MINUTE = 60_000;
const MINUTES_PER_DAY = 1440;
/** Monday. Matches the existing month picker, and most of the world. */
const WEEK_STARTS_ON = 1;

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, n: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

export function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function startOfWeek(d: Date) {
  const day = (d.getDay() - WEEK_STARTS_ON + 7) % 7;
  return addDays(startOfDay(d), -day);
}

function sameDay(a: Date | null | undefined, b: Date | null | undefined) {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Minutes from midnight, clamped into the day so a spill-over still draws. */
function minutesInto(d: Date, day: Date) {
  const delta = (d.getTime() - startOfDay(day).getTime()) / MS_MINUTE;
  return Math.max(0, Math.min(MINUTES_PER_DAY, delta));
}

function eachDay(start: Date, count: number) {
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}

const fmt = {
  monthYear: new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }),
  monthShort: new Intl.DateTimeFormat("en", { month: "short" }),
  monthLong: new Intl.DateTimeFormat("en", { month: "long" }),
  weekdayShort: new Intl.DateTimeFormat("en", { weekday: "short" }),
  weekdayLong: new Intl.DateTimeFormat("en", { weekday: "long" }),
  dayMonth: new Intl.DateTimeFormat("en", { day: "numeric", month: "long" }),
};

/**
 * The now marker, in the hour gutter's width.
 *
 * No meridiem: "1:36 am" does not fit the gutter and wraps onto a second
 * line, which reads as two labels. The hour labels above and below it already
 * say which half of the day this is.
 */
function clockBare(d: Date) {
  const h = d.getHours() % 12 === 0 ? 12 : d.getHours() % 12;
  return `${h}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Compact clock: the minutes only appear when they are not zero. */
function clock(d: Date) {
  const h = d.getHours();
  const m = d.getMinutes();
  const suffix = h < 12 ? "am" : "pm";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour} ${suffix}` : `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

/* ------------------------------------------------------------------ ranges */

interface CalendarRange {
  /** Inclusive first day drawn. */
  start: Date;
  /** Exclusive last day drawn. */
  end: Date;
  /** The days a column-based view draws. Empty for month and year. */
  days: Date[];
  title: string;
}

function rangeFor(view: CalendarViewId, cursor: Date): CalendarRange {
  const day = startOfDay(cursor);

  if (view === "year") {
    const start = new Date(cursor.getFullYear(), 0, 1);
    return {
      start,
      end: new Date(cursor.getFullYear() + 1, 0, 1),
      days: [],
      title: String(cursor.getFullYear()),
    };
  }

  if (view === "month") {
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    return {
      start,
      end: addMonths(start, 1),
      days: [],
      title: fmt.monthYear.format(start),
    };
  }

  if (view === "week" || view === "agenda") {
    const start = startOfWeek(day);
    const last = addDays(start, 6);
    const sameMonth = start.getMonth() === last.getMonth();
    return {
      start,
      end: addDays(start, 7),
      days: eachDay(start, 7),
      title: sameMonth
        ? `${start.getDate()} to ${last.getDate()} ${fmt.monthYear.format(start)}`
        : `${start.getDate()} ${fmt.monthShort.format(start)} to ${last.getDate()} ${fmt.monthShort.format(last)}`,
    };
  }

  /* day, timeline and resources all stand on a single day. */
  return {
    start: day,
    end: addDays(day, 1),
    days: [day],
    title: `${fmt.weekdayLong.format(day)} ${fmt.dayMonth.format(day)}`,
  };
}

/** How far one press of the chevrons travels, per view. */
function stepFor(view: CalendarViewId, cursor: Date, dir: number) {
  if (view === "year") return new Date(cursor.getFullYear() + dir, cursor.getMonth(), 1);
  if (view === "month") return addMonths(cursor, dir);
  if (view === "week" || view === "agenda") return addDays(cursor, dir * 7);
  return addDays(cursor, dir);
}

/* ------------------------------------------------------------------ layout */

interface PlacedEvent {
  event: CalendarEvent;
  /** Which of `columns` lanes this event sits in. */
  column: number;
  /** How many lanes its overlap cluster needs. */
  columns: number;
}

/**
 * Side-by-side placement for events that share hours.
 *
 * Events are swept in start order and gathered into clusters of transitively
 * overlapping events. Inside a cluster each event takes the first lane whose
 * last event has already finished, so the cluster ends up as wide as the
 * deepest pile-up and no wider. Everything in one cluster is then given that
 * same width, which is what keeps the columns aligned down the day.
 */
function packOverlaps(events: CalendarEvent[]): PlacedEvent[] {
  const sorted = [...events].sort(
    (a, b) =>
      a.start.getTime() - b.start.getTime() ||
      b.end.getTime() - a.end.getTime()
  );

  const placed: PlacedEvent[] = [];
  let cluster: PlacedEvent[] = [];
  let lanes: number[] = [];
  let clusterEnd = 0;

  const flush = () => {
    const width = lanes.length;
    cluster.forEach((p) => (p.columns = width));
    placed.push(...cluster);
    cluster = [];
    lanes = [];
    clusterEnd = 0;
  };

  for (const event of sorted) {
    /* A gap with nothing running means the previous pile-up is settled. */
    if (cluster.length && event.start.getTime() >= clusterEnd) flush();

    let column = lanes.findIndex((end) => end <= event.start.getTime());
    if (column === -1) {
      column = lanes.length;
      lanes.push(0);
    }
    lanes[column] = event.end.getTime();
    clusterEnd = Math.max(clusterEnd, event.end.getTime());
    cluster.push({ event, column, columns: 1 });
  }
  if (cluster.length) flush();

  return placed;
}

function eventsOn(events: CalendarEvent[], day: Date) {
  const from = startOfDay(day).getTime();
  const to = addDays(startOfDay(day), 1).getTime();
  return events.filter((e) => e.start.getTime() < to && e.end.getTime() > from);
}

function eventsBetween(events: CalendarEvent[], start: Date, end: Date) {
  return events
    .filter((e) => e.start.getTime() < end.getTime() && e.end.getTime() > start.getTime())
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

/* ------------------------------------------------------------------- hooks */

/**
 * The wall clock, resolved after mount and ticked once a minute.
 *
 * Null on the server and on the first client render on purpose: a pre-rendered
 * page would otherwise bake in the build date and disagree with the browser
 * the moment it hydrates. Today's marker and the now line fade in instead.
 */
export function useNow(): Date | null {
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, MS_MINUTE);
    return () => window.clearInterval(id);
  }, []);

  return now;
}

/* ------------------------------------------------------------ event pieces */

/** Opening the inspector needs the element too, so the panel can find it. */
type SelectHandler = (event: CalendarEvent, el: HTMLElement) => void;

interface ChipProps {
  event: CalendarEvent;
  resource?: CalendarResource;
  selected: boolean;
  onSelect: SelectHandler;
}

interface Inspected {
  event: CalendarEvent;
  resource?: CalendarResource;
  rect: DOMRect;
}

const PANEL_W = 232;
const PANEL_H = 168;

/**
 * The one inspector, portalled out of the grid.
 *
 * Anchoring it in place would not survive either of the calendar's own
 * habits: a chip inside the hour grid is absolutely positioned, so a wrapper
 * around it would steal the coordinate system it is placed against, and the
 * grid is a scroller, so an in-flow panel would be clipped by the very box it
 * sits in. It scales out of the chip it belongs to and closes on any scroll,
 * because fixed coordinates go stale the moment the page moves.
 */
function EventInspector({
  state,
  triggerRef,
  onClose,
}: {
  state: Inspected | null;
  triggerRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
}) {
  const motionOk = useMotionEnabled();
  const panelRef = React.useRef<HTMLDivElement>(null);
  useDismiss(!!state, onClose, [panelRef, triggerRef]);

  React.useEffect(() => {
    if (!state) return;
    window.addEventListener("scroll", onClose, true);
    window.addEventListener("resize", onClose);
    return () => {
      window.removeEventListener("scroll", onClose, true);
      window.removeEventListener("resize", onClose);
    };
  }, [state, onClose]);

  const place = () => {
    if (!state) return { left: 0, top: 0 };
    const { rect } = state;
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - PANEL_W - 12));
    const below = rect.bottom + 8;
    const top =
      below + PANEL_H > window.innerHeight - 12
        ? Math.max(12, rect.top - PANEL_H - 8)
        : below;
    return { left, top };
  };

  const Icon = state?.resource?.icon;

  return (
    <Portal>
      <AnimatePresence>
        {state && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-label={state.event.title}
            initial={motionOk ? { opacity: 0, scale: 0.96, y: -4 } : false}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={motionOk ? { opacity: 0, scale: 0.97, y: -2, transition: exit } : undefined}
            transition={motionOk ? enter : { duration: 0 }}
            style={{ ...place(), width: PANEL_W, transformOrigin: "top left" }}
            className="fixed z-anchored rounded-overlay bg-bg-2 p-4 shadow-overlay ring-1 ring-border"
          >
            <motion.div variants={cascade(0.05)} initial={motionOk ? "hidden" : false} animate="visible">
              <motion.p
                variants={fadeRise}
                className="font-display text-section font-bold text-text"
              >
                {state.event.title}
              </motion.p>
              <motion.p variants={fadeRise} className="mt-1 text-body text-text-2">
                {state.event.allDay
                  ? "All day"
                  : `${clock(state.event.start)} to ${clock(state.event.end)}`}
              </motion.p>
              {state.resource && Icon && (
                <motion.p
                  variants={fadeRise}
                  className="mt-3 flex items-center gap-2 text-body text-text-2"
                >
                  <Icon className="size-4 shrink-0 text-fg-2" />
                  {state.resource.name}
                </motion.p>
              )}
              {state.event.location && (
                <motion.p
                  variants={fadeRise}
                  className="mt-1.5 flex items-center gap-2 text-body text-text-2"
                >
                  <MapPin className="size-4 shrink-0 text-fg-2" />
                  {state.event.location}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

/**
 * A block on a time axis. Its height is its duration, which makes it a data
 * mark rather than a container: the fill is what says "this hour is taken".
 */
function TimeChip({
  event,
  resource,
  selected,
  onSelect,
  style,
  height,
}: ChipProps & { style: React.CSSProperties; height: number }) {
  const Icon = resource?.icon;
  const roomy = height >= 36;
  const spacious = height >= 58;

  return (
    <button
      type="button"
      onClick={(e) => onSelect(event, e.currentTarget)}
      style={style}
      className={cn(
        "group/chip absolute overflow-hidden rounded-control px-1.5 text-left outline-none transition-colors duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
        roomy ? "py-1" : "py-0.5",
        /* Ringed in the canvas colour: invisible alone, a clean gap when fanned. */
        "ring-1 ring-bg",
        /*
         * The base is the canvas, not the tint. The hover token is deliberately
         * translucent, and a fanned stack of translucent blocks composites into
         * a smear where two titles read through each other. Opaque underneath,
         * tinted on top: the same colour, and the stack stays legible.
         */
        selected ? "bg-fg text-bg" : "bg-bg text-text"
      )}
    >
      {!selected && (
        <span
          aria-hidden
          className="absolute inset-0 bg-hover transition-colors duration-150 group-hover/chip:bg-border"
        />
      )}
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-1 left-0 w-0.5 rounded-full",
          selected ? "bg-bg/50" : "bg-fg-2"
        )}
      />
      <span className="relative flex items-center gap-1.5 pl-1">
        {Icon && roomy && (
          <Icon className={cn("size-4 shrink-0", selected ? "text-bg/70" : "text-fg-2")} />
        )}
        <span className="truncate text-caption font-medium">{event.title}</span>
      </span>
      {spacious && (
        <span
          className={cn(
            "relative block truncate pl-1 text-caption",
            selected ? "text-bg/70" : "text-text-2"
          )}
        >
          {clock(event.start)}
        </span>
      )}
    </button>
  );
}

/** A whole-day event: no duration to draw, so it reads as a label. */
function DayChip({ event, resource, selected, onSelect }: ChipProps) {
  const Icon = resource?.icon;

  return (
    <button
      type="button"
      onClick={(e) => onSelect(event, e.currentTarget)}
      className={cn(
        "flex min-h-6 w-full items-center gap-1.5 rounded-control px-1.5 py-0.5 text-left outline-none transition-colors duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
        selected ? "bg-fg text-bg" : "text-text hover:bg-hover"
      )}
    >
      {Icon && (
        <Icon className={cn("size-4 shrink-0", selected ? "text-bg/70" : "text-fg-2")} />
      )}
      {/*
        * The title hides itself when there is no room for a word of it. In a
        * narrow month cell a truncated title renders as a single letter and an
        * ellipsis, which is noise; the identity glyph says which calendar the
        * day is busy with, and the day opens for the rest.
        */}
      <span className="hidden truncate text-caption @2xl:inline">{event.title}</span>
    </button>
  );
}

/* --------------------------------------------------------------- time grid */

/** One hour of vertical travel. Everything on the axis is derived from it. */
const HOUR_PX = 44;
const DAY_PX = HOUR_PX * 24;

/*
 * How much of a column a pile-up is allowed to stagger across.
 *
 * Tiling overlapping events into equal columns is the obvious answer and the
 * wrong one: three things at ten o'clock leave each of them a third of a
 * column, which is not enough to read a word of. So they overlap instead,
 * each one stepped a little further right and running to the edge, the way a
 * hand of cards is fanned. Titles start at the left, so the strip of a covered
 * event that stays visible is exactly the part worth seeing.
 */
const OVERLAP_SPREAD = 55;

interface GridColumn {
  key: string;
  /** The calendar day this column's hours belong to. */
  day: Date;
  header: React.ReactNode;
  events: CalendarEvent[];
  isToday?: boolean;
}

/**
 * The shared vertical time grid.
 *
 * Week hands it seven day columns, day hands it one, and the resource view
 * hands it one column per resource over a single day. The grid itself never
 * learns which of those it is drawing.
 */
function TimeGrid({
  columns,
  now,
  resourceFor,
  selectedId,
  onSelect,
}: {
  columns: GridColumn[];
  now: Date | null;
  resourceFor: (e: CalendarEvent) => CalendarResource | undefined;
  selectedId: string | null;
  onSelect: SelectHandler;
}) {
  const scroller = React.useRef<HTMLDivElement>(null);
  const motionOk = useMotionEnabled();

  /* Open on the working day rather than on midnight, the way a diary does. */
  React.useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = 7.5 * HOUR_PX;
  }, []);

  const allDay = columns.some((c) => c.events.some((e) => e.allDay));
  const nowOffset =
    now && columns.some((c) => sameDay(c.day, now))
      ? (minutesInto(now, now) / MINUTES_PER_DAY) * DAY_PX
      : null;

  /*
   * A column narrower than this stops being a column: the day number collides
   * with its weekday and no event title survives. Below that the grid scrolls
   * sideways instead, headers and hours together, which is what a phone
   * calendar does.
   */
  const minWidth = 48 + columns.length * MIN_COLUMN_PX + 8;

  return (
    <div className="overflow-x-auto [scrollbar-width:thin]">
      <div style={{ minWidth }}>
      {/* Column headers sit outside the scroller so they never travel away. */}
      <div className="flex pr-2">
        <div className="w-12 shrink-0" />
        {columns.map((column) => (
          <div key={column.key} className="min-w-0 flex-1 px-1 pb-2">
            {column.header}
          </div>
        ))}
      </div>

      {allDay && (
        <motion.div initial={motionOk ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={enter}>
          <div className="flex pr-2">
            <span className="w-12 shrink-0 pr-2 pt-0.5 text-right text-caption text-text-2">
              all day
            </span>
            {columns.map((column) => (
              <div key={column.key} className="min-w-0 flex-1 space-y-0.5 px-1 pb-2">
                {column.events
                  .filter((e) => e.allDay)
                  .map((event) => (
                    <DayChip
                      key={event.id}
                      event={event}
                      resource={resourceFor(event)}
                      selected={selectedId === event.id}
                      onSelect={onSelect}
                    />
                  ))}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div
        ref={scroller}
        className="relative max-h-[25.5rem] overflow-y-auto overflow-x-hidden [scrollbar-width:thin]"
      >
        <div className="relative flex" style={{ height: DAY_PX }}>
          {/* Hour axis. A hairline is the whole of it; nothing goes darker. */}
          <div className="w-12 shrink-0">
            {Array.from({ length: 24 }, (_, hour) => {
              /*
               * The hour nearest the now label stands down. Two numbers a few
               * pixels apart in the same narrow gutter read as one smudge, and
               * between "2 am" and the actual time, the actual time wins.
               */
              const crowded =
                nowOffset !== null &&
                now !== null &&
                /* 27 minutes is 20px at this scale: one line height of
                   clearance, which is what stops the two reading as one. */
                Math.abs(minutesInto(now, now) - hour * 60) < 27;

              return (
                <div key={hour} className="relative" style={{ height: HOUR_PX }}>
                  {hour > 0 && !crowded && (
                    <span className="absolute -top-1.5 right-2 text-caption text-text-2">
                      {clock(new Date(2000, 0, 1, hour))}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="relative flex flex-1 pr-2">
            {Array.from({ length: 23 }, (_, i) => (
              <span
                key={i}
                aria-hidden
                className="pointer-events-none absolute inset-x-0 border-t border-border"
                style={{ top: (i + 1) * HOUR_PX }}
              />
            ))}

            {columns.map((column) => {
              const timed = column.events.filter((e) => !e.allDay);
              const placed = packOverlaps(timed);

              return (
                <div key={column.key} className="relative min-w-0 flex-1 px-1">
                  {placed.map(({ event, column: lane, columns: lanes }) => {
                    const top = (minutesInto(event.start, column.day) / MINUTES_PER_DAY) * DAY_PX;
                    const bottom = (minutesInto(event.end, column.day) / MINUTES_PER_DAY) * DAY_PX;
                    const height = Math.max(22, bottom - top);

                    return (
                      <TimeChip
                        key={event.id}
                        event={event}
                        resource={resourceFor(event)}
                        selected={selectedId === event.id}
                        onSelect={onSelect}
                        height={height}
                        style={{
                          top,
                          height,
                          left: `${(lane / lanes) * OVERLAP_SPREAD}%`,
                          width: `calc(${100 - (lane / lanes) * OVERLAP_SPREAD}% - 2px)`,
                          zIndex: lane + 1,
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}

            {/* Now. The one accent in the view, and the only line that is not a hairline. */}
            {nowOffset !== null && now && (
              <motion.span
                aria-hidden
                initial={motionOk ? { scaleX: 0, opacity: 0 } : false}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={enter}
                style={{ top: nowOffset }}
                className="pointer-events-none absolute inset-x-0 origin-left border-t border-accent"
              />
            )}
          </div>

          {nowOffset !== null && now && (
            <motion.span
              initial={motionOk ? { opacity: 0, x: -6 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={enter}
              style={{ top: nowOffset - 7 }}
              className="pointer-events-none absolute left-0 w-12 whitespace-nowrap pr-2 text-right text-caption font-medium text-accent"
            >
              {clockBare(now)}
            </motion.span>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- month, year */

const WEEKDAY_INITIALS = ["M", "T", "W", "T", "F", "S", "S"];

function MonthView({
  cursor,
  events,
  now,
  resourceFor,
  selectedId,
  onSelect,
  onOpenDay,
}: {
  cursor: Date;
  events: CalendarEvent[];
  now: Date | null;
  resourceFor: (e: CalendarEvent) => CalendarResource | undefined;
  selectedId: string | null;
  onSelect: SelectHandler;
  onOpenDay: (day: Date) => void;
}) {
  const motionOk = useMotionEnabled();
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const gridStart = startOfWeek(first);
  const weeks = 6;
  const days = eachDay(gridStart, weeks * 7);

  return (
    <div>
      <div className="grid grid-cols-7 gap-x-2 pb-3">
        {days.slice(0, 7).map((d) => (
          <span
            key={d.toISOString()}
            className="text-caption uppercase tracking-[0.08em] text-text-2"
          >
            {fmt.weekdayShort.format(d)}
          </span>
        ))}
      </div>

      <motion.div
        variants={cascade(0.012)}
        initial={motionOk ? "hidden" : false}
        animate="visible"
        className="grid grid-cols-7 gap-x-2 gap-y-4"
      >
        {days.map((day) => {
          const outside = day.getMonth() !== cursor.getMonth();
          const dayEvents = eventsOn(events, day).sort(
            (a, b) => Number(b.allDay ?? false) - Number(a.allDay ?? false) ||
              a.start.getTime() - b.start.getTime()
          );
          const shown = dayEvents.slice(0, 3);
          const spare = dayEvents.length - shown.length;
          const isToday = sameDay(day, now);

          return (
            <motion.div
              key={day.toISOString()}
              variants={fadeRise}
              className={cn("min-h-[4.5rem] min-w-0", outside && "opacity-40")}
            >
              <button
                type="button"
                onClick={() => onOpenDay(day)}
                aria-label={`Open ${fmt.weekdayLong.format(day)} ${fmt.dayMonth.format(day)}`}
                className={cn(
                  "mb-1 inline-flex min-h-6 min-w-6 items-center justify-center rounded-control px-1 text-body outline-none transition-colors duration-150",
                  "hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
                  isToday ? "font-semibold text-accent" : "text-text"
                )}
              >
                {day.getDate()}
              </button>

              <div className="flex flex-wrap gap-0.5 @2xl:block @2xl:space-y-0.5">
                {shown.map((event) => (
                  <DayChip
                    key={event.id}
                    event={event}
                    resource={resourceFor(event)}
                    selected={selectedId === event.id}
                    onSelect={onSelect}
                  />
                ))}
                {spare > 0 && (
                  <button
                    type="button"
                    onClick={() => onOpenDay(day)}
                    className="rounded-control px-1.5 text-caption text-text-2 outline-none transition-colors duration-150 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
                  >
                    {spare} more
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

/**
 * The year at a glance.
 *
 * Apple tints a busy day; this weighs it instead. A day with nothing on it
 * stays secondary, a day with a couple of things steps up to primary, and a
 * full day takes semibold, so density is legible without spending a colour.
 */
function YearView({
  cursor,
  events,
  now,
  onOpenMonth,
  onOpenDay,
}: {
  cursor: Date;
  events: CalendarEvent[];
  now: Date | null;
  onOpenMonth: (month: Date) => void;
  onOpenDay: (day: Date) => void;
}) {
  const motionOk = useMotionEnabled();
  const year = cursor.getFullYear();

  return (
    <motion.div
      variants={cascade(0.04)}
      initial={motionOk ? "hidden" : false}
      animate="visible"
      className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4"
    >
      {Array.from({ length: 12 }, (_, m) => {
        const first = new Date(year, m, 1);
        const gridStart = startOfWeek(first);
        const cells = eachDay(gridStart, 42);

        return (
          <motion.div key={m} variants={fadeRise}>
            <button
              type="button"
              onClick={() => onOpenMonth(first)}
              className="mb-2 rounded-control font-display text-body font-bold text-text outline-none transition-colors duration-150 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {fmt.monthLong.format(first)}
            </button>

            <div className="grid grid-cols-7 gap-y-0.5">
              {WEEKDAY_INITIALS.map((d, i) => (
                <span
                  key={i}
                  className="text-center text-caption text-text-2 opacity-60"
                >
                  {d}
                </span>
              ))}

              {cells.map((day) => {
                if (day.getMonth() !== m) return <span key={day.toISOString()} />;
                const count = eventsOn(events, day).length;
                const isToday = sameDay(day, now);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => onOpenDay(day)}
                    aria-label={`${fmt.dayMonth.format(day)}, ${count} events`}
                    className={cn(
                      "rounded-control text-center text-caption outline-none transition-colors duration-150",
                      "hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
                      isToday
                        ? "font-semibold text-accent"
                        : count === 0
                          ? "text-text-2"
                          : count < 3
                            ? "font-medium text-text"
                            : "font-semibold text-text"
                    )}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ agenda */

function AgendaView({
  range,
  events,
  now,
  resourceFor,
  selectedId,
  onSelect,
}: {
  range: CalendarRange;
  events: CalendarEvent[];
  now: Date | null;
  resourceFor: (e: CalendarEvent) => CalendarResource | undefined;
  selectedId: string | null;
  onSelect: SelectHandler;
}) {
  const motionOk = useMotionEnabled();
  const [listRef] = useAutoAnimate<HTMLDivElement>();
  const days = range.days.length
    ? range.days
    : eachDay(range.start, Math.round((range.end.getTime() - range.start.getTime()) / 86_400_000));
  const busy = days.filter((d) => eventsOn(events, d).length > 0);

  if (!busy.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={enter}
        className="flex flex-col items-center py-16"
      >
        <CalendarDays className="size-6 text-fg-2" />
        <p className="mt-3 text-body text-text-2">Nothing scheduled</p>
      </motion.div>
    );
  }

  return (
    <div ref={listRef}>
      {busy.map((day) => (
        <div key={day.toISOString()} className="flex gap-6 py-3">
          <div className="w-14 shrink-0 pt-1">
            <p className="text-caption uppercase tracking-[0.08em] text-text-2">
              {fmt.weekdayShort.format(day)}
            </p>
            <p
              className={cn(
                "font-display text-section font-bold",
                sameDay(day, now) ? "text-accent" : "text-text"
              )}
            >
              {day.getDate()}
            </p>
          </div>

          <motion.div
            variants={cascade(0.05)}
            initial={motionOk ? "hidden" : false}
            animate="visible"
            className="min-w-0 flex-1"
          >
            {eventsOn(events, day)
              .sort((a, b) => a.start.getTime() - b.start.getTime())
              .map((event) => {
                const resource = resourceFor(event);
                const Icon = resource?.icon;
                return (
                  <motion.div key={event.id} variants={fadeRise}>
                    <button
                      type="button"
                      onClick={(e) => onSelect(event, e.currentTarget)}
                      className={cn(
                        "flex min-h-10 w-full items-center gap-3 rounded-control px-2 text-left outline-none transition-colors duration-150",
                        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
                        selectedId === event.id
                          ? "bg-fg text-bg"
                          : "text-text hover:bg-hover"
                      )}
                    >
                      <span
                        className={cn(
                          "w-20 shrink-0 text-caption tabular-nums",
                          selectedId === event.id ? "text-bg/70" : "text-text-2"
                        )}
                      >
                        {event.allDay ? "all day" : clock(event.start)}
                      </span>
                      {Icon && (
                        <Icon
                          className={cn(
                            "size-4 shrink-0",
                            selectedId === event.id ? "text-bg/70" : "text-fg-2"
                          )}
                        />
                      )}
                      <span className="truncate text-body font-medium">{event.title}</span>
                      {event.location && (
                        <span
                          className={cn(
                            "ml-auto hidden shrink-0 truncate text-caption @lg:block",
                            selectedId === event.id ? "text-bg/70" : "text-text-2"
                          )}
                        >
                          {event.location}
                        </span>
                      )}
                    </button>
                  </motion.div>
                );
              })}
          </motion.div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- timeline */

const ROW_PX = 44;
/** Height of the slot-label strip. Both columns reserve exactly this much. */
const AXIS_PX = 28;
/** Narrowest an event bar may draw, however short the event is. */
const MIN_BAR_PX = 22;
/** Narrowest a day or resource column may draw before the grid scrolls. */
const MIN_COLUMN_PX = 84;

/**
 * Resources as rows, time running left to right.
 *
 * The resource names and the time tracks are two columns, and only the right
 * one scrolls sideways. The obvious alternative, one scroller with the names
 * pinned by `sticky`, needs the names to paint an opaque fill so the tracks do
 * not slide out from under them, and that fill is a box: it has to guess the
 * colour of whatever surface the calendar was dropped onto, and it guesses
 * wrong the moment that surface is not the page canvas. Two columns need no
 * fill at all, so there is nothing to guess and no box to draw.
 */
function TimelineView({
  range,
  resources,
  events,
  now,
  unit,
  selectedId,
  onSelect,
}: {
  range: CalendarRange;
  resources: CalendarResource[];
  events: CalendarEvent[];
  now: Date | null;
  unit: "hour" | "day";
  selectedId: string | null;
  onSelect: SelectHandler;
}) {
  const motionOk = useMotionEnabled();

  /* An hour axis covers the working day; a day axis spans the whole range. */
  const axisStart =
    unit === "hour" ? new Date(range.start.getTime() + 6 * 3_600_000) : range.start;
  const axisEnd =
    unit === "hour" ? new Date(range.start.getTime() + 22 * 3_600_000) : range.end;
  const span = axisEnd.getTime() - axisStart.getTime();

  const slots =
    unit === "hour"
      ? Array.from({ length: 16 }, (_, i) => new Date(axisStart.getTime() + i * 3_600_000))
      : range.days;
  const slotLabel = (d: Date) =>
    unit === "hour" ? clock(d) : `${fmt.weekdayShort.format(d)} ${d.getDate()}`;

  const pct = (t: number) => ((t - axisStart.getTime()) / span) * 100;
  const nowPct =
    now && now.getTime() >= axisStart.getTime() && now.getTime() <= axisEnd.getTime()
      ? pct(now.getTime())
      : null;

  /* Measured once so the names and the tracks cannot drift out of line. */
  const rows = resources.map((resource) => {
    const placed = packOverlaps(
      eventsBetween(
        events.filter((e) => e.resourceId === resource.id),
        range.start,
        range.end
      )
    );
    const lanes = placed.reduce((max, p) => Math.max(max, p.columns), 1);
    return { resource, placed, height: Math.max(ROW_PX, lanes * 30 + 12) };
  });

  if (!rows.length) {
    return (
      <motion.div
        initial={motionOk ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={enter}
        className="flex flex-col items-center py-16"
      >
        <CalendarDays className="size-6 text-fg-2" />
        <p className="mt-3 text-body text-text-2">No resources shown</p>
      </motion.div>
    );
  }

  return (
    <div className="flex">
      <motion.div
        variants={cascade(0.06)}
        initial={motionOk ? "hidden" : false}
        animate="visible"
        className="w-36 shrink-0"
      >
        <div style={{ height: AXIS_PX }} />
        {rows.map(({ resource, height }) => {
          const Icon = resource.icon;
          return (
            <motion.div
              key={resource.id}
              variants={fadeRise}
              style={{ height }}
              className="flex items-center gap-2.5 pr-4"
            >
              <Icon className="size-5 shrink-0 text-fg-2" />
              <span className="min-w-0">
                <span className="block truncate text-body font-medium text-text">
                  {resource.name}
                </span>
                {resource.detail && (
                  <span className="block truncate text-caption text-text-2">
                    {resource.detail}
                  </span>
                )}
              </span>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:thin]">
        <div style={{ minWidth: unit === "hour" ? 16 * 64 : 7 * 150 }}>
          <div className="flex" style={{ height: AXIS_PX }}>
            {slots.map((slot) => (
              <span
                key={slot.toISOString()}
                className="min-w-0 flex-1 text-caption text-text-2"
              >
                {slotLabel(slot)}
              </span>
            ))}
          </div>

          <div className="relative">
            {rows.map(({ resource, placed, height }) => (
              <div key={resource.id} className="relative" style={{ height }}>
                {slots.map((slot, i) =>
                  i === 0 ? null : (
                    <span
                      key={slot.toISOString()}
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 border-l border-border"
                      style={{ left: `${(i / slots.length) * 100}%` }}
                    />
                  )
                )}

                {placed.map(({ event, column: lane, columns: laneCount }) => {
                  const left = Math.max(0, pct(event.start.getTime()));
                  const right = Math.min(100, pct(event.end.getTime()));
                  const laneHeight = (height - 12) / laneCount;

                  return (
                    <motion.button
                      key={event.id}
                      type="button"
                      onClick={(e) => onSelect(event, e.currentTarget)}
                      initial={motionOk ? { scaleX: 0, opacity: 0 } : false}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={enter}
                      style={{
                        left: `${left}%`,
                        width: `calc(${Math.max(0.5, right - left)}% - 3px)`,
                        /*
                         * A floor, because proportion alone loses the event.
                         * An hour of a seven day axis is well under one per
                         * cent, which draws a bar a few pixels wide: too thin
                         * to read, and too thin to hit. The position stays
                         * honest; only the minimum width is enforced.
                         */
                        minWidth: MIN_BAR_PX,
                        top: 6 + lane * laneHeight,
                        height: laneHeight - 3,
                      }}
                      className={cn(
                        "group/bar absolute origin-left overflow-hidden rounded-control px-1.5 text-left outline-none ring-1 ring-bg transition-colors duration-150",
                        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
                        selectedId === event.id ? "bg-fg text-bg" : "bg-bg text-text"
                      )}
                    >
                      {selectedId !== event.id && (
                        <span
                          aria-hidden
                          className="absolute inset-0 bg-hover transition-colors duration-150 group-hover/bar:bg-border"
                        />
                      )}
                      <span
                        aria-hidden
                        className={cn(
                          "absolute inset-y-1 left-0 w-0.5 rounded-full",
                          selectedId === event.id ? "bg-bg/50" : "bg-fg-2"
                        )}
                      />
                      {/*
                        * No clock: on a time axis the bar's position is the
                        * time, and printing it again costs the title its room.
                        * And no title at all on a day-wide axis, where an hour
                        * is a couple of dozen pixels and a label degrades to a
                        * single letter and an ellipsis. There the bar is the
                        * answer to "is this room free on Tuesday"; the name is
                        * one click away in the inspector.
                        */}
                      {unit === "hour" && (
                        <span className="relative flex h-full items-center pl-1">
                          <span className="truncate text-caption font-medium">
                            {event.title}
                          </span>
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ))}

            {nowPct !== null && (
              <motion.span
                aria-hidden
                initial={motionOk ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={enter}
                className="pointer-events-none absolute inset-y-0 border-l border-accent"
                style={{ left: `${nowPct}%` }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- shell */

const TIME_VIEWS: Array<{ value: CalendarViewId; label: string }> = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

const PLAN_VIEWS: Array<{ value: CalendarViewId; label: string }> = [
  { value: "agenda", label: "Agenda" },
  { value: "timeline", label: "Timeline" },
  { value: "resources", label: "Resources" },
];

export interface EventCalendarProps {
  events: CalendarEvent[];
  /** Rooms, people or equipment. Required by the timeline and resource views. */
  resources?: CalendarResource[];
  initialView?: CalendarViewId;
  /**
   * The day the calendar opens on. Leave it out and the calendar anchors on
   * today, resolved after mount so a pre-rendered page cannot bake in a date.
   */
  initialDate?: Date;
  /** Narrow the view switcher to the views a surface actually needs. */
  views?: CalendarViewId[];
  /** Timeline axis: hours across one day, or days across one week. */
  timelineUnit?: "hour" | "day";
  className?: string;
}

export function EventCalendar({
  events,
  resources = [],
  initialView = "week",
  initialDate,
  views,
  timelineUnit = "hour",
  className,
}: EventCalendarProps) {
  const now = useNow();
  const motionOk = useMotionEnabled();

  const [view, setView] = React.useState<CalendarViewId>(initialView);
  const [cursor, setCursor] = React.useState<Date | null>(initialDate ?? null);
  const [inspect, setInspect] = React.useState<Inspected | null>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const [hidden, setHidden] = React.useState<Set<string>>(() => new Set());
  /* -1 back, 1 forward, 0 for a view change: decides which way the body enters. */
  const [travel, setTravel] = React.useState(0);

  const selectedId = inspect?.event.id ?? null;
  const closeInspector = React.useCallback(() => setInspect(null), []);

  /* Anchor on today once the browser has told us what today is. */
  React.useEffect(() => {
    if (!cursor && now) setCursor(startOfDay(now));
  }, [cursor, now]);

  const shownViews = views ?? [...TIME_VIEWS, ...PLAN_VIEWS].map((v) => v.value);
  const timeOptions = TIME_VIEWS.filter((v) => shownViews.includes(v.value));
  const planOptions = PLAN_VIEWS.filter((v) => shownViews.includes(v.value));

  const visibleResources = resources.filter((r) => !hidden.has(r.id));
  const visibleEvents = React.useMemo(
    () => events.filter((e) => !e.resourceId || !hidden.has(e.resourceId)),
    [events, hidden]
  );
  const resourceFor = React.useCallback(
    (event: CalendarEvent) => resources.find((r) => r.id === event.resourceId),
    [resources]
  );

  const select: SelectHandler = (event, el) => {
    triggerRef.current = el;
    setInspect((prev) =>
      prev?.event.id === event.id
        ? null
        : { event, resource: resourceFor(event), rect: el.getBoundingClientRect() }
    );
  };

  /* A day axis needs a week under it, so the timeline borrows the week range. */
  const rangeView: CalendarViewId =
    view === "timeline" && timelineUnit === "day" ? "week" : view;

  if (!cursor) {
    /* One frame, at the height the calendar will take, so nothing jumps. */
    return <div className={cn("min-h-[28rem]", className)} aria-busy="true" />;
  }

  const range = rangeFor(rangeView, cursor);
  const inRange = eventsBetween(visibleEvents, range.start, range.end);

  const go = (dir: number) => {
    closeInspector();
    setTravel(dir);
    setCursor(stepFor(rangeView, cursor, dir));
  };

  const jump = (day: Date, next?: CalendarViewId) => {
    closeInspector();
    setTravel(0);
    setCursor(startOfDay(day));
    if (next) setView(next);
  };

  const pick = (next: CalendarViewId) => {
    closeInspector();
    setTravel(0);
    setView(next);
  };

  const dayColumn = (day: Date) => (
    <div className="flex items-baseline gap-1.5">
      <span className="text-caption uppercase tracking-[0.08em] text-text-2">
        {fmt.weekdayShort.format(day)}
      </span>
      <span
        className={cn(
          "font-display text-section font-bold",
          sameDay(day, now) ? "text-accent" : "text-text"
        )}
      >
        {day.getDate()}
      </span>
    </div>
  );

  const body = () => {
    if (view === "year")
      return (
        <YearView
          cursor={cursor}
          events={visibleEvents}
          now={now}
          onOpenMonth={(m) => jump(m, "month")}
          onOpenDay={(d) => jump(d, "day")}
        />
      );

    if (view === "month")
      return (
        <MonthView
          cursor={cursor}
          events={visibleEvents}
          now={now}
          resourceFor={resourceFor}
          selectedId={selectedId}
          onSelect={select}
          onOpenDay={(d) => jump(d, "day")}
        />
      );

    if (view === "agenda")
      return (
        <AgendaView
          range={range}
          events={visibleEvents}
          now={now}
          resourceFor={resourceFor}
          selectedId={selectedId}
          onSelect={select}
        />
      );

    if (view === "timeline")
      return (
        <TimelineView
          range={range}
          resources={visibleResources}
          events={visibleEvents}
          now={now}
          unit={timelineUnit}
          selectedId={selectedId}
          onSelect={select}
        />
      );

    /* Resources: one column per resource, all standing on the same day. */
    if (view === "resources")
      return (
        <TimeGrid
          now={now}
          resourceFor={resourceFor}
          selectedId={selectedId}
          onSelect={select}
          columns={visibleResources.map((resource) => {
            const Icon = resource.icon;
            return {
              key: resource.id,
              day: range.start,
              isToday: sameDay(range.start, now),
              events: eventsOn(
                visibleEvents.filter((e) => e.resourceId === resource.id),
                range.start
              ),
              header: (
                <div className="flex min-w-0 items-center gap-2">
                  <Icon className="size-4 shrink-0 text-fg-2" />
                  <span className="truncate text-body font-medium text-text">
                    {resource.name}
                  </span>
                </div>
              ),
            };
          })}
        />
      );

    /* Day and week are the same grid with a different number of columns. */
    return (
      <TimeGrid
        now={now}
        resourceFor={resourceFor}
        selectedId={selectedId}
        onSelect={select}
        columns={range.days.map((day) => ({
          key: day.toISOString(),
          day,
          isToday: sameDay(day, now),
          events: eventsOn(visibleEvents, day),
          header: dayColumn(day),
        }))}
      />
    );
  };

  /*
   * Switching off motion has to switch off the waiting too, not just the
   * drawing. `AnimatePresence` holds the outgoing view on screen for the whole
   * exit duration, so leaving `exit` in place under a reduce-motion setting
   * buys the user an invisible pause and, on a throttled tab, a pane that sits
   * empty until the next frame arrives. With motion off the swap is a cut.
   */
  const still = { initial: false as const, transition: { duration: 0 } };
  const titleMotion = motionOk
    ? { initial: { opacity: 0, x: travel * 10 }, transition: roll }
    : still;
  const bodyMotion = motionOk
    ? {
        initial: { opacity: 0, x: travel * 24, y: travel === 0 ? 8 : 0 },
        exit: { opacity: 0, x: travel * -24, y: travel === 0 ? -8 : 0 },
        transition: travel === 0 ? enter : morph,
      }
    : still;

  return (
    /*
     * Container queries, not viewport ones. A calendar is dropped into a
     * documentation column, a dashboard pane or a full page, and the only
     * width that decides whether its title and its controls fit on one line is
     * its own. A `sm:` breakpoint would read the window and get it wrong in
     * every embedded case.
     */
    <div className={cn("@container w-full select-none", className)}>
      {/*
        * Stacked below `sm`, one row above it, and never wrapping on content.
        *
        * Letting the row wrap on its own put the controls on a second line for
        * a long title and back on the first for a short one, so paging from
        * "24 to 30 August 2026" to "2027" moved the chevron out from under the
        * pointer mid-click. The title takes the slack and truncates instead.
        */}
      <div className="flex flex-col gap-4 @4xl:flex-row @4xl:items-end @4xl:justify-between @4xl:gap-x-6">
        <div className="min-w-0 @4xl:flex-1">
          {/*
            * No exit on the title: a heading that blanks out for the length of
            * a fade reads as a bug, so the old one is cut and the new one
            * arrives from the direction of travel.
            */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.h2
              key={range.title}
              {...titleMotion}
              animate={{ opacity: 1, x: 0 }}
              className="truncate font-display text-title font-bold text-text"
            >
              {range.title}
            </motion.h2>
          </AnimatePresence>
          <p className="mt-1 flex items-center gap-2 text-body text-text-2">
            <CalendarDays className="size-4 shrink-0 text-fg-2" />
            <motion.span
              key={inRange.length}
              initial={motionOk ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={motionOk ? roll : { duration: 0 }}
            >
              {inRange.length === 1 ? "1 event" : `${inRange.length} events`}
            </motion.span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 @4xl:shrink-0">
          <IconButton label="Previous" onClick={() => go(-1)}>
            <ChevronLeft />
          </IconButton>
          <Button variant="text" size="sm" onClick={() => jump(now ?? cursor)}>
            Today
          </Button>
          <IconButton label="Next" onClick={() => go(1)}>
            <ChevronRight />
          </IconButton>

          {resources.length > 0 && (
            <Popover
              align="end"
              className="w-auto p-3"
              trigger={
                <IconButton label="Filter resources">
                  <SlidersHorizontal />
                </IconButton>
              }
            >
              <motion.div variants={cascade(0.05)} initial={motionOk ? "hidden" : false} animate="visible" className="w-48">
                {resources.map((resource) => {
                  const Icon = resource.icon;
                  return (
                    <motion.div key={resource.id} variants={fadeRise} className="py-1">
                      <Checkbox
                        checked={!hidden.has(resource.id)}
                        onChange={() =>
                          setHidden((prev) => {
                            const next = new Set(prev);
                            if (next.has(resource.id)) next.delete(resource.id);
                            else next.add(resource.id);
                            return next;
                          })
                        }
                        label={
                          <span className="flex items-center gap-2">
                            <Icon className="size-4 shrink-0 text-fg-2" />
                            {resource.name}
                          </span>
                        }
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            </Popover>
          )}

          {/* Two groups, one state. The gap is the grouping; neither shows a
              thumb unless the current view is one of its own. */}
          <div className="flex flex-wrap items-center gap-2">
            {timeOptions.length > 0 && (
              <Segmented
                label="Calendar range"
                options={timeOptions}
                value={view}
                onValueChange={(v) => pick(v as CalendarViewId)}
              />
            )}
            {planOptions.length > 0 && (
              <Segmented
                label="Schedule view"
                options={planOptions}
                value={view}
                onValueChange={(v) => pick(v as CalendarViewId)}
              />
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${view}:${range.start.toISOString()}`}
            {...bodyMotion}
            animate={{ opacity: 1, x: 0, y: 0 }}
          >
            {body()}
          </motion.div>
        </AnimatePresence>
      </div>

      <EventInspector state={inspect} triggerRef={triggerRef} onClose={closeInspector} />
    </div>
  );
}
