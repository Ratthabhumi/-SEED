# ADR0054 — V4.8 controllable builds and ordinary-wave rhythm

Status: implemented experiment; owner acceptance pending.

## Evidence and decision

Parent PR38 / 1edd86ee7a3d5a0e3d54898050996f9687edfff4 is the verified source, not main. Owner feedback remains Combat1/5 and Upgrade2/5. These scores authorize an experiment, not a claim that any particular new mechanic is enjoyable.

Use existing mechanics: Kinetic retains its aimed first projectile and alternates additional flank rays; Conduction removes Energy projectile pushback to keep clusters within chain reach; moving Field places a rear barrier perpendicular to movement. Standing Field retains its scattered placement. Mine placement consumes the same two event-stream draws in either mode. Damage, HP, cooldowns, counts, chain range and pools retain their existing values. Even Kinetic volleys are intentionally asymmetric; projectile fan coverage and survivability can worsen in some situations.

After the first actual chosen Tech, World1 ordinary packets follow 1.2/1.2/4.2-second rhythm on absolute396-tick boundaries. The transition has a minimum1.2-second gap, verified at every phase. This can adjust initial packet phase; steady-state density remains three packets per6.6seconds. First survival, Boss mode, child worlds, elite and milestone scheduling retain existing rules. No new director or canonical counter. Content26 records replay identity changes; Worldgen3, Save3 and child laws18 stay pinned.

Draft tactics describe canonical changes only. Conduction text is excluded for aura/beam paths. No new effects, assets, currencies, inventory or progression engine.

## Validation and limits

RED/GREEN geometry, displacement, cardinal mine placement, RNG isolation, replay and timing tests. Parent comparison runner verifies every cached parent source blob rather than trusting extraction existence. Six staged probes and two unchanged historical180-second policies are observational evidence, not human gameplay.

One fixed-cadence ablation retained the new weapons. Final handoff-safe pulse versus fixed-cadence ablation: Hunter empty-near30094.867→91.983s; Energy89.533→96.617s, a worse spatial observation. Results were mixed. Near300 emptiness is not downtime because attacks extend beyond300units. First-choice Hunter timing worsened against the parent. Preserve those observations and both independent Natural36 outcomes; do not tune for a target win percentage.

Final receipts belong in the Draft PR and V48 owner packet. Fresh review agent was unavailable due provider quota; author review found the transition-edge bug and added the396-phase regression. No independent-review PASS is claimed. Human fun, original-art production and physical60Hz remain separate gates.
