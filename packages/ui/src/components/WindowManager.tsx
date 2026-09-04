"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo, useReducer } from "react";

export type WindowMeta = {
  id: string;
  title: string;
  /** Short glyph/emoji shown in the taskbar + titlebar. */
  icon?: string;
};

export type WindowState = WindowMeta & { minimized: boolean };

type State = { stack: WindowState[] }; // index order === z-order, last === focused

type Action =
  | { type: "open"; meta: WindowMeta }
  | { type: "close"; id: string }
  | { type: "focus"; id: string }
  | { type: "toggleMin"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "open": {
      const rest = state.stack.filter((w) => w.id !== action.meta.id);
      return { stack: [...rest, { ...action.meta, minimized: false }] };
    }
    case "close":
      return { stack: state.stack.filter((w) => w.id !== action.id) };
    case "focus": {
      const target = state.stack.find((w) => w.id === action.id);
      if (!target) return state;
      const rest = state.stack.filter((w) => w.id !== action.id);
      return { stack: [...rest, { ...target, minimized: false }] };
    }
    case "toggleMin":
      return {
        stack: state.stack.map((w) => (w.id === action.id ? { ...w, minimized: !w.minimized } : w)),
      };
    default:
      return state;
  }
}

type Ctx = {
  stack: WindowState[];
  open: (meta: WindowMeta) => void;
  close: (id: string) => void;
  focus: (id: string) => void;
  toggleMinimize: (id: string) => void;
  isOpen: (id: string) => boolean;
  zIndexOf: (id: string) => number;
  focusedId: string | null;
};

const WindowContext = createContext<Ctx | null>(null);

export function WindowManagerProvider({
  children,
  initialOpen = [],
}: {
  children: ReactNode;
  /** Windows open on first render — included in the SSR HTML so their content
   *  is present before hydration (SEO + no-JS partial rendering). */
  initialOpen?: WindowMeta[];
}) {
  const [state, dispatch] = useReducer(reducer, {
    stack: initialOpen.map((m) => ({ ...m, minimized: false })),
  });

  const open = useCallback((meta: WindowMeta) => dispatch({ type: "open", meta }), []);
  const close = useCallback((id: string) => dispatch({ type: "close", id }), []);
  const focus = useCallback((id: string) => dispatch({ type: "focus", id }), []);
  const toggleMinimize = useCallback((id: string) => dispatch({ type: "toggleMin", id }), []);

  const value = useMemo<Ctx>(() => {
    const visible = state.stack.filter((w) => !w.minimized);
    const focusedId = visible.at(-1)?.id ?? null;
    return {
      stack: state.stack,
      open,
      close,
      focus,
      toggleMinimize,
      isOpen: (id) => state.stack.some((w) => w.id === id),
      zIndexOf: (id) => state.stack.findIndex((w) => w.id === id),
      focusedId,
    };
  }, [state.stack, open, close, focus, toggleMinimize]);

  return <WindowContext.Provider value={value}>{children}</WindowContext.Provider>;
}

export function useWindows(): Ctx {
  const ctx = useContext(WindowContext);
  if (!ctx) throw new Error("useWindows must be used within <WindowManagerProvider>");
  return ctx;
}
