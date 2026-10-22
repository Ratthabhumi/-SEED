# ADR0040: restore painted boss after owner rejection

Date: 2026-10-22. Status: implemented for review; human acceptance pending.

Owner rejected ADR0039's new vector boss art as worse and off-theme. Restore
the original lava-rock painted atlas as production default, including authored
hit/death cells. Keep the rig/source/tests behind explicit `bossArt=rig`; only
that path loads its additional3MiB texture. ADR0039's HUD, observer lifecycle,
POI visibility and simulation boundary decisions remain in force.

`BossPresentation` owns one painted Image or the explicit historical rig. It
selects existing cells from canonical encounter state; after .32s of recovery
use idle instead of continuing to depict an attack. Canonical seconds drive
bounded whole-body motion/fade; Reduced Effects suppresses secondary motion.
World nonce/restart clear transients. This is not newly authored anatomy or
an animation-engine rewrite. No core/content/save/worldgen change.

Retain painted hostile assets; High Contrast/Canvas use source-specific threat
silhouettes with shared normalized geometry. Cache identity includes source
role to prevent two same-color/radius attacks receiving the first cached shape.
The float comparison holds a stable shoulder station instead of intersecting
the hero every orbit. Hand remains default without human preference evidence.

See V3_VISUAL_RECOVERY for art target, early comparison, evidence limitations,
research status and natural-play instructions. Engineering PASS does not
reverse the owner's rejection or establish new art/fun acceptance.
