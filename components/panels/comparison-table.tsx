"use client";

import { PanelFrame } from "@/components/chat/panel-frame";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  { key: "cursor", name: "Cursor", tagline: "Editor-first" },
  { key: "copilot", name: "Copilot", tagline: "Ubiquitous" },
  {
    key: "claude",
    name: "Claude Code",
    tagline: "Agentic",
    recommended: true,
  },
];

type Cell =
  | { kind: "text"; value: string }
  | { kind: "bool"; value: boolean }
  | { kind: "score"; value: number };

const rows: {
  feature: string;
  note?: string;
  cells: Record<string, Cell>;
}[] = [
  {
    feature: "Multi-file editing",
    cells: {
      cursor: { kind: "bool", value: true },
      copilot: { kind: "bool", value: false },
      claude: { kind: "bool", value: true },
    },
  },
  {
    feature: "Agent mode",
    note: "Plans and executes tasks autonomously",
    cells: {
      cursor: { kind: "text", value: "Basic" },
      copilot: { kind: "text", value: "Preview" },
      claude: { kind: "text", value: "Native" },
    },
  },
  {
    feature: "Terminal access",
    cells: {
      cursor: { kind: "bool", value: true },
      copilot: { kind: "bool", value: false },
      claude: { kind: "bool", value: true },
    },
  },
  {
    feature: "Starting price",
    cells: {
      cursor: { kind: "text", value: "$20 / mo" },
      copilot: { kind: "text", value: "$10 / mo" },
      claude: { kind: "text", value: "$17 / mo" },
    },
  },
  {
    feature: "Best-for score · juniors",
    cells: {
      cursor: { kind: "score", value: 4 },
      copilot: { kind: "score", value: 3 },
      claude: { kind: "score", value: 5 },
    },
  },
];

function Dots({ n, max = 5 }: { n: number; max?: number }) {
  return (
    <span className="inline-flex gap-1 items-center">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            i < n ? "bg-primary" : "bg-border",
          )}
        />
      ))}
    </span>
  );
}

export function ComparisonTablePanel() {
  return (
    <PanelFrame
      eyebrow="Research · live sources"
      title="AI coding assistants, compared"
      meta={
        <span className="font-mono text-[0.7rem] text-foreground-muted">
          3 sources · updated just now
        </span>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-highlight">
                <th className="px-4 py-3 text-left font-mono text-[0.7rem] uppercase tracking-[0.1em] text-foreground-muted font-normal">
                  Feature
                </th>
                {tools.map((t) => (
                  <th
                    key={t.key}
                    className="px-4 py-3 text-left font-normal align-bottom"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base text-foreground">
                        {t.name}
                      </span>
                      {t.recommended && (
                        <span className="text-[0.65rem] font-mono uppercase tracking-[0.1em] text-primary border border-[color:var(--primary)]/40 rounded-full px-1.5 py-0.5">
                          Pick
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[0.7rem] text-foreground-muted mt-0.5">
                      {t.tagline}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.feature}
                  className={cn(
                    "border-t border-border",
                    i % 2 === 1 && "bg-background/30",
                  )}
                >
                  <td className="px-4 py-3.5 align-top">
                    <div className="text-foreground">{r.feature}</div>
                    {r.note && (
                      <div className="text-xs text-foreground-muted mt-0.5">
                        {r.note}
                      </div>
                    )}
                  </td>
                  {tools.map((t) => {
                    const cell = r.cells[t.key];
                    return (
                      <td
                        key={t.key}
                        className={cn(
                          "px-4 py-3.5 align-top",
                          t.recommended && "bg-primary/5",
                        )}
                      >
                        {cell.kind === "bool" ? (
                          cell.value ? (
                            <Check className="h-4 w-4 text-primary" />
                          ) : (
                            <Minus className="h-4 w-4 text-foreground-muted" />
                          )
                        ) : cell.kind === "score" ? (
                          <Dots n={cell.value} />
                        ) : (
                          <span className="text-foreground">{cell.value}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-md border border-border p-4 bg-background/30">
          <div className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-foreground-muted mb-2">
            Recommendation
          </div>
          <p
            className="text-foreground leading-[1.7] text-[0.95rem]"
            style={{ maxWidth: "65ch" }}
          >
            For a junior developer, <strong className="font-semibold text-foreground">Claude Code</strong> offers
            the strongest scaffolding — agent-native workflows, inline
            reasoning, and a terminal that keeps the editor as a canvas rather
            than a cage.
          </p>
        </div>
      </div>
    </PanelFrame>
  );
}
