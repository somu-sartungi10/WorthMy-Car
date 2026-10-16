import { useCallback, useEffect, useState } from "react";

import { loadMeta } from "@/lib/meta";
import type { Meta } from "@/lib/types";

interface MetaState {
  meta: Meta | null;
  loading: boolean;
  error: string | null;
}

let cached: Promise<Meta> | null = null;

function ensureLoaded(): Promise<Meta> {
  if (!cached) cached = loadMeta();
  return cached;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Loads public/meta.json once and shares it across components. */
export function useMeta() {
  const [state, setState] = useState<MetaState>({
    meta: null,
    loading: true,
    error: null,
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    ensureLoaded()
      .then((meta) => {
        if (active) setState({ meta, loading: false, error: null });
      })
      .catch((error: unknown) => {
        cached = null;
        if (active) setState({ meta: null, loading: false, error: messageOf(error) });
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const retry = useCallback(() => {
    setState({ meta: null, loading: true, error: null });
    setReloadKey((key) => key + 1);
  }, []);

  return { ...state, retry };
}
