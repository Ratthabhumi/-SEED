# Verdant environment target — production work still pending

Existing ground is predominantly chunk-color fills, soft shapes and stateless
procedural decoration. Biome gameplay importance already comes from canonical
site multipliers and missions; dressing must communicate those existing rules,
not fabricate new bonuses or obstacles.

The first environment target is one Verdant combat scene: authored ground
materials, low-density grass/foliage, rock dressing, a ruin route and visible
Signal/outposts, with hero/enemy/projectile/telegraph contrast retained. Keep
warm character focal points, blue Knowledge, violet alien identity and quiet
backgrounds consistent with the typed theme. Do not populate six biome catalogs
before one native-scale scene and its performance are reviewed.

Production requirements:

- Editable tile/decor sources, matching pivots, edge/seam checks and provenance.
- Separate stateless cosmetic coordinate hashes; no mutable gameplay stream.
- Retain configured visual radius and cached chunk ground. Do not rebuild foliage
  every frame. Bound texture pages, sprites and draw submission before importing.
- Decorative plants/rocks do not gain hidden collision. Introducing physical
  obstacles requires canonical collision/reachability tests and an intentional
  WORLDGEN_VERSION bump if compatibility changes.
- Existing discovered/claimed POI coordinates and fog remain authoritative.
  Signal art cannot silently scan a seed for a hidden destination.
- Enemy warnings stay visible under Reduced Effects/high contrast; decorative
  effects degrade first. Target16.7ms frame / sim p95<4ms / renderer p95<8ms stays
  unchanged. GPU batches, hardware stress and15min memory stability need actual
  measurements, not inference from a sparse software-rendered capture.

This checkpoint fixes site identity only. It does not supply the authored terrain
family or certify a finished environment. Record native same-scene comparisons
and player routing/recognition evidence when that work is implemented.
