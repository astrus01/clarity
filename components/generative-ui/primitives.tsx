"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  CardRoot,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Button as UIButton } from "@/components/ui/button";
import { Skeleton as UISkeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea as UITextarea } from "@/components/ui/textarea";
import type { ComponentProps } from "@/lib/render/types";
import { useBoundProp } from "@/lib/render/state-context";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

// ---------- Layout ----------

export const Card = ({ props, children }: ComponentProps) => (
  <CardRoot
    className={cn(
      props.maxWidth === "sm" && "max-w-sm",
      props.maxWidth === "md" && "max-w-md",
      props.maxWidth === "lg" && "max-w-2xl",
      props.centered && "mx-auto",
    )}
  >
    {(props.title || props.description) && (
      <CardHeader>
        {props.title && <CardTitle>{props.title}</CardTitle>}
        {props.description && (
          <CardDescription>{props.description}</CardDescription>
        )}
      </CardHeader>
    )}
    <CardContent>{children}</CardContent>
  </CardRoot>
);

export const Grid = ({ props, children }: ComponentProps) => {
  const cols = props.columns ?? 2;
  const colsClass =
    cols === 1
      ? "grid-cols-1"
      : cols === 2
        ? "grid-cols-1 md:grid-cols-2"
        : cols === 3
          ? "grid-cols-1 md:grid-cols-3"
          : "grid-cols-1 md:grid-cols-4";
  return (
    <div className={cn("grid gap-4", colsClass, props.className)}>
      {children}
    </div>
  );
};

export const Stack = ({ props, children }: ComponentProps) => (
  <div
    className={cn(
      "flex",
      props.direction === "row" ? "flex-row" : "flex-col",
      props.align === "center" && "items-center",
      props.align === "end" && "items-end",
      props.justify === "center" && "justify-center",
      props.justify === "between" && "justify-between",
    )}
    style={{ gap: props.gap ?? "0.75rem" }}
  >
    {children}
  </div>
);

// ---------- Typography ----------

export const Heading = ({ props }: ComponentProps) => {
  const level = props.level ?? "h3";
  const Tag = level as keyof JSX.IntrinsicElements;
  return <Tag className="font-serif text-foreground">{props.text}</Tag>;
};

export const Text = ({ props }: ComponentProps) => (
  <p
    className={cn(
      "leading-relaxed",
      props.muted ? "text-foreground-muted" : "text-foreground",
    )}
    style={{ maxWidth: "65ch" }}
  >
    {props.content ?? props.text}
  </p>
);

export const Link = ({ props }: ComponentProps) => (
  <a
    href={props.href}
    target="_blank"
    rel="noreferrer"
    className="text-primary hover:opacity-80 transition-opacity underline-offset-4 hover:underline"
  >
    {props.text ?? props.label ?? props.href}
  </a>
);

// ---------- Data display ----------

export const Badge = ({ props }: ComponentProps) => (
  <UIBadge variant={props.variant ?? "default"}>{props.text ?? props.label}</UIBadge>
);

