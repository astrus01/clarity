"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileText, Link2 } from "lucide-react";

interface Source {
  title: string;
  url: string;
  domain: string;
}

interface ResearchReportCardProps {
  title?: string;
  summary: string;
  sources: Source[];
  keyFindings?: string[];
  recommendations?: string[];
  data?: Array<{ label: string; value: number }>;
  onSourceClick?: (url: string) => void;
}

export function ResearchReportCard({
  title = "Research Report",
  summary,
  sources,
  keyFindings = [],
  recommendations = [],
  data = [],
  onSourceClick,
}: ResearchReportCardProps) {
  return (
    <Card className="bg-card/50 backdrop-blur border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {sources.length} sources
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          {summary}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Findings */}
        {keyFindings.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">
                {keyFindings.length}
              </span>
              Key Findings
            </h4>
            <ul className="space-y-2 ml-8">
              {keyFindings.map((finding, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Simple Data Chart (placeholder) */}
        {data.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3">Data Summary</h4>
            <div className="space-y-2">
              {data.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-24 text-sm truncate">{item.label}</div>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                  <div className="w-10 text-right text-sm text-muted-foreground">
                    {item.value}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-xs">
                ✓
              </span>
              Recommendations
            </h4>
            <ul className="space-y-2 ml-8">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sources */}
        <div className="pt-4 border-t border-border/40">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Sources
          </h4>
          <div className="space-y-2">
            {sources.map((source, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors group"
              >
                <div>
                  <div className="text-sm font-medium truncate max-w-[200px]">
                    {source.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {source.domain}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="shrink-0"
                  onClick={() => onSourceClick?.(source.url)}
                >
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
