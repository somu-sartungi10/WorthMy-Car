import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Cpu,
  Database,
  Gauge,
  IndianRupee,
  LoaderCircle,
  RefreshCw,
  Table,
  TrendingUp,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR, formatNumber } from "@/lib/format";
import type { DatasetRow } from "@/lib/types";
import { useMeta } from "@/lib/useMeta";

function MetricSkeleton() {
  return (
    <div className="h-36 w-full rounded-2xl border border-border bg-card p-5">
      <div className="skeleton h-4 w-24" />
      <div className="skeleton mt-4 h-8 w-36" />
      <div className="skeleton mt-3 h-3 w-32" />
    </div>
  );
}

export default function Home() {
  const { meta, loading, error, retry } = useMeta();
  const [datasetOpen, setDatasetOpen] = useState(false);
  const [previewRows, setPreviewRows] = useState<DatasetRow[]>([]);

  const metrics = meta?.metrics.test_metrics;
  const model = meta?.metrics.model;

  // Random 10-row preview, reshuffled every time the dialog opens.
  function reshufflePreview() {
    const pool = [...(meta?.dataset.sample ?? [])];
    const picked: DatasetRow[] = [];
    while (pool.length > 0 && picked.length < 10) {
      const index = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(index, 1)[0]);
    }
    setPreviewRows(picked);
  }

  const hyperparameters = Object.entries(model?.hyperparameters ?? {}).filter(
    ([, value]) => value !== null,
  );

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="animate-fade-up space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="info">AI Powered</Badge>
          <Badge variant="default">{model?.algorithm ?? "Machine Learning"}</Badge>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          <span className="text-gradient">WorthMy-Car</span>
        </h1>

        <p className="text-lg font-medium text-foreground/80 sm:text-xl">
          AI powered used car resale price prediction
        </p>

        <p className="max-w-2xl leading-relaxed text-muted-foreground">
          WorthMy-Car is an end-to-end machine learning application that predicts
          the resale price of a used car based on its specifications, usage,
          ownership and location.
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <Button asChild size="lg">
            <Link to="/predict">
              Make Prediction
              <ArrowRight className="size-4" />
            </Link>
          </Button>

          <Dialog
            open={datasetOpen}
            onOpenChange={(open) => {
              setDatasetOpen(open);
              if (open) reshufflePreview();
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="lg">
                <Table className="size-4" />
                View Dataset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl">
              <DialogHeader>
                <DialogTitle>Dataset Preview</DialogTitle>
                <DialogDescription>
                  Random sample of the{" "}
                  <span className="font-medium text-foreground">
                    {meta ? formatNumber(meta.dataset.totalRows) : "—"}
                  </span>{" "}
                  rows used to train the model.
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-[60vh] overflow-auto rounded-xl border border-border">
                <TableUI>
                  <TableHeader className="sticky top-0 z-10 bg-card">
                    <TableRow>
                      {(meta?.dataset.columns ?? []).map((column) => (
                        <TableHead key={column}>{column}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {(meta?.dataset.columns ?? []).map((column) => (
                          <TableCell
                            key={column}
                            className="whitespace-nowrap tabular-nums"
                          >
                            {column === "Price" && typeof row[column] === "number"
                              ? formatINR(row[column] as number)
                              : column === "Kilometer" && typeof row[column] === "number"
                                ? `${formatNumber(row[column] as number)} km`
                                : String(row[column] ?? "—")}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </TableUI>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Status */}
      {error && (
        <Alert variant="destructive">
          <Database />
          <AlertTitle>Could not load application metadata</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={retry}>
              <RefreshCw className="size-3.5" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Model metrics */}
      <section className="animate-fade-up space-y-4" style={{ animationDelay: "80ms" }}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Model Metrics</h2>
            <p className="text-sm text-muted-foreground">
              Evaluated on the held-out test set
            </p>
          </div>
          {loading && <LoaderCircle className="size-4 animate-spin text-muted-foreground" />}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {loading && !metrics ? (
            <>
              <MetricSkeleton />
              <MetricSkeleton />
              <MetricSkeleton />
            </>
          ) : (
            <>
              <Card className="card-hover gap-4 py-5">
                <CardHeader className="px-5">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-info/15 text-info">
                    <Gauge className="size-5" />
                  </div>
                  <CardDescription>R² Score</CardDescription>
                  <CardTitle className="font-mono text-3xl">
                    {metrics ? metrics.R2.toFixed(4) : "—"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 text-xs text-muted-foreground">
                  Share of price variance the model explains
                </CardContent>
              </Card>

              <Card className="card-hover gap-4 py-5">
                <CardHeader className="px-5">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <IndianRupee className="size-5" />
                  </div>
                  <CardDescription>Mean Absolute Error</CardDescription>
                  <CardTitle className="font-mono text-3xl">
                    {metrics ? formatINR(metrics.MAE) : "—"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 text-xs text-muted-foreground">
                  Average miss per prediction
                </CardContent>
              </Card>

              <Card className="card-hover gap-4 py-5">
                <CardHeader className="px-5">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-warning/15 text-warning">
                    <TrendingUp className="size-5" />
                  </div>
                  <CardDescription>Root Mean Squared Error</CardDescription>
                  <CardTitle className="font-mono text-3xl">
                    {metrics ? formatINR(metrics.RMSE) : "—"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 text-xs text-muted-foreground">
                  Penalises large prediction misses
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>

      {/* Model details */}
      <section
        className="animate-fade-up grid gap-4 lg:grid-cols-2"
        style={{ animationDelay: "160ms" }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cpu className="size-4 text-primary" />
              <CardTitle className="text-base">Trained Model</CardTitle>
            </div>
            <CardDescription>
              Hyperparameters of the deployed estimator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{model?.algorithm ?? "—"}</Badge>
              {hyperparameters.map(([key, value]) => (
                <span
                  key={key}
                  className="rounded-lg border border-border bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground"
                >
                  {key}: <span className="text-foreground">{String(value)}</span>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="size-4 text-info" />
              <CardTitle className="text-base">Training Dataset</CardTitle>
            </div>
            <CardDescription>Used-car listings used for training</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="font-mono text-2xl font-semibold">
                {meta ? formatNumber(meta.dataset.totalRows) : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Rows</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold">
                {meta ? meta.dataset.columns.length : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Columns</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold">
                {meta ? meta.options.Make.length : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Brands</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
