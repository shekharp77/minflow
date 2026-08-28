"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUp,
  AtSign,
  Box,
  ChevronDown,
  Paperclip,
  Sparkles,
  X,
} from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Menu, MenuItem, MenuLabel } from "@/components/ui/menu";
import { cn } from "@/lib/utils";
import {
  blurRise,
  cascade,
  durations,
  easeEnter,
  fadeRise,
  morph,
  useMotionEnabled,
} from "@/lib/motion";

/*
 * The opening move of a conversation with a model.
 *
 * Everything that is not the sentence you are writing is demoted: the field
 * has no border, the options are unlabelled-until-needed pills on the same
 * baseline, and the examples underneath are bare rows rather than cards. The
 * one piece of chrome is the surface fill, which exists so the caret has
 * somewhere to live on a page that is otherwise all prose.
 */

export interface PromptOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  /** Choices this option offers. Omit for a plain toggle. */
  items?: string[];
}

export interface PromptHint {
  id: string;
  icon: React.ReactNode;
  title: string;
  detail: string;
  /** Text dropped into the field when picked. Falls back to `title`. */
  prompt?: string;
}

export interface AiPromptProps {
  /** Cycled through while the field is empty and unfocused. */
  placeholders?: string[];
  options?: PromptOption[];
  hints?: PromptHint[];
  hintsLabel?: string;
  onSubmit?: (value: string) => void;
  className?: string;
}

const DEFAULT_PLACEHOLDERS = [
  "Ask anything...",
  "Draft a release note...",
  "Summarise this week...",
];

const DEFAULT_OPTIONS: PromptOption[] = [
  { id: "skills", label: "Skills", icon: <Box />, items: ["Search", "Analyse", "Write"] },
  { id: "context", label: "Context", icon: <AtSign />, items: ["Current page", "Whole project"] },
];

const DEFAULT_HINTS: PromptHint[] = [
  {
    id: "project",
    icon: <Box />,
    title: "Create a new project",
    detail: "Turn an idea into a well-scoped project",
  },
  {
    id: "research",
    icon: <Sparkles />,
    title: "Research a topic",
    detail: "Read across the backlog and report back",
  },
];

