"use client";

import * as React from "react";
import { Blocks, Building2, Music, Pause, Play, Plus, StickyNote, Timer, X } from "lucide-react";
import { Button } from "@/registry/minflow/ui/button";
import {
  ContextBar,
  ContextBarProvider,
  Keepable,
  useContextBar,
} from "@/registry/minflow/ui/context-bar";
import { IconButton } from "@/registry/minflow/ui/icon-button";
import { durations, morph, pressScaleSmall } from "@/lib/motion";
import { motion } from "motion/react";
import type { DemoSet } from "@/components/site/demos/types";

/*
 * The context bar needs a page to sit beside, so every specimen here is a
 * miniature application: a content column, its own provider, and the bar in
 * `container` mode so it anchors to the stage rather than the viewport.
 */

/* Live fixtures ---------------------------------------------------------- */

function useTicker(running: boolean, from = 552) {
  const [seconds, setSeconds] = React.useState(from);
  React.useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  return seconds;
}

function clock(total: number) {
  const m = Math.floor(total / 60);
  const s = Math.floor(total % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function Hairline({ value }: { value: number }) {
  return (
    <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-border">
      <motion.div
        className="h-full rounded-full bg-fg-2"
        animate={{ scaleX: Math.max(0.005, Math.min(1, value)) }}
        transition={morph}
        style={{ originX: 0 }}
      />
    </div>
  );
}

/** The proof that the instance travels: this keeps counting wherever it is. */
function TimerCard() {
  const [running, setRunning] = React.useState(true);
  const seconds = useTicker(running);
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-bg-2 text-fg-2">
          <Timer className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-caption text-text-2">Deep work</p>
          <p className="font-display text-title font-bold tabular-nums text-text">
            {clock(seconds)}
          </p>
        </div>
        <motion.button
          aria-label={running ? "Pause timer" : "Start timer"}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setRunning((r) => !r);
          }}
          whileTap={{ scale: pressScaleSmall }}
          transition={{ duration: durations.press, ease: "easeOut" }}
          className="hit-target inline-flex size-6 shrink-0 items-center justify-center rounded-full text-fg-2 outline-none transition-colors duration-150 hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent [&_svg]:size-4"
        >
          {running ? <Pause /> : <Play />}
        </motion.button>
      </div>
      <Hairline value={seconds / 1500} />
    </div>
  );
}

function PlayerCard() {
  const [playing, setPlaying] = React.useState(true);
  const progress = (useTicker(playing, 84) % 252) / 252;
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
        <motion.button
          aria-label={playing ? "Pause" : "Play"}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setPlaying((p) => !p);
          }}
          whileTap={{ scale: pressScaleSmall }}
          transition={{ duration: durations.press, ease: "easeOut" }}
          className="hit-target inline-flex size-6 shrink-0 items-center justify-center rounded-full text-fg-2 outline-none transition-colors duration-150 hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent [&_svg]:size-4"
        >
          {playing ? <Pause /> : <Play />}
        </motion.button>
      </div>
      <Hairline value={progress} />
    </div>
  );
}

/** The other proof: text typed here survives the trip in both directions. */
function NoteCard() {
  const [value, setValue] = React.useState("");
  return (
    <div>
      <div className="flex items-center gap-2 text-text-2">
        <StickyNote className="size-4" aria-hidden />
        <p className="text-caption">Note to self</p>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onPointerDown={(e) => e.stopPropagation()}
        placeholder="Type here, then keep it"
        rows={2}
        className="mt-2 w-full resize-none bg-transparent text-body text-text outline-none [field-sizing:content] placeholder:text-text-2/60"
      />
    </div>
  );
}

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
      <p className="text-caption text-text-2">Deploy · api</p>
      <p className="text-body font-medium text-text">Rolling out v2.4.1</p>
      <Hairline value={0.64} />
    </div>
  );
}

/* Frame ------------------------------------------------------------------ */

/**
 * The miniature application every specimen sits in.
 *
 * `reserve` is what a real page does under a floating bar: the panel overlaps
 * by design, so the page keeps its own controls out from under it. Without it
 * the bar sits on top of the very affordance that sends cards to the bar.
 */
function Stage({
  children,
  bar,
  reserve = 0,
}: {
  children: React.ReactNode;
  bar: React.ReactNode;
  reserve?: number;
}) {
  return (
    <div className="relative flex h-[420px] w-full overflow-hidden rounded-overlay bg-bg ring-1 ring-border">
      <div
        className="min-w-0 flex-1 overflow-y-auto p-5"
        style={reserve ? { paddingRight: reserve } : undefined}
      >
        {children}
      </div>
      {bar}
    </div>
  );
}

