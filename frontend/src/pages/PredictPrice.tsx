import { useEffect, useMemo, useRef, useState } from "react";
import {
  Car,
  Download,
  Info,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { Field, SectionHeading } from "@/components/SectionHeading";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError, downloadReport, predictPrice, saveBlob } from "@/lib/api";
import { formatINR, formatNumber } from "@/lib/format";
import type { CarPayload, PredictionExplanation } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMeta } from "@/lib/useMeta";

interface FormState {
  make: string;
  model: string;
  year: string;
  kilometer: string;
  owner: string;
  seller_type: string;
  fuel_type: string;
  transmission: string;
  drivetrain: string;
  seating_capacity: string;
  location: string;
  color: string;
  engine: string;
  max_power: string;
  max_torque: string;
  length: string;
  width: string;
  height: string;
  fuel_tank_capacity: string;
}

const DEFAULT_FORM: FormState = {
  make: "",
  model: "",
  year: "2019",
  kilometer: "50000",
  owner: "",
  seller_type: "",
  fuel_type: "",
  transmission: "",
  drivetrain: "",
  seating_capacity: "5",
  location: "",
  color: "",
  engine: "1493 cc",
  max_power: "70 bhp",
  max_torque: "195 Nm",
  length: "3995",
  width: "1745",
  height: "1880",
  fuel_tank_capacity: "45",
};

