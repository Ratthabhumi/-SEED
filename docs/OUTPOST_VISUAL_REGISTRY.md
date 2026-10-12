# Outpost identity contract

`OutpostVisualRegistry.ts` receives the actual specialization, Age, tier, disabled
and repair-presence state. `GameScene.refreshGround()` now passes those fields;
previously it omitted specialization, making all three types share architecture.
Claimed Ruins no longer retain the generic observatory sprite over another spec.

| Actual spec | Stable silhouette | Meaning retained from simulation |
|---|---|---|
| Research | observatory dome, lens, telescope, lab windows | Knowledge multiplier |
| Military | two bastions, recessed gate, pennants | squad slot / existing support rules |
| Economy | workshop roof, chimney, storage crate, supply strip | nearby canonical regeneration |
| unassigned | existing claim pad | freely claimed land; choose a spec later |

Six geometry kits: timber, bronze framing, rivets, pipework, antenna, conduit
grid. Tier2 adds an annex. Disabled structures lose operational lights and gain
cracks/debris; canonical repair presence adds a repair strip. The existing actual
repair timer/bar remains the authoritative progress display. Ground invalidates
on spec/tier/disabled or repair-presence edges, never on every repair timer tick.

Original code-native vector artwork uses shared theme materials and fixed world
anchors. Approximate footprint86×90u; all decorative geometry remains nonblocking
as in the existing territory contract. No invented firing turrets, manufacturing
economy, capacity grants, biome rules or save/worldgen changes.

Regression exercises3 specs×6 Ages×2 tiers×2 damage states and distinguishes
actual geometry, rather than checking hue alone. Native captures use real
claim/specialization methods in an explicitly staged E2E fixture. These do not
establish human recognition or production-art approval.
