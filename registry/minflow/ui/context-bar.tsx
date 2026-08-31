"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { ArrowRightToLine, Columns2, Layers, PanelRight, X } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Tooltip } from "@/components/ui/tooltip";
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

/*
 * Context bar: a standing, non-modal companion rail on the right that holds
 * LIVE component instances. A card sent over keeps running - a timer keeps
 * counting, a player keeps playing - because the instance is owned here and
 * never remounts: page slots and bar cards are only *frames* that adopt the
 * instance's DOM.
 *
 * How the ownership works, because it is the whole point:
 *
 *  - Each item renders exactly once, through a portal into a detached host
 *    element the provider owns. `Keepable` (on the page) and the bar card are
 *    frames containing a `HostSlot`, which appends that host element into
 *    itself on mount. Keeping a card moves DOM; React state inside the
 *    instance survives, across keep, recall, and route changes.
 *  - The item's node lives in a mutable store read via useSyncExternalStore,
 *    not in provider state: a page re-render refreshes one item's subtree
 *    without re-rendering the provider, and without the render loop that
 *    pushing fresh JSX into state every render would cause.
 *  - The adoption flight is a shared `layoutId` morph between the two frames;
 *    the instance rides whichever frame exists.
 *
 * The bar itself: sections created on demand, newest item on top, older items
 * overlapped in an iOS-style stack (click fans them out), two postures -
 * `push` squeezes the page as an in-flow rail, `float` overlaps it as a
 * translucent panel - and one bar per named scope, switched in the header.
 *
 * Three lessons from the mock round are baked in (harness findings F57-F59):
 * the keep affordance sits OUTSIDE the card corner so it can never collide
 * with the card's own controls; collapsed peeks are BOTTOM-aligned so the lip
 * is a guaranteed constant whatever the cards' heights; and stack placement is
 * written as static style when motion is off, because reduced motion strips
 * transform animations and layout must survive without them.
 */

/* ------------------------------------------------------------------ types */

export interface ContextBarScope {
  id: string;
  name: string;
  /** Identity glyph shown beside the name. Lucide at size 16. */
  icon?: React.ReactNode;
}

export interface ContextBarSection {
  id: string;
  label: string;
}

export interface KeepOptions {
  /** Stable identity: the handle `remove` takes and the flight's layoutId. */
  id: string;
  /** Section within the bar; created on demand. */
  section?: string;
  /** Used by the ghost ("<title> is in the context bar") and for a11y. */
  title?: string;
  /** Which bar this item belongs to. Defaults to the "default" scope. */
  scope?: string;
  /** Allow removing this card by dragging it out of the bar. */
  dragOut?: boolean;
}

interface ItemRecord {
  id: string;
  scope: string;
  section: string;
  title?: string;
  /** Shown in the bar. */
  kept: boolean;
  /** A Keepable for this id is currently mounted on the page. */
  homed: boolean;
  dragOut: boolean;
  /** Arrival order; higher = newer = the face of its stack. */
  seq: number;
  host: HTMLElement;
}

export type ContextBarMode = "push" | "float";

interface Ctx {
  /**
   * This provider's layout namespace.
   *
   * `layoutId` is global to the document, so two bars that both hold an item
   * called "timer" would be treated by Motion as ONE element in two places and
   * morph between them forever - neither ever settles. An application is meant
   * to be able to run several bars at once, so layout identity is scoped per
   * provider rather than per item id.
   */
  uid: string;
  items: Map<string, ItemRecord>;
  open: boolean;
  mode: ContextBarMode;
  scope: string;
  flash: { id: string; nonce: number } | null;
  api: ContextBarApi;
  internal: {
    home(id: string, meta: Omit<KeepOptions, "id">): void;
    unhome(id: string): void;
    keep(id: string): void;
    setNode(id: string, node: React.ReactNode): void;
    subscribe(id: string, cb: () => void): () => void;
    getNode(id: string): React.ReactNode;
    clearFlash(): void;
    setMode(mode: ContextBarMode): void;
    setScope(scope: string): void;
  };
}

