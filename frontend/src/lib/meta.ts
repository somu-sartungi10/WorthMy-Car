import type { Meta } from "./types";

/**
 * `public/meta.json` is generated from data/raw/cardata.csv and
 * models/metrics.json by `npm run meta` (runs automatically before dev/build).
 */
export async function loadMeta(): Promise<Meta> {
  let response: Response;
  try {
    response = await fetch("/meta.json", { cache: "no-cache" });
  } catch {
    throw new Error("Could not load /meta.json — run `npm run meta` in frontend/.");
  }

  if (!response.ok) {
    throw new Error(
      `meta.json missing (HTTP ${response.status}) — run \`npm run meta\` in frontend/.`,
    );
  }
  return (await response.json()) as Meta;
}
