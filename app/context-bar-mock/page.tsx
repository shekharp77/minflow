"use client";

/*
 * DESIGN MOCK - context bar (round 8). Not a library component yet.
 *
 * A standing, non-modal companion rail on the right that holds LIVE component
 * instances. The page sends a card over and the actual card flies from where
 * it sits into the bar; because the state driving each card lives above both
 * renders, the timer keeps counting and the track keeps playing no matter
 * which side it is on or which page tab is open.
 *
 * What the mock simulates cheaply and the real build does properly: instance
 * ownership. Here demo state is lifted to this page's root; the registry
 * component will own instances in a provider and retarget portals so a route
 * change never unmounts a docked component (harness memory, D25).
 */

import * as React from "react";
import { AnimatePresence, LayoutGroup, motion, type PanInfo } from "motion/react";
import {
  ArrowRightToLine,
  Blocks,
  Building2,
  Columns2,
  Layers,
  LoaderCircle,
  Moon,
  Music,
  PanelRight,
  Pause,
  Play,
  Plus,
  StickyNote,
  Sun,
  Timer,
  X,
  Zap,
  ZapOff,
} from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useMotionSetting, useTheme } from "@/lib/theme";
import {
  durations,
  easeEnter,
  enter,
  exit as exitT,
  fadeRise,
  fadeSlide,
  morph,
  pressScaleSmall,
  shouldDismiss,
  spring,
  springSnap,
  useHoverCapable,
  useMotionEnabled,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * Model
 * ------------------------------------------------------------------ */

type SectionId = "now" | "clips" | "notes";
type Scope = "atlas" | "northwind";
type Kind = "timer" | "player" | "spark" | "note" | "clip" | "deploy" | "oncall";
type AdoptableId = "timer" | "player" | "spark" | "note";

interface BarItem {
  /** Stable identity: the handle code removes by, and the layoutId the flight rides on. */
  id: string;
  kind: Kind;
  section: SectionId;
  scope: Scope;
  /** Arrival order. Higher = newer = closer to the top of its stack. */
  seq: number;
  clipText?: string;
}

const SECTION_ORDER: SectionId[] = ["now", "clips", "notes"];
const SECTION_LABEL: Record<SectionId, string> = {
  now: "Now",
  clips: "Clips",
  notes: "Notes",
};

const SCOPES: Record<Scope, { name: string; icon: React.ReactNode }> = {
  atlas: { name: "atlas", icon: <Blocks className="size-4" aria-hidden /> },
  northwind: { name: "northwind", icon: <Building2 className="size-4" aria-hidden /> },
};

const TITLES: Record<AdoptableId, string> = {
  timer: "Deep work timer",
  player: "Now playing",
  spark: "Net volume",
  note: "Note to self",
};

/* minflow-native snippets, cycled by the "from code" push button */
const CLIP_POOL = [
  "Latency budget for the composer is 80ms, hard.",
  "CORE wants invoice export behind a flag until Q4.",
  "Cohort w34 retention is up 4.1% after the digest change.",
  "Ship the palette migration before the brand review.",
];

/* The other workspace arrives with its own bar already in use. */
const SEED: BarItem[] = [
  { id: "deploy", kind: "deploy", section: "now", scope: "northwind", seq: 2 },
  { id: "oncall", kind: "oncall", section: "notes", scope: "northwind", seq: 1 },
];

/* Stack geometry: iOS notification stack. Newest card full, older cards peek
 * beneath it in 10px steps, shrinking and dimming; at most two peeks and a
 * "+N more" caption for the rest. */
const PEEK_Y = 10;
const PEEK_SCALE = 0.035;
const PEEK_DIM = 0.18;
const MAX_PEEK = 2;
const GAP = 8;
const FALLBACK_H = 72;

function useMinWidth(px: number): boolean {
  const [ok, setOk] = React.useState(true);
  React.useEffect(() => {
    const mq = window.matchMedia(`(min-width:${px}px)`);
    const compute = () => setOk(mq.matches);
    compute();
    mq.addEventListener("change", compute);
    return () => mq.removeEventListener("change", compute);
  }, [px]);
  return ok;
}

function fmt(total: number): string {
  const m = Math.floor(total / 60);
  const s = Math.floor(total % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ *
 * Live demo components. Each renders identically on the page and in the
 * bar; all of their state arrives as props so the card can travel without
 * losing its place.
 * ------------------------------------------------------------------ */

/** 24px control that never bubbles a pointer-down into the card's drag. */
function CardButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip label={label}>
      <motion.button
        aria-label={label}
        whileTap={{ scale: pressScaleSmall }}
        transition={{ duration: durations.press, ease: "easeOut" }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={cn(
          "hit-target inline-flex size-6 shrink-0 items-center justify-center rounded-full text-fg-2 outline-none transition-colors duration-150 hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent [&_svg]:size-4",
          className
        )}
      >
        {children}
      </motion.button>
    </Tooltip>
  );
}

function Hairline({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-0.5 w-full overflow-hidden rounded-full bg-border", className)}>
      <motion.div
        className="h-full rounded-full bg-fg-2"
        animate={{ scaleX: Math.max(0.005, Math.min(1, value)) }}
        transition={morph}
        style={{ originX: 0 }}
      />
    </div>
  );
}

const TimerCard = React.memo(function TimerCard({
  seconds,
  running,
  onToggle,
}: {
  seconds: number;
  running: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-bg-2 text-fg-2">
          <Timer className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-caption text-text-2">Deep work</p>
          <p className="font-display text-title font-bold tabular-nums text-text">
            {fmt(seconds)}
          </p>
        </div>
        <CardButton label={running ? "Pause timer" : "Start timer"} onClick={onToggle}>
          {running ? <Pause /> : <Play />}
        </CardButton>
      </div>
      <Hairline value={seconds / 1500} className="mt-3" />
    </div>
  );
});

const PlayerCard = React.memo(function PlayerCard({
  progress,
  playing,
  onToggle,
}: {
  progress: number;
  playing: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-bg-2 text-fg-2">
          <Music className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-medium text-text">Low tide</p>
          <p className="text-caption text-text-2">Field recordings</p>
        </div>
        <CardButton label={playing ? "Pause" : "Play"} onClick={onToggle}>
          {playing ? <Pause /> : <Play />}
        </CardButton>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Hairline value={progress} />
        <span className="shrink-0 text-caption tabular-nums text-text-2">
          -{fmt(252 * (1 - progress))}
        </span>
      </div>
    </div>
  );
});

const SPARK = [4, 6, 5, 8, 7, 9, 8, 11, 10, 13, 12, 15];

const SparkCard = React.memo(function SparkCard({ motionOk }: { motionOk: boolean }) {
  const max = Math.max(...SPARK);
  const pts = SPARK.map(
    (v, i) => `${(i / (SPARK.length - 1)) * 100},${30 - (v / max) * 28}`
  ).join(" L");
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-caption text-text-2">Net volume · 30d</p>
        <p className="font-display text-title font-bold tabular-nums text-text">48.2k</p>
      </div>
      <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="mt-2 h-8 w-full" aria-hidden>
        <motion.path
          d={`M${pts}`}
          fill="none"
          stroke="var(--fg-2)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={motionOk ? { duration: durations.focal, ease: easeEnter } : { duration: 0 }}
        />
      </svg>
    </div>
  );
});

const NoteCard = React.memo(function NoteCard({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-text-2">
        <StickyNote className="size-4" aria-hidden />
        <p className="text-caption">Note to self</p>
      </div>
      {/* Inline register: no boundary in any state; position is the affordance. */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPointerDown={(e) => e.stopPropagation()}
        placeholder="Capture a thought"
        rows={2}
        className="mt-2 w-full resize-none bg-transparent text-body text-text outline-none [field-sizing:content] placeholder:text-text-2/60"
      />
    </div>
  );
});

function ClipCard({ text }: { text: string }) {
  return (
    <div>
      <p className="text-caption text-text-2">Clip</p>
      <p className="mt-1 text-body text-text">{text}</p>
    </div>
  );
}

function DeployCard() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <LoaderCircle className="size-4 shrink-0 animate-spin text-fg-2" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-caption text-text-2">Deploy · api</p>
          <p className="text-body font-medium text-text">Rolling out v2.4.1</p>
        </div>
      </div>
      <Hairline value={0.64} className="mt-3" />
    </div>
  );
}

