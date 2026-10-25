# V3.5 weapon release review

Parent: Draft PR24, 8edbc5b5afa3c5b4beb66341af8e993fb21aa6fa.
Decision and compatibility: [ADR0044](ADR/0044-canonical-weapon-release-transform.md).

The primary now emits actual arrows/projectiles and beams from the transformed
painted weapon tip. Explicit primary provenance replaces player-distance guesses.
The companion tracks its target and keeps a quiet idle station. No tether or
cosmetic duplicate conceals the previous player-centered emitter.

Validation receipts are kept separately from acceptance. Targeted geometry and
simulation checks cover all 24 frames/eight directions/both mounts, true spread,
first-step motion and deterministic reversals. Native e2e captures clean/overlay
screens and clips. White=player, cyan=pivot, yellow=current muzzle, magenta=birth,
green=actual projectile and red=target. Fixtures are labeled staged engineering
evidence, never human playtest evidence. Full check, Natural36, package, exact-head
CI and physical performance results are recorded in the Draft PR receipts.

Manual owner retest after the exact source checks finish:

1. Double-click the existing Play-SEED-QA.bat. Start a **new** session; existing
   failed/partial human evidence stays intact.
2. As Hunters, circle stationary and moving enemies; reverse left/right and try
   enemies very close to the companion. Check arrow emergence and aim in eight
   directions. Observe any waiting/awkward near-target behavior.
3. Check later bow/crossbow stages, multishot and the Space beam. Guardian/squad
   shots should originate from their own units.
4. Compare pause/resume, Reduced Effects and high contrast at 720p and1080p in
   Thai/English. Compare Hand with /?qa=1&equipment=hand on a separate new session.
5. Restart and reach World2 naturally; report spacing, aim, stalls and enjoyment
   in your own words. Do not count a staged capture as a clean human pass.

Original31 issue statuses, HQ painted Boss preference and the pending genuine
layered animation remain unchanged. Parent physical20/24 (four HC1920 failures)
and local219/1 browser failure are historical evidence, not candidate results.
Strict render<8ms/simulation<4ms remain acceptance criteria. No causal claim
attributes those old failures to Float. No market research is needed for this fix.
