import type { Spec, SpecElement } from "./types";

// [STAGE 2] Sanitize: ensure every element has {type, props} and drop invalid entries
export function sanitize(spec: Spec): Spec {
  const out: Spec = { ...spec, elements: {} };
  for (const [key, el] of Object.entries(spec.elements ?? {})) {
    if (!el || typeof el !== "object") continue;
    if (typeof (el as any).type !== "string") continue;
    out.elements[key] = {
      type: (el as any).type,
      props: (el as any).props ?? {},
      children: Array.isArray((el as any).children) ? (el as any).children : undefined,
    };
  }
  return out;
}

// [STAGE 3] Repair: fix naming mismatches, wrap orphans, normalize props
export function repair(spec: Spec): Spec {
  const elements = { ...spec.elements };

  // Normalize per-type props (Table columns, Tabs items, Accordion items, Radio options)
  for (const key of Object.keys(elements)) {
    const el = elements[key];
    const { type, props = {} } = el;

    if (type === "Table" && Array.isArray(props.columns)) {
      props.columns = props.columns.map((c: any) => ({
        key: c.key ?? c.accessorKey ?? c.id,
        label: c.label ?? c.header ?? c.title ?? c.key ?? c.accessorKey,
      }));
    }
    if (type === "Tabs" && Array.isArray(props.items)) {
      props.items = props.items.map((t: any) => ({
        value: t.value ?? t.id ?? t.key,
        label: t.label ?? t.title ?? t.name,
      }));
    }
    if (type === "RadioGroup" && Array.isArray(props.options)) {
      props.options = props.options.map((o: any) => ({
        value: o.value ?? o.id,
        label: o.label ?? o.title ?? o.value,
      }));
    }
    if (type === "SelectInput" && Array.isArray(props.options)) {
      props.options = props.options.map((o: any) => ({
        value: o.value ?? o.id,
        label: o.label ?? o.title ?? o.value,
      }));
    }
    elements[key] = { ...el, props };
  }

  // Fix dangling child references (suffix-match against existing keys)
  const validKeys = new Set(Object.keys(elements));
  for (const el of Object.values(elements)) {
    if (!el.children) continue;
    el.children = el.children.map((c) => {
      if (validKeys.has(c)) return c;
      const match = Array.from(validKeys).find(
        (k) => k.startsWith(c) || c.startsWith(k),
      );
      return match ?? c;
    });
  }

  return { ...spec, elements };
}

// [STAGE 4] Deduplicate: remove duplicate children and state array entries
export function deduplicate(spec: Spec): Spec {
  const elements = { ...spec.elements };
  for (const el of Object.values(elements)) {
    if (Array.isArray(el.children)) {
      el.children = Array.from(new Set(el.children));
    }
  }
  return { ...spec, elements };
}

// Full pipeline
export function processSpec(spec: Spec): Spec {
  return deduplicate(repair(sanitize(spec)));
}
