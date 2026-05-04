/**
 * Bounded Levenshtein distance for fuzzy city search.
 *
 * Single-row DP with early termination — fast enough to run against
 * 30k+ cities on every debounced keystroke.
 */

export function boundedLevenshtein(a: string, b: string, maxDist: number): number {
  const m = a.length;
  const n = b.length;

  if (Math.abs(m - n) > maxDist) return -1;
  if (a === b) return 0;
  if (m === 0) return n <= maxDist ? n : -1;
  if (n === 0) return m <= maxDist ? m : -1;

  let short = a;
  let long = b;
  let sLen = m;
  let lLen = n;
  if (m > n) {
    short = b;
    long = a;
    sLen = n;
    lLen = m;
  }

  const row = new Array<number>(sLen + 1);
  for (let i = 0; i <= sLen; i++) row[i] = i;

  for (let j = 1; j <= lLen; j++) {
    let prev = row[0];
    row[0] = j;
    let rowMin = row[0];

    for (let i = 1; i <= sLen; i++) {
      const cost = short[i - 1] === long[j - 1] ? 0 : 1;
      const val = Math.min(row[i] + 1, row[i - 1] + 1, prev + cost);
      prev = row[i];
      row[i] = val;
      if (val < rowMin) rowMin = val;
    }

    if (rowMin > maxDist) return -1;
  }

  return row[sLen] <= maxDist ? row[sLen] : -1;
}

/**
 * Maximum allowed edit distance for a query of the given length.
 *   1–2 chars → 0 (no fuzzy — too ambiguous)
 *   3–5 chars → 1
 *   6+  chars → 2
 */
export function maxEditDistance(queryLen: number): number {
  if (queryLen <= 2) return 0;
  if (queryLen <= 5) return 1;
  return 2;
}

export function fuzzyScore(query: string, target: string, maxDist: number): number {
  if (maxDist === 0) return 0;

  const dist = boundedLevenshtein(query, target, maxDist);
  if (dist < 0) return 0;
  if (dist === 0) return 30;

  const maxLen = Math.max(query.length, target.length);
  if (dist / maxLen > 0.34) return 0;

  return dist === 1 ? 5 : 2;
}
