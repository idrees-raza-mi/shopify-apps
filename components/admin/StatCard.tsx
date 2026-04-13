type StatCardProps = {
  label: string;
  value: string | number;
};

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-white border border-card-border rounded-card px-6 py-5">
      <div className="text-[42px] font-serif-display leading-none text-[#1a1a1a]">
        {value}
      </div>
      <div className="mt-3 text-[10px] tracking-[0.16em] uppercase text-text-muted">
        {label}
      </div>
    </div>
  );
}
