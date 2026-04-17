"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface LocationMapCardProps {
  location: string;
  zoom?: number;
  height?: string;
}

export function LocationMapCard({
  location,
  zoom = 13,
  height = "300px",
}: LocationMapCardProps) {
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;

  return (
    <Card className="bg-card/50 backdrop-blur border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <span>Location</span>
        </CardTitle>
        <div className="text-sm text-muted-foreground">{location}</div>
      </CardHeader>
      <CardContent>
        <div
          className="w-full rounded-lg overflow-hidden border border-border/40"
          style={{ height }}
        >
          <iframe
            src={embedUrl}
            width="100%"
            height={height}
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Map of ${location}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
