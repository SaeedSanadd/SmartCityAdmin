const tones = {
  danger: "bg-red-50 text-red-700 border-red-200/60",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  info: "bg-blue-50 text-blue-700 border-blue-200/60",
  warn: "bg-amber-50 text-amber-700 border-amber-200/60",
  neutral: "bg-slate-50 text-slate-600 border-slate-200/60",
};

// eslint-disable-next-line react-refresh/only-export-components
export const statusTone = (status) => {
  switch (status?.toLowerCase()) {
    case "resolved":
      return "success";
    case "in_progress":
      return "warn";
    case "pending":
      return "danger";
    default:
      return "neutral";
  }
};

export default function Badge({ children, tone = "neutral" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide
        ${tones[tone] || tones.neutral}`}
    >
      {children}
    </span>
  );
}