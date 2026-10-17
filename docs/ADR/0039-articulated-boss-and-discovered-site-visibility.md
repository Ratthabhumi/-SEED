# ADR0039: original vector boss joints and discovered-site eligibility

Date: 2026-10-17. Status: implemented; human art/fun approval pending.

## Evidence and decision

PR18 uses eight128px whole-body cells. Measured occupied dimensions are
88x97,95x96,87x91,85x99,97x89,97x95,90x81,98x60 (alpha>8).
At nominal240px and zoom1–1.25 each source pixel occupies1.875–2.344
screen pixels; the two walk poses switch at4Hz. Filtering cannot supply
missing anatomy. The old boss.svg is a low-detail64px-cell strip, not a
hidden high-resolution painted source.

Choose a new original editable vector armor character: nine separately
authored plates,14 joint images, one1024x768 SVG raster texture (3MiB RGBA).
Do not resample the old painted PNG. Steel, violet stone, brass crown and
coral heart preserve the armored crowned boss identity. This is a crisp
vector interpretation, **not new painted art**. See source SVG, alpha report,
exported PNG and reproducible export scripts in assets/original/actors.
Canonical seconds/encounter timers drive analytic shoulder, elbow, hip,
knee, mantle, crown and torso transforms. Warning/commit/attack/recovery
join continuously; locomotion, breathing, transition, hit and defeat have
separate tracks. There are no animation callbacks affecting damage.
World nonce clears transient state; defeat lasts0.7 canonical seconds and
reuses the same14 images. Scene shutdown owns their destruction.

The old0.5MiB atlas remains for explicit legacy laboratory comparisons;
new3MiB allocation is additional. Future painted production may replace the
plates without moving rules or adopting a new animation dependency.

Boss stats, HP and phase text now share a flowing center column. Side
columns have disjoint horizontal bounds; ResizeObserver places notifications
below the actual wrapped lane. Thai uses existing≥1.7 line height.

## Proven POI defect

Canonical discovery uses distance<70 across adjacent chunks. Presentation
previously required the player's current chunk or an explored chunk even
when that POI was already canonically discovered. A site near a chunk edge
could therefore pay its discovery reward while its landmark remained hidden.
Allow discovered IDs through the visibility guard; retain the existing guard
for undiscovered sites. No pre-reveal, reward, RNG or worldgen change.
The regression positions the player outside an unvisited chunk, lets the
real simulation discover the nearby POI, verifies absent→present art, and
compares native screenshots with only that landmark hidden to prove pixels
actually contributed. CPU POST_RENDER timing is still not GPU presentation
time; it is not relabeled as such.

## Floating mount comparison

Add opt-in `?equipment=float` with one bounded cosmetic primary mount, active
family/Origin equipment and a tether to the unchanged canonical emitter.
Reduced Effects holds its orbital position. `?equipment=hand` and default
retain the hand mount pending real preference/readability feedback. Do not
draw a second defense/trap/ability as another primary. No canonical values,
projectile origins, cooldowns or save/version fields change. Native staged
comparisons cover four Origins and Stone/Space; this does not constitute
human preference or natural progression evidence.

## Validation and limitations

New joint continuity/pause/skip tests supplement original canonical and
input tests. Two legacy art assertions now require14 actual new rig images
instead of obsolete boss-v2 frame3; no damage/dodge/fan/phase assertion was
removed. Native rig/HUD captures cover720/1080, EN/TH,200% and three modes.
Full final checks and immutable CI/hardware receipts are recorded in PR.
The original31-issue ledger is retained; animation across every other actor,
universal performance, final art direction and human fun remain separate
acceptance gates. No release or automatic human PASS follows.
