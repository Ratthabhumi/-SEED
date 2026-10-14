# ADR0032 — physical input context and bounded presentation caching

Accepted for engineering candidate14 October2026; human quality gates open.

Focused native buttons accept fresh Space on key release. Held-key guarding
alone does not fulfill the explicit ban on Space Draft decisions. Capture
prevents both default phases whenever canonical Draft is open; explicit Enter/
digits/pointer remain accessible. Native physical movement tracking clears at
context/blur/visibility boundaries instead of trusting possibly stale Phaser
button states. Simulation's InputFrame and rules remain unchanged.

Optional HC friendly geometry cache uses existing vector artwork and Mesh2D,
bounded64glyphs/1000quads/2.25MiB. Essential effects, entity count and collisions
are preserved. Overflow/Canvas uses original vector path.

Worker prepares reversed RGBA rows for typed WebGL partial upload, retaining
unreversed backing Canvas for restoration. This removes a DOM source upload
path; performance improvement requires paired measurement and does not prove
that prior31.6ms stalls were all DOM conversion. No new dependency, save/world/
content version or canonical change. Existing performance budgets remain.
