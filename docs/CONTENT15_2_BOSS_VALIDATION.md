# Boss experience audit and validation

Historical human384: Engineers, efef11e clean, boss spawn874.98s/kill891.08s,
approximately16.1s simulation exposure. No phase-exposure or DPS trace and no
fun ratings. This is not a15.2 human run and does not prove one phase.

Current canonical `src/core/combat/bossEncounter.ts`: approach→warning→commit
→attack→recover; half-HP transition checked during approach only. Warning1.15s
slam/1.35s fan/1.4s cross; commit.14s; release.18s; recover1.85/1.4/1.8s;
approach cooldown2.2s; transition.8s. PhaseI alternates slam/fan, PhaseII adds
cross and changes sequence. Fixed aim and fan center gap allow counterplay.
Damage during other phases can pass50% before next approach; a strong build
could kill before transition. This is a concrete code risk, not demonstrated
as the sole cause of the human complaint.

15.2 adds truthful persistent localized phase/action/recovery cues; staged EN/TH
tests exercise the actual canonical phase-transition via existing hooks and
check the label/visible bounds at high UI scale. Existing tests exercise patterns,
collision/safe gap, actual release and phase behavior. Native captures demonstrate
communication, not a balanced natural fight or representative DPS exposure.

No HP/DPS/invulnerability/pattern/timing change. Boss/elite fun gate remains
PARTIAL. Next justified gameplay intervention requires phase/time/HP/DPS telemetry
for weak/high-DPS builds across Origins/seeds, then deterministic tuning and
explicit Content compatibility policy. Do not silently add invulnerability or
multiply HP based on one16.1s observation.
