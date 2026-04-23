export function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      {icon ? (
        <div className="mb-2 flex items-center gap-2">
          {icon}
          <span className="text-xs text-stone-500">{label}</span>
        </div>
      ) : (
        <p className="mb-1 text-xs text-stone-500">{label}</p>
      )}
      <p className={`text-xl font-semibold ${accent ? "text-amber-700" : "text-stone-900"}`}>{value}</p>
    </div>
  );
}
