// Human/auditor-readable report rendering — pure functions over a snapshot.
import type { RecorderSnapshot, QaCheckpoint } from "./PlaytestRecorder";
import type { CheckpointStats } from "./PerformanceSampler";

const f2 = (n: number): string => (Number.isFinite(n) ? n.toFixed(2) : "n/a");
const f0 = (n: number): string => (Number.isFinite(n) ? String(Math.round(n)) : "n/a");

function ageTime(checkpoints: QaCheckpoint[], name: string): number | null {
  const c = checkpoints.find((x) => x.event === name);
  return c ? c.simTime : null;
}

function fmtT(sec: number | null): string {
  if (sec === null) return "NOT REACHED";
  return `${f2(sec)}s sim`;
}

function perfRow(p: CheckpointStats): string {
  return `| ${p.label} | ${p.samples} | ${f0(p.fpsMin)} | ${f2(p.frameP50)}/${f2(p.frameP95)}/${f2(p.frameP99)} | ${f2(p.simP50)}/${f2(p.simP95)}/${f2(p.simP99)} | ${p.enemiesMax}/${p.projsMax}/${p.pickupsMax} | ${p.enemyPoolMax}/${p.projPoolMax}/${p.pickupPoolMax} |`;
}

function routeLine(snap: RecorderSnapshot, event: string, label: string): string {
  const done = snap.checkpoints.some((c) => c.event === event);
  return `- [${done ? "x" : " "}] ${label}`;
}

