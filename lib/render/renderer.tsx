"use client";

import type { SpecData } from "@json-render/core";
import {
  NewsBriefCard,
  EmailDraftCard,
  CalendarBlockCard,
  ResearchReportCard,
  ComparisonTableCard,
  Globe3dCard,
} from "@/components/generative-ui";

interface ExplorerRendererProps {
  spec: SpecData;
  loading?: boolean;
}

const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  "news-brief": NewsBriefCard,
  "email-draft": EmailDraftCard,
  "calendar-block": CalendarBlockCard,
  "research-report": ResearchReportCard,
  "comparison-table": ComparisonTableCard,
  "globe-3d": Globe3dCard,
};

export function ExplorerRenderer({ spec, loading }: ExplorerRendererProps) {
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-sm text-muted-foreground animate-shimmer">
          Generating UI...
        </div>
      </div>
    );
  }

  const Component = COMPONENT_MAP[spec.type];

  if (!Component) {
    return (
      <div className="p-4 border border-border/40 rounded-lg bg-muted/20">
        <div className="text-sm text-muted-foreground">
          Unknown component type: {spec.type}
        </div>
        <pre className="text-xs mt-2 overflow-auto">
          {JSON.stringify(spec.data, null, 2)}
        </pre>
      </div>
    );
  }

  return <Component {...(spec.data as any)} />;
}
