# ADR0033 — Content16 boss transition and shared visual materials

Status: implemented candidate, validation/human quality gates open.

Boss threshold evaluation was approach-only. Evaluate at every safe boundary,
finish commit/attack, then visibly transition; reset phase2 to cross-first so a
new spatial challenge actually follows escalation. Keep lethal damage, HP,
warnings and recovery fairness. Content16 declares replay timing incompatibility;
Worldgen3/Save2 unchanged. No renderer-owned gameplay mutation.

Reuse native Phaser/canonical-time sampler for selected original release/recovery
frames through optional per-frame overrides. Legacy metadata remains supported.
Full walk is withheld because contact chronology is unverified. Never call a
generated sheet or source hash evidence of authored gait quality.

Paint only known hostile sources with existing bounded meshes. Unknown and HC
sources keep vector fallback. Shared periodic fallback costs1MiB plus one-time
preparation, disclosed separately from warm rendering. Hero body +12.5% is a
presentation intervention; canonical collision/range/speed are unchanged.

No new runtime dependency, new animation engine, new profiler or rewritten world
generator. Final acceptance requires full regression, native captures, existing
paired profiling and exact-head official packages, plus later human judgments.
