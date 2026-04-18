export type Ticker = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  series: number[];
};

// Fallback deterministic fixtures (for when the external quote endpoint is blocked).
const FIXTURES: Record<string, Omit<Ticker, "symbol">> = {
  NVDA: {
    name: "NVIDIA",
    price: 912.45,
    change: 18.32,
    changePct: 2.05,
    series: [870, 879, 882, 877, 890, 899, 905, 912],
  },
  AAPL: {
    name: "Apple",
    price: 218.9,
    change: -1.42,
    changePct: -0.64,
    series: [220, 221, 220, 219, 219, 218, 218, 218.9],
  },
  TQQQ: {
    name: "ProShares UltraPro QQQ",
    price: 79.55,
    change: 1.78,
    changePct: 2.29,
    series: [77, 77.5, 77.8, 78.1, 78.6, 79, 79.3, 79.55],
  },
  MSFT: {
    name: "Microsoft",
    price: 438.2,
    change: 3.1,
    changePct: 0.71,
    series: [432, 433, 434, 435, 436, 437, 437.5, 438.2],
  },
  GOOGL: {
    name: "Alphabet",
    price: 176.4,
    change: -0.6,
    changePct: -0.34,
    series: [177, 177.5, 177, 176.8, 176.5, 176.3, 176.2, 176.4],
  },
  TSLA: {
    name: "Tesla",
    price: 241.3,
    change: 5.6,
    changePct: 2.37,
    series: [233, 234, 236, 237, 238, 240, 240.8, 241.3],
  },
};

export function getQuotes(symbols: string[]): Ticker[] {
  return symbols
    .map((s) => s.toUpperCase())
    .map((symbol) => {
      const fx = FIXTURES[symbol];
      if (!fx) {
        return {
          symbol,
          name: symbol,
          price: 100,
          change: 0,
          changePct: 0,
          series: [100, 100, 100, 100, 100, 100, 100, 100],
        };
      }
      return { symbol, ...fx };
    });
}