export interface ContextBarApi {
  /** Put a component into the bar from code. Latest lands on top. */
  push(node: React.ReactNode, opts: KeepOptions): void;
  /**
   * Remove by id. A card whose page slot is currently mounted flies home and
   * keeps living there; anything else leaves the registry entirely.
   */
  remove(id: string): void;
  /** True while the id is held in the bar. */
  has(id: string): boolean;
  open(): void;
  close(): void;
  setMode(mode: ContextBarMode): void;
  setScope(scope: string): void;
}

const ContextBarContext = React.createContext<Ctx | null>(null);

function useCtx(): Ctx {
  const ctx = React.useContext(ContextBarContext);
  if (!ctx) {
    throw new Error("Context bar components need a <ContextBarProvider> above them.");
  }
  return ctx;
}

/** The bar's programmatic surface: push, remove, has, open, close. */
export function useContextBar(): ContextBarApi {
  return useCtx().api;
}

/* --------------------------------------------------------------- provider */

const DEFAULT_SCOPE = "default";
const DEFAULT_SECTION = "pinned";

export function ContextBarProvider({
  children,
  defaultOpen = true,
  defaultMode = "push",
  defaultScope = DEFAULT_SCOPE,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
  defaultMode?: ContextBarMode;
  defaultScope?: string;
}) {
  const [items, setItems] = React.useState<Map<string, ItemRecord>>(new Map());
  const [open, setOpen] = React.useState(defaultOpen);
  const [mode, setMode] = React.useState<ContextBarMode>(defaultMode);
  const [scope, setScope] = React.useState(defaultScope);
  const [flash, setFlash] = React.useState<{ id: string; nonce: number } | null>(null);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const uid = React.useId();

  const seqRef = React.useRef(0);
  /* The mutable half: nodes and their subscribers. See the header comment. */
  const nodes = React.useRef(new Map<string, React.ReactNode>());
  const subs = React.useRef(new Map<string, Set<() => void>>());

  const notify = React.useCallback((id: string) => {
    for (const cb of subs.current.get(id) ?? []) cb();
  }, []);

  const setNode = React.useCallback(
    (id: string, node: React.ReactNode) => {
      nodes.current.set(id, node);
      /* Deferred: this can be called from a component's render pass. */
      queueMicrotask(() => notify(id));
    },
    [notify]
  );

  const subscribe = React.useCallback((id: string, cb: () => void) => {
    const set = subs.current.get(id) ?? new Set();
    set.add(cb);
    subs.current.set(id, set);
    return () => {
      set.delete(cb);
    };
  }, []);

  const getNode = React.useCallback((id: string) => nodes.current.get(id) ?? null, []);

  const mutate = (fn: (next: Map<string, ItemRecord>) => void) =>
    setItems((prev) => {
      const next = new Map(prev);
      fn(next);
      return next;
    });

  const land = React.useCallback(
    (id: string) => setFlash({ id, nonce: ++seqRef.current }),
    []
  );

  const home = React.useCallback((id: string, meta: Omit<KeepOptions, "id">) => {
    mutate((next) => {
      const existing = next.get(id);
      if (existing) {
        next.set(id, { ...existing, homed: true });
        return;
      }
      next.set(id, {
        id,
        scope: meta.scope ?? DEFAULT_SCOPE,
        section: meta.section ?? DEFAULT_SECTION,
        title: meta.title,
        kept: false,
        homed: true,
        dragOut: meta.dragOut ?? true,
        seq: ++seqRef.current,
        host: document.createElement("div"),
      });
    });
  }, []);

  const unhome = React.useCallback((id: string) => {
    mutate((next) => {
      const it = next.get(id);
      if (!it) return;
      /* A kept card outlives its page; an unkept one belongs to it. */
      if (it.kept) next.set(id, { ...it, homed: false });
      else next.delete(id);
    });
  }, []);

  const keep = React.useCallback(
    (id: string) => {
      mutate((next) => {
        const it = next.get(id);
        if (!it || it.kept) return;
        next.set(id, { ...it, kept: true, seq: ++seqRef.current });
      });
      setOpen(true);
      land(id);
    },
    [land]
  );

  const scopeRef = React.useRef(scope);
  scopeRef.current = scope;
  /* `has` must read current state without making `api` unstable. */
  const itemsRef = React.useRef(items);
  itemsRef.current = items;

  const api = React.useMemo<ContextBarApi>(
    () => ({
      push(node, opts) {
        nodes.current.set(opts.id, node);
        queueMicrotask(() => notify(opts.id));
        mutate((next) => {
          const existing = next.get(opts.id);
          next.set(opts.id, {
            id: opts.id,
            scope: opts.scope ?? existing?.scope ?? scopeRef.current,
            section: opts.section ?? existing?.section ?? DEFAULT_SECTION,
            title: opts.title ?? existing?.title,
            kept: true,
            homed: existing?.homed ?? false,
            dragOut: opts.dragOut ?? existing?.dragOut ?? true,
            seq: ++seqRef.current,
            host: existing?.host ?? document.createElement("div"),
          });
        });
        setOpen(true);
        land(opts.id);
      },
      remove(id) {
        mutate((next) => {
          const it = next.get(id);
          if (!it) return;
          if (it.homed) next.set(id, { ...it, kept: false });
          else next.delete(id);
        });
      },
      has(id) {
        return itemsRef.current.get(id)?.kept ?? false;
      },
      open: () => setOpen(true),
      close: () => setOpen(false),
      setMode,
      setScope,
    }),
    [land, notify]
  );

  const ctx = React.useMemo<Ctx>(
    () => ({
      uid,
      items,
      open,
      mode,
      scope,
      flash,
      api,
      internal: {
        home,
        unhome,
        keep,
        setNode,
        subscribe,
        getNode,
        clearFlash: () => setFlash(null),
        setMode,
        setScope,
      },
    }),
    [uid, items, open, mode, scope, flash, api, home, unhome, keep, setNode, subscribe, getNode]
  );

  return (
    <ContextBarContext.Provider value={ctx}>
      {children}
      {/*
        * The instances themselves. Rendered here - and only here - into each
        * item's detached host, so no frame swap or route change ever remounts
        * them. Context flows from this position in the tree, so app-level
        * providers above the ContextBarProvider reach kept components.
        */}
      {mounted &&
        [...items.values()].map((it) => createPortal(<ItemNode id={it.id} />, it.host, it.id))}
    </ContextBarContext.Provider>
  );
}

