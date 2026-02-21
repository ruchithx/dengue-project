"use client";

import { FeatureImportance } from "@/lib/api";

interface ShapChartProps {
  importances: FeatureImportance[];
}

function formatFeatureName(raw: string): string {
  if (raw === "Lag_1") return "Cases — Last Month";
  if (raw === "Lag_2") return "Cases — 2 Months Ago";
  if (raw.startsWith("District_")) return `District: ${raw.replace("District_", "")}`;
  if (raw.startsWith("Month_")) return `Month: ${raw.replace("Month_", "")}`;
  return raw;
}

export default function ShapChart({ importances }: ShapChartProps) {
  if (!importances || importances.length === 0) return null;

  const maxAbs = Math.max(...importances.map((d) => Math.abs(d.value)), 0.001);
  const BAR_MAX_WIDTH = 200; // px

  return (
    <div className="space-y-3">
      {importances.map((item, i) => {
        const isPositive = item.value >= 0;
        const barWidth = (Math.abs(item.value) / maxAbs) * BAR_MAX_WIDTH;
        const barColor = isPositive
          ? "bg-red-500/80"
          : "bg-blue-500/80";
        const textColor = isPositive ? "text-red-400" : "text-blue-400";

        return (
          <div key={i} className="flex items-center gap-3 text-xs">
            {/* Feature label */}
            <span className="w-44 shrink-0 text-right text-white/60 truncate" title={formatFeatureName(item.feature)}>
              {formatFeatureName(item.feature)}
            </span>

            {/* Bar track */}
            <div className="flex-1 relative h-5 flex items-center">
              <div
                className={`h-3 rounded-sm ${barColor} transition-all duration-500`}
                style={{ width: `${barWidth}px` }}
              />
            </div>

            {/* Value */}
            <span className={`w-14 shrink-0 font-mono font-semibold ${textColor}`}>
              {item.value > 0 ? "+" : ""}{item.value.toFixed(3)}
            </span>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex items-center gap-6 pt-2 text-xs text-white/35 border-t border-white/10 mt-2">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-500/80" />
          Increases risk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-blue-500/80" />
          Decreases risk
        </span>
      </div>
    </div>
  );
}
