import { Spinner } from "@/components/Spinner";

export default function EditorLoading() {
  return (
    <div className="fixed inset-0 flex flex-col bg-cream text-[#1a1a1a]">
      {/* Top bar skeleton */}
      <header className="h-[52px] shrink-0 bg-white border-b border-card-border flex items-center px-6">
        <div className="w-[260px]">
          <div className="h-4 w-36 bg-card-border/40 rounded animate-pulse" />
        </div>
        <div className="flex-1" />
      </header>

      {/* Main area */}
      <div className="flex-1 min-h-0 flex">
        {/* Left panel skeleton */}
        <aside className="w-[260px] shrink-0 bg-white border-r border-card-border p-5 space-y-4">
          <div className="h-3 w-24 bg-card-border/40 rounded animate-pulse" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-16 bg-card-border/40 rounded animate-pulse" />
                <div className="h-9 bg-card-border/30 rounded-md animate-pulse" />
              </div>
            ))}
          </div>
        </aside>

        {/* Canvas area */}
        <section className="flex-1 min-w-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Spinner size={24} className="text-text-muted" />
            <span className="text-[12px] text-text-muted">
              Loading editor…
            </span>
          </div>
        </section>
      </div>

      {/* Bottom bar skeleton */}
      <footer className="h-[70px] shrink-0 bg-white border-t border-card-border flex items-center px-6">
        <div className="h-4 w-32 bg-card-border/40 rounded animate-pulse" />
        <div className="flex-1" />
        <div className="h-10 w-28 bg-card-border/40 rounded-lg animate-pulse" />
      </footer>
    </div>
  );
}
