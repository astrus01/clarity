"use client";

import { PanelFrame } from "@/components/chat/panel-frame";
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Ticker = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  spark: number[];
};

const TICKERS: Ticker[] = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: 982.41,
    change: 24.18,
    changePct: 2.52,
    spark: [940, 948, 952, 944, 958, 965, 960, 972, 978, 982],
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 223.76,
    change: -1.44,
    changePct: -0.64,
    spark: [226, 227, 225, 224, 222, 223, 221, 222, 224, 223],
  },
  {
    symbol: "TQQQ",
    name: "ProShares UltraPro QQQ",
    price: 78.13,
    change: 1.92,
    changePct: 2.52,
    spark: [74, 75, 74, 76, 77, 76, 78, 77, 78, 78],
  },
];

export function StockWatchPanel() {
  return (
    <PanelFrame
      eyebrow="Markets · 3:54 PM ET"
      title="Your watchlist"
      meta={
        <Badge variant="default">
          <span className="font-mono text-[0.65rem] tracking-[0.1em]">LIVE</span>
        </Badge>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-border rounded-md border border-border overflow-hidden">
        {TICKERS.map((t) => (
          <TickerCard key={t.symbol} ticker={t} />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-foreground-muted">
        <span className="font-mono tracking-[0.1em] uppercase">
          S&P 500
        </span>
        <span className="text-foreground">5,218.44</span>
        <span className="text-[color:var(--primary)]">+0.31%</span>
        <span className="opacity-40">·</span>
        <span className="font-mono tracking-[0.1em] uppercase">Nasdaq</span>
        <span className="text-foreground">16,442.20</span>
        <span className="text-[color:var(--primary)]">+0.52%</span>
        <span className="opacity-40">·</span>
        <span className="font-mono tracking-[0.1em] uppercase">VIX</span>
        <span className="text-foreground">14.22</span>
        <span className="text-red-400">-2.1%</span>
      </div>
    </PanelFrame>
  );
}

function TickerCard({ ticker }: { ticker: Ticker }) {
  const up = ticker.change >= 0;
  return (
    <div className="p-5 flex flex-col gap-3 hover:bg-surface-highlight/50 transition-colors">
      <div className="flex items-start justify-between">
        <div>
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

      <Sparkline data={ticker.spark} up={up} />
    </div>
  );
}

function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 120;
  const h = 28;
  const step = w / (data.length - 1);
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
