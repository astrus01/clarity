"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine, Search, Calendar, Globe, FileText, Sparkles } from "lucide-react";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
  color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "draft-reply",
    label: "Draft Reply",
    icon: <PenLine className="h-4 w-4" />,
    prompt: "Draft a reply to the most recent email",
    color: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  },
  {
    id: "news-brief",
    label: "News Brief",
    icon: <Search className="h-4 w-4" />,
    prompt: "What's the most important news for me today?",
    color: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
  },
  {
    id: "check-availability",
    label: "Check Availability",
    icon: <Calendar className="h-4 w-4" />,
    prompt: "Do I have time for a 2-hour deep work block?",
    color: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
  },
  {
    id: "web-research",
    label: "Research",
    icon: <Globe className="h-4 w-4" />,
    prompt: "Research the top AI productivity tools",
    color: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
  },
  {
    id: "report",
    label: "Generate Report",
    icon: <FileText className="h-4 w-4" />,
    prompt: "Create a summary of this week's emails and meetings",
    color: "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20",
  },
  {
    id: "insights",
    label: "Get Insights",
    icon: <Sparkles className="h-4 w-4" />,
    prompt: "What patterns do you see in my productivity?",
    color: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
  },
];

export function QuickActionsBar() {
  const handleActionClick = (prompt: string) => {
    // TODO: Send to command bar / agent
    console.log("Quick action triggered:", prompt);
    // Dispatch custom event that command bar can listen to
    window.dispatchEvent(new CustomEvent("clarity-command", { detail: prompt }));
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              className={`h-auto p-3 flex flex-col items-center gap-2 transition-all group ${action.color}`}
              onClick={() => handleActionClick(action.prompt)}
            >
              {action.icon}
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
