"use client";

import { useState } from "react";
import { predictRisk, explainRisk, type PredictResponse, type FeatureImportance } from "@/lib/api";
import ShapChart from "@/components/ShapChart";
import RiskGauge from "@/components/RiskGauge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalmunai",
  "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala",
  "Mannar", "Matale", "Matara", "Moneragala", "Mulativu",
  "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura",
  "Trincomalee", "Vavuniya",
];

const MONTHS = [
  "April", "Aug", "Dec", "Feb", "Jan",
  "July", "June", "Mar", "May", "Nov", "Oct", "Sept",
];

const MONTH_LABELS: Record<string, string> = {
  Jan: "January", Feb: "February", Mar: "March", April: "April",
  May: "May", June: "June", July: "July", Aug: "August",
  Sept: "September", Oct: "October", Nov: "November", Dec: "December",
};

export default function Home() {
  const [district, setDistrict] = useState("");
  const [month, setMonth] = useState("");
  const [lag1, setLag1] = useState("");
  const [lag2, setLag2] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [shapData, setShapData] = useState<FeatureImportance[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setShapData(null);

    if (!district || !month) {
      setError("Please select a district and month.");
      return;
    }

    const payload: Record<string, number> = {
      Lag_1: parseFloat(lag1) || 0,
      Lag_2: parseFloat(lag2) || 0,
    };

    // One-hot encode district (skip Ampara — it's the dropped first category)
    if (district !== "Ampara") {
      payload[`District_${district}`] = 1;
    }

    // One-hot encode month (skip April — it's the dropped first category)
    if (month !== "April") {
      payload[`Month_${month}`] = 1;
    }

    setLoading(true);
    try {
      const [res, explainRes] = await Promise.all([
        predictRisk(payload),
        explainRisk(payload),
      ]);
      setResult(res);
      setShapData(explainRes.importances);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Prediction failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  const isHighRisk = result?.prediction === 1;
  const riskPct = result ? Math.round(result.risk_probability * 100) : 0;

  return (
    <main className="min-h-screen bg-[#030712] text-white overflow-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-700/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-700/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b border-white/10 bg-white/5 backdrop-blur-md px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-600/80">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zm-4.243-9.75a6 6 0 1110.486 0l-1.268 7.606A2.25 2.25 0 0114.735 16.5H9.265a2.25 2.25 0 01-2.24-2.144L5.757 6.75z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">DengueGuard</h1>
              <p className="text-xs text-white/50">Outbreak Risk Prediction System — Sri Lanka</p>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 flex items-start justify-center px-4 py-12">
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

            {/* LEFT — Input Form */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-white">Predict Outbreak Risk</CardTitle>
                <CardDescription className="text-white/50 text-sm">
                  Enter dengue case counts from the previous two months to predict outbreak risk for the upcoming period.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* District */}
                  <div className="space-y-1.5">
                    <Label className="text-white/80 text-sm font-medium">District</Label>
                    <Select onValueChange={setDistrict} value={district}>
                      <SelectTrigger className="bg-white/5 border-white/15 text-white h-10 focus:ring-red-500">
                        <SelectValue placeholder="Select district..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0f172a] border-white/15 text-white">
                        {DISTRICTS.map((d) => (
                          <SelectItem key={d} value={d} className="focus:bg-white/10 focus:text-white">
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Month */}
                  <div className="space-y-1.5">
                    <Label className="text-white/80 text-sm font-medium">Prediction Month</Label>
                    <Select onValueChange={setMonth} value={month}>
                      <SelectTrigger className="bg-white/5 border-white/15 text-white h-10 focus:ring-red-500">
                        <SelectValue placeholder="Select month..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0f172a] border-white/15 text-white">
                        {MONTHS.map((m) => (
                          <SelectItem key={m} value={m} className="focus:bg-white/10 focus:text-white">
                            {MONTH_LABELS[m] ?? m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Lag inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-white/80 text-sm font-medium">
                        Cases — Last Month
                        <span className="ml-1 text-white/35 font-normal">(Lag 1)</span>
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="e.g. 120"
                        value={lag1}
                        onChange={(e) => setLag1(e.target.value)}
                        className="bg-white/5 border-white/15 text-white placeholder:text-white/30 h-10 focus-visible:ring-red-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-white/80 text-sm font-medium">
                        Cases — 2 Months Ago
                        <span className="ml-1 text-white/35 font-normal">(Lag 2)</span>
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="e.g. 95"
                        value={lag2}
                        onChange={(e) => setLag2(e.target.value)}
                        className="bg-white/5 border-white/15 text-white placeholder:text-white/30 h-10 focus-visible:ring-red-500"
                      />
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                      ⚠ {error}
                    </div>
                  )}

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-red-600 hover:bg-red-500 text-white font-semibold transition-all duration-200 disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Analyzing...
                      </span>
                    ) : (
                      "Predict Outbreak Risk"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* RIGHT — Results */}
            <div className="space-y-5">
              {!result && !loading && (
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm shadow-2xl text-center py-16 px-8">
                  <div className="flex flex-col items-center gap-4 text-white/30">
                    <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                    <p className="text-sm max-w-xs">Fill in the form and click <strong className="text-white/50">Predict Outbreak Risk</strong> to see the analysis results here.</p>
                  </div>
                </Card>
              )}

              {result && (
                <>
                  {/* Risk badge + gauge */}
                  <Card className={`border backdrop-blur-sm shadow-2xl ${isHighRisk ? "bg-red-950/30 border-red-500/30" : "bg-green-950/30 border-green-500/30"}`}>
                    <CardContent className="pt-6 pb-5 flex flex-col items-center gap-4">
                      <Badge
                        className={`text-sm px-4 py-1 font-bold tracking-widest uppercase ${
                          isHighRisk
                            ? "bg-red-600/80 text-white border-red-500/50"
                            : "bg-green-600/80 text-white border-green-500/50"
                        }`}
                      >
                        {isHighRisk ? "⚠ High Risk" : "✓ Low Risk"}
                      </Badge>
                      <RiskGauge probability={result.risk_probability} />
                    </CardContent>
                  </Card>

                  {/* Probability bar */}
                  <Card className="bg-white/5 border-white/10 backdrop-blur-sm shadow-xl">
                    <CardContent className="pt-5 pb-5 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/60 font-medium">Outbreak Probability</span>
                        <span className="font-bold text-white">{riskPct}%</span>
                      </div>
                      <Progress
                        value={riskPct}
                        className="h-3 bg-white/10"
                        style={{
                          ["--progress-color" as string]: isHighRisk ? "#ef4444" : "#22c55e"
                        }}
                      />
                      <div className="flex justify-between text-xs text-white/30">
                        <span>Low Risk (0%)</span>
                        <span>High Risk (100%)</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Feature Importance / SHAP */}
                  {shapData && shapData.length > 0 && (
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm shadow-xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-white/70">Why this prediction?</CardTitle>
                        <CardDescription className="text-xs text-white/40">
                          SHAP feature importances — how much each factor pushed the risk score up or down.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-1 pb-4">
                        <ShapChart importances={shapData} />
                      </CardContent>
                    </Card>
                  )}

                  {/* Interpretation */}
                  <Card className="bg-white/5 border-white/10 backdrop-blur-sm shadow-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-white/70">What does this mean?</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-white/60 space-y-2">
                      {isHighRisk ? (
                        <>
                          <p>The model predicts a <span className="text-red-400 font-semibold">high dengue outbreak risk</span> for this district in the selected month.</p>
                          <p>This indicates case counts are likely to exceed the 75th percentile threshold based on historical trends.</p>
                          <p className="text-red-400/80 font-medium">Recommended action: Activate surveillance, vector control, and public health alerts.</p>
                        </>
                      ) : (
                        <>
                          <p>The model predicts a <span className="text-green-400 font-semibold">low dengue outbreak risk</span> for this district in the selected month.</p>
                          <p>Case counts are likely to remain below critical thresholds based on the provided lag data.</p>
                          <p className="text-green-400/80 font-medium">Recommended action: Continue routine monitoring and preventive measures.</p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 py-4 text-center text-xs text-white/25">
          DengueGuard · Powered by Random Forest · Data: Sri Lanka Epidemiology Unit 2019–2021
        </footer>
      </div>
    </main>
  );
}
