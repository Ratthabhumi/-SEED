# ADR0042 — release-aligned painted equipment and grounded Boss

Status: implemented for review; human art/motion/fun pending. Parent PR21/835a25f.

Native normalized-source review confirms staff cells already point right;
the pipeline rotated the diagonal original. Do not compensate twice. Only weapon_fired reached the
mount; beam_fired already animated the body/effects, leaving the mount aimed
along old locomotion. Moving/firing could also disagree on body-facing/socket.
Use one pure release predicate for body and mount, accepting only kinetic/
energy emitted within4u of the player. Keep actual canonical emitters unchanged.
Preserve normalized source axes, reflect the grip origin with Phaser's center-based flipY,
and briefly use real release direction for the body without mutating movement
history. Recoil is a bounded quadratic canonical-time offset, not another shot.

The generic moving predicate returned true for any enemy without evolution,
including stationary Bosses. BossPresentation now observes actual positions,
retains that observation while canonical time is paused, and resets on rewind/
world change. Preserve the exact painted cells; use their measured alpha>64
bottoms as floor pivots, with a shared original rest contact. Ease anticipation/
recovery around the floor, face locked attack aim, and warm the phase2 tint.
Hero/Boss/focused-enemy floor shadows are bounded Graphics ink; HC retains
its existing sparse accessibility art/optimized ground. The unchanged1774x887
Boss source also contains detail lost in the128px derivative. Re-normalize
directly from source to256px cells, same240u display size and eight poses,
adding1.5MiB RGBA with no extra draw object. Preserve source hash, regenerate
derivative/provenance and measured feet; no old-bitmap upscale or new anatomy.
No new source artwork, engine,
dependency, canonical/content/save/worldgen change or ownership transfer.

Rejected alternatives: extra emitters from Float, a new vector Boss, inferred
hidden limbs, generated gait grids, uniform actor enlargement and Boss immunity.
Full artist-owned anatomy/in-betweens remain blocked under V32_COMBAT_SLICE.
The artist can export Krita PNG sequences into the existing sheet pipeline.

Validation: pure source-axis/release/reset/ground tests; native real canonical
releases all6 ages, Hand/Float, left aim, actual beam, phase tint, paused poses,
EN/TH720/1080; inherited Boss defeat/World2/restart and original31 regressions.
Early official-PR21/candidate PNGs/clips precede expensive CI. Source stamps,
full final checks and strict24-case physical results are distinct PR receipts.
No test or human rating is removed to manufacture a pass.
