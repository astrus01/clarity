export type SpecElement = {
  type: string;
  props?: Record<string, any>;
  children?: string[];
};

export type Spec = {
  $schema?: string;
  root: string;
  elements: Record<string, SpecElement>;
  state?: Record<string, any>;
};

export type ComponentProps = {
  props: Record<string, any>;
  children?: React.ReactNode;
  emit?: (eventName: string, payload?: any) => void;
  bindings?: Record<string, string>;
};
