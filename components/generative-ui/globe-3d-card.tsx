"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

// Lazy load heavy 3D dependencies only when needed
// import dynamic from "next/dynamic";
// const Globe3D = dynamic(() => import("@/components/generative-ui/globe-3d"), {
//   ssr: false,
//   loading: () => <div className="h-64 flex items-center justify-center text-muted-foreground">Loading 3D...</div>
// });

interface Globe3dCardProps {
  data?: Array<{ region: string; value: number; color?: string }>;
  title?: string;
}

export function Globe3dCard({
  data = [
    { region: "North America", value: 45, color: "#3b82f6" },
    { region: "Europe", value: 30, color: "#10b981" },
    { region: "Asia", value: 60, color: "#f59e0b" },
  ],
  title = "Global AI Investment by Region",
}: Globe3dCardProps) {
  return (
    <Card className="bg-card/50 backdrop-blur border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="text-2xl">🌐</span>
          <span>{title}</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Interactive 3D globe showing regional data
        </p>
      </CardHeader>

      <CardContent>
        {/* Placeholder for React Three Fiber globe */}
        <div className="relative h-64 bg-muted/20 rounded-lg border border-border/30 flex items-center justify-center overflow-hidden">
          <div className="text-center">
            <div className="text-4xl mb-2">🌍</div>
            <p className="text-sm text-muted-foreground">
              [3D Globe Placeholder]
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Implementation: Use React Three Fiber to render an interactive
              globe with data markers
            </p>
          </div>

          {/* Overlay data panel */}
          <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur rounded-lg p-4 border border-border/40">
            <div className="text-sm font-semibold mb-2">Data:</div>
            <div className="grid grid-cols-3 gap-2">
              {data.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="text-xs">
                    <span className="font-medium">{item.region}</span>
                    <span className="text-muted-foreground ml-1">
                      ({item.value})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground text-center">
          Drag to rotate • Scroll to zoom
        </div>
      </CardContent>
    </Card>
  );
}
