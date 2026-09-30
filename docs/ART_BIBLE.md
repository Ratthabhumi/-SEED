# -SEED Art Bible & Visual Design System
**Version**: 0.22  
**Status**: CANONICAL SPECIFICATION  
**Scope**: Presentation, UI, Sprites, VFX, and Third-Party Asset Normalization

---

## 1. Visual Thesis
> *"Readable civilization evolution through geometric sci-fi language."*

Every visual element in -SEED serves cognitive clarity first and aesthetic delight second. The player oversees a macro-civilization through a micro-survivor avatar. Evolution from crude Stone-age survival to interstellar Space-age dominance must be immediately visible without reading text, while maintaining high combat readability at 60 FPS under heavy swarm density (650+ active entities).

---

## 2. Silhouette Hierarchy
To ensure instant target acquisition, silhouettes are strictly tiered by geometric footprint, edge sharpness, and visual weight:

1. **Player Avatar**: Sharp triangular/arrowhead apex forward; bright central core (radius 16u); constant facing indicator. Unambiguous visual anchor.
2. **Command Squad**: Orbiting chevron drones (radius 8-10u); concentric formation rings around player or stationed outposts.
3. **Boss Entities**: Massive geometric monoliths (radius 48-64u); multi-segmented armor plates, rotating hazard motifs, distinct health bar anchor.
4. **Elite Foes**: Distinct geometric spikes/crowns, 1.6x base enemy radius, high-frequency internal pulse.
5. **Standard Enemies**: High-contrast geometric primitives grouped by family:
   - *Swarm*: Small hexagons/triangles, compact clustering.
   - *Shooters*: Diamond/rhombus chassis with directional barrel geometry.
   - *Bruisers*: Heavy rounded octagons with thick armored rims.
6. **Civilization Outposts**: Anchored hexagonal base pads (radius 28-36u) with specialized superstructure silhouettes (radar dome for Research, dual turrets for Military, extraction drill for Economy).
7. **POIs (Points of Interest)**: Ancient obelisks and beacon spires; pulsing rhythmic aura rings extending beyond standard fog of war.
8. **Projectiles & Hazards**: High-luminance streaks and directional bolts; bright core with contrast outline; never pure circles identical to pickup orbs.
9. **Pickups & Rewards**: Compact glowing dodecagons / pills with soft radial glow; distinct floating animation.

---

## 3. Palette Roles & Color-Blind Safety
Gameplay meaning is **never communicated solely by hue**. Every role combines hue, luminance contrast, and distinct geometric stroke:

| Role | Primary HSL / Hex | Secondary Token | Contrast Invariant | Semantic Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **Player / Self** | `#ffd166` (Gold) | `#ffe08a` | Brightest warm core | Active player entity & focal point |
| **Friendly / Squad** | `#53e0c8` (Teal) | `#7fffd4` | Cool luminescent stroke | Allied units, claimed outposts, safe zones |
| **Hostile / Threat** | `#ff5a5a` (Crimson) | `#ff9a3c` | Dark outer halo `#1a0505` | Active enemy units, hostile bullets, boss hazards |
| **Knowledge / Tech** | `#7fb8ff` (Cobalt) | `#a8d0ff` | Radial glow pulse | Knowledge drops, research outposts, DAG nodes |
| **Navigation / POI** | `#c084fc` (Violet) | `#e9d5ff` | Strobe beacon line | Unexplored markers, compass target lines |
| **Civilization / Ter.**| `#38bdf8` (Sky) | `#0284c7` | Hexagonal boundary tint | Territory boundaries, frontier perimeter |
| **Warning / Alarm** | `#f43f5e` (Rose) | `#fecdd3` | Flashing alternating halo | Territory breach, incoming raid, low HP |
| **Background / Map** | `#0a1018` (Void) | `#141d2e` | Luminance <= 15% | Cosmic grid, terrain tiles, chunk borders |
| **Age Accents** | See Section 6 | Tokenized | Distinct lane banners | Era identity milestones |

---

## 4. Stroke & Outline System
All on-screen assets must conform to standard outline rules to prevent visual mush when rendered against busy procedural ground tiles:

- **Entity Outer Stroke**: 2px dark stroke (`#06090e` at 90% opacity) around every dynamic sprite and unit.
- **Inner Detail Stroke**: 1px sharp highlight line (`rgba(255, 255, 255, 0.25)`) along top/left edges to give subtle metallic relief.
- **UI Chrome Borders**: 1px solid `#2c3a52` base; `#53e0c8` for active focus; `#ffd166` for pinned paths.
- **Icon Line Weight**: Consistent 2px stroke weight across all Kenney board-game and input prompt icons.

---

## 5. Shape Grammar by Civilization Domain & Family
Distinct semantic domains use consistent geometric motifs:

