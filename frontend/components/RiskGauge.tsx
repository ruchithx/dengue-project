"use client";

interface RiskGaugeProps {
  probability: number; // 0–1
}

function getColor(p: number) {
  if (p < 0.4) return { stroke: "#22c55e", text: "text-green-400", label: "LOW RISK" };
  if (p < 0.7) return { stroke: "#f59e0b", text: "text-amber-400", label: "MODERATE RISK" };
  return { stroke: "#ef4444", text: "text-red-400", label: "HIGH RISK" };
}

export default function RiskGauge({ probability }: RiskGaugeProps) {
  const pct = Math.round(probability * 100);
  const { stroke, text, label } = getColor(probability);

  // SVG arc math
  const radius = 70;
  const circumference = Math.PI * radius; // half-circle
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 200 110" className="w-52 h-28">
        {/* Background track */}
        <path
          d="M 15 100 A 85 85 0 0 1 185 100"
          fill="none"
          stroke="#1e293b"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Animated progress arc */}
        <path
          d="M 15 100 A 85 85 0 0 1 185 100"
          fill="none"
          stroke={stroke}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s ease" }}
        />
        {/* Center text */}
        <text
          x="100"
          y="88"
          textAnchor="middle"
          fontSize="28"
          fontWeight="bold"
          fill={stroke}
          style={{ transition: "fill 0.5s ease" }}
        >
          {pct}%
        </text>
      </svg>
      <span className={`text-sm font-bold tracking-widest uppercase ${text}`}>{label}</span>
    </div>
  );
}