/** Reads one item's node from the mutable store; re-renders on its writes. */
function ItemNode({ id }: { id: string }) {
  const { internal } = useCtx();
  const node = React.useSyncExternalStore(
    (cb) => internal.subscribe(id, cb),
    () => internal.getNode(id),
    () => null
  );
  return <>{node}</>;
}

/** A frame's mouth: adopts the item's host element into the local DOM. */
function HostSlot({ host }: { host: HTMLElement }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    const parent = ref.current;
    if (!parent) return;
    parent.appendChild(host);
    return () => {
      /* A later frame may already have adopted it; only detach what is ours. */
      if (host.parentNode === parent) parent.removeChild(host);
    };
  }, [host]);
  return <div ref={ref} />;
}

/* ------------------------------------------------------------------ shared */

/** 24px corner control that never bubbles a pointer-down into a drag. */
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

/** Content left beside an open rail before the page stops being readable. */
const MIN_CONTENT = 280;

/**
 * True when the space the bar was dropped into can hold a rail AND a readable
 * page beside it.
 *
 * Measured from the bar's own parent rather than from the viewport, because
 * the bar does not always own the window: dropped into a panel or a
 * documentation stage, a viewport media query reports a roomy screen while the
 * actual column is 350px, and pushing there squeezes the page to a sliver.
 */
function useRoomFor(ref: React.RefObject<HTMLElement | null>, needed: number): boolean {
  /* Optimistic so the server and the first client render agree; corrected on
     mount, the same contract `useMotionEnabled` keeps. */
  const [roomy, setRoomy] = React.useState(true);

  React.useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const measure = () => setRoomy(parent.clientWidth >= needed);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [ref, needed]);

  return roomy;
}

/* ---------------------------------------------------------------- keepable */