function OncallCard() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-2 text-caption font-medium text-text-2">
        RK
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-caption text-text-2">On call</p>
        <p className="text-body font-medium text-text">Rhea Kapoor · until 18:00</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * The stack: one section's items, newest on top, older ones overlapped
 * beneath it. Absolute cards driven by measured heights, so collapsed and
 * fanned-out are the same elements with different transforms.
 * ------------------------------------------------------------------ */

interface StackProps {
  items: BarItem[];
  expanded: boolean;
  onExpand: () => void;
  onRemove: (item: BarItem) => void;
  onDragOut: (item: BarItem) => void;
  render: (item: BarItem) => React.ReactNode;
  flash: { id: string; nonce: number } | null;
  onFlashDone: () => void;
  motionOk: boolean;
}

function Stack({
  items,
  expanded,
  onExpand,
  onRemove,
  onDragOut,
  render,
  flash,
  onFlashDone,
  motionOk,
}: StackProps) {
  const [heights, setHeights] = React.useState<Record<string, number>>({});
  const report = React.useCallback((id: string, h: number) => {
    setHeights((prev) => (prev[id] === h ? prev : { ...prev, [id]: h }));
  }, []);
  const h = (id: string) => heights[id] ?? FALLBACK_H;

  const fanned = expanded || items.length === 1;
  let total = 0;
  /*
   * Collapsed peeks are BOTTOM-aligned to the face card: each one is placed so
   * its scaled bottom edge lands exactly PEEK_Y below the card above it. Cards
   * here have different natural heights, and a top-aligned offset makes the
   * visible lip `PEEK_Y - (faceH - peekH*scale)`, which goes negative the
   * moment the face is taller than a peek and swallows it whole (F58).
   */
  const faceH = h(items[0].id);
  const offsets = items.map((item, i) => {
    if (fanned) {
      const y = total;
      total += h(item.id) + GAP;
      return y;
    }
    if (i === 0) return 0;
    const scale = 1 - Math.min(i, MAX_PEEK + 1) * PEEK_SCALE;
    return faceH - h(item.id) * scale + Math.min(i, MAX_PEEK) * PEEK_Y;
  });
  if (fanned) total -= GAP;
  else total = faceH + Math.min(items.length - 1, MAX_PEEK) * PEEK_Y;

  const hiddenCount = fanned ? 0 : Math.max(0, items.length - 1 - MAX_PEEK);

  return (
    <div>
      <motion.div
        className="relative"
        animate={{ height: total }}
        transition={motionOk ? morph : { duration: 0 }}
        initial={false}
      >
        <AnimatePresence initial={false}>
          {items.map((item, i) => (
            <StackCard
              key={item.id}
              item={item}
              y={offsets[i]}
              scale={fanned ? 1 : 1 - Math.min(i, MAX_PEEK + 1) * PEEK_SCALE}
              dim={fanned ? 1 : i === 0 ? 1 : i <= MAX_PEEK ? 1 - i * PEEK_DIM : 0}
              z={items.length - i}
              collapsed={!fanned}
              stackable={items.length > 1}
              index={i}
              onExpand={onExpand}
              onRemove={onRemove}
              onDragOut={onDragOut}
              onHeight={report}
              flash={flash?.id === item.id ? flash.nonce : null}
              onFlashDone={onFlashDone}
              motionOk={motionOk}
            >
              {render(item)}
            </StackCard>
          ))}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>
        {hiddenCount > 0 && (
          <motion.button
            variants={fadeRise}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onExpand}
            className="mt-2 text-caption text-text-2 outline-none transition-colors duration-150 hover:text-text focus-visible:outline-2 focus-visible:outline-accent"
          >
            +{hiddenCount} more
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

interface StackCardProps {
  item: BarItem;
  y: number;
  scale: number;
  dim: number;
  z: number;
  collapsed: boolean;
  stackable: boolean;
  index: number;
  onExpand: () => void;
  onRemove: (item: BarItem) => void;
  onDragOut: (item: BarItem) => void;
  onHeight: (id: string, h: number) => void;
  flash: number | null;
  onFlashDone: () => void;
  motionOk: boolean;
  children: React.ReactNode;
}

function StackCard({
  item,
  y,
  scale,
  dim,
  z,
  collapsed,
  stackable,
  index,
  onExpand,
  onRemove,
  onDragOut,
  onHeight,
  flash,
  onFlashDone,
  motionOk,
  children,
}: StackCardProps) {
  const hoverable = useHoverCapable();
  /* Measures the CARD's full box (padding and ring included), not its content:
   * the stack geometry and the fanned offsets both position whole cards. */
  const measureRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    onHeight(item.id, el.offsetHeight);
    const ro = new ResizeObserver(() => onHeight(item.id, el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [item.id, onHeight]);

  /* Only the face of a collapsed stack drags; a peek's one job is to expand. */
  const draggable = !collapsed || index === 0;
  /* A twin on the page means the flight carries the entrance; codeless items
   * (clips, seeded cards) land from just above instead. */
  const hasTwin = item.kind !== "clip" && item.kind !== "deploy" && item.kind !== "oncall";

  const onDragEnd = (_: unknown, info: PanInfo) => {
    /* Out of the bar means leftward, toward the page, so both tests flip sign. */
    if (shouldDismiss(-info.offset.x, -info.velocity.x, 288)) onDragOut(item);
  };

  const expandable = collapsed && stackable;

  return (
    <motion.div
      className="absolute inset-x-0 top-0"
      /*
       * With motion off, MotionConfig drops transform ANIMATIONS entirely
       * (F52), so a stack whose placement rides on `animate` collapses into a
       * pile (F59). Placement is layout, not decoration: when motion is off it
       * is written as static style, which Motion applies without animating.
       */
      style={{
        zIndex: z,
        transformOrigin: "top center",
        ...(motionOk ? {} : { y, scale, opacity: dim }),
      }}
      initial={motionOk && !hasTwin ? { opacity: 0, y: y - 14, scale: 0.98 } : false}
      animate={motionOk ? { opacity: dim, y, scale } : undefined}
      exit={{ opacity: 0, scale: motionOk ? 0.96 : 1, transition: exitT }}
      transition={spring}
    >
      <motion.div
        ref={measureRef}
        layoutId={`card-${item.id}`}
        transition={motionOk ? spring : { duration: 0 }}
        drag={draggable ? "x" : false}
        dragSnapToOrigin
        dragElastic={{ left: 0.9, right: 0.08 }}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={onDragEnd}
        whileDrag={{ rotate: -1.5, scale: 1.01 }}
        onClick={(e) => {
          if (!expandable) return;
          const target = e.target as HTMLElement;
          if (target.closest("button,textarea,input,a")) return;
          onExpand();
        }}
        role={expandable ? "button" : undefined}
        tabIndex={expandable ? 0 : undefined}
        aria-label={expandable ? "Expand stack" : undefined}
        onKeyDown={
          expandable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onExpand();
                }
              }
            : undefined
        }
        className={cn(
          "group/card relative rounded-overlay bg-bg p-3 ring-1 ring-border outline-none",
          draggable && "cursor-grab active:cursor-grabbing",
          expandable && "focus-visible:ring-accent"
        )}
      >
        <div>{children}</div>
        {/* Arrival strike: one accent ring that lands and fades. Decorative one-shot. */}
        <AnimatePresence>
          {flash != null && (
            <motion.span
              key={flash}
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-overlay ring-2 ring-accent"
              initial={{ opacity: 0.55 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: durations.bloom, ease: easeEnter }}
              onAnimationComplete={onFlashDone}
            />
          )}
        </AnimatePresence>
        <div
          className={cn(
            "absolute -right-1.5 -top-1.5 transition-opacity duration-150",
            hoverable && "opacity-0 group-hover/card:opacity-100 has-[:focus-visible]:opacity-100"
          )}
        >
          <CardButton
            label="Remove from bar"
            onClick={() => onRemove(item)}
            className="bg-bg-2 ring-1 ring-border hover:bg-bg-2"
          >
            <X />
          </CardButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 * Bar body: workspace, mode, sections. Shared by the rail and the float
 * panel, which is what lets cards glide between the two surfaces.
 * ------------------------------------------------------------------ */

interface BarBodyProps {
  scope: Scope;
  onCycleScope: () => void;
  mode: "push" | "float";
  onMode: (m: "push" | "float") => void;
  modeChoice: boolean;
  onClose: () => void;
  items: BarItem[];
  expanded: Record<string, boolean>;
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onRemove: (item: BarItem) => void;
  onDragOut: (item: BarItem) => void;
  render: (item: BarItem) => React.ReactNode;
  flash: { id: string; nonce: number } | null;
  onFlashDone: () => void;
  motionOk: boolean;
}

function BarBody({
  scope,
  onCycleScope,
  mode,
  onMode,
  modeChoice,
  onClose,
  items,
  expanded,
  setExpanded,
  onRemove,
  onDragOut,
  render,
  flash,
  onFlashDone,
  motionOk,
}: BarBodyProps) {
  const scopeItems = items.filter((i) => i.scope === scope);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-0.5 py-2 pl-3 pr-2">
        <Tooltip label="Switch workspace">
          <motion.button
            aria-label={`Workspace ${SCOPES[scope].name}, switch`}
            onClick={onCycleScope}
            whileTap={{ scale: pressScaleSmall }}
            transition={{ duration: durations.press, ease: "easeOut" }}
            className="flex h-8 min-w-0 items-center gap-2 rounded-control px-2 text-fg-2 outline-none transition-colors duration-150 hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={scope}
                variants={fadeSlide(-6)}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex items-center gap-2"
              >
                {SCOPES[scope].icon}
                <span className="truncate text-body font-medium text-text">
                  {SCOPES[scope].name}
                </span>
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </Tooltip>

        <div className="flex-1" />

        {modeChoice && (
          <div className="flex items-center" role="group" aria-label="Bar behaviour">
            {(["push", "float"] as const).map((m) => (
              <span key={m} className="relative">
                <IconButton
                  label={m === "push" ? "Squeeze the page" : "Float over the page"}
                  aria-pressed={mode === m}
                  onClick={() => onMode(m)}
                  className={cn("size-8", mode === m ? "text-fg" : undefined)}
                >
                  {m === "push" ? <Columns2 /> : <Layers />}
                </IconButton>
                {mode === m && (
                  <motion.span
                    aria-hidden
                    layoutId="cbar-mode-ink"
                    transition={motionOk ? springSnap : { duration: 0 }}
                    className="absolute inset-x-2 bottom-0.5 h-0.5 rounded-full bg-fg-2"
                  />
                )}
              </span>
            ))}
          </div>
        )}

        <IconButton label="Hide context bar" onClick={onClose} className="size-8">
          <PanelRight />
        </IconButton>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-clip px-4 pb-6 pt-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={scope}
            variants={fadeRise}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {scopeItems.length === 0 ? (
              <div className="mt-16 flex flex-col items-center gap-3 text-center">
                <PanelRight className="size-6 text-fg-2/50" aria-hidden />
                <div>
                  <p className="text-body font-medium text-text-2">Nothing kept here</p>
                  <p className="mt-1 text-caption text-text-2/80">
                    Send a card over from the page
                  </p>
                </div>
              </div>
            ) : (
              SECTION_ORDER.map((section) => {
                const sectionItems = scopeItems.filter((i) => i.section === section);
                if (!sectionItems.length) return null;
                const key = `${scope}:${section}`;
                const isOpen = !!expanded[key];
                return (
                  <section key={section} className="mt-6 first:mt-2">
                    <header className="flex items-baseline justify-between">
                      <h3 className="text-caption font-medium uppercase tracking-[0.08em] text-text-2">
                        {SECTION_LABEL[section]}
                      </h3>
                      <AnimatePresence>
                        {isOpen && sectionItems.length > 1 && (
                          <motion.button
                            variants={fadeRise}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={() =>
                              setExpanded((prev) => ({ ...prev, [key]: false }))
                            }
                            className="text-caption text-text-2 outline-none transition-colors duration-150 hover:text-text focus-visible:outline-2 focus-visible:outline-accent"
                          >
                            Show less
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </header>
                    <div className="mt-3">
                      <Stack
                        items={sectionItems}
                        expanded={isOpen}
                        onExpand={() => setExpanded((prev) => ({ ...prev, [key]: true }))}
                        onRemove={onRemove}
                        onDragOut={onDragOut}
                        render={render}
                        flash={flash}
                        onFlashDone={onFlashDone}
                        motionOk={motionOk}
                      />
                    </div>
                  </section>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Page side: a card that can be adopted, and the ghost it leaves behind.
 * ------------------------------------------------------------------ */

function PageSlot({
  id,
  docked,
  onDock,
  onRecall,
  motionOk,
  children,
}: {
  id: AdoptableId;
  docked: boolean;
  onDock: () => void;
  onRecall: () => void;
  motionOk: boolean;
  children: React.ReactNode;
}) {
  const hoverable = useHoverCapable();
  return docked ? (
    <motion.button
      key="ghost"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { ...enter, delay: 0.16 } }}
      onClick={onRecall}
      className="flex min-h-20 w-full items-center gap-2.5 rounded-overlay p-4 text-left text-text-2/70 outline-none transition-colors duration-150 hover:text-text-2 focus-visible:outline-2 focus-visible:outline-accent"
    >
      <PanelRight className="size-4 shrink-0" aria-hidden />
      <span className="text-caption">
        {TITLES[id]} is in the context bar · tap to recall
      </span>
    </motion.button>
  ) : (
    <motion.div
      key="card"
      layoutId={`card-${id}`}
      transition={motionOk ? spring : { duration: 0 }}
      className="group/slot relative rounded-overlay bg-bg p-4 ring-1 ring-border"
    >
      {children}
      {/* Outside the corner, in the same chip idiom as the bar's remove control,
          so it can never collide with a card's own trailing controls (F57). */}
      <div
        className={cn(
          "absolute -right-1.5 -top-1.5 transition-opacity duration-150",
          hoverable && "opacity-0 group-hover/slot:opacity-100 has-[:focus-visible]:opacity-100"
        )}
      >
        <CardButton
          label="Keep in context bar"
          onClick={onDock}
          className="bg-bg-2 ring-1 ring-border hover:bg-bg-2"
        >
          <ArrowRightToLine />
        </CardButton>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 * The mock
 * ------------------------------------------------------------------ */

export default function ContextBarMockPage() {
  const { dark, toggle: toggleTheme } = useTheme();
  const { enabled: motionSetting, toggle: toggleMotion } = useMotionSetting();
  const motionOk = useMotionEnabled();
  const isLg = useMinWidth(1024);
  const isSm = useMinWidth(640);

  /* ---- live state, deliberately above both renders (D25) ---- */
  const [seconds, setSeconds] = React.useState(9 * 60 + 12);
  const [running, setRunning] = React.useState(true);
  const [track, setTrack] = React.useState(0.36);
  const [playing, setPlaying] = React.useState(true);
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (!running && !playing) return;
    const t = setInterval(() => {
      if (running) setSeconds((s) => s + 1);
      if (playing) setTrack((p) => (p + 1 / 252) % 1);
    }, 1000);
    return () => clearInterval(t);
  }, [running, playing]);

  /* ---- bar state ---- */
  const [tab, setTab] = React.useState<"overview" | "reports">("overview");
  const [open, setOpen] = React.useState(true);
  const [mode, setMode] = React.useState<"push" | "float">("push");
  const [scope, setScope] = React.useState<Scope>("atlas");
  const [docked, setDocked] = React.useState<BarItem[]>(SEED);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [flash, setFlash] = React.useState<{ id: string; nonce: number } | null>(null);
  const seqRef = React.useRef(10);
  const clipRef = React.useRef(0);

  /* Phones start with the bar tucked away behind the floating control. */
  React.useEffect(() => {
    if (!window.matchMedia("(min-width: 640px)").matches) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDocked = React.useCallback(
    (id: string) => docked.some((i) => i.id === id),
    [docked]
  );

  const land = (id: string) => setFlash({ id, nonce: ++seqRef.current });

  const dock = (id: AdoptableId, section: SectionId) => {
    setOpen(true);
    setDocked((d) =>
      d.some((i) => i.id === id)
        ? d
        : [{ id, kind: id, section, scope, seq: ++seqRef.current }, ...d]
    );
    land(id);
  };

  const removeById = (id: string) => setDocked((d) => d.filter((i) => i.id !== id));

  const pushClip = () => {
    setOpen(true);
    const n = clipRef.current++;
    const id = `clip-${n}`;
    setDocked((d) => [
      {
        id,
        kind: "clip",
        section: "clips",
        scope,
        seq: ++seqRef.current,
        clipText: CLIP_POOL[n % CLIP_POOL.length],
      },
      ...d,
    ]);
    land(id);
  };

  const renderItem = React.useCallback(
    (item: BarItem): React.ReactNode => {
      switch (item.kind) {
        case "timer":
          return (
            <TimerCard seconds={seconds} running={running} onToggle={() => setRunning((r) => !r)} />
          );
        case "player":
          return (
            <PlayerCard progress={track} playing={playing} onToggle={() => setPlaying((p) => !p)} />
          );
        case "spark":
          return <SparkCard motionOk={motionOk} />;
        case "note":
          return <NoteCard value={note} onChange={setNote} />;
        case "clip":
          return <ClipCard text={item.clipText ?? ""} />;
        case "deploy":
          return <DeployCard />;
        case "oncall":
          return <OncallCard />;
      }
    },
    [seconds, running, track, playing, note, motionOk]
  );

  const railVisible = open && mode === "push" && isLg;
  const floatVisible = open && !railVisible;

  const barBody = (
    <BarBody
      scope={scope}
      onCycleScope={() => setScope((s) => (s === "atlas" ? "northwind" : "atlas"))}
      mode={mode}
      onMode={setMode}
      modeChoice={isLg}
      onClose={() => setOpen(false)}
      items={docked}
      expanded={expanded}
      setExpanded={setExpanded}
      onRemove={(item) => removeById(item.id)}
      onDragOut={(item) => removeById(item.id)}
      render={renderItem}
      flash={flash}
      onFlashDone={() => setFlash(null)}
      motionOk={motionOk}
    />
  );

  return (
    <LayoutGroup>
      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-header bg-bg/85 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-4 sm:gap-6 sm:px-6">
            <span className="flex items-baseline gap-2">
              <span className="font-display text-section font-bold text-text">atlas</span>
              <span className="hidden text-caption text-text-2 sm:inline">context bar mock</span>
            </span>
            <nav aria-label="Pages" className="flex items-center gap-1">
              {(["overview", "reports"] as const).map((t) => (
                <span key={t} className="relative">
                  <button
                    onClick={() => setTab(t)}
                    aria-current={tab === t ? "page" : undefined}
                    className={cn(
                      "flex h-8 items-center rounded-control px-2 text-body capitalize outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
                      tab === t ? "text-text" : "text-text-2 hover:text-text"
                    )}
                  >
                    {t}
                  </button>
                  {tab === t && (
                    <motion.span
                      aria-hidden
                      layoutId="mock-tab-ink"
                      transition={motionOk ? springSnap : { duration: 0 }}
                      className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-accent"
                    />
                  )}
                </span>
              ))}
            </nav>
            <div className="flex flex-1 items-center justify-end">
              <IconButton
                label={motionSetting ? "Reduce motion" : "Enable motion"}
                onClick={toggleMotion}
              >
                {motionSetting ? <Zap /> : <ZapOff />}
              </IconButton>
              <IconButton label={dark ? "Light theme" : "Dark theme"} onClick={toggleTheme}>
                {dark ? <Sun /> : <Moon />}
              </IconButton>
              <IconButton
                label={open ? "Hide context bar" : "Show context bar"}
                aria-pressed={open}
                onClick={() => setOpen((o) => !o)}
                className={open ? "text-fg" : undefined}
              >
                <PanelRight />
              </IconButton>
            </div>
          </div>
        </header>

        <div className="flex min-h-[calc(100dvh-3.5rem)] flex-1 items-stretch">
          <main className="min-w-0 flex-1">
            <div className="mx-auto max-w-[760px] px-5 pb-28 pt-10 sm:px-8">
              <AnimatePresence mode="wait" initial={false}>
                {tab === "overview" ? (
                  <motion.div
                    key="overview"
                    variants={fadeRise}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <h1 className="font-display text-title font-bold text-text">
                      Monday at atlas
                    </h1>
                    <p className="mt-2 max-w-[46ch] text-body text-text-2">
                      Anything on this page can be kept in the context bar. The card
                      itself moves there, keeps running, and survives a page change.
                    </p>

                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <PageSlot
                        id="timer"
                        docked={isDocked("timer")}
                        onDock={() => dock("timer", "now")}
                        onRecall={() => removeById("timer")}
                        motionOk={motionOk}
                      >
                        <TimerCard
                          seconds={seconds}
                          running={running}
                          onToggle={() => setRunning((r) => !r)}
                        />
                      </PageSlot>
                      <PageSlot
                        id="player"
                        docked={isDocked("player")}
                        onDock={() => dock("player", "now")}
                        onRecall={() => removeById("player")}
                        motionOk={motionOk}
                      >
                        <PlayerCard
                          progress={track}
                          playing={playing}
                          onToggle={() => setPlaying((p) => !p)}
                        />
                      </PageSlot>
                      <PageSlot
                        id="note"
                        docked={isDocked("note")}
                        onDock={() => dock("note", "notes")}
                        onRecall={() => removeById("note")}
                        motionOk={motionOk}
                      >
                        <NoteCard value={note} onChange={setNote} />
                      </PageSlot>
                    </div>

                    <div className="mt-14">
                      <h2 className="text-caption font-medium uppercase tracking-[0.08em] text-text-2">
                        From code
                      </h2>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <Button size="sm" onClick={pushClip}>
                          <Plus aria-hidden />
                          bar.push(clip, &#123; section: &quot;clips&quot; &#125;)
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => removeById("player")}
                          disabled={!isDocked("player")}
                        >
                          <X aria-hidden />
                          bar.remove(&quot;player&quot;)
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => dock("note", "notes")}
                          disabled={isDocked("note")}
                        >
                          <ArrowRightToLine aria-hidden />
                          bar.push(note, &#123; section: &quot;notes&quot; &#125;)
                        </Button>
                      </div>
                      <p className="mt-3 text-caption text-text-2/80">
                        The component exposes push(node, &#123; id, section &#125;) and
                        remove(id); dragging a card out of the bar is the same removal
                        by hand.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="reports"
                    variants={fadeRise}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <h1 className="font-display text-title font-bold text-text">Reports</h1>
                    <p className="mt-2 max-w-[46ch] text-body text-text-2">
                      A different page. Whatever the bar is holding is still there,
                      still running: that is the point of keeping the component, not a
                      reference to it.
                    </p>
                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <PageSlot
                        id="spark"
                        docked={isDocked("spark")}
                        onDock={() => dock("spark", "now")}
                        onRecall={() => removeById("spark")}
                        motionOk={motionOk}
                      >
                        <SparkCard motionOk={motionOk} />
                      </PageSlot>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>

          {/* Push mode: the rail is real layout, so opening it squeezes the page.
              Its content is anchored left and overflows past the right viewport
              edge during the width tween; body overflow-x: clip swallows it. */}
          <motion.div
            initial={false}
            animate={{ width: railVisible ? 320 : 0 }}
            transition={motionOk ? morph : { duration: 0 }}
            className="shrink-0"
          >
            {railVisible && (
              <aside aria-label="Context bar" className="h-full w-80 bg-bg-2">
                <div className="sticky top-14 h-[calc(100dvh-3.5rem)]">{barBody}</div>
              </aside>
            )}
          </motion.div>
        </div>

        {/* Float mode: a detached translucent panel with the minimal shadow. */}
        <AnimatePresence>
          {floatVisible && (
            <motion.aside
              key="float"
              aria-label="Context bar"
              initial={{ opacity: 0, x: 24, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1, transition: enter }}
              exit={{ opacity: 0, x: 24, transition: exitT }}
              className="fixed bottom-3 right-3 top-16 z-raised flex w-80 max-w-[calc(100vw-1.5rem)] flex-col rounded-overlay bg-bg-2/75 shadow-overlay ring-1 ring-border backdrop-blur-md"
            >
              {barBody}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Small screens tuck the bar behind one floating control. */}
        <AnimatePresence>
          {!open && !isSm && (
            <motion.button
              key="fab"
              aria-label="Show context bar"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, transition: enter }}
              exit={{ opacity: 0, scale: 0.8, transition: exitT }}
              whileTap={{ scale: pressScaleSmall }}
              onClick={() => setOpen(true)}
              className="fixed bottom-4 right-4 z-raised flex size-12 items-center justify-center rounded-full bg-bg-2 text-fg-2 shadow-overlay ring-1 ring-border outline-none focus-visible:outline-2 focus-visible:outline-accent"
            >
              <PanelRight className="size-5" aria-hidden />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
