"use client";

import { PanelFrame } from "@/components/chat/panel-frame";
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type Ticker = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  series: number[];
};

export type StockWatchData = {
  title?: string;
  tickers: Ticker[];
  indices?: { label: string; value: string; change: string; positive?: boolean }[];
};

const DEFAULT_DATA: StockWatchData = {
  tickers: [
    {
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      price: 982.41,
      change: 24.18,
      changePct: 2.52,
      series: [940, 948, 952, 944, 958, 965, 960, 972, 978, 982],
    },
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 223.76,
      change: -1.44,
      changePct: -0.64,
      series: [226, 227, 225, 224, 222, 223, 221, 222, 224, 223],
    },
    {
      symbol: "TQQQ",
      name: "ProShares UltraPro QQQ",
      price: 78.13,
      change: 1.92,
      changePct: 2.52,
      series: [74, 75, 74, 76, 77, 76, 78, 77, 78, 78],
    },
  ],
  indices: [
    { label: "S&P 500", value: "5,218.44", change: "+0.31%", positive: true },
    { label: "Nasdaq", value: "16,442.20", change: "+0.52%", positive: true },
    { label: "VIX", value: "14.22", change: "-2.1%", positive: false },
  ],
};

export function StockWatchPanel({ data }: { data?: StockWatchData }) {
  const d = data ?? DEFAULT_DATA;
  const tickers = d.tickers?.length ? d.tickers : DEFAULT_DATA.tickers;
  const indices = d.indices ?? DEFAULT_DATA.indices ?? [];

  return (
    <PanelFrame
      eyebrow="Markets · live snapshot"
      title={d.title ?? "Your watchlist"}
      meta={
        <Badge variant="default">
          <span className="font-mono text-[0.65rem] tracking-[0.1em]">LIVE</span>
        </Badge>
      }
    >
      <div
        className={cn(
          "grid grid-cols-1 gap-0 divide-y md:divide-y-0 md:divide-x divide-border rounded-md border border-border overflow-hidden",
          tickers.length === 2 && "md:grid-cols-2",
          tickers.length === 3 && "md:grid-cols-3",
          tickers.length >= 4 && "md:grid-cols-4",
        )}
      >
        {tickers.slice(0, 4).map((t) => (
          <TickerCard key={t.symbol} ticker={t} />
        ))}
      </div>

      {indices.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-foreground-muted">
          {indices.map((idx, i) => (
            <span key={`${idx.label}-${i}`} className="inline-flex items-center gap-2">
              {i > 0 && <span className="opacity-40">·</span>}
              <span className="font-mono tracking-[0.1em] uppercase">
                {idx.label}
              </span>
              <span className="text-foreground">{idx.value}</span>
              <span
                className={
                  idx.positive ? "text-[color:var(--primary)]" : "text-red-400"
                }
              >
                {idx.change}
              </span>
            </span>
          ))}
        </div>
      )}
    </PanelFrame>
  );
}

function TickerCard({ ticker }: { ticker: Ticker }) {
  const up = ticker.change >= 0;
  return (
    <div className="p-5 flex flex-col gap-3 hover:bg-surface-highlight/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="font-serif text-[1.4rem] leading-none text-foreground">
            {ticker.symbol}
          </div>
          <div className="text-xs text-foreground-muted mt-1 truncate max-w-[16ch]">
            {ticker.name}
          </div>
        </div>
        <div
          className={cn(
            "flex items-center gap-0.5 text-xs font-medium tabular-nums",
            up ? "text-[color:var(--primary)]" : "text-red-400",
          )}
        >
          {up ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {ticker.changePct.toFixed(2)}%
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <span className="font-mono text-2xl tabular-nums text-foreground">
          ${ticker.price.toFixed(2)}
        </span>
        <span
          className={cn(
            "font-mono text-xs tabular-nums",
            up ? "text-[color:var(--primary)]" : "text-red-400",
          )}
        >
          {up ? "+" : ""}
          {ticker.change.toFixed(2)}
        </span>
      </div>

      <Sparkline data={ticker.series} up={up} />
    </div>
  );
}

function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  if (!data?.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 120;
  const h = 28;
  const step = w / Math.max(data.length - 1, 1);
  const points = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(" ");
  const color = up ? "var(--primary)" : "#f87171";

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-7"
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
