# QA provenance and player-facing history labels

Date2026-10-11. A real Content9 report exposed a negative wall duration; Chronicle rendering exposed canonical tech IDs.

QA start/end timestamps use the same monotonic millisecond clock. Existing relative-second checkpoint/auto-save timings stay unchanged. Invalid historical durations are labeled unknown rather than reconstructed by guessing.

Vite embeds SHA and source-dirty status once at startup/build; the recorder carries those values. The dev sink records reportSavedSha separately and marks provenance dirty when the current source differs, or unknown when bundle metadata is missing. A later commit cannot turn an old/dirty running bundle into clean evidence. This is local observational provenance, not cryptographic attestation; operators still restart the launcher and validate exact SHA before a clean run. No gameplay state, RNG, content/worldgen/save version or dependency changes.

Canonical history retains IDs for replay/hash/evidence. Chronicle resolves current graph names and stable frontier depth/slot, plus fallback names. Ascension replaces the world graph; the latest child-root/Ascension history boundary prevents reused IDs from borrowing new-world names; an old-world entry receives an honest localized previous-world label. A persistent cross-world name archive would need a separate state/schema decision and is not added for this narrow fix. Five technology-map tooltips now use EN/TH keys.

Regressions cover terminal clock units, old/dirty/missing provenance, historical negative reports, translated graph/fallback/previous-world labels, actual EN/TH Chronicle and map tooltip DOM. All earlier free-claim, Signal, refund, reroll and modal-queue contracts remain in force.
