"use client";

import * as React from "react";
import { motion } from "motion/react";
import { enter } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Real radio inputs for forms (the design language reserves radios for real
 * forms; quick options outside forms use the Segmented control). The chosen
 * dot scales into place.
 */
interface RadioContextValue {
  name: string;
  value: string | undefined;
  setValue: (v: string) => void;
  disabled?: boolean;
}

const RadioContext = React.createContext<RadioContextValue | null>(null);

export interface RadioGroupProps {
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function RadioGroup({
  name,
  value,
  defaultValue,
  onValueChange,
  disabled,
  className,
  children,
}: RadioGroupProps) {
  const autoName = React.useId();
  const [internal, setInternal] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  const ctx = React.useMemo<RadioContextValue>(
    () => ({
      name: name ?? autoName,
      value: current,
      disabled,
      setValue: (v) => {
        if (!isControlled) setInternal(v);
        onValueChange?.(v);
      },
    }),
    [name, autoName, current, disabled, isControlled, onValueChange]
  );

  return (
    <RadioContext.Provider value={ctx}>
      <div role="radiogroup" className={cn("flex flex-col gap-2.5", className)}>
        {children}
      </div>
    </RadioContext.Provider>
  );
}

export interface RadioProps {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export function Radio({ value, label, disabled }: RadioProps) {
  const ctx = React.useContext(RadioContext);
  if (!ctx) throw new Error("Radio must be used inside RadioGroup");
  const off = disabled || ctx.disabled;
  const on = ctx.value === value;

  return (
    <label
      className={cn(
        "inline-flex cursor-pointer select-none items-center gap-2.5 text-body text-text",
        off && "cursor-default opacity-50"
      )}
    >
      <input
        type="radio"
        name={ctx.name}
        className="peer sr-only"
        checked={on}
        disabled={off}
        onChange={() => ctx.setValue(value)}
      />
      <span
        aria-hidden
        className={cn(
          "flex size-4.5 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
          on ? "border-fg" : "border-border-strong"
        )}
      >
        <motion.span
          initial={false}
          animate={{ scale: on ? 1 : 0, opacity: on ? 1 : 0 }}
          transition={enter}
          className="size-2 rounded-full bg-fg"
        />
      </span>
      {label}
    </label>
  );
}
