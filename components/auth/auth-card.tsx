import type { ReactNode } from "react";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl bg-card px-8 py-10 shadow-lg ring-1 ring-plum-100">
      <div className="mb-8 flex items-center justify-center gap-2">
        <span aria-hidden className="h-2 w-2 rounded-sm bg-chartreuse-500" />
        <span className="font-serif text-xl font-medium tracking-tight text-plum-700">
          Impactify
        </span>
      </div>
      {children}
    </div>
  );
}