/** Quiet pill that carries an inline option. Reads as a word, not a control. */
const Pill = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  function Pill({ className, children, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex h-7 items-center gap-1.5 rounded-full px-2 text-caption font-medium text-text-2 outline-none transition-colors duration-150 hover:bg-hover hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&_svg]:size-4 [&_svg]:shrink-0",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

export function AiPrompt({
  placeholders = DEFAULT_PLACEHOLDERS,
  options = DEFAULT_OPTIONS,
  hints = DEFAULT_HINTS,
  hintsLabel = "Get started with some examples",
  onSubmit,
  className,
}: AiPromptProps) {
  const motionOn = useMotionEnabled();
  const [value, setValue] = React.useState("");
  const [focused, setFocused] = React.useState(false);
  const [showHints, setShowHints] = React.useState(true);
  const [picked, setPicked] = React.useState<Record<string, string>>({});
  const [sent, setSent] = React.useState<string | null>(null);
  const [slot, setSlot] = React.useState(0);
  const fieldRef = React.useRef<HTMLTextAreaElement>(null);

  const ready = value.trim().length > 0;

  /*
   * The placeholder only rotates while the field is genuinely idle. Cycling it
   * under someone who is mid-thought would be motion for its own sake.
   *
   * It also stops while the page is hidden. A backgrounded tab still runs
   * timers but freezes rAF, so the crossfade would keep starting and never
   * finish - the outgoing strings pile up unremoved, and the whole loop is
   * work nobody can see. Rotation resumes on the way back in.
   */
  const idle = !focused && value === "";
  const [visible, setVisible] = React.useState(true);
  React.useEffect(() => {
    const read = () => setVisible(document.visibilityState === "visible");
    read();
    document.addEventListener("visibilitychange", read);
    return () => document.removeEventListener("visibilitychange", read);
  }, []);

  React.useEffect(() => {
    if (!idle || !motionOn || !visible || placeholders.length < 2) return;
    const id = window.setInterval(
      () => setSlot((s) => (s + 1) % placeholders.length),
      3200
    );
    return () => window.clearInterval(id);
  }, [idle, motionOn, visible, placeholders.length]);

  /*
   * Auto-grow: the field is as tall as the sentence, never taller.
   *
   * The reset is `auto`, not `0px`. Zeroing the height and reading
   * `scrollHeight` back is the idiom everyone reaches for, and it collapses
   * the field to nothing the one time that read returns 0 - which then leaves
   * no caret to click into and nothing to trigger a re-measure. `auto` falls
   * back to the intrinsic single-row height instead, and the `min-h-6` floor
   * below makes a zero-height field impossible however the measurement goes.
   */
  const grow = React.useCallback(() => {
    const el = fieldRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }, []);
  React.useEffect(grow, [value, grow]);

  const commit = () => {
    if (!ready) return;
    const text = value.trim();
    onSubmit?.(text);
    setSent(text);
    setValue("");
    setShowHints(false);
    window.setTimeout(() => setSent(null), 2600);
  };

  const take = (hint: PromptHint) => {
    setValue(hint.prompt ?? hint.title);
    fieldRef.current?.focus();
  };

  return (
    <motion.div
      variants={blurRise}
      initial={motionOn ? "hidden" : false}
      animate="visible"
      transition={motionOn ? undefined : { duration: 0 }}
      className={cn("w-full max-w-2xl", className)}
    >
      {/* The field surface. Fill only: a border here would box the sentence. */}
      <div
        onClick={() => fieldRef.current?.focus()}
        className="cursor-text rounded-overlay bg-bg-2 px-3 pb-2 pt-3 sm:px-4 sm:pt-4"
      >
        <div className="relative flex items-start gap-2.5">
          <motion.span
            aria-hidden
            /* The glyph brightening is how the field says it has something to
               send, so it holds with motion off. */
            animate={{ opacity: ready ? 1 : 0.5, rotate: ready ? 0 : -8 }}
            transition={{ duration: motionOn ? durations.micro : 0, ease: easeEnter }}
            className="mt-0.5 shrink-0 text-fg-2 [&_svg]:size-4"
          >
            <Sparkles />
          </motion.span>

          <div className="relative min-w-0 flex-1">
            {/* Placeholder is rendered rather than native, so it can cross-fade. */}
            {value === "" && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden"
              >
                {/*
                  * Deliberately NOT `mode="wait"`. That would serialise the
                  * exit before the enter, which gives a beat where neither
                  * string is on screen and - worse for something that loops -
                  * makes one stalled exit stop the rotation for good. Letting
                  * the two overlap crossfades them and keeps each cycle
                  * independent of the last.
                  */}
                <AnimatePresence initial={false}>
                  <motion.span
                    key={placeholders[slot]}
                    initial={motionOn ? { opacity: 0, y: 6 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    exit={motionOn ? { opacity: 0, y: -6 } : undefined}
                    transition={{ duration: durations.micro, ease: easeEnter }}
                    className="absolute inset-0 block text-emphasis text-text-2/70"
                  >
                    {placeholders[slot]}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}
            <textarea
              ref={fieldRef}
              rows={1}
              value={value}
              aria-label="Message"
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  commit();
                }
              }}
              className="block min-h-6 w-full resize-none bg-transparent font-sans text-emphasis leading-6 text-text outline-none"
            />
          </div>
        </div>

        {/* Inline options. Same baseline as the send control, so the whole row
            reads as one sentence of affordances rather than a toolbar. */}
        <div className="mt-1 flex items-center gap-1">
          {options.map((opt) =>
            opt.items ? (
              <Menu
                key={opt.id}
                align="start"
                trigger={
                  <Pill>
                    {opt.icon}
                    {picked[opt.id] ?? opt.label}
                    <ChevronDown className="!size-3.5 opacity-60" />
                  </Pill>
                }
              >
                <MenuLabel>{opt.label}</MenuLabel>
                {opt.items.map((item) => (
                  <MenuItem
                    key={item}
                    onSelect={() =>
                      setPicked((p) => ({
                        ...p,
                        [opt.id]: p[opt.id] === item ? "" : item,
                      }))
                    }
                  >
                    {item}
                  </MenuItem>
                ))}
              </Menu>
            ) : (
              <Pill key={opt.id}>
                {opt.icon}
                {opt.label}
              </Pill>
            )
          )}

          <span className="ml-auto flex items-center gap-0.5">
            <IconButton label="Attach a file" className="size-8">
              <Paperclip />
            </IconButton>
            {/* The send control only exists once there is something to send. */}
            <AnimatePresence initial={false}>
              {ready && (
                <motion.div
                  initial={motionOn ? { opacity: 0, scale: 0.6 } : false}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={motionOn ? { opacity: 0, scale: 0.6 } : undefined}
                  transition={{ duration: durations.micro, ease: easeEnter }}
                >
                  <IconButton
                    label="Send"
                    onClick={commit}
                    className="size-8 bg-fg text-bg hover:bg-fg hover:text-bg hover:opacity-90"
                  >
                    <ArrowUp />
                  </IconButton>
                </motion.div>
              )}
            </AnimatePresence>
          </span>
        </div>
      </div>

      {/* Sent confirmation, so the field emptying is a result and not a loss. */}
      <AnimatePresence>
        {sent && (
          <motion.p
            variants={fadeRise}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mt-3 flex items-center gap-2 px-1 text-caption text-text-2 [&_svg]:size-3.5"
          >
            <Sparkles aria-hidden className="text-accent" />
            Sent - &ldquo;{sent}&rdquo;
          </motion.p>
        )}
      </AnimatePresence>

      {/* Examples. Bare rows: whitespace groups them, nothing draws a box. */}
      <AnimatePresence initial={false}>
        {showHints && hints.length > 0 && (
          <motion.div
            key="hints"
            initial={motionOn ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={motionOn ? { height: 0, opacity: 0 } : undefined}
            transition={morph}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 px-1 pt-5">
              <p className="text-caption text-text-2">{hintsLabel}</p>
              <IconButton
                label="Hide examples"
                onClick={() => setShowHints(false)}
                className="-my-2 ml-auto size-8"
              >
                <X />
              </IconButton>
            </div>

            <motion.ul
              variants={cascade(0.07, 0.06)}
              initial={motionOn ? "hidden" : false}
              animate="visible"
              className="mt-1 grid list-none grid-cols-1 gap-1 sm:grid-cols-2"
            >
              {hints.map((hint) => (
                <motion.li key={hint.id} variants={fadeRise}>
                  <button
                    type="button"
                    onClick={() => take(hint)}
                    className="group flex w-full flex-col items-start gap-1 rounded-control px-3 py-3 text-left outline-none transition-colors duration-150 hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <span className="flex items-center gap-2 text-body font-medium text-text [&_svg]:size-4 [&_svg]:shrink-0">
                      <span className="text-fg-2 transition-colors duration-150 group-hover:text-accent">
                        {hint.icon}
                      </span>
                      {hint.title}
                    </span>
                    <span className="text-caption text-text-2">{hint.detail}</span>
                  </button>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
