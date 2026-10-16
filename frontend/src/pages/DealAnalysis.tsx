import { useMemo, useState } from "react";
import {
  ArrowRightLeft,
  CircleAlert,
  CircleCheck,
  HandCoins,
  Info,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatINR } from "@/lib/format";
import type { Verdict } from "@/lib/types";
import { cn } from "@/lib/utils";

interface VerdictConfig {
  label: string;
  message: string;
  variant: "success" | "info" | "warning" | "destructive";
  badge: "success" | "info" | "warning" | "destructive";
  icon: typeof CircleCheck;
  accent: string;
}

const VERDICTS: Record<Verdict, VerdictConfig> = {
  excellent: {
    label: "Excellent Deal",
    message:
      "The seller's asking price is significantly below the estimated market value.",
    variant: "success",
    badge: "success",
    icon: CircleCheck,
    accent: "text-success",
  },
  good: {
    label: "Good Deal",
    message: "The asking price is below the estimated market value.",
    variant: "success",
    badge: "success",
    icon: CircleCheck,
    accent: "text-success",
  },
  fair: {
    label: "Fair Price",
    message: "The asking price is reasonably close to the estimated market value.",
    variant: "warning",
    badge: "warning",
    icon: TriangleAlert,
    accent: "text-warning",
  },
  high: {
    label: "Price Seems High",
    message:
      "The seller's asking price is significantly above the estimated market value.",
    variant: "destructive",
    badge: "destructive",
    icon: CircleAlert,
    accent: "text-destructive",
  },
};

function verdictFor(percentage: number): Verdict {
  if (percentage <= -10) return "excellent";
  if (percentage < 0) return "good";
  if (percentage <= 10) return "fair";
  return "high";
}

interface Analysis {
  estimated: number;
  asking: number;
  difference: number;
  percentage: number;
  verdict: Verdict;
}

export default function DealAnalysis() {
  const [estimated, setEstimated] = useState("500000");
  const [asking, setAsking] = useState("500000");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  function analyze() {
    const estimatedPrice = Number(estimated);
    const askingPrice = Number(asking);
    if (!Number.isFinite(estimatedPrice) || estimatedPrice <= 0) return;
    if (!Number.isFinite(askingPrice)) return;

    const difference = askingPrice - estimatedPrice;
    const percentage = (difference / estimatedPrice) * 100;

    setAnalysis({
      estimated: estimatedPrice,
      asking: askingPrice,
      difference,
      percentage,
      verdict: verdictFor(percentage),
    });
  }

  const verdictConfig = analysis ? VERDICTS[analysis.verdict] : null;

  const barMax = useMemo(() => {
    if (!analysis) return 1;
    return Math.max(analysis.estimated, analysis.asking, 1);
  }, [analysis]);

  return (
    <div className="animate-fade-up space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-xl bg-warning/15 text-warning">
            <HandCoins className="size-5" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Deal Analysis</h1>
        </div>
        <p className="text-lg font-medium text-foreground/80">
          Is this car worth the asking price?
        </p>
        <p className="max-w-2xl leading-relaxed text-muted-foreground">
          Enter the estimated market price and the seller's asking price to
          determine whether the car is fairly priced.
        </p>
      </header>

      <Card className="gap-6">
        <CardHeader>
          <CardTitle className="text-base">Price Comparison</CardTitle>
          <CardDescription>
            Both values are in Indian Rupees (₹)
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground/90">
                Estimated Market Price (₹)
              </span>
              <Input
                type="number"
                min={0}
                step={10000}
                value={estimated}
                onChange={(event) => setEstimated(event.target.value)}
                placeholder="500000"
                inputMode="numeric"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground/90">
                Seller's Asking Price (₹)
              </span>
              <Input
                type="number"
                min={0}
                step={10000}
                value={asking}
                onChange={(event) => setAsking(event.target.value)}
                placeholder="500000"
                inputMode="numeric"
              />
            </label>
          </div>

          <Button size="lg" className="w-full" onClick={analyze}>
            <ArrowRightLeft className="size-4" />
            Analyze Deal
          </Button>
        </CardContent>
      </Card>

      {analysis && verdictConfig && (
        <div className="animate-fade-up space-y-5" key={`${analysis.estimated}-${analysis.asking}`}>
          {/* Verdict */}
          <Alert variant={verdictConfig.variant}>
            <verdictConfig.icon />
            <AlertTitle className="text-base">{verdictConfig.label}</AlertTitle>
            <AlertDescription>{verdictConfig.message}</AlertDescription>
          </Alert>

          {/* Metrics */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="gap-2 py-5">
              <CardHeader className="px-5">
                <CardDescription>Estimated Market Price</CardDescription>
                <CardTitle className="font-mono text-2xl">
                  {formatINR(analysis.estimated)}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="gap-2 py-5">
              <CardHeader className="px-5">
                <CardDescription>Asking Price</CardDescription>
                <CardTitle className="font-mono text-2xl">
                  {formatINR(analysis.asking)}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="gap-2 py-5">
              <CardHeader className="px-5">
                <CardDescription>Difference</CardDescription>
                <div className="flex items-center gap-2">
                  <CardTitle className="font-mono text-2xl">
                    {formatINR(Math.abs(analysis.difference))}
                  </CardTitle>
                  <Badge variant={verdictConfig.badge}>
                    {analysis.percentage > 0 ? "+" : ""}
                    {analysis.percentage.toFixed(1)}%
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Visual comparison */}
          <Card className="gap-5 py-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <CardTitle className="text-base">Side by Side</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Estimated market value</span>
                  <span className="font-mono text-foreground">
                    {formatINR(analysis.estimated)}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-info/80 transition-all duration-700"
                    style={{ width: `${(analysis.estimated / barMax) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Seller's asking price</span>
                  <span className="font-mono text-foreground">
                    {formatINR(analysis.asking)}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      analysis.verdict === "high"
                        ? "bg-destructive/80"
                        : analysis.verdict === "fair"
                          ? "bg-warning/80"
                          : "bg-success/80",
                    )}
                    style={{ width: `${(analysis.asking / barMax) * 100}%` }}
                  />
                </div>
              </div>

              <p className="flex items-start gap-2 pt-1 text-xs text-muted-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0" />
                Benchmarked against the estimated market price. A difference
                within ±10% is considered fair value.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
