# ADR 0022 — Child-world experiment and pure goal advice

Accepted for private human evaluation, 2026-10-11. Base Content 9 a09babd.

Human evidence is preserved before edits: docs/playtests/content9-ascension-human-20261011.md. A child-world reset is intentional bounded prestige, but unchanged master-seeded rules and repeated early objectives were poorly explained. Preserve the reset; test two bounded conditions using existing research bonuses and raid scheduling. No new dependency, copied content, quest engine or combat verb.

Odd child indices: Knowledge rewards ×0.8, research contribution ×2 before that scaling. A tier-one tundra research base contributes .15, yielding .8×(1+.30)=1.04 before build multipliers; a normal .10 base gives .96. This changes site/specialization choice. Even child indices: raid interval ×.75, with the existing 30-second warning, enemy strength and pools unchanged. Claim one cleared site plus the existing ten kills before Bronze; free claim cannot be trapped by capacity. All later requirements and first-Signal exception persist.

Child conditions derive only from canonical ascension index. No new serialized RunState field is necessary: snapshot already hashes ascension, rules, territories, rewards and RNG. WORLDGEN remains 2; CONTENT increases 9→10 for intentional child progression differences. SAVE remains 1 because settings and archive shape are unchanged. World-one laws explicitly retain c9 sampling to preserve Content 9 gameplay; child laws now derive from child seed and c10. Old child traces are incompatible intentionally.

Goal advice is a pure core graph query. Tech targets use transitive prerequisites; combo targets use missing tags, alternative providers and provider prerequisites. Shared eligibleTech validates age, ownership, prerequisites, exclusions and weapon families. Relations are completes / required step / missing ingredient / indirect route / unrelated. Stable IDs order the next-step list. No RNG draw, new offer guarantee, automatic pick, changed quality or weighting. The existing bounded pinned-path weighting remains.

Draft map review temporarily hides the pending draft, pauses simulation, gives input to the map, and reconstructs advice after return. It cannot consume a hidden choice. Modal choices expose keyboard focus and native-style Enter/Space activation. Child arrival displays actual FIFO inherited effects and condition rules, with explicit action. Canonical identifiers remain unchanged; Chronicle translates presentation only.

Renderer measurements bracket Phaser PRE_RENDER/POST_RENDER: CPU dispatch/submit time, not GPU completion. Frame intervals and canonical simulation step times remain separate. No performance budget is waived; representative dense/long-session hardware certification remains pending.

QA reports add optional renderer CPU-submit percentiles and derived child condition. Historical reports omit unmeasured values; they are never backfilled as zero. This observational report extension does not change the persistent game save schema.
