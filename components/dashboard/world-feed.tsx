"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, MessageCircle, Share2 } from "lucide-react";

interface NewsCard {
  id: string;
  headline: string;
  source: string;
  summary: string;
  topic: string;
  sentiment: "positive" | "neutral" | "negative";
  timestamp: string;
}

const MOCK_NEWS: NewsCard[] = [
  {
    id: "1",
    headline: "Federal Reserve Signals Shift in Monetary Policy",
    source: "Bloomberg",
    summary: "The Fed indicated potential rate cuts coming in Q3 as inflation cools...",
    topic: "Finance",
    sentiment: "positive",
    timestamp: "15m ago",
  },
  {
    id: "2",
    headline: "Major Tech Companies Announce AI Safety Coalition",
    source: "TechCrunch",
    summary: "Leading AI labs form unprecedented alliance to ensure responsible development...",
    topic: "AI",
    sentiment: "neutral",
    timestamp: "42m ago",
  },
  {
    id: "3",
    headline: "Startup Funding Rounds Surge in Q2",
    source: "VentureBeat",
    summary: "Early-stage investments reach highest levels since 2021, with focus on enterprise AI...",
    topic: "Startups",
    sentiment: "positive",
    timestamp: "1h ago",
  },
];

export function WorldFeedPanel() {
  const getSentimentColor = (sentiment: NewsCard["sentiment"]) => {
    switch (sentiment) {
      case "positive":
        return "bg-emerald-500/10 text-emerald-500";
      case "negative":
        return "bg-red-500/10 text-red-500";
      case "neutral":
      default:
        return "bg-blue-500/10 text-blue-500";
    }
  };

  const getSentimentLabel = (sentiment: NewsCard["sentiment"]) => {
    switch (sentiment) {
      case "positive":
        return "Positive";
      case "negative":
        return "Negative";
      case "neutral":
        return "Neutral";
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>World Feed</span>
          <Badge variant="outline" className="text-xs">
            Live Updates
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {MOCK_NEWS.map((news) => (
            <div
              key={news.id}
              className="p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors border border-border/20 group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <Badge variant="secondary" className="text-xs">
                  {news.topic}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {news.timestamp}
                </span>
              </div>

              <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors">
                {news.headline}
              </h3>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {news.summary}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-medium">{news.source}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${getSentimentColor(news.sentiment)}`}
                  >
                    {getSentimentLabel(news.sentiment)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <button className="p-1 hover:text-foreground transition-colors">
                    <ThumbsUp className="h-4 w-4" />
                  </button>
                  <button className="p-1 hover:text-foreground transition-colors">
                    <MessageCircle className="h-4 w-4" />
                  </button>
                  <button className="p-1 hover:text-foreground transition-colors">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