function toNumber(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Computed once at module load so render stays pure. */
const CURRENT_YEAR = new Date().getFullYear();

interface PredictionResult {
  price: number;
  car: CarPayload;
  explanation: PredictionExplanation | null;
}

interface FactorBar {
  feature: string;
  contribution: number;
  width: number;
}

function SelectField({
  label,
  value,
  options,
  onValueChange,
  placeholder = "Select an option",
}: {
  label: string;
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <Select value={value || undefined} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

export default function PredictPrice() {
  const { meta, loading, error, retry } = useMeta();

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const initialized = useRef(false);

  const [submitting, setSubmitting] = useState(false);
  const [predictError, setPredictError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [showAllFactors, setShowAllFactors] = useState(false);

  // Seed the form with the first available option of each dropdown.
  useEffect(() => {
    if (!meta || initialized.current) return;
    initialized.current = true;

    const make = meta.options.Make[0] ?? "";
    setForm((previous) => ({
      ...previous,
      make,
      model: meta.modelsByMake[make]?.[0] ?? "",
      owner: meta.options.Owner[0] ?? "",
      seller_type: meta.options["Seller Type"][0] ?? "",
      fuel_type: meta.options["Fuel Type"][0] ?? "",
      transmission: meta.options.Transmission[0] ?? "",
      drivetrain: meta.options.Drivetrain[0] ?? "",
      location: meta.options.Location[0] ?? "",
      color: meta.options.Color[0] ?? "",
    }));
  }, [meta]);

  const modelsForMake = useMemo(
    () => (form.make ? (meta?.modelsByMake[form.make] ?? []) : []),
    [meta, form.make],
  );

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function handleMakeChange(make: string) {
    setForm((previous) => ({
      ...previous,
      make,
      model: meta?.modelsByMake[make]?.[0] ?? "",
    }));
  }

  function buildPayload(): CarPayload {
    return {
      make: form.make,
      model: form.model,
      year: Math.round(toNumber(form.year, 2019)),
      kilometer: toNumber(form.kilometer, 50000),
      fuel_type: form.fuel_type,
      transmission: form.transmission,
      location: form.location,
      color: form.color,
      owner: form.owner,
      seller_type: form.seller_type,
      engine: form.engine,
      max_power: form.max_power,
      max_torque: form.max_torque,
      drivetrain: form.drivetrain,
      length: toNumber(form.length, 0),
      width: toNumber(form.width, 0),
      height: toNumber(form.height, 0),
      seating_capacity: toNumber(form.seating_capacity, 5),
      fuel_tank_capacity: toNumber(form.fuel_tank_capacity, 0),
    };
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;

    setPredictError(null);
    setDownloading(false);
    setDownloadError(null);
    setShowAllFactors(false);
    setSubmitting(true);

    const car = buildPayload();
    const startedAt = performance.now();

    try {
      const prediction = await predictPrice(car);

      // Keep the loading state visible briefly for a smoother feel.
      const elapsed = performance.now() - startedAt;
      if (elapsed < 800) {
        await new Promise((resolve) => setTimeout(resolve, 800 - elapsed));
      }

      setResult({ price: prediction.price, car, explanation: prediction.explanation });
      requestAnimationFrame(() =>
        document
          .getElementById("prediction-result")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    } catch (caught) {
      setResult(null);
      setPredictError(
        caught instanceof ApiError
          ? caught.message
          : `Unexpected error: ${String(caught)}`,
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDownload() {
    if (!result || downloading) return;
    setDownloading(true);
    setDownloadError(null);

    try {
      const blob = await downloadReport(result.car);
      saveBlob(blob, "car_price_report.pdf");
    } catch (caught) {
      setDownloadError(
        caught instanceof ApiError
          ? caught.message
          : `Unexpected error: ${String(caught)}`,
      );
    } finally {
      setDownloading(false);
    }
  }

  const carAge = CURRENT_YEAR - (result ? result.car.year : 0);

  // Factor bars: ignore dust-sized effects and scale the rest by the largest.
  const factors: FactorBar[] = useMemo(() => {
    const significant = (result?.explanation?.contributions ?? []).filter(
      (item) => Math.abs(item.contribution) >= 1,
    );
    const maxAbs = Math.max(
      1,
      ...significant.map((item) => Math.abs(item.contribution)),
    );
    return significant.map((item) => ({
      ...item,
      width: (Math.abs(item.contribution) / maxAbs) * 48,
    }));
  }, [result]);

  const visibleFactors = showAllFactors ? factors : factors.slice(0, 8);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-9 w-64" />
        <div className="skeleton h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !meta) {
    return (
      <Alert variant="destructive">
        <Info />
        <AlertTitle>Application metadata unavailable</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center gap-3">
          <span>{error ?? "meta.json could not be loaded."}</span>
          <Button size="sm" variant="outline" onClick={retry}>
            <RefreshCw className="size-3.5" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="animate-fade-up space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <TrendingUp className="size-5" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Car Details</h1>
        </div>
        <p className="max-w-2xl leading-relaxed text-muted-foreground">
          Input the details of your car to predict its resale price.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="gap-8">
          {/* 1. Vehicle Identity */}
          <section>
            <CardHeader className="mb-4">
              <SectionHeading
                index={1}
                title="Vehicle Identity"
                hint="Choose the brand and exact variant"
              />
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Car Make / Brand"
                value={form.make}
                options={meta.options.Make}
                onValueChange={handleMakeChange}
                placeholder="Select a brand"
              />
              <SelectField
                label="Car Model"
                value={form.model}
                options={modelsForMake}
                onValueChange={(value) => set("model", value)}
                placeholder="Select a model"
              />
            </CardContent>
          </section>

          {/* 2. Usage and Ownership */}
          <section>
            <CardHeader className="mb-4">
              <SectionHeading
                index={2}
                title="Usage and Ownership"
                hint="Age, distance covered and ownership history"
              />
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Manufacturing Year">
                <Input
                  type="number"
                  min={1987}
                  max={2026}
                  value={form.year}
                  onChange={(event) => set("year", event.target.value)}
                />
              </Field>
              <Field label="Kilometres Driven">
                <Input
                  type="number"
                  min={0}
                  max={1_000_000}
                  step={1000}
                  value={form.kilometer}
                  onChange={(event) => set("kilometer", event.target.value)}
                />
              </Field>
              <SelectField
                label="Owner Type"
                value={form.owner}
                options={meta.options.Owner}
                onValueChange={(value) => set("owner", value)}
              />
              <SelectField
                label="Seller Type"
                value={form.seller_type}
                options={meta.options["Seller Type"]}
                onValueChange={(value) => set("seller_type", value)}
              />
            </CardContent>
          </section>

          {/* 3. Vehicle Configuration */}
          <section>
            <CardHeader className="mb-4">
              <SectionHeading
                index={3}
                title="Vehicle Configuration"
                hint="Powertrain, drivetrain and capacity"
              />
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SelectField
                label="Fuel Type"
                value={form.fuel_type}
                options={meta.options["Fuel Type"]}
                onValueChange={(value) => set("fuel_type", value)}
              />
              <SelectField
                label="Transmission"
                value={form.transmission}
                options={meta.options.Transmission}
                onValueChange={(value) => set("transmission", value)}
              />
              <SelectField
                label="Drivetrain"
                value={form.drivetrain}
                options={meta.options.Drivetrain}
                onValueChange={(value) => set("drivetrain", value)}
              />
              <Field label="Seating Capacity">
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={form.seating_capacity}
                  onChange={(event) => set("seating_capacity", event.target.value)}
                />
              </Field>
            </CardContent>
          </section>

          {/* 4. Location and Appearance */}
          <section>
            <CardHeader className="mb-4">
              <SectionHeading
                index={4}
                title="Location and Appearance"
                hint="Registration city and exterior colour"
              />
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Car Location"
                value={form.location}
                options={meta.options.Location}
                onValueChange={(value) => set("location", value)}
              />
              <SelectField
                label="Car Colour"
                value={form.color}
                options={meta.options.Color}
                onValueChange={(value) => set("color", value)}
              />
            </CardContent>
          </section>

          {/* 5. Engine Specifications */}
          <section>
            <CardHeader className="mb-4">
              <SectionHeading
                index={5}
                title="Engine Specifications"
                hint="Capacity, power and torque as printed in the brochure"
              />
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <Field label="Engine Capacity" help="Example: 1493 cc">
                <Input
                  value={form.engine}
                  onChange={(event) => set("engine", event.target.value)}
                  placeholder="1493 cc"
                />
              </Field>
              <Field label="Maximum Power" help="Example: 70 bhp">
                <Input
                  value={form.max_power}
                  onChange={(event) => set("max_power", event.target.value)}
                  placeholder="70 bhp"
                />
              </Field>
              <Field label="Maximum Torque" help="Example: 195 Nm">
                <Input
                  value={form.max_torque}
                  onChange={(event) => set("max_torque", event.target.value)}
                  placeholder="195 Nm"
                />
              </Field>
            </CardContent>
          </section>

          {/* 6. Vehicle Dimensions */}
          <section>
            <CardHeader className="mb-4">
              <SectionHeading
                index={6}
                title="Vehicle Dimensions"
                hint="Body measurements in millimetres"
              />
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Length (mm)">
                <Input
                  type="number"
                  min={0}
                  value={form.length}
                  onChange={(event) => set("length", event.target.value)}
                />
              </Field>
              <Field label="Width (mm)">
                <Input
                  type="number"
                  min={0}
                  value={form.width}
                  onChange={(event) => set("width", event.target.value)}
                />
              </Field>
              <Field label="Height (mm)">
                <Input
                  type="number"
                  min={0}
                  value={form.height}
                  onChange={(event) => set("height", event.target.value)}
                />
              </Field>
              <Field label="Fuel Tank Capacity (litres)">
                <Input
                  type="number"
                  min={0}
                  value={form.fuel_tank_capacity}
                  onChange={(event) => set("fuel_tank_capacity", event.target.value)}
                />
              </Field>
            </CardContent>
          </section>
        </Card>

        {predictError && (
          <Alert variant="destructive">
            <Info />
            <AlertTitle>Prediction failed</AlertTitle>
            <AlertDescription>{predictError}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Calculating estimated resale price…
            </>
          ) : (
            <>
              <Wallet className="size-4" />
              Estimate Resale Price
            </>
          )}
        </Button>
      </form>

      {/* Result */}
      {result && (
        <div id="prediction-result" className="animate-fade-up space-y-5">
          <Card className="relative overflow-hidden gap-6 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card">
            <div className="pointer-events-none absolute -top-24 -right-16 size-56 rounded-full bg-primary/15 blur-3xl" />

            <CardHeader className="relative">
              <div className="flex items-center gap-2">
                <Badge variant="success">Estimated Resale Value</Badge>
              </div>
              <p className="font-mono text-4xl font-bold tracking-tight text-gradient sm:text-5xl">
                {formatINR(result.price)}
              </p>
              <CardDescription className="flex items-center gap-1.5">
                <Info className="size-3.5" />
                This is a model estimate and may differ from the actual market
                selling price.
              </CardDescription>
            </CardHeader>

            <CardContent className="relative grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-background/50 p-4">
                <p className="font-mono text-2xl font-semibold">
                  {formatINR(result.price)}
                </p>
                <p className="text-xs text-muted-foreground">Estimated Price</p>
              </div>
              <div className="rounded-xl border border-border bg-background/50 p-4">
                <p className="font-mono text-2xl font-semibold">{carAge} yr</p>
                <p className="text-xs text-muted-foreground">Car Age</p>
              </div>
              <div className="rounded-xl border border-border bg-background/50 p-4">
                <p className="font-mono text-2xl font-semibold">
                  {formatNumber(result.car.kilometer)} km
                </p>
                <p className="text-xs text-muted-foreground">Kilometres Driven</p>
              </div>
            </CardContent>

            {result.explanation && factors.length > 0 && (
              <CardContent className="relative space-y-4 border-t border-border pt-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="size-4 text-primary" />
                    What drives this estimate
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Base value{" "}
                    <span className="font-mono text-foreground/80">
                      {formatINR(result.explanation.base_value)}
                    </span>{" "}
                    → estimate{" "}
                    <span className="font-mono text-foreground/80">
                      {formatINR(result.price)}
                    </span>
                  </p>
                </div>

                <div className="space-y-2.5">
                  {visibleFactors.map((factor) => (
                    <div
                      key={factor.feature}
                      className="grid grid-cols-[6.5rem_1fr_6rem] items-center gap-3 sm:grid-cols-[11rem_1fr_7.5rem]"
                    >
                      <span
                        className="truncate text-xs text-muted-foreground"
                        title={factor.feature}
                      >
                        {factor.feature}
                      </span>
                      <div className="relative h-2.5 overflow-hidden rounded-full bg-muted/70">
                        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" />
                        <div
                          className={cn(
                            "absolute top-0 bottom-0 rounded-full transition-all duration-500",
                            factor.contribution >= 0 ? "bg-success" : "bg-destructive",
                          )}
                          style={
                            factor.contribution >= 0
                              ? { left: "50%", width: `${factor.width}%` }
                              : { right: "50%", width: `${factor.width}%` }
                          }
                        />
                      </div>
                      <span
                        className={cn(
                          "text-right font-mono text-xs tabular-nums",
                          factor.contribution >= 0 ? "text-success" : "text-destructive",
                        )}
                      >
                        {factor.contribution >= 0 ? "+" : "−"}
                        {formatINR(Math.abs(factor.contribution))}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    Green pushes the price up, red pulls it down — all factors plus
                    the base value add up to the estimate.
                  </p>
                  {factors.length > 8 && (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto p-0"
                      onClick={() => setShowAllFactors((open) => !open)}
                    >
                      {showAllFactors
                        ? "Show top factors"
                        : `Show all ${factors.length} factors`}
                    </Button>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* PDF report */}
          <Card className="gap-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Car className="size-4 text-info" />
                Car Price Report
              </CardTitle>
              <CardDescription>
                Download a printable PDF with the prediction and vehicle summary.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full sm:w-auto"
                variant="secondary"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Preparing PDF…
                  </>
                ) : (
                  <>
                    <Download className="size-4" />
                    Download PDF Report
                  </>
                )}
              </Button>

              {downloadError && (
                <Alert variant="destructive">
                  <Info />
                  <AlertTitle>Report generation failed</AlertTitle>
                  <AlertDescription>{downloadError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
