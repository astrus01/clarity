"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
  type: "meeting" | "focus" | "personal";
}

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Team Standup",
    startTime: "09:00",
    endTime: "09:30",
    type: "meeting",
  },
  {
    id: "2",
    title: "Deep Work Block",
    startTime: "10:00",
    endTime: "12:00",
    type: "focus",
  },
  {
    id: "3",
    title: "Client Presentation",
    startTime: "14:00",
    endTime: "15:30",
    location: "Zoom",
    type: "meeting",
  },
  {
    id: "4",
    title: "Review PRs",
    startTime: "16:00",
    endTime: "17:00",
    type: "focus",
  },
];

export function SchedulePanel() {
  const getEventColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "meeting":
        return "border-l-blue-500 bg-blue-500/5";
      case "focus":
        return "border-l-emerald-500 bg-emerald-500/5";
      case "personal":
        return "border-l-amber-500 bg-amber-500/5";
    }
  };

  const getEventBadgeVariant = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "meeting":
        return "default";
      case "focus":
        return "outline";
      case "personal":
        return "secondary";
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/40 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Today&apos;s Schedule</span>
          <Badge variant="secondary">{MOCK_EVENTS.length} events</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {MOCK_EVENTS.map((event) => (
          <div
            key={event.id}
            className={`p-3 rounded-r-lg border-l-4 ${getEventColor(event.type)} transition-all hover:bg-muted/30`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="font-medium text-sm truncate">{event.title}</div>
              <Badge variant={getEventBadgeVariant(event.type)} className="text-xs">
                {event.type}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Clock className="h-3 w-3" />
              <span>{event.startTime} - {event.endTime}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
