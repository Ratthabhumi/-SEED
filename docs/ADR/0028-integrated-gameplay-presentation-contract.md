# ADR0028 — Reservations, raid readiness and unified presentation

Review experiment2026-10-13, based on PR7 exact2222002. Content14 intentionally
changes raid scheduling, target selection and canonical snapshot coverage.
Worldgen2 geometry and persistent save-schema2 remain unchanged. No dependency.

Neutral land remains free. Every specialized post reserves its complete tier cost,
including disabled posts; repair and garrison never mint/refund capacity. Mutation
paths reconcile the stored total to the actual reservations. The first Signal
retains at most its tier-one1/2-point exceptional overcommitment and consumes the
world-scoped signalSecured flag permanently, even after dismantle/loss. Age growth
or explicit dismantling pays down excess. UI names Logistics rather than a count
of bases and explains neutral/disabled/Signal semantics. Old territory-count APIs
are historical diagnostics, not the current claim predicate.

Stationed allies reserve squad quota. Military reinforcement counts all active
allies before filling inactive holes, preventing duplication after garrison.
Recall/dismantle returns living reserves with their actual injuries; only a paid
military recruitment may replace a dead reserve. The HUD reports actual mobile
quota instead of the fixed backing pool length. Existing outpost benefits remain
defined by active specialization, independently of this quota correction.

Normal raid cadence stays180s (frontier child135s) plus the full30s warning.
If a real raid defense is the sole next-age requirement, continuous readiness
caps preparation at30s with a45s post-claim grace: arrival within60s of readiness,
or75s for a newly claimed base. This counterfactual gate query never grants credit.
Closest specialized active posts are preferred, with seeded exact-tie selection.
Wave size is bounded at12; progression-critical spawn allocation can reclaim
ordinary non-boss/non-siege slots without kills/loot. Protected saturation retries
after5s. A zero-allocation wave cannot land or win. Loss/cancellation is not a
defense. Raid phase, successful allocation count and readiness clock are hashed.

One pure path recommendation ranks complete/required/progress/indirect, ties by
actual offer order, and highlights none if irrelevant. Advice changes no RNG or
eligibility, preserves player choice and rarity labeling.

One world-scale/presentation registry owns visible sizes, Origin-family geometry
and six equipment materials. Real release/ability events drive mounted recoil,
impact and ability presentation; canonical hitboxes/damage/ranges are unchanged.
Painted actor bodies keep upright poses; full authored multi-frame sequences and
era-specific painted costumes remain explicit production acceptance gates.

Four original floor sources feed one16MiB2048px canvas atlas with64 bounded252px
cells. World-coherent bilinear biome weights and mirrored source edges remove
rectangular transitions, without changing biome rules/collision/discovery/RNG.
Cache invalidates on world nonce; high contrast retains the functional plain floor.
Default painted floor replaces old repeated decor glyphs; painted bases replace
duplicate geometric building superstructures, with neutral/high-contrast paths
retained. Legacy actor sources remain archived/licensed but only Guardian's
six-era SVG rig is uploaded for gameplay. Source/provenance is never deleted.

An initial124px/cell atlas visibly blurred native captures and was rejected.
The252px/cell atlas keeps two-pixel edge extrusion to prevent unrelated linear
filter samples. Only changed tiles rebuild; cached actor styles avoid repeated
texture/size/pivot/tint updates. GPU draw/vertex submission counts are measured
in the browser test, with the actual driver reported; presentation-command
construction timing excludes Phaser rendering and GPU completion.

Measured sparse software baseline is not target-hardware evidence. Keep full
regressions, native captures, comparative cohorts and unchanged performance
budgets; no fun/production-art/60FPS claim follows from CI alone.

Input correction: installed Phaser4 KeyboardManager emits PROCESS per DOM key,
but KeyboardPlugin.update revisits its uncleared queue and deduplicates only the
immediately previous code/time/type. A same-frame Escape down/up then another
key replays the original Escape, closing/recreating Pause before native Resume.
A failing-before-fix native key-burst regression proves this mechanism. Scene
edge commands now consume each KeyboardEvent object once through a WeakSet,
including F4 diagnostics; distinct events and existing repeat filters are
preserved. Movement level polling, canonical balance, RNG and InputFrame replay
remain unchanged. Do not patch third-party code or debounce by timestamp.