export function renderMarkdown(snap: RecorderSnapshot): string {
  const c = snap.checkpoints;
  const t = (n: Parameters<typeof ageTime>[1]): number | null => ageTime(c, n);
  const L: string[] = [];
  L.push(`# -SEED Human Gate A Report`);
  L.push(``);
  L.push(`> Machine-checkable evidence only. This report MUST NOT be read as a`);
  L.push(`> human-gate PASS — fun, clarity, readability, and Thai typography`);
  L.push(`> require human judgment.`);
  L.push(``);
  L.push(`## Environment`);
  L.push(``);
  const e = snap.environment;
  if (e) {
    L.push(`- userAgent: ${e.userAgent}`);
    L.push(`- viewport: ${e.viewport}`);
    L.push(`- devicePixelRatio: ${e.devicePixelRatio}`);
    L.push(`- screen: ${e.screen}`);
    L.push(`- refreshHz (estimated): ${e.refreshHz}`);
    L.push(`- hardwareConcurrency: ${e.hardwareConcurrency}`);
    L.push(`- deviceMemory: ${e.deviceMemory}`);
    L.push(`- webgl: ${e.webgl}`);
  } else {
    L.push(`- environment: NOT CAPTURED`);
  }
  L.push(``);
  L.push(`## Seed / Versions`);
  L.push(``);
  L.push(`- masterSeed: ${snap.seed}`);
  L.push(`- package: ${snap.versions.packageVersion}`);
  L.push(`- WORLDGEN_VERSION: ${snap.versions.worldgen}`);
  L.push(`- CONTENT_VERSION: ${snap.versions.content}`);
  L.push(`- SAVE_SCHEMA_VERSION: ${snap.versions.saveSchema}`);
  L.push(`- endReason: ${snap.endReason || "NOT FINISHED"}`);
  L.push(``);
  L.push(`## Route`);
  L.push(``);
  L.push(routeLine(snap, "RUN_START", "Run started"));
  L.push(routeLine(snap, "BRONZE_REACHED", "Bronze"));
  L.push(routeLine(snap, "IRON_REACHED", "Iron"));
  L.push(routeLine(snap, "INDUSTRIAL_REACHED", "Industrial"));
  L.push(routeLine(snap, "ATOMIC_REACHED", "Atomic"));
  L.push(routeLine(snap, "SPACE_REACHED", "Space"));
  L.push(routeLine(snap, "BOSS_SPAWNED", "Boss spawned"));
  L.push(routeLine(snap, "BOSS_KILLED", "Boss killed"));
  L.push(routeLine(snap, "ASCENSION_OFFERED", "Ascension offered"));
  L.push(routeLine(snap, "CHILD_WORLD_STARTED", "Child world started"));
  L.push(routeLine(snap, "POST_ASCENSION_30S", "Post-ascension +30s"));
  L.push(routeLine(snap, "POST_ASCENSION_60S", "Post-ascension +60s"));
  L.push(routeLine(snap, "POST_ASCENSION_120S", "Post-ascension +120s"));
  L.push(routeLine(snap, "PLAYER_DIED", "Player died"));
  L.push(routeLine(snap, "RUN_END", "Run ended"));
  L.push(``);
  L.push(`## Age Transition Times (sim seconds)`);
  L.push(``);
  L.push(`- Stone start: ${fmtT(t("STONE_START"))}`);
  L.push(`- Bronze: ${fmtT(t("BRONZE_REACHED"))}`);
  L.push(`- Iron: ${fmtT(t("IRON_REACHED"))}`);
  L.push(`- Industrial: ${fmtT(t("INDUSTRIAL_REACHED"))}`);
  L.push(`- Atomic: ${fmtT(t("ATOMIC_REACHED"))}`);
  L.push(`- Space: ${fmtT(t("SPACE_REACHED"))}`);
  L.push(``);
  L.push(`## Knowledge At Age (observed totals)`);
  L.push(``);
  if (snap.ageKnowledge.length === 0) L.push(`- none recorded`);
  for (const k of snap.ageKnowledge) {
    L.push(`- ${k.age} @${f2(k.simTime)}s (asc ${k.ascension}): knowledge ${k.knowledge}`);
  }
  L.push(``);
  L.push(`## Build Identity / Engagement`);
  L.push(``);
  if (snap.engagement.length === 0) L.push(`- none recorded`);
  for (const g of snap.engagement) {
    L.push(`- @${f2(g.simTime)}s ${g.age} asc ${g.ascension}: origin ${g.origin} [${g.families}] ` +
      `lv${g.level} ${g.weapons} techs ${g.techs} knowledge ${g.knowledge} ` +
      `breakthroughs [${g.breakthroughs.join("+") || "-"}] legacies [${g.legacies.join("+") || "-"}] ` +
      `poi [${g.poiClaims.join("+") || "-"}]`);
  }
  L.push(``);
  L.push(`## Boss`);
  L.push(``);
  L.push(`- spawned: ${fmtT(t("BOSS_SPAWNED"))}`);
  L.push(`- killed: ${fmtT(t("BOSS_KILLED"))}`);
  L.push(``);
  L.push(`## Ascension`);
  L.push(``);
  L.push(`- offered: ${fmtT(t("ASCENSION_OFFERED"))}`);
  L.push(`- started: ${fmtT(t("ASCENSION_STARTED"))}`);
  L.push(`- child world: ${fmtT(t("CHILD_WORLD_STARTED"))}`);
  L.push(``);
  L.push(`## Performance Summary`);
  L.push(``);
  L.push(`| checkpoint | samples | fpsMin | frame p50/p95/p99 (ms) | sim p50/p95/p99 (ms) | ent/max proj/max pick | pools E/P/K max |`);
  L.push(`|---|---|---|---|---|---|---|`);
  if (snap.perfCheckpoints.length === 0) L.push(`| (no perf snapshots) | | | | | | |`);
  for (const p of snap.perfCheckpoints) L.push(perfRow(p));
  L.push(``);
  L.push(`## Peak Entity Counts`);
  L.push(``);
  const peak = (f: (p: CheckpointStats) => number): number =>
    snap.perfCheckpoints.reduce((m, p) => Math.max(m, f(p)), 0);
  L.push(`- enemies max: ${peak((p) => p.enemiesMax)}`);
  L.push(`- projectiles max: ${peak((p) => p.projsMax)}`);
  L.push(`- pickups max: ${peak((p) => p.pickupsMax)}`);
  L.push(`- worst frame: ${f2(Math.max(0, ...snap.perfCheckpoints.map((p) => p.worstFrameMs)))}ms`);
  L.push(`- worst sim step: ${f2(Math.max(0, ...snap.perfCheckpoints.map((p) => p.worstSimMs)))}ms`);
  L.push(`- frames >33ms: ${Math.max(0, ...snap.perfCheckpoints.map((p) => p.over33ms))}`);
  L.push(`- frames >50ms: ${Math.max(0, ...snap.perfCheckpoints.map((p) => p.over50ms))}`);
  L.push(`- frames >100ms: ${Math.max(0, ...snap.perfCheckpoints.map((p) => p.over100ms))}`);
  L.push(``);
  L.push(`## Pool Saturation`);
  L.push(``);
  if (snap.poolSaturations.length === 0) L.push(`- none recorded`);
  for (const p of snap.poolSaturations) {
    L.push(`- ${p.pool}: ${p.used}/${p.cap} at ${f2(p.simTime)}s (age ${p.age}, asc ${p.ascension})`);
  }
  L.push(``);
  L.push(`## Functional Runtime Assertions`);
  L.push(``);
  if (snap.assertions.length === 0) L.push(`- none recorded`);
  for (const a of snap.assertions) {
    L.push(`- [${a.pass ? "PASS" : "FAIL"}] ${a.id} — ${a.name}: ${a.detail} (${f2(a.simTime)}s, ${a.age})`);
  }
  L.push(``);
  L.push(`## Console Errors / Warnings`);
  L.push(``);
  if (snap.consoleEntries.length === 0) L.push(`- none captured`);
  for (const ce of snap.consoleEntries.slice(0, 50)) {
    L.push(`- [${ce.level.toUpperCase()}] ${ce.message} (${f2(ce.simTime)}s, ${ce.age})`);
  }
  L.push(``);
  L.push(`## EN/TH Switching`);
  L.push(``);
  if (snap.langSwitches.length === 0) L.push(`- no language switch observed during QA run`);
  for (const s of snap.langSwitches) {
    L.push(`- ${s.from} → ${s.to}: canonical snapshot ${s.unchanged ? "UNCHANGED" : "CHANGED"} (${f2(s.simTime)}s)`);
  }
  L.push(``);
  L.push(`## UI Overflow Findings (structural only — NOT typography proof)`);
  L.push(``);
  if (snap.overflows.length === 0) L.push(`- none detected`);
  for (const o of snap.overflows.slice(0, 100)) {
    L.push(`- ${o.selector} [${o.lang} ${o.viewport}] ${o.kind} by ${f0(o.overBy)}px`);
  }
  L.push(``);
  L.push(`## Human Feedback Markers`);
  L.push(``);
  if (snap.feedback.length === 0) L.push(`- none`);
  for (const fb of snap.feedback) {
    L.push(`- [${fb.category}] [${fb.label}] ${fb.note || "(no note)"} — ${f2(fb.simTime)}s, age ${fb.age}, asc ${fb.ascension}, chunk ${fb.chunk}, fps ${f0(fb.fps)}, enemies ${fb.enemies}, proj ${fb.projs}, build ${fb.build}`);
  }
  L.push(``);
  L.push(`## Human Ratings (1-5, recorded not inferred)`);
  L.push(``);
  if (snap.ratings.length === 0) L.push(`- none recorded`);
  for (const r of snap.ratings) {
    L.push(`- ${r.question}: ${r.score}/5 (${f2(r.simTime)}s)`);
  }
  L.push(``);
  L.push(`## Automatic Gate Result`);
  L.push(``);
  const fails = snap.assertions.filter((a) => !a.pass).length;
  const errs = snap.consoleEntries.filter((x) => x.level === "error").length;
  L.push(`- failed assertions: ${fails}`);
  L.push(`- console errors: ${errs}`);
  L.push(`- verdict: ${fails === 0 && errs === 0 ? "AUTOMATED_CHECKS_PASS" : "AUTOMATED_CHECKS_FAIL"}`);
  L.push(``);
  L.push(`## Items Requiring Human Judgment`);
  L.push(``);
  L.push(`- fun / pacing / combat feel per era`);
  L.push(`- visual readability (enemies, projectiles, weapons, elites, boss)`);
  L.push(`- navigation clarity (do you know where to go?)`);
  L.push(`- Thai typography: tone marks, upper/lower vowels, line-height, clipping`);
  L.push(`- balance: difficulty, age length, weapon usefulness (one run is not statistics)`);
  L.push(``);
  return L.join("\n");
}

/** Machine-readable raw evidence (pretty-printed, bounded by recorder caps). */
export function renderJSON(snap: RecorderSnapshot): string {
  return JSON.stringify(snap, null, 2);
}