- **Kinetic Family**: Heavy straight lines, chiseled bevels, ballistic cones, dual barrels.
- **Energy Family**: Concentric arcs, sharp diamonds, laser conduits, high-frequency jitter.
- **Defense Family**: Curved bastion shields, reinforced interlaced plates, circular barrier perimeters.
- **Field Family**: Orbiting nodes, planar hex grids, pulsing perimeter rings, area-of-effect ripples.
- **Research Domain**: Planetary orbits, open codex, molecular lattice, glowing lens.
- **Military Domain**: Crossed blades, fortress battlements, targeting reticles, chevron ranks.
- **Economy Domain**: Mineral ingots, extraction hoppers, trade arrows, gear teeth.
- **Ancient / Alien**: Asymmetric glyphs, obsidian monoliths, non-Euclidean angles.
- **Space Era**: Sleek aerodynamic radomes, solar array wings, ion thruster manifolds.

---

## 6. Age Progression Grammar
Civilization progression visually transitions from raw geological forms to sleek stellar constructs:

1. **Stone Age (`#8c7e6d`)**: Rough fractured edges, tribal dot markings, primitive stone axes, natural ochre tones.
2. **Bronze Age (`#cd7f32`)**: Cast copper plates, hammered rivets, burnished bronze luster, warm metallic sheen.
3. **Iron Age (`#94a3b8`)**: Cold forged steel, square bolted trusses, blocky defensive battlements, smoke-iron grey.
4. **Industrial Age (`#d97706`)**: Steam pipes, cogwheels, brass fittings, dark soot highlights, amber furnace glows.
5. **Atomic Age (`#06b6d4`)**: Reactor housing rings, warning hazard striping, neon cobalt cooling conduits.
6. **Space Age (`#a855f7`)**: Composite matte-black stealth panels, photon conduits, anti-gravity suspension rings.

---

## 7. UI Geometry & Component Standards
- **Panels**: Background `#0f172a` (94% opacity) with 1px border `#334155`. Corner radius: `12px` modal screens, `8px` cards.
- **Cards**: Width 220px, min-height 190px. Hover elevation `-2px` transform with border color shift to `var(--accent)`.
- **Bars (HP / XP / Knowledge)**: Height 14px, rounded 8px outer shell `#141c2a`, inner progress filled with curated CSS gradients.
- **Buttons**: Min-height 36px (touch target compliant >= 34px); padding 8px 14px; uppercase letter-spacing 0.5px.
- **Tech Map Nodes**: Rounded 8px cards (160px x 68px); color-coded status border; domain tag pill at top-right.

---

## 8. Motion Grammar & Animation Curves
- **Hit Impact**: 60ms white flash + 120ms sharp radial particle burst; zero camera hitch on standard hits.
- **Outpost Claim**: 400ms smooth outward expanding ring (`easeOutQuad`) from outpost center to territory perimeter.
- **Breakthrough Discovery**: 500ms golden aura bloom (`#ffd166`) + localized floating celebratory spark shower.
- **Age-Up Milestone**: Screen-wide ambient horizon flare + toast slide-in from `top: 76px` with 350ms damping.
- **Boss Spawn**: 600ms chromatic alert pulse + boss health bar sweep across top screen.
- **Raid Alert**: Pulsing red hazard chevron indicator pointing toward the targeted frontier outpost.

---

## 9. Typography & Thai Localization Rules
- **Primary Font**: `Noto Sans` (Latin) and `Noto Sans Thai` (Thai).
- **Line Height**: Minimum `line-height: 1.7` across ALL UI text containers. Vital to prevent Thai upper/lower vowel and tone mark clipping (e.g. `ปิ่`, `ที่`, `ผู้`).
- **Thai String Splitting**: **NEVER** slice or split Thai strings by UTF-16 code units. Always use `Array.from()` or `Intl.Segmenter` to prevent orphaned combining marks.
- **Key Parity**: 100% key parity enforced between `src/i18n/en.ts` and `src/i18n/th.ts`.
- **Text Wrapping**: Use `word-break: break-word` and `overflow-wrap: anywhere` with generous padding for multi-line Thai descriptions.

---

## 10. Third-Party Asset Selection & Presentation Pipeline
To guarantee that vendored CC0 assets never look like an uncurated "asset flip":

1. **Production Selection & Resolution Discipline**:
   - Production assets are selectively extracted from vetted vendor source packs (prompts, structures, particles, icons, UI).
   - Display scaling is governed cleanly at runtime by HTML/CSS and Phaser (e.g. 20-32px badges for prompts/icons, scaled world rendering for structures).
2. **Runtime Palette Conformity**:
   - UI frames and headers are styled with project CSS tokens (`#53e0c8`, `#141d2e`, `#0f172a`).
   - Particles use additive blending and dynamic Phaser tinting (`setTint`, `alpha` tweens) for context-driven combat and age effects.
3. **Contrast Testing**:
   - Every asset must pass visual inspection in:
     - Normal RGB mode
     - Full Grayscale mode (`filter: grayscale(1)`)
     - High-Contrast mode (`filter: contrast(1.5)`)
4. **Anchor Points**:
   - Outposts and sprites are anchored at `(0.5, 0.5)` or bottom center `(0.5, 0.8)` for depth-consistent world rendering.
5. **Bundle & Manifest Hygiene**:
   - Only audited, production-selected assets are indexed in `assets/ASSET_MANIFEST.json` and bundled.
   - Byte-level SHA256 integrity is continuously verified against original vendor source files.
