"use client";

import { lazy } from "react";
import type { ComponentProps } from "./types";

// Registry entries receive normalized {props, children, emit, bindings}
export type RegistryComponent = (p: ComponentProps) => React.ReactNode;

// Lazy-loaded heavy bundles (3D, Map)
const Scene3DLazy = lazy(() =>
  import("@/components/generative-ui/scene-3d").then((m) => ({ default: m.Scene3D })),
);
const MapLazy = lazy(() =>
  import("@/components/generative-ui/map-view").then((m) => ({ default: m.MapView })),
);

// Core primitives (stubbed — flesh out during hackathon)
import {
  Card,
  Grid,
  Stack,
  Heading,
  Text,
  Badge,
  Button,
  TableComp,
  Metric,
  Progress,
  Callout,
  Separator,
  Skeleton,
  Alert,
  Link as LinkComp,
  Avatar,
  Image as ImageComp,
  Accordion,
  Tabs,
  RadioGroup,
  SelectInput,
  TextInput,
  Timeline,
  BarChartComp,
  LineChartComp,
  PieChartComp,
  FollowUpChoices,
} from "@/components/generative-ui/primitives";

export const registry: Record<string, RegistryComponent> = {
  // Layout
  Card,
  Grid,
  Stack,
  // Typography
  Heading,
  Text,
  Link: LinkComp,
  // Data display
  Badge,
  Table: TableComp,
  Metric,
  Progress,
  Avatar,
  Image: ImageComp,
  // Interactive
  Button,
  Tabs,
  Accordion,
  RadioGroup,
  SelectInput,
  TextInput,
  // Specialized
  Callout,
  Separator,
  Skeleton,
  Alert,
  Timeline,
  FollowUpChoices,
  // Charts
  BarChart: BarChartComp,
  LineChart: LineChartComp,
  PieChart: PieChartComp,
  // Heavy (lazy)
  Scene3D: ({ props, children }) => (
    <Scene3DLazy {...({ props, children } as any)} />
  ),
  Map: ({ props }) => <MapLazy {...({ props } as any)} />,
};
