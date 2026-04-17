"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";

interface Email {
  id: string;
  sender: string;
  senderInitials: string;
  subject: string;
  summary: string;
  urgency: "high" | "medium" | "low";
  timestamp: string;
}

const MOCK_EMAILS: Email[] = [
  {
    id: "1",
    sender: "Sarah Chen",
    senderInitials: "SC",
    subject: "Project Update - Q2 Roadmap",
    summary: "Review the attached roadmap and provide feedback by EOD...",
    urgency: "high",
    timestamp: "10m ago",
  },
  {
    id: "2",
    sender: "Michael Torres",
    senderInitials: "MT",
    subject: "Re: Budget Approval",
    summary: "Approved the budget with minor changes. See comments...",
    urgency: "medium",
    timestamp: "32m ago",
  },
  {
    id: "3",
    sender: "Newsletter",
    senderInitials: "NW",
    subject: "Tech Weekly: AI Trends",
    summary: "This week's top stories in AI and machine learning...",
    urgency: "low",
    timestamp: "2h ago",
  },
];

export function InboxPulsePanel() {
  const getUrgencyColor = (urgency: Email["urgency"]) => {
    switch (urgency) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "low":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  const getUrgencyIcon = (urgency: Email["urgency"]) => {
    switch (urgency) {
      case "high":
        return <AlertCircle className="h-3 w-3" />;
      case "medium":
        return <Clock className="h-3 w-3" />;
      case "low":
        return <CheckCircle className="h-3 w-3" />;
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/40 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Inbox Pulse</span>
          <Badge variant="secondary">{MOCK_EMAILS.length} unread</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {MOCK_EMAILS.map((email) => (
          <div
            key={email.id}
            className="group p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer border border-transparent hover:border-border/40"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {email.senderInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold truncate">
                    {email.sender}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-xs px-1.5 py-0 ${getUrgencyColor(email.urgency)}`}
                  >
                    <span className="flex items-center gap-1">
                      {getUrgencyIcon(email.urgency)}
                      {email.urgency}
                    </span>
                  </Badge>
                </div>
                <div className="font-medium text-sm mb-1 truncate">
                  {email.subject}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {email.summary}
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  {email.timestamp}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
