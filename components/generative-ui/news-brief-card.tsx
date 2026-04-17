"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Share2, ExternalLink } from "lucide-react";

interface NewsBriefCardProps {
  headline: string;
  summary: string;
  sentiment: "positive" | "neutral" | "negative";
  source: string;
  topic: string;
  timestamp: string;
  relatedArticles?: Array<{ title: string; url: string }>;
}

export function NewsBriefCard({
  headline,
  summary,
  sentiment,
  source,
  topic,
  timestamp,
  relatedArticles = [],
}: NewsBriefCardProps) {
  const sentimentColors = {
    positive: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    neutral: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    negative: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {topic}
          </Badge>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </div>
        <CardTitle className="text-xl leading-tight mt-2">
          {headline}
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {source}
          </span>
          <Badge className={`text-xs border ${sentimentColors[sentiment]}`}>
            {sentiment}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {summary}
        </p>

        {relatedArticles.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Related Articles
            </div>
            {relatedArticles.map((article, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors group"
              >
                <span className="text-sm truncate flex-1">{article.title}</span>
                <Button variant="ghost" size="sm" asChild className="shrink-0">
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-border/40 flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2">
            <ThumbsUp className="h-4 w-4" />
            <span>Helpful</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Discuss</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