export interface KeepableProps extends Omit<KeepOptions, "id"> {
  id: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * A page slot whose content can be kept in the context bar. Renders the card
 * frame and the keep affordance; while kept, a quiet ghost that recalls it.
 * The children render through the provider's portal, so keeping and recalling
 * move the same live instance rather than remounting it.
 */
export function Keepable({
  id,
  section,
  title,
  scope,
  dragOut,
  className,
  children,
}: KeepableProps) {
  const { uid, items, api, internal } = useCtx();
  const motionOk = useMotionEnabled();
  const hoverable = useHoverCapable();

  /*
   * SSR and the first client paint render children inline, so the page ships
   * whole HTML; the portal takes over right after hydration, before any state
   * worth preserving exists.
   */
  const [live, setLive] = React.useState(false);
  React.useEffect(() => setLive(true), []);

  /* Every render refreshes the store, so page-driven props keep flowing to
   * the instance even while it sits in the bar. Mutable write + deferred
   * notify: no provider re-render, no loop. */
  if (live) internal.setNode(id, children);

  React.useEffect(() => {
    if (!live) return;
    internal.setNode(id, children);
    internal.home(id, { section, title, scope, dragOut });
    return () => internal.unhome(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, id]);

  const item = items.get(id);
  const kept = item?.kept ?? false;

  if (kept) {
    return (
      <motion.button
        key="ghost"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { ...enter, delay: 0.16 } }}
        onClick={() => api.remove(id)}
        className={cn(
          "flex min-h-20 w-full items-center gap-2.5 rounded-overlay p-4 text-left text-text-2/70 outline-none transition-colors duration-150 hover:text-text-2 focus-visible:outline-2 focus-visible:outline-accent",
          className
        )}
      >
        <PanelRight className="size-4 shrink-0" aria-hidden />
        <span className="text-caption">
          {title ?? id} is in the context bar · tap to recall
        </span>
      </motion.button>
    );
  }

