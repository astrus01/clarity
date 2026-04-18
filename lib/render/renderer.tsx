"use client";

import { memo, Suspense, useMemo } from "react";
import { processSpec } from "./process";
import { registry } from "./registry";
import { StateProvider, useRenderState } from "./state-context";
import type { Spec } from "./types";

export function GenerativeRenderer({ spec }: { spec: Spec }) {
  const clean = useMemo(() => processSpec(spec), [spec]);
  return (
    <StateProvider initialState={clean.state ?? {}}>
      <Suspense fallback={<div className="text-foreground-muted text-sm">Loading…</div>}>
        <RenderNode spec={clean} nodeKey={clean.root} />
      </Suspense>
    </StateProvider>
  );
}

const RenderNode = memo(function RenderNode({
  spec,
  nodeKey,
}: {
  spec: Spec;
  nodeKey: string;
}) {
  const { emit } = useRenderState();
  const element = spec.elements[nodeKey];
  if (!element) return null;

  const Component = registry[element.type];
  if (!Component) {
    return (
      <div className="text-xs text-warning font-mono">
        Unknown component: {element.type}
      </div>
    );
  }

  const children = element.children?.map((childKey) => (
    <RenderNode key={childKey} spec={spec} nodeKey={childKey} />
  ));

  return (
    <Component props={element.props ?? {}} emit={emit}>
      {children}
    </Component>
  );
});

export { GenerativeRenderer as ExplorerRenderer };
