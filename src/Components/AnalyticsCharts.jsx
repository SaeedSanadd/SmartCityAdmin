import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export default function AnalyticsCharts({ reports, bins }) {
  const { t, i18n } = useTranslation();

  // 1. Category Data Processing
  const categoryData = useMemo(() => {
    const counts = {};
    reports.forEach((r) => {
      const cat = r.type || t("unassigned");
      counts[cat] = (counts[cat] || 0) + 1;
    });

    if (bins && bins.length > 0) {
      const cat = t("bins_reports") || "Smart Bins";
      counts[cat] = bins.length;
    }

    const sorted = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    if (sorted.length <= 4) return sorted;

    // Group tail into "Others"
    const top = sorted.slice(0, 3);
    const othersCount = sorted
      .slice(3)
      .reduce((sum, item) => sum + item.count, 0);
    top.push({ name: t("others") || "Others", count: othersCount });
    return top;
  }, [reports, bins, t]);

  const totalCategoriesCount = useMemo(() => {
    return categoryData.reduce((sum, item) => sum + item.count, 0);
  }, [categoryData]);

  // Donut Colors
  const colors = [
    "stroke-emerald-600 fill-none",
    "stroke-teal-500 fill-none",
    "stroke-blue-500 fill-none",
    "stroke-amber-500 fill-none",
  ];

  const bgColors = [
    "bg-emerald-600",
    "bg-teal-500",
    "bg-blue-500",
    "bg-amber-500",
  ];

  // Donut Math
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16


  // 2. Weekly Trend Data Processing (Last 7 Days)
  const weeklyData = useMemo(() => {
    const days = [];
    const lang = i18n.language;

    // Generate past 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString(lang, { weekday: "short" });
      const key = d.toDateString();
      days.push({ label, key, count: 0 });
    }

    // Count reports per day
    reports.forEach((r) => {
      if (!r.createdAt) return;
      let dateObj;
      if (r.createdAt.toDate) {
        dateObj = r.createdAt.toDate();
      } else {
        dateObj = new Date(r.createdAt);
      }
      const dateStr = dateObj.toDateString();
      const found = days.find((day) => day.key === dateStr);
      if (found) found.count += 1;
    });

    // Count bins per day
    if (bins) {
      bins.forEach((b) => {
        if (!b.reportDate) return;
        const dateObj = new Date(b.reportDate);
        const dateStr = dateObj.toDateString();
        const found = days.find((day) => day.key === dateStr);
        if (found) found.count += 1;
      });
    }

    const maxVal = Math.max(...days.map((d) => d.count), 1);
    return days.map((day) => ({
      ...day,
      percentage: (day.count / maxVal) * 100,
    }));
  }, [reports, bins, i18n.language]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Category Donut */}
      <div className="rounded-2xl glass-card-strong p-5 hover-lift animate-fadeInUp stagger-1">
        <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {t("by_category")}
        </h3>

        {totalCategoriesCount === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-xs">
            {t("no_reports")}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 h-48">
            {/* SVG Donut */}
            <div className="relative w-36 h-36 shrink-0">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 120 120"
              >
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  className="stroke-slate-100 fill-none"
                  strokeWidth="10"
                />
                {categoryData.map((item, idx) => {
                  const percent = (item.count / totalCategoriesCount) * 100;
                  const strokeDashoffset =
                    circumference - (circumference * percent) / 100;
                  const strokeDasharray = `${circumference} ${circumference}`;
                  const currentAccumulated = categoryData
                    .slice(0, idx)
                    .reduce((sum, it) => sum + (it.count / totalCategoriesCount) * 100, 0);
                  const rotation = (currentAccumulated / 100) * 360;

                  return (
                    <circle
                      key={idx}
                      cx="60"
                      cy="60"
                      r={radius}
                      className={`${colors[idx % colors.length]} transition-all duration-500`}
                      strokeWidth="10"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      transform={`rotate(${rotation} 60 60)`}
                    />
                  );
                })}
              </svg>
              {/* Inner Info */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-slate-800">
                  {totalCategoriesCount}
                </span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  {t("report")}
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2.5 w-full max-w-[200px]">
              {categoryData.map((item, idx) => {
                const percent = Math.round(
                  (item.count / totalCategoriesCount) * 100,
                );
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`h-2.5 w-2.5 rounded-full shrink-0 ${bgColors[idx % bgColors.length]}`}
                      />
                      <span className="text-slate-600 font-medium truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono shrink-0 ml-2">
                      {item.count} ({percent}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Weekly Trend Bar Chart */}
      <div className="rounded-2xl glass-card-strong p-5 hover-lift animate-fadeInUp stagger-2">
        <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          {t("weekly_trends")}
        </h3>

        <div className="flex items-end justify-between h-48 pt-6 pb-2 px-2 border-b border-slate-100">
          {weeklyData.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1 group">
              {/* Count Label */}
              <span className="opacity-0 group-hover:opacity-100 text-[10px] text-primary font-bold transition-all duration-200 mb-1.5 translate-y-1 group-hover:translate-y-0">
                {day.count}
              </span>
              {/* Bar */}
              <div className="w-6 sm:w-8 bg-slate-100/80 rounded-t-lg overflow-hidden h-28 flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-primary to-emerald-400 rounded-t-lg transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] origin-bottom"
                  style={{
                    height: `${day.percentage}%`,
                    animation: `fadeInUp 0.6s ease-out ${idx * 0.05}s both`,
                  }}
                />
              </div>
              {/* X Axis Label */}
              <span className="text-[10px] text-slate-400 font-semibold mt-2.5 tracking-tight uppercase">
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
