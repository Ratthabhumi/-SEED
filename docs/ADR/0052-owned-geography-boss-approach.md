# ADR0052 — derive the enemy approach from owned geography before spawning

The exact-source ed85984 Content23 cohorts both had zero boss-only base damage:
the old stronghold is derived near6000u from world origin, while owned bases are
near the played frontier. A distance filter alone prevents excessive travel but
silences the intended defense choice. All36 outcomes remain in
evidence/v44-rejected-distance-filter.json. This is a failed geographical
assumption, not a target win ratio. Remaining superseded CI is canceled; its
completed analysis and passing verification are not transferred to new source.

Content24 derives the UNREVEALED stronghold approach from the nearest active
specialized owned base, stable-ID ties. Keep the seeded bearing, use600u offset,
and prefer unowned real nearby major POI coordinates400–900u from that base. When none
fits, the raw600u point remains an enemy approach, as the prior implementation
already allowed raw points. No base is moved/granted/upgraded, and no boss is
teleported. Already revealed positions never change. Without an eligible owned
base the historical distant approach remains. Terrain/POI descriptors and
Worldgen3 are unchanged; this is run-state encounter placement, Content24.

The existing proximity spawn rule remains: approaching within1500u answers with
an actual boss. It can now already be satisfied at Space entry. The frontier
integration test therefore retains any actual warning in its entry-step event
history instead of requiring a second warning after teleporting its test player.
All transition, proximity and transactional-spawn assertions remain. Phase-one
teaching/recovery and the12s/24s phase-two assault rules remain.

The defender-aware observer previously counted only events from step(), missing
actual direct tryAbility()/setSquadMode() return events. Count once in its shared
observe() path, without issuing new actions or adding telemetry events. The
historical controller stays untouched; its step-only usage fields explicitly
exclude direct actions and cannot establish actual non-use. A direct-action
regression verifies a real power cooldown and exactly one recorded use.
The new runner recognizes the first actual canonical boss count as well as its
step event, so a direct-API kill is not missed and cannot silently continue into
a second world. Historical controller code and its pinned comparison remain.

Save3, Insight, reward rules, child laws18, authored art, damage and HP remain.
Both final cohorts are rerun independently. No human enjoyment inferred.
