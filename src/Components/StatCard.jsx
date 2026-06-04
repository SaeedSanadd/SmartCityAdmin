import { useEffect, useRef, useState } from "react";

const accentColors = {
  "bg-primary/10 text-primary border-primary/20": {
    bar: "from-emerald-500 to-emerald-600",
    glow: "hover:shadow-emerald-500/10",
  },
  "bg-amber-50 text-amber-600 border-amber-200/60": {
    bar: "from-amber-400 to-amber-500",
    glow: "hover:shadow-amber-400/10",
  },
  "bg-blue-50 text-blue-600 border-blue-200/60": {
    bar: "from-blue-400 to-blue-500",
    glow: "hover:shadow-blue-400/10",
  },
  "bg-green-50 text-green-600 border-green-200/60": {
    bar: "from-green-400 to-green-500",
    glow: "hover:shadow-green-400/10",
  },
  "bg-red-50 text-red-600 border-red-200/60": {
    bar: "from-red-400 to-red-500",
    glow: "hover:shadow-red-400/10",
  },
};

export default function StatCard({ title, value, icon, bgClass }) {
  const accent = accentColors[bgClass] || {
    bar: "from-emerald-500 to-emerald-600",
    glow: "",
  };
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    if (animated.current) {
      setDisplayValue(value);
      return;
    }

    const target = typeof value === "number" ? value : parseInt(value) || 0;
    if (target === 0) {
      setDisplayValue(0);
      animated.current = true;
      return;
    }

    animated.current = true;
    const duration = 600;
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      setDisplayValue(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(target);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-2xl bg-white hover-lift ${accent.glow} hover:shadow-lg`}
    >
      {/* Gradient accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${accent.bar}`} />

      <div className="flex items-center gap-4 p-5">
        <div
          className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl shrink-0 border ${bgClass || "bg-slate-50 border-slate-100 text-slate-600"}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">
            {title}
          </p>
          <p className="text-2xl font-extrabold text-slate-800 mt-1 tracking-tight tabular-nums">
            {displayValue}
          </p>
        </div>
      </div>
    </div>
  );
}
