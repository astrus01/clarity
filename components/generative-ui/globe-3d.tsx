"use client";

// Lazy-loaded 3D globe stub. Wire up React Three Fiber sphere + country markers during hackathon.
export function Globe3D(_props: { markers?: Array<{ lat: number; lng: number; label?: string }> }) {
  return (
    <div className="h-80 rounded-lg border border-border bg-surface flex items-center justify-center text-foreground-muted text-sm">
      Globe3D placeholder — React Three Fiber + markers
    </div>
  );
}
