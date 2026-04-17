"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ClarityScorePanelProps {
  score?: number;
  trend?: "up" | "down" | "neutral";
}

export function ClarityScorePanel({
  score = 73,
  trend = "neutral",
}: ClarityScorePanelProps) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return "text-emerald-500";
    if (value >= 60) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/40 overflow-hidden relative">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Clarity Score
            </p>
            <div className="flex items-baseline gap-4">
              <span className={`text-6xl font-bold ${getScoreColor(score)}`}>
                {score}
              </span>
              <span className="text-2xl text-muted-foreground">/100</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Today&apos;s digital wellness metric
            </p>
          </div>

          {trend !== "neutral" && (
            <div
              className={`flex items-center gap-1 ${
                trend === "up" ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {trend === "up" ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              <span className="text-sm font-medium capitalize">{trend}</span>
            </div>
          )}
        </div>

        {/* TODO: Add dynamic factors breakdown */}
        <div className="mt-6 pt-4 border-t border-border/40">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-muted-foreground">Email Urgency</div>
              <div className="font-semibold text-foreground">3 High</div>
            </div>
            <div>
              <div className="text-muted-foreground">Calendar Load</div>
              <div className="font-semibold text-foreground">65%</div>
            </div>
            <div>
              <div className="text-muted-foreground">News Relevance</div>
              <div className="font-semibold text-foreground">Strong</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