  return (
    <motion.div
      key="card"
      layoutId={`cbar-${uid}-${id}`}
      transition={motionOk ? spring : { duration: 0 }}
      className={cn(
        "group/slot relative rounded-overlay bg-bg p-4 ring-1 ring-border",
        className
      )}
    >
      {live && item ? <HostSlot host={item.host} /> : children}
      {/* Outside the corner, in the same chip idiom as the bar's remove
          control, so it can never collide with the card's own controls (F57). */}
      <div
        className={cn(
          "absolute -right-1.5 -top-1.5 transition-opacity duration-150",
          hoverable &&
            "opacity-0 group-hover/slot:opacity-100 has-[:focus-visible]:opacity-100"
        )}
      >
        <CardButton
          label="Keep in context bar"
          onClick={() => internal.keep(id)}
          className="bg-bg-2 ring-1 ring-border hover:bg-bg-2"
        >
          <ArrowRightToLine />
        </CardButton>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ stack */

/* iOS-notification stack geometry. Newest card is the face; older cards peek
 * beneath in PEEK_Y steps, shrinking and dimming; at most MAX_PEEK peeks and
 * a "+N more" caption for the rest. */
const PEEK_Y = 10;
const PEEK_SCALE = 0.035;
const PEEK_DIM = 0.18;
const MAX_PEEK = 2;
const GAP = 8;
const FALLBACK_H = 72;

interface StackProps {
  uid: string;
  items: ItemRecord[];
  expanded: boolean;
  onExpand: () => void;
  onRemove: (id: string) => void;
  flash: { id: string; nonce: number } | null;
  onFlashDone: () => void;
  motionOk: boolean;
}

function Stack({
  uid,
  items,
  expanded,
  onExpand,
  onRemove,
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
   * Collapsed peeks are BOTTOM-aligned to the face: each scaled bottom edge
   * lands exactly PEEK_Y below the card above it. Cards have different
   * natural heights, and a top-aligned offset makes the visible lip
   * `PEEK_Y - (faceH - peekH*scale)`, which goes negative the moment the face
   * is taller than a peek and swallows it whole (F58).
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
              uid={uid}
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
              onHeight={report}
              flash={flash?.id === item.id ? flash.nonce : null}
              onFlashDone={onFlashDone}
              motionOk={motionOk}
            />
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
  uid: string;
  item: ItemRecord;
  y: number;
  scale: number;
  dim: number;
  z: number;
  collapsed: boolean;
  stackable: boolean;
  index: number;
  onExpand: () => void;
  onRemove: (id: string) => void;
  onHeight: (id: string, h: number) => void;
  flash: number | null;
  onFlashDone: () => void;
  motionOk: boolean;
}

function StackCard({
  uid,
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
  onHeight,
  flash,
  onFlashDone,
  motionOk,
}: StackCardProps) {
  const hoverable = useHoverCapable();
  /* Measures the card's full box: the stack geometry positions whole cards. */
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
  const draggable = item.dragOut && (!collapsed || index === 0);
  /* A buried card keeps no tab stop either; see `buried` below. */

  const onDragEnd = (_: unknown, info: PanInfo) => {
    /* Out of the bar means leftward, toward the page; both tests flip sign. */
    if (shouldDismiss(-info.offset.x, -info.velocity.x, 288)) onRemove(item.id);
  };

  /*
   * Past the peek limit a card is painted at zero opacity, and an invisible
   * card must not be operable: it would still take a tab stop, still answer a
   * hit test, and still be announced, so a reader could focus or click
   * something nobody can see. The "+N more" control is how those are reached.
   */
  const buried = dim === 0;
  const expandable = collapsed && stackable && !buried;

  /*
   * Expanding is wired natively rather than through React's `onClick`, and it
   * has to be.
   *
   * An item's content is rendered through a portal, so in the REACT tree it
   * hangs off the provider, not off this card - a React synthetic event raised
   * inside a kept card bubbles to the provider and never passes through this
   * component at all. Native DOM events follow real ancestry, and the item's
   * host element is a genuine DOM descendant of this card, so a plain listener
   * sees every click the card contains. Same reason Motion's drag keeps
   * working: it listens on the element itself.
   */
  const expandRef = React.useRef(onExpand);
  expandRef.current = onExpand;

  React.useEffect(() => {
    const el = measureRef.current;
    if (!el || !expandable) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      /* Never swallow a control's own click. `role=button` is deliberately not
         in this list: the card itself carries it, so every target would match. */
      if (target?.closest("button,textarea,input,a,select")) return;
      expandRef.current();
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [expandable]);

  return (
    <motion.div
      aria-hidden={buried || undefined}
      className="absolute inset-x-0 top-0"
      /*
       * With motion off, MotionConfig drops transform ANIMATIONS entirely
       * (F52), and a stack whose placement rides on `animate` collapses into
       * a pile (F59). Placement is layout, not decoration: with motion off it
       * is written as static style, which applies without animating.
       */
      style={{
        zIndex: z,
        transformOrigin: "top center",
        pointerEvents: buried ? "none" : undefined,
        ...(motionOk ? {} : { y, scale, opacity: dim }),
      }}
      initial={motionOk && !item.homed ? { opacity: 0, y: y - 14, scale: 0.98 } : false}
      animate={motionOk ? { opacity: dim, y, scale } : undefined}
      exit={{ opacity: 0, scale: motionOk ? 0.96 : 1, transition: exitT }}
      transition={spring}
    >
      <motion.div
        ref={measureRef}
        layoutId={`cbar-${uid}-${item.id}`}
        transition={motionOk ? spring : { duration: 0 }}
        drag={draggable ? "x" : false}
        dragSnapToOrigin
        dragElastic={{ left: 0.9, right: 0.08 }}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={onDragEnd}
        whileDrag={{ rotate: -1.5, scale: 1.01 }}
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
        <HostSlot host={item.host} />
        {/* Arrival strike: one accent ring that lands and fades. One-shot. */}
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
            hoverable &&
              "opacity-0 group-hover/card:opacity-100 has-[:focus-visible]:opacity-100"
          )}
        >
          <CardButton
            label="Remove from bar"
            onClick={() => onRemove(item.id)}
            className="bg-bg-2 ring-1 ring-border hover:bg-bg-2"
          >
            <X />
          </CardButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------- bar */

export interface ContextBarProps {
  /** Workspaces. More than one shows the switcher; each holds its own items. */
  scopes?: ContextBarScope[];
  /** Explicit section order and labels. Unlisted sections follow, capitalised. */
  sections?: ContextBarSection[];
  /** Rail and panel width. */
  width?: number;
  /**
   * Position within the nearest positioned ancestor instead of the viewport.
   * For demos and embedded stages; a real app wants the viewport default.
   */
  container?: boolean;
  /** Show the floating reopen control while the bar is closed. */
  reopen?: boolean;
  className?: string;
}

/**
 * The bar itself. In `push` mode it is an in-flow rail: place it as the last
 * child of the flex row that wraps the page so opening it squeezes the
 * content. In `float` mode it detaches into a translucent panel over the
 * page. Below 1024px float is forced; the rail needs room to squeeze.
 */
export function ContextBar({
  scopes,
  sections,
  width = 320,
  container = false,
  reopen = true,
  className,
}: ContextBarProps) {
  const { uid, items, open, mode, scope, flash, api, internal } = useCtx();
  const motionOk = useMotionEnabled();
  const railRef = React.useRef<HTMLDivElement>(null);
  /* Below this, a rail would leave no readable page, so the bar floats
     instead - which is also the right posture on a phone. */
  const roomy = useRoomFor(railRef, width + MIN_CONTENT);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  /* If scopes are declared and the active one is not among them, adopt the
   * first. Lets a provider default pair with any scope list. */
  React.useEffect(() => {
    if (scopes?.length && !scopes.some((s) => s.id === scope)) {
      internal.setScope(scopes[0].id);
    }
  }, [scopes, scope, internal]);

  const activeScope = scopes?.find((s) => s.id === scope) ?? scopes?.[0];
  const scopeItems = [...items.values()]
    .filter((it) => it.kept && it.scope === (activeScope?.id ?? scope))
    .sort((a, b) => b.seq - a.seq);

  /* Section order: the explicit list first, then discovery order. */
  const sectionIds: string[] = [];
  for (const s of sections ?? []) sectionIds.push(s.id);
  for (const it of [...scopeItems].sort((a, b) => a.seq - b.seq)) {
    if (!sectionIds.includes(it.section)) sectionIds.push(it.section);
  }
  const labelOf = (id: string) =>
    sections?.find((s) => s.id === id)?.label ??
    id.charAt(0).toUpperCase() + id.slice(1);

  const cycleScope = () => {
    if (!scopes || scopes.length < 2) return;
    const i = scopes.findIndex((s) => s.id === (activeScope?.id ?? scope));
    internal.setScope(scopes[(i + 1) % scopes.length].id);
  };

  const railVisible = open && mode === "push" && roomy;
  const floatVisible = open && !railVisible;

  const body = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-0.5 py-2 pl-3 pr-2">
        {scopes && scopes.length > 1 ? (
          <Tooltip label="Switch workspace">
            <motion.button
              aria-label={`Workspace ${activeScope?.name ?? scope}, switch`}
              onClick={cycleScope}
              whileTap={{ scale: pressScaleSmall }}
              transition={{ duration: durations.press, ease: "easeOut" }}
              className="flex h-8 min-w-0 items-center gap-2 rounded-control px-2 text-fg-2 outline-none transition-colors duration-150 hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={activeScope?.id ?? scope}
                  variants={fadeSlide(-6)}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex items-center gap-2"
                >
                  {activeScope?.icon}
                  <span className="truncate text-body font-medium text-text">
                    {activeScope?.name ?? scope}
                  </span>
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </Tooltip>
        ) : (
          <span className="flex h-8 items-center gap-2 px-2 text-fg-2">
            {activeScope?.icon}
            <span className="truncate text-body font-medium text-text">
              {activeScope?.name ?? "Context"}
            </span>
          </span>
        )}

        <div className="flex-1" />

        {roomy && (
          <div className="flex items-center" role="group" aria-label="Bar behaviour">
            {(["push", "float"] as const).map((m) => (
              <span key={m} className="relative">
                <IconButton
                  label={m === "push" ? "Squeeze the page" : "Float over the page"}
                  aria-pressed={mode === m}
                  onClick={() => internal.setMode(m)}
                  className={cn("size-8", mode === m ? "text-fg" : undefined)}
                >
                  {m === "push" ? <Columns2 /> : <Layers />}
                </IconButton>
                {mode === m && (
                  <motion.span
                    aria-hidden
                    layoutId={`cbar-mode-ink-${uid}`}
                    transition={motionOk ? springSnap : { duration: 0 }}
                    className="absolute inset-x-2 bottom-0.5 h-0.5 rounded-full bg-fg-2"
                  />
                )}
              </span>
            ))}
          </div>
        )}

        <IconButton label="Hide context bar" onClick={api.close} className="size-8">
          <PanelRight />
        </IconButton>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-clip px-4 pb-6 pt-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeScope?.id ?? scope}
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
              sectionIds.map((sectionId) => {
                const sectionItems = scopeItems.filter((it) => it.section === sectionId);
                if (!sectionItems.length) return null;
                const key = `${activeScope?.id ?? scope}:${sectionId}`;
                const isOpen = !!expanded[key];
                return (
                  <section key={sectionId} className="mt-6 first:mt-2">
                    <header className="flex items-baseline justify-between">
                      <h3 className="text-caption font-medium uppercase tracking-[0.08em] text-text-2">
                        {labelOf(sectionId)}
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
                        uid={uid}
                        items={sectionItems}
                        expanded={isOpen}
                        onExpand={() => setExpanded((prev) => ({ ...prev, [key]: true }))}
                        onRemove={api.remove}
                        flash={flash}
                        onFlashDone={internal.clearFlash}
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

  return (
    <>
      {/* Push mode: real layout, so opening the rail squeezes the page. Its
          content is anchored left and overflows past the right viewport edge
          during the width tween; body overflow-x: clip swallows it. */}
      <motion.div
        ref={railRef}
        initial={false}
        animate={{ width: railVisible ? width : 0 }}
        transition={motionOk ? morph : { duration: 0 }}
        className="shrink-0"
      >
        {railVisible && (
          <aside
            aria-label={`Context bar${activeScope ? `, ${activeScope.name}` : ""}`}
            style={{ width }}
            className={cn("h-full bg-bg-2", className)}
          >
            <div
              className={
                container
                  ? "flex h-full flex-col"
                  : "sticky top-14 flex h-[calc(100dvh-3.5rem)] flex-col"
              }
            >
              {body}
            </div>
          </aside>
        )}
      </motion.div>

      {/* Float mode: a detached translucent panel with the minimal shadow. */}
      <AnimatePresence>
        {floatVisible && (
          <motion.aside
            key="float"
            aria-label={`Context bar${activeScope ? `, ${activeScope.name}` : ""}`}
            initial={{ opacity: 0, x: 24, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1, transition: enter }}
            exit={{ opacity: 0, x: 24, transition: exitT }}
            style={{ width }}
            className={cn(
              "z-raised flex flex-col rounded-overlay bg-bg-2/75 shadow-overlay ring-1 ring-border backdrop-blur-md",
              container
                ? "absolute bottom-2 right-2 top-2 max-w-[calc(100%-1rem)]"
                : "fixed bottom-3 right-3 top-16 max-w-[calc(100vw-1.5rem)]",
              className
            )}
          >
            {body}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Closed: one floating control brings it back. */}
      <AnimatePresence>
        {!open && reopen && (
          <motion.button
            key="cbar-reopen"
            aria-label="Show context bar"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, transition: enter }}
            exit={{ opacity: 0, scale: 0.8, transition: exitT }}
            whileTap={{ scale: pressScaleSmall }}
            onClick={api.open}
            className={cn(
              "z-raised flex size-12 items-center justify-center rounded-full bg-bg-2 text-fg-2 shadow-overlay ring-1 ring-border outline-none focus-visible:outline-2 focus-visible:outline-accent",
              container ? "absolute bottom-3 right-3" : "fixed bottom-4 right-4"
            )}
          >
            <PanelRight className="size-5" aria-hidden />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