/* Specimens -------------------------------------------------------------- */

function PostureDemo({ mode }: { mode: "push" | "float" }) {
  return (
    <ContextBarProvider defaultMode={mode}>
      <Stage
        reserve={mode === "float" ? 284 : 0}
        bar={
          <ContextBar
            container
            width={260}
            scopes={[{ id: "default", name: "atlas", icon: <Blocks className="size-4" aria-hidden /> }]}
            sections={[{ id: "pinned", label: "Kept" }]}
          />
        }
      >
        <p className="max-w-[42ch] text-body text-text-2">
          Hover a card and use the corner control to send it over. The timer
          keeps counting on the way, because the card itself moves.
        </p>
        <div className="mt-5 flex flex-col gap-4">
          <Keepable id="timer" title="Deep work timer" section="pinned">
            <TimerCard />
          </Keepable>
          <Keepable id="note" title="Note to self" section="pinned">
            <NoteCard />
          </Keepable>
        </div>
      </Stage>
    </ContextBarProvider>
  );
}

const CLIPS = [
  "Latency budget for the composer is 80ms, hard.",
  "CORE wants invoice export behind a flag until Q4.",
  "Cohort w34 retention is up 4.1% after the digest change.",
  "Ship the palette migration before the brand review.",
];

/** Drives the bar from code: push into a section, remove by id. */
function SectionsControls() {
  const bar = useContextBar();
  const next = React.useRef(0);

  return (
    <div className="mt-6">
      <p className="text-caption font-medium uppercase tracking-[0.08em] text-text-2">
        From code
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button
          size="sm"
          onClick={() => {
            const n = next.current++;
            bar.push(<ClipCard text={CLIPS[n % CLIPS.length]} />, {
              id: `clip-${n}`,
              section: "clips",
              title: "Clip",
            });
          }}
        >
          <Plus aria-hidden />
          push to clips
        </Button>
        <Button
          size="sm"
          onClick={() =>
            bar.push(<DeployCard />, { id: "deploy", section: "now", title: "Deploy" })
          }
        >
          <Plus aria-hidden />
          push to now
        </Button>
        <Button size="sm" onClick={() => bar.remove("deploy")}>
          <X aria-hidden />
          remove(&quot;deploy&quot;)
        </Button>
      </div>
    </div>
  );
}

function SectionsDemo() {
  return (
    <ContextBarProvider defaultMode="push">
      <Stage
        bar={
          <ContextBar
            container
            width={260}
            scopes={[{ id: "default", name: "atlas", icon: <Blocks className="size-4" aria-hidden /> }]}
            sections={[
              { id: "now", label: "Now" },
              { id: "clips", label: "Clips" },
            ]}
          />
        }
      >
        <p className="max-w-[42ch] text-body text-text-2">
          Push a few clips. The newest is the face of the stack, older ones tuck
          under it, and a click fans them out.
        </p>
        <div className="mt-5">
          <Keepable id="player" title="Now playing" section="now">
            <PlayerCard />
          </Keepable>
        </div>
        <SectionsControls />
      </Stage>
    </ContextBarProvider>
  );
}

function ScopesDemo() {
  return (
    <ContextBarProvider defaultMode="push" defaultScope="atlas">
      <Stage
        bar={
          <ContextBar
            container
            width={260}
            scopes={[
              { id: "atlas", name: "atlas", icon: <Blocks className="size-4" aria-hidden /> },
              {
                id: "northwind",
                name: "northwind",
                icon: <Building2 className="size-4" aria-hidden />,
              },
            ]}
            sections={[{ id: "pinned", label: "Kept" }]}
          />
        }
      >
        <p className="max-w-[42ch] text-body text-text-2">
          Keep the timer, then switch workspace in the bar header. Each scope
          holds its own items, and nothing leaks between them.
        </p>
        <div className="mt-5 flex flex-col gap-4">
          <Keepable id="atlas-timer" title="Deep work timer" section="pinned" scope="atlas">
            <TimerCard />
          </Keepable>
          <Keepable
            id="northwind-note"
            title="Northwind note"
            section="pinned"
            scope="northwind"
          >
            <NoteCard />
          </Keepable>
        </div>
      </Stage>
    </ContextBarProvider>
  );
}

export const contextDemos: DemoSet = {
  "minimilist-context-bar": {
    default: <PostureDemo mode="push" />,
    float: <PostureDemo mode="float" />,
    sections: <SectionsDemo />,
    scopes: <ScopesDemo />,
  },
};
