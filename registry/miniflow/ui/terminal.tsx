"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import {
  cascade,
  durations,
  easeEnter,
  fadeRise,
  useMotionEnabled,
} from "@/lib/motion";

/*
 * A terminal transcript that plays itself.
 *
 * The usual mockup borrows macOS chrome - three coloured dots and a title bar.
 * That is decoration standing in for meaning, so it is gone. What is left is
 * the only thing a reader needs: which lines you typed and which the machine
 * answered, told apart by a prompt glyph and by weight, not by a box.
 *
 * Commands type out a character at a time because the pause between the
 * command and its output is the part that carries information; output arrives
 * as a block, the way it actually does.
 */

export type TerminalLineKind = "command" | "output" | "success" | "error" | "comment";

export interface TerminalLine {
  kind: TerminalLineKind;
  text: string;
}

export interface TerminalProps {
  lines: TerminalLine[];
  /** Shown before every typed command. */
  prompt?: string;
  /** Muted path label above the transcript. Omit for a bare terminal. */
  title?: string;
  /** Milliseconds per character while a command types. */
  speed?: number;
  /** Start playing without waiting to be scrolled to. */
  autoPlay?: boolean;
  className?: string;
}

const tone: Record<TerminalLineKind, string> = {
  command: "text-text",
  output: "text-text-2",
  success: "text-ok",
  error: "text-err",
  comment: "text-fg-2",
};

export function Terminal({
  lines,
  prompt = "$",
  title,
  speed = 26,
  autoPlay = true,
  className,
}: TerminalProps) {
  const motionOn = useMotionEnabled();
  const [run, setRun] = React.useState(0);
  const [at, setAt] = React.useState(0);
  const [chars, setChars] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  const scroller = React.useRef<HTMLDivElement>(null);

  /* With motion off the transcript is simply already finished. */
  const instant = !motionOn || !autoPlay;

  React.useEffect(() => {
    if (instant) {
      setAt(lines.length);
      setChars(0);
      return;
    }
    setAt(0);
    setChars(0);
  }, [instant, lines.length, run]);

  React.useEffect(() => {
    if (instant || at >= lines.length) return;
    const line = lines[at];

    if (line.kind !== "command") {
      /* Output lands as a block after a beat, like a real command returning. */
      const id = window.setTimeout(() => setAt((i) => i + 1), 260);
      return () => window.clearTimeout(id);
    }

    if (chars < line.text.length) {
      const id = window.setTimeout(() => setChars((c) => c + 1), speed);
      return () => window.clearTimeout(id);
    }

    /* Command finished typing: hold on the caret, then run it. */
    const id = window.setTimeout(() => {
      setAt((i) => i + 1);
      setChars(0);
    }, 420);
    return () => window.clearTimeout(id);
  }, [at, chars, instant, lines, speed]);

  /* Follow the newest line without dragging the page with it. */
  React.useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [at, chars]);

  const done = at >= lines.length;
  const typing = !instant && !done ? lines[at] : null;

  const copy = async () => {
    const text = lines
      .map((l) => (l.kind === "command" ? `${prompt} ${l.text}` : l.text))
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* Clipboard refused (permissions, insecure origin): stay silent rather
         than throwing an error at someone who only wanted to copy a demo. */
    }
  };

  return (
    <div className={cn("group/term w-full max-w-2xl", className)}>
      <div className="flex h-8 items-center gap-2 px-1">
        {title && (
          <span className="truncate font-mono text-caption text-fg-2">{title}</span>
        )}
        <span className="ml-auto flex items-center opacity-0 transition-opacity duration-200 group-hover/term:opacity-100 focus-within:opacity-100">
          {!instant && (
            <IconButton
              label="Replay"
              className="size-8"
              onClick={() => setRun((r) => r + 1)}
            >
              <RotateCcw />
            </IconButton>
          )}
          <IconButton label={copied ? "Copied" : "Copy transcript"} className="size-8" onClick={copy}>
            {copied ? <Check className="text-ok" /> : <Copy />}
          </IconButton>
        </span>
      </div>

      <div
        ref={scroller}
        className="max-h-72 overflow-auto rounded-overlay bg-bg-2 px-3 py-3 sm:px-4 sm:py-4"
      >
        <motion.div
          key={run}
          variants={cascade(0.04)}
          initial={motionOn ? "hidden" : false}
          animate="visible"
          transition={motionOn ? undefined : { duration: 0 }}
          className="flex min-w-0 flex-col gap-1 font-mono text-caption leading-5 sm:text-body"
        >
          {lines.slice(0, at).map((line, i) => (
            <motion.div
              key={`${run}-${i}`}
              variants={fadeRise}
              className="flex gap-2"
            >
              {line.kind === "command" && (
                <span aria-hidden className="shrink-0 select-none text-accent">
                  {prompt}
                </span>
              )}
              <span className={cn("min-w-0 whitespace-pre-wrap break-words", tone[line.kind])}>
                {line.text}
              </span>
            </motion.div>
          ))}

          {/* The line currently being typed, plus the caret. */}
          {typing && typing.kind === "command" && (
            <div className="flex gap-2">
              <span aria-hidden className="shrink-0 select-none text-accent">
                {prompt}
              </span>
              <span className="min-w-0 whitespace-pre-wrap break-words text-text">
                {typing.text.slice(0, chars)}
                <Caret />
              </span>
            </div>
          )}

          {/* At rest the prompt waits, so the terminal never looks finished. */}
          <AnimatePresence>
            {done && (
              <motion.div
                initial={motionOn ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ duration: durations.micro, ease: easeEnter }}
                className="flex gap-2"
              >
                <span aria-hidden className="shrink-0 select-none text-accent">
                  {prompt}
                </span>
                <Caret />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

/* Block caret. Opacity only, so it costs nothing to keep alive. */
function Caret() {
  const motionOn = useMotionEnabled();
  return (
    <motion.span
      aria-hidden
      animate={motionOn ? { opacity: [1, 1, 0, 0] } : { opacity: 1 }}
      transition={
        motionOn
          ? { duration: 1.1, repeat: Infinity, ease: "linear", times: [0, 0.5, 0.5, 1] }
          : undefined
      }
      className="ml-px inline-block h-[1em] w-[0.5em] translate-y-[0.15em] bg-fg-2"
    />
  );
}
