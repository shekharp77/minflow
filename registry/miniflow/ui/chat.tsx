"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUp,
  Box,
  ChevronDown,
  Layers,
  Maximize2,
  Minus,
  Paperclip,
  Scan,
  Search,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Menu, MenuItem } from "@/components/ui/menu";
import { Spinner } from "@/components/ui/spinner";
import { Portal } from "@/components/ui/overlay";
import { enter, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Floating chat window: materializes from its corner (blur + scale
 * together, per the material rule), welcomes with suggestion pills, and
 * streams its reply character by character. Assistant text sits naked on
 * the canvas; only the human's words get a surface.
 */
interface Message {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  { icon: <Sparkles />, label: "Draft a component" },
  { icon: <Search />, label: "Audit the tokens" },
  { icon: <Box />, label: "Plan a release" },
];

const REPLY =
  "On it. I drafted a plan: tokens first, then motion presets, then the registry entry. Nothing ships until both themes pass contrast.";

export interface ChatWindowProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  context?: string;
  appName?: string;
}

export function ChatWindow({
  open,
  onClose,
  title = "Assistant",
  context = "atlas",
  appName = "miniflow",
}: ChatWindowProps) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [draft, setDraft] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const streamTimer = React.useRef<number>(0);

  const scrollToEnd = React.useCallback(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setDraft("");
    setThinking(true);
    window.setTimeout(() => {
      setThinking(false);
      setMessages((m) => [...m, { role: "assistant", text: "" }]);
      let i = 0;
      streamTimer.current = window.setInterval(() => {
        i += 2;
        setMessages((m) => {
          const next = [...m];
          next[next.length - 1] = {
            role: "assistant",
            text: REPLY.slice(0, i),
          };
          return next;
        });
        if (i >= REPLY.length) window.clearInterval(streamTimer.current);
      }, 24);
    }, 700);
  };

  React.useEffect(() => {
    scrollToEnd();
  }, [messages, thinking, scrollToEnd]);

  React.useEffect(() => () => window.clearInterval(streamTimer.current), []);

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.95, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.96, y: 16, filter: "blur(4px)" }}
            transition={spring}
            style={{ transformOrigin: "bottom right" }}
            className="fixed bottom-6 right-6 z-overlay flex h-[540px] max-h-[78vh] w-[360px] max-w-[calc(100vw-3rem)] flex-col rounded-overlay bg-bg shadow-overlay ring-1 ring-border"
          >
            <div className="flex h-11 shrink-0 items-center gap-1 pl-4 pr-2">
              <span className="text-body font-medium text-text">{title}</span>
              <span className="ml-auto flex items-center">
                <IconButton label="Minimize" className="size-8">
                  <Minus />
                </IconButton>
                <IconButton label="Expand" className="size-8">
                  <Maximize2 />
                </IconButton>
                <IconButton label="Close" className="size-8" onClick={onClose}>
                  <X />
                </IconButton>
              </span>
            </div>

            <div
              ref={bodyRef}
              className="flex-1 overflow-y-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                  <Sparkles aria-hidden className="size-5 text-fg-2" />
                  <p className="font-display text-section font-semibold text-text">
                    What should we build?
                  </p>
                  <p className="text-caption text-text-2">
                    Ask {appName} for a plan, a component, or a review
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => send(s.label)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border-strong px-3 text-body text-text outline-none transition-colors duration-150 hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&_svg]:size-4 [&_svg]:text-fg-2"
                      >
                        {s.icon}
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 py-3">
                  {messages.map((m, i) =>
                    m.role === "user" ? (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={enter}
                        className="max-w-[85%] self-end rounded-overlay bg-bg-2 px-3 py-1.5 text-body text-text"
                      >
                        {m.text}
                      </motion.div>
                    ) : (
                      <p key={i} className="max-w-[95%] text-body text-text">
                        {m.text}
                      </p>
                    )
                  )}
                  {thinking && (
                    <span className="flex items-center gap-2 text-caption text-text-2">
                      <Spinner size={16} label="Thinking" />
                      Thinking
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="shrink-0 px-3 pb-3">
              <div className="mb-2 flex px-1">
                <span className="inline-flex h-6 items-center gap-1 rounded-full bg-id-1/12 px-2 text-caption font-medium text-id-1 [&_svg]:size-4">
                  <Box aria-hidden />
                  {context}
                </span>
              </div>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send(draft);
                }}
                placeholder="Ask, or @ mention any project or doc"
                className="w-full bg-transparent px-1 font-sans text-body text-text outline-none placeholder:text-text-2/70"
              />
              <div className="mt-2 flex items-center">
                <Menu
                  side="top"
                  trigger={
                    <button
                      type="button"
                      className="inline-flex h-8 items-center gap-1 rounded-control px-1.5 text-caption text-text-2 outline-none transition-colors duration-150 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&_svg]:size-4"
                    >
                      <Layers aria-hidden />
                      Tools
                      <ChevronDown aria-hidden />
                    </button>
                  }
                >
                  <MenuItem icon={<Layers />}>Component research</MenuItem>
                  <MenuItem icon={<Sparkles />}>Token audit</MenuItem>
                </Menu>
                <span className="ml-auto flex items-center">
                  <IconButton label="Focus mode" className="size-8">
                    <Scan />
                  </IconButton>
                  <IconButton label="Attach" className="size-8">
                    <Paperclip />
                  </IconButton>
                  <IconButton
                    label="Send"
                    accent={!!draft.trim()}
                    className="size-8"
                    onClick={() => send(draft)}
                  >
                    <ArrowUp />
                  </IconButton>
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
