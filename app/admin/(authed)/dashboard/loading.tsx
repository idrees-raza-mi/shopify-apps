import { Spinner } from "@/components/Spinner";

export default function DashboardLoading() {
  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 w-40 bg-card-border/40 rounded animate-pulse" />
        <div className="h-9 w-36 bg-card-border/40 rounded-lg animate-pulse" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-card-border rounded-card p-4 space-y-2"
          >
            <div className="h-3 w-20 bg-card-border/40 rounded animate-pulse" />
            <div className="h-6 w-12 bg-card-border/40 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Product cards skeleton */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-card-border rounded-card overflow-hidden"
          >
            <div className="h-40 bg-card-border/30 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 bg-card-border/40 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-card-border/40 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center mt-12 gap-2 text-text-muted">
        <Spinner size={16} />
        <span className="text-[12px]">Loading products from Shopify…</span>
      </div>
    </div>
  );
}
