"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ToastItem = { id: number; message: string };

type ToastCtx = {
  show: (message: string) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none">
        {items.map((t) => (
          <div
            key={t.id}
            className="bg-[#1a1a1a] text-white text-[12px] px-5 py-[9px] rounded-lg shadow-lg pointer-events-auto"
          >
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Fallback so components can be used outside the provider in tests.
    return {
      show: (m) => {
        if (typeof window !== "undefined") console.log("[toast]", m);
      },
    };
  }
  return ctx;
}
