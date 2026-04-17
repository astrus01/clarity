"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle2, AlertCircle, Clock } from "lucide-react";

interface AgentLog {
  id: string;
  timestamp: string;
  level: "info" | "success" | "warn" | "error";
  message: string;
  tool?: string;
}

const MOCK_LOGS: AgentLog[] = [
  {
    id: "1",
    timestamp: "2 sec ago",
    level: "info",
    message: "Received query: 'Draft reply to Sarah'",
    tool: "Input",
  },
  {
    id: "2",
    timestamp: "1 sec ago",
    level: "info",
    message: "Planning multi-step task...",
    tool: "Planner",
  },
  {
    id: "3",
    timestamp: "Just now",
    level: "info",
    message: "Fetching email thread from Gmail",
    tool: "Gmail",
  },
];

export function ActiveAgentPanel() {
  const getLevelIcon = (level: AgentLog["level"]) => {
    switch (level) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "warn":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "info":
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLevelBadgeVariant = (
    level: AgentLog["level"]
  ): "default" | "destructive" | "outline" | "secondary" => {
    switch (level) {
      case "success":
        return "default";
      case "warn":
        return "outline";
      case "error":
        return "destructive";
      case "info":
      default:
        return "secondary";
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/40 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <span>Active Agent</span>
          <Badge variant="outline" className="text-xs animate-pulse">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Status */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
            <div className="text-sm font-semibold mb-1">Current Task</div>
            <div className="text-xs text-muted-foreground">
              Drafting reply to Sarah Chen about Q2 Roadmap
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-2/3 animate-pulse rounded-full" />
              </div>
              <span className="text-xs text-muted-foreground">67%</span>
            </div>
          </div>

          {/* Tool Call Log */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recent Activity
            </div>
            {MOCK_LOGS.map((log) => (
              <div
                key={log.id}
                className="flex gap-3 items-start text-sm group animate-in fade-in slide-in-from-bottom-1"
              >
                <div className="mt-0.5 shrink-0">{getLevelIcon(log.level)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs text-muted-foreground">
                      {log.timestamp}
                    </span>
                    {log.tool && (
                      <Badge variant="outline" className="text-[10px] px-1.5">
                        {log.tool}
                      </Badge>
                    )}
                  </div>
                  <div className="text-foreground/90">{log.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
