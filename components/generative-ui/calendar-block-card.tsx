"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, CheckCircle } from "lucide-react";

interface CalendarBlockCardProps {
  date?: string;
  startTime?: string;
  endTime?: string;
  title?: string;
  location?: string;
  description?: string;
  conflicts?: Array<{ event: string; time: string }>;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function CalendarBlockCard({
  date = "Today",
  startTime = "14:00",
  endTime = "16:00",
  title = "Deep Work Block",
  location = "",
  description = "Focused time for important tasks. Notifications silenced.",
  conflicts = [],
  onConfirm,
  onCancel,
}: CalendarBlockCardProps) {
  const duration = () => {
    const start = parseInt(startTime.split(":")[0]);
    const end = parseInt(endTime.split(":")[0]);
    const hours = end - start;
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <span>Time Block</span>
        </CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            {date}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {startTime} - {endTime} ({duration()})
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Event Details */}
          <div>
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            {location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Clock className="h-4 w-4" />
                <span>{location}</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          {/* Conflicts */}
          {conflicts.length > 0 && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="destructive" className="text-xs">
                  Conflict Detected
                </Badge>
              </div>
              <div className="space-y-1">
                {conflicts.map((conflict, i) => (
                  <div key={i} className="text-sm text-red-500/80">
                    <span className="font-medium">{conflict.event}</span>
                    <span className="text-xs ml-2">({conflict.time})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirmation Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/40">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onConfirm} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Block Time
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
