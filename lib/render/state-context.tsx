"use client";

import { createContext, useCallback, useContext, useState } from "react";

type StateContextValue = {
  state: Record<string, any>;
  getValue: (path: string) => any;
  setValue: (path: string, value: any) => void;
  emit: (eventName: string, payload?: any) => void;
  invokeAction: (name: string, params?: any) => Promise<any>;
};

const StateContext = createContext<StateContextValue | null>(null);

export function StateProvider({
  initialState = {},
  actions = {},
  children,
}: {
  initialState?: Record<string, any>;
  actions?: Record<string, (params: any, ctx: StateContextValue) => any>;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<Record<string, any>>(initialState);

  const getValue = useCallback(
    (path: string) => state[path],
    [state],
  );

  const setValue = useCallback((path: string, value: any) => {
    setState((prev) => ({ ...prev, [path]: value }));
  }, []);

  const emit = useCallback((eventName: string, payload?: any) => {
    // Default no-op; consumers can wire handlers via actions map
    // eslint-disable-next-line no-console
    console.debug("[emit]", eventName, payload);
  }, []);

  const invokeAction = useCallback(
    async (name: string, params?: any) => {
      const fn = actions[name];
      if (!fn) return undefined;
      return fn(params, { state, getValue, setValue, emit, invokeAction } as any);
    },
    [actions, state, getValue, setValue, emit],
  );

  return (
    <StateContext.Provider
      value={{ state, getValue, setValue, emit, invokeAction }}
    >
      {children}
    </StateContext.Provider>
  );
}

export function useRenderState() {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error("useRenderState must be used inside StateProvider");
  return ctx;
}

export function useBoundProp<T>(
  propValue: T | undefined,
  bindingPath?: string,
): [T | undefined, (next: T) => void] {
  const { getValue, setValue } = useRenderState();
  const current = bindingPath != null ? (getValue(bindingPath) as T) : propValue;
  const set = (next: T) => {
    if (bindingPath != null) setValue(bindingPath, next);
  };
  return [current, set];
}
