// qa:handoff — update ONLY the delimited latest-playtest section of
// SESSION_HANDOFF.md from the sanitized summary. History is never touched.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SUMMARY = join(ROOT, "docs", "playtests", "latest-v020-engagement.md");
const HANDOFF = join(ROOT, "SESSION_HANDOFF.md");

export const START_MARK = "<!-- QA-ENGAGEMENT-START -->";
export const END_MARK = "<!-- QA-ENGAGEMENT-END -->";

/** Replace the delimited section; throws if markers are missing/duplicated. */
export function applyHandoffSection(handoffText, summaryText) {
  const si = handoffText.indexOf(START_MARK);
  const ei = handoffText.indexOf(END_MARK);
  if (si < 0 || ei < 0 || ei <= si) throw new Error("handoff markers missing");
  if (handoffText.indexOf(START_MARK, si + 1) >= 0) throw new Error("duplicate markers");
  const head = handoffText.slice(0, si + START_MARK.length);
  const tail = handoffText.slice(ei);
  return `${head}\n\n${summaryText.trim()}\n\n${tail}`;
}

function main() {
  if (!existsSync(SUMMARY)) {
    console.error(`No sanitized summary: ${SUMMARY} — run npm run qa:report first.`);
    process.exit(1);
  }
  const handoff = readFileSync(HANDOFF, "utf8");
  const summary = readFileSync(SUMMARY, "utf8");
  writeFileSync(HANDOFF, applyHandoffSection(handoff, summary), "utf8");
  console.log("handoff latest-playtest section updated");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
