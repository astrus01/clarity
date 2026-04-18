"use client";

import { PanelFrame } from "@/components/chat/panel-frame";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export type ComparisonRow = {
  feature: string;
  note?: string;
  cells: string[]; // length must match tools.length; "yes"/"no" become booleans
};

export type ComparisonData = {
  title?: string;
  tools: string[];
  rows: ComparisonRow[];
  recommendation?: string;
  recommendedIndex?: number;
};

const DEFAULT_DATA: ComparisonData = {
  title: "AI coding assistants, compared",
  tools: ["Cursor", "Copilot", "Claude Code"],
  recommendedIndex: 2,
  rows: [
    { feature: "Multi-file editing", cells: ["yes", "no", "yes"] },
    {
      feature: "Agent mode",
      note: "Plans and executes tasks autonomously",
      cells: ["Basic", "Preview", "Native"],
    },
    { feature: "Terminal access", cells: ["yes", "no", "yes"] },
    { feature: "Starting price", cells: ["$20 / mo", "$10 / mo", "$17 / mo"] },
    { feature: "Best-for score · juniors", cells: ["★★★★", "★★★", "★★★★★"] },
  ],
  recommendation:
    "For a junior developer, Claude Code offers the strongest scaffolding — agent-native workflows, inline reasoning, and a terminal that keeps the editor as a canvas rather than a cage.",
};

function renderCell(value: string) {
  const norm = value.trim().toLowerCase();
  if (norm === "yes" || norm === "true" || norm === "✓") {
    return <Check className="h-4 w-4 text-primary" />;
  }
  if (norm === "no" || norm === "false" || norm === "-") {
    return <Minus className="h-4 w-4 text-foreground-muted" />;
  }
  // star rating shorthand like "★★★"
  if (/^★+$/.test(value)) {
    const n = value.length;
    return (
      <span className="inline-flex gap-1 items-center">
        {Array.from({ length: 5 }).map((_, i) => (
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
  return <span className="text-foreground">{value}</span>;
}

export function ComparisonTablePanel({ data }: { data?: ComparisonData }) {
  const d = data ?? DEFAULT_DATA;
  const tools = d.tools?.length ? d.tools : DEFAULT_DATA.tools;
  const rows = d.rows?.length ? d.rows : DEFAULT_DATA.rows;
  const recIdx = d.recommendedIndex ?? -1;

  return (
    <PanelFrame
      eyebrow="Research · live sources"
      title={d.title ?? "Compared"}
      meta={
        <span className="font-mono text-[0.7rem] text-foreground-muted">
          {tools.length} options · updated just now
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
                {tools.map((name, i) => (
                  <th
                    key={`${name}-${i}`}
                    className="px-4 py-3 text-left font-normal align-bottom"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base text-foreground">
                        {name}
                      </span>
                      {i === recIdx && (
                        <span className="text-[0.65rem] font-mono uppercase tracking-[0.1em] text-primary border border-[color:var(--primary)]/40 rounded-full px-1.5 py-0.5">
                          Pick
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={`${r.feature}-${i}`}
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
                  {tools.map((_name, colIdx) => {
                    const cell = r.cells[colIdx] ?? "";
                    return (
                      <td
                        key={colIdx}
                        className={cn(
                          "px-4 py-3.5 align-top",
                          colIdx === recIdx && "bg-primary/5",
                        )}
                      >
                        {renderCell(cell)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {d.recommendation && (
          <div className="rounded-md border border-border p-4 bg-background/30">
            <div className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-foreground-muted mb-2">
              Recommendation
            </div>
            <p
              className="text-foreground leading-[1.7] text-[0.95rem]"
              style={{ maxWidth: "65ch" }}
            >
              {d.recommendation}
            </p>
          </div>
        )}
      </div>
    </PanelFrame>
  );
}
