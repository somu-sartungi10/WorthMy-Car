import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  index: number;
  title: string;
  hint?: string;
}

/** Numbered section header used inside the prediction form. */
export function SectionHeading({ index, title, hint }: SectionHeadingProps) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-xs font-bold text-primary">
        {index}
      </span>
      <div>
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  help?: string;
  children: ReactNode;
  className?: string;
}

/** Label + control wrapper with consistent spacing. */
export function Field({ label, help, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="text-sm font-medium text-foreground/90">{label}</span>
      {children}
      {help && <p className="text-xs text-muted-foreground">{help}</p>}
    </div>
  );
}