export const TableComp = ({ props }: ComponentProps) => {
  const columns: { key: string; label: string }[] = props.columns ?? [];
  const rows: any[] = props.rows ?? props.data ?? [];
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface-highlight">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className="px-4 py-2 text-left font-medium text-foreground-muted"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 text-foreground">
                  {String(r[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const Metric = ({ props }: ComponentProps) => {
  const trend = props.trend as "up" | "down" | "neutral" | undefined;
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const trendColor =
    trend === "up"
      ? "text-success"
      : trend === "down"
        ? "text-warning"
        : "text-foreground-muted";
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wider text-foreground-muted">
        {props.label}
      </span>
      <span className="font-serif text-4xl text-foreground">{props.value}</span>
      {(trend || props.detail) && (
        <span className={cn("flex items-center gap-1 text-sm", trendColor)}>
          {trend && <TrendIcon className="h-3.5 w-3.5" />}
          {props.detail}
        </span>
      )}
    </div>
  );
};

export const Progress = ({ props }: ComponentProps) => {
  const pct = Math.min(100, Math.max(0, (props.value / (props.max ?? 100)) * 100));
  return (
    <div className="space-y-1.5">
      {props.label && (
        <div className="flex justify-between text-sm text-foreground-muted">
          <span>{props.label}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div className="h-1.5 w-full rounded-full bg-surface-highlight overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export const Avatar = ({ props }: ComponentProps) => (
  <div className="h-10 w-10 rounded-full bg-surface-highlight border border-border flex items-center justify-center overflow-hidden">
    {props.src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={props.src} alt={props.alt ?? ""} className="h-full w-full object-cover" />
    ) : (
      <span className="text-sm font-medium text-foreground">
        {props.fallback ?? props.initials ?? "?"}
      </span>
    )}
  </div>
);

export const Image = ({ props }: ComponentProps) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={props.src}
    alt={props.alt ?? ""}
    className={cn(
      "max-w-full",
      props.rounded && "rounded-lg",
      props.align === "center" && "mx-auto",
    )}
    style={{ width: props.width, height: props.height }}
  />
);

// ---------- Interactive ----------

export const Button = ({ props, emit }: ComponentProps) => (
  <UIButton
    variant={props.variant ?? "primary"}
    onClick={() => emit?.("press", props.payload)}
  >
    {props.label ?? props.text}
  </UIButton>
);

export const Tabs = ({ props, children }: ComponentProps) => {
  const items: { value: string; label: string }[] = props.items ?? [];
  const [active, setActive] = useBoundProp<string>(
    props.value ?? items[0]?.value,
    props.bindings?.value,
  );
  return (
    <div>
      <div className="flex gap-1 border-b border-border">
        {items.map((t) => (
          <button
            key={t.value}
            onClick={() => setActive(t.value)}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors relative",
              active === t.value
                ? "text-foreground"
                : "text-foreground-muted hover:text-foreground",
            )}
          >
            {t.label}
            {active === t.value && (
              <span className="absolute bottom-[-1px] left-0 right-0 h-px bg-primary" />
            )}
          </button>
        ))}
      </div>
      <div className="pt-4">{children}</div>
    </div>
  );
};

export const Accordion = ({ props, children }: ComponentProps) => (
  <details className="group rounded-md border border-border bg-surface px-4 py-3 [&_summary::-webkit-details-marker]:hidden">
    <summary className="cursor-pointer list-none flex items-center justify-between text-foreground font-medium">
      {props.title}
      <span className="text-foreground-muted transition-transform group-open:rotate-180">⌄</span>
    </summary>
    <div className="pt-3 text-foreground-muted">{children}</div>
  </details>
);

export const RadioGroup = ({ props }: ComponentProps) => {
  const options: { value: string; label: string }[] = props.options ?? [];
  const [value, setValue] = useBoundProp<string>(
    props.value,
    props.bindings?.value,
  );
  return (
    <div className="flex flex-col gap-2">
      {props.label && (
        <span className="text-sm text-foreground-muted">{props.label}</span>
      )}
      <div className="flex gap-2 flex-wrap">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => setValue(o.value)}
            className={cn(
              "px-3 py-1.5 rounded-full border text-sm transition-all",
              value === o.value
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border text-foreground-muted hover:border-primary/60 hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export const SelectInput = ({ props }: ComponentProps) => {
  const options: { value: string; label: string }[] = props.options ?? [];
  const [value, setValue] = useBoundProp<string>(
    props.value,
    props.bindings?.value,
  );
  return (
    <div className="flex flex-col gap-1">
      {props.label && (
        <label className="text-sm text-foreground-muted">{props.label}</label>
      )}
      <select
        value={value ?? ""}
        onChange={(e) => setValue(e.target.value)}
        className="h-10 rounded-md border border-border bg-surface px-3 text-foreground focus:outline-none focus:border-primary"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export const TextInput = ({ props }: ComponentProps) => {
  const [value, setValue] = useBoundProp<string>(
    props.value,
    props.bindings?.value,
  );
  if (props.multiline) {
    return (
      <div className="flex flex-col gap-1">
        {props.label && (
          <label className="text-sm text-foreground-muted">{props.label}</label>
        )}
        <UITextarea
          rows={props.rows ?? 4}
          placeholder={props.placeholder}
          value={value ?? ""}
          onChange={(e) => setValue(e.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 focus:border-primary"
        />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      {props.label && (
        <label className="text-sm text-foreground-muted">{props.label}</label>
      )}
      <Input
        type={props.type ?? "text"}
        placeholder={props.placeholder}
        value={value ?? ""}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};

// ---------- Specialized ----------

export const Callout = ({ props, children }: ComponentProps) => {
  const variant = (props.variant ?? "info") as "info" | "tip" | "warning" | "important";
  const palette: Record<typeof variant, string> = {
    info: "border-l-primary bg-primary/5",
    tip: "border-l-success bg-success/5",
    warning: "border-l-warning bg-warning/5",
    important: "border-l-primary bg-primary/10",
  };
  return (
    <div className={cn("border-l-2 rounded-r-md px-4 py-3", palette[variant])}>
      {props.title && (
        <div className="font-medium text-foreground mb-1">{props.title}</div>
      )}
      <div className="text-sm text-foreground-muted">
        {props.content ?? children}
      </div>
    </div>
  );
};

export const Separator = ({ props }: ComponentProps) => (
  <div
    role="separator"
    className={cn(
      props.orientation === "vertical"
        ? "w-px h-full bg-border"
        : "h-px w-full bg-border my-2",
    )}
  />
);

export const Skeleton = ({ props }: ComponentProps) => (
  <UISkeleton
    className={cn("animate-none")}
    {...({
      style: { width: props.width ?? "100%", height: props.height ?? "1rem" },
    } as any)}
  />
);

export const Alert = ({ props }: ComponentProps) => {
  const variant = (props.variant ?? "info") as "info" | "success" | "error";
  const styles = {
    info: "border-border bg-surface text-foreground",
    success: "border-success/40 bg-success/10 text-success",
    error: "border-warning/40 bg-warning/10 text-warning",
  };
  return (
    <div className={cn("border rounded-md p-3", styles[variant])}>
      {props.title && <div className="font-medium">{props.title}</div>}
      {props.description && <div className="text-sm mt-1">{props.description}</div>}
    </div>
  );
};

export const Timeline = ({ props }: ComponentProps) => {
  const items: any[] = props.items ?? [];
  return (
    <ol className="relative border-l border-border ml-2 space-y-5">
      {items.map((it, i) => {
        const status = it.status ?? "upcoming";
        const dot =
          status === "completed"
            ? "bg-primary border-primary"
            : status === "current"
              ? "bg-surface border-primary"
              : "bg-surface border-border";
        return (
          <li key={i} className="pl-5">
            <span
              className={cn(
                "absolute -left-[5px] mt-1 h-2.5 w-2.5 rounded-full border-2",
                dot,
              )}
            />
            <div className="flex items-baseline gap-3">
              <span className="text-foreground font-medium">{it.title}</span>
              {it.date && (
                <span className="text-xs text-foreground-muted">{it.date}</span>
              )}
            </div>
            {it.description && (
              <p className="text-sm text-foreground-muted mt-0.5">
                {it.description}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
};

export const FollowUpChoices = ({ props, emit }: ComponentProps) => {
  const choices: string[] = props.choices ?? [];
  return (
    <div className="flex flex-wrap gap-2 pt-2 border-t border-border mt-4">
      {choices.map((c) => (
        <button
          key={c}
          onClick={() => emit?.("select", c)}
          className="text-xs px-3 py-1.5 rounded-full border border-border text-foreground-muted hover:text-foreground hover:border-primary/60 transition-all"
        >
          {c}
        </button>
      ))}
    </div>
  );
};

// ---------- Charts (Recharts wrappers) ----------

const ChartFallback = ({ label }: { label: string }) => (
  <div className="h-48 rounded-md border border-border border-dashed flex items-center justify-center text-foreground-muted text-sm">
    {label} chart — wire Recharts during hackathon
  </div>
);

export const BarChartComp = ({ props }: ComponentProps) => (
  <ChartFallback label={props.title ?? "Bar"} />
);
export const LineChartComp = ({ props }: ComponentProps) => (
  <ChartFallback label={props.title ?? "Line"} />
);
export const PieChartComp = ({ props }: ComponentProps) => (
  <ChartFallback label={props.title ?? "Pie"} />
);
