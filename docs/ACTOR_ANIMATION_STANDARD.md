# Actor animation target — production work still pending

Keep the existing original top-down anatomy, dark outline, shared typed palette,
upright humanoid front/back policy and independent canonical weapon targeting.
The first proposed representative is Resonant, paired with the playable Energy
signature; this choice is a design target, not human approval of its current art.

| Origin | Existing identity to retain | Authoring emphasis |
|---|---|---|
| Hunters | hood, asymmetric bow/cape | readable shoulders, drawn bow/attack release |
| Engineers | helmet, broad shoulders, engineering equipment | equipment weight, articulated tool/guardian activation |
| Resonant | split robe, forked staff | head/upper-body identity, actual staff-mounted discharge |
| Sentinels | protective helmet, broad shield | shield silhouette, deliberate heavy stance |

Current runtime:64px anchored cells,48u hero, front/back36-frame strips for four
Origins, cached frames and bounded actor pools. Damage hitbox stays canonical.
Six Age equipment kits retain the same anatomy. Do not increase hitboxes to fit
art or restore whole-body rotation.

| Required authored state | Canonical trigger | Current status |
|---|---|---|
| idle / walk | actual motion history | existing authored slots; gait quality unvalidated |
| attack / mounted weapon | actual release observation | missing authored attack poses; first beam FX exists |
| hurt | actual damage/iframe | tint only, authored reaction pending |
| dash | actual dashT | existing functional trail/tint, authored dash pose pending |
| death | actual player_died | Chronicle exists; authored death sequence pending |
| ability | actual ability_used | existing tint/effects, specific authored pose pending |
| Age transition | actual age_reached | existing equipment changes, transition animation pending |

Author a small original Resonant sheet with stable head/volume, explicit pivot and
front/back attack poses first; inspect at native game scale over Verdant ground,
in both facing directions, with Reduced Effects and dense enemies. Review attack
readability and collision clearance before extending three more Origins or all
24 age/origin forms. Editable sources/provenance, native captures and real human
recognition are acceptance criteria; a frame-count test is insufficient.
