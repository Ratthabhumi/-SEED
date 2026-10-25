// QA mode detection — pure, framework-free, unit-testable.
// ?qa=1 activates the human-playtest harness. Everything QA stays dormant
// without the query parameter; normal play is byte-for-byte unaffected.
export const GOLDEN_QA_SEED = "EPOCH-GOLDEN-001";

export const QA_QUERY_KEY = "qa";

/** True when the given location.search string carries the QA flag. */
export function isQAMode(search: string): boolean {
  try {
    return new URLSearchParams(search).has(QA_QUERY_KEY);
  } catch {
    return false;
  }
}

/** True when the visual-language lab should boot instead of the game. */
export function isVisualMode(search: string): boolean {
  try {
    const params = new URLSearchParams(search);
    return params.has("visual") || params.has("leverage");
  } catch {
    return false;
  }
}
