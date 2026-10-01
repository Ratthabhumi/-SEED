// Seeded Tech DAG generator: authored spine + seeded side branches.
import { createStreamRng } from "../seed/streams";
import type { TechGraph, TechNode, AgeId, Domain, Rarity } from "./graph";
import { CRITICAL_SPINE } from "./graph";

interface SideTemplate {
  suffix: string;
  titleKey: string;
  descriptionKey: string;
  domain: Domain;
  tags: string[];
  synergyTags: string[];
  rarity: Rarity;
  effectKind: TechNode["effects"][number]["kind"];
  effectValue: number;
  family?: TechNode["effects"][number]["family"];
}

const SIDE_TEMPLATES: Record<AgeId, SideTemplate[]> = {
  stone: [
    { suffix: "fire", titleKey: "tech.fire.name", descriptionKey: "tech.fire.description", domain: "science", tags: ["fire", "offense"], synergyTags: ["energy"], rarity: "common", effectKind: "damageMul", effectValue: 0.12 },
    { suffix: "tools", titleKey: "tech.tools.name", descriptionKey: "tech.tools.description", domain: "industry", tags: ["tools", "economy"], synergyTags: ["craft"], rarity: "common", effectKind: "knowledgeMul", effectValue: 0.15 },
    { suffix: "hunt", titleKey: "tech.hunt.name", descriptionKey: "tech.hunt.description", domain: "warfare", tags: ["hunt", "offense"], synergyTags: ["kinetic"], rarity: "common", effectKind: "projectileAdd", effectValue: 1, family: "kinetic" },
    { suffix: "totem", titleKey: "tech.totem.name", descriptionKey: "tech.totem.description", domain: "culture", tags: ["spirit", "defense"], synergyTags: ["ward"], rarity: "common", effectKind: "maxHpAdd", effectValue: 20 },
    { suffix: "trap", titleKey: "tech.trap.name", descriptionKey: "tech.trap.description", domain: "warfare", tags: ["trap", "control"], synergyTags: ["field"], rarity: "uncommon", effectKind: "mineAdd", effectValue: 1, family: "field" },
  ],
  bronze: [
    { suffix: "armor", titleKey: "tech.armor.name", descriptionKey: "tech.armor.description", domain: "warfare", tags: ["armor", "defense"], synergyTags: ["fort"], rarity: "common", effectKind: "maxHpAdd", effectValue: 30 },
    { suffix: "precision", titleKey: "tech.precision.name", descriptionKey: "tech.precision.description", domain: "warfare", tags: ["precision", "offense"], synergyTags: ["kinetic"], rarity: "uncommon", effectKind: "damageMul", effectValue: 0.15 },
    { suffix: "rite", titleKey: "tech.rite.name", descriptionKey: "tech.rite.description", domain: "culture", tags: ["rite", "economy"], synergyTags: ["ward"], rarity: "common", effectKind: "pickupMul", effectValue: 0.2 },
    { suffix: "sentry", titleKey: "tech.sentry.name", descriptionKey: "tech.sentry.description", domain: "industry", tags: ["sentry", "defense"], synergyTags: ["ward"], rarity: "uncommon", effectKind: "summonAdd", effectValue: 1, family: "defense" },
  ],
  iron: [
    { suffix: "fort", titleKey: "tech.fort.name", descriptionKey: "tech.fort.description", domain: "warfare", tags: ["fort", "defense"], synergyTags: ["fort"], rarity: "common", effectKind: "maxHpAdd", effectValue: 40 },
    { suffix: "ballistics", titleKey: "tech.ballistics.name", descriptionKey: "tech.ballistics.description", domain: "science", tags: ["ballistics", "offense"], synergyTags: ["kinetic"], rarity: "uncommon", effectKind: "projectileAdd", effectValue: 1, family: "kinetic" },
    { suffix: "medicine", titleKey: "tech.medicine.name", descriptionKey: "tech.medicine.description", domain: "science", tags: ["medicine", "survival"], synergyTags: ["regen"], rarity: "common", effectKind: "regenAdd", effectValue: 1.2 },
    { suffix: "breeding", titleKey: "tech.breeding.name", descriptionKey: "tech.breeding.description", domain: "industry", tags: ["breeding", "economy"], synergyTags: ["swarm"], rarity: "uncommon", effectKind: "knowledgeMul", effectValue: 0.2 },
  ],
  industrial: [
    { suffix: "rail", titleKey: "tech.rail.name", descriptionKey: "tech.rail.description", domain: "industry", tags: ["rail", "mobility"], synergyTags: ["engine"], rarity: "common", effectKind: "moveMul", effectValue: 0.1 },
    { suffix: "rotary", titleKey: "tech.rotary.name", descriptionKey: "tech.rotary.description", domain: "warfare", tags: ["rotary", "offense"], synergyTags: ["kinetic"], rarity: "rare", effectKind: "cooldownMul", effectValue: -0.15 },
    { suffix: "tesla", titleKey: "tech.tesla.name", descriptionKey: "tech.tesla.description", domain: "science", tags: ["tesla", "control"], synergyTags: ["energy"], rarity: "rare", effectKind: "auraAdd", effectValue: 1, family: "energy" },
    { suffix: "turret", titleKey: "tech.turret.name", descriptionKey: "tech.turret.description", domain: "warfare", tags: ["turret", "defense"], synergyTags: ["ward"], rarity: "uncommon", effectKind: "summonAdd", effectValue: 1, family: "defense" },
  ],
  atomic: [
    { suffix: "reactor", titleKey: "tech.reactor.name", descriptionKey: "tech.reactor.description", domain: "science", tags: ["reactor", "energy"], synergyTags: ["energy"], rarity: "rare", effectKind: "damageMul", effectValue: 0.25 },
    { suffix: "radar", titleKey: "tech.radar.name", descriptionKey: "tech.radar.description", domain: "industry", tags: ["radar", "mobility"], synergyTags: ["engine"], rarity: "uncommon", effectKind: "pickupMul", effectValue: 0.3 },
    { suffix: "plasma", titleKey: "tech.plasma.name", descriptionKey: "tech.plasma.description", domain: "warfare", tags: ["plasma", "offense"], synergyTags: ["energy"], rarity: "rare", effectKind: "beamAdd", effectValue: 1, family: "energy" },
    { suffix: "gravity", titleKey: "tech.gravity.name", descriptionKey: "tech.gravity.description", domain: "science", tags: ["gravity", "control"], synergyTags: ["field"], rarity: "mythic", effectKind: "orbitAdd", effectValue: 2, family: "field" },
  ],
  space: [
    { suffix: "lance", titleKey: "tech.lance.name", descriptionKey: "tech.lance.description", domain: "warfare", tags: ["lance", "offense"], synergyTags: ["kinetic"], rarity: "mythic", effectKind: "damageMul", effectValue: 0.4 },
    { suffix: "swarm", titleKey: "tech.swarm.name", descriptionKey: "tech.swarm.description", domain: "industry", tags: ["swarm", "defense"], synergyTags: ["swarm"], rarity: "mythic", effectKind: "summonAdd", effectValue: 2, family: "defense" },
    { suffix: "singularity", titleKey: "tech.singularity.name", descriptionKey: "tech.singularity.description", domain: "science", tags: ["singularity", "control"], synergyTags: ["field"], rarity: "mythic", effectKind: "auraAdd", effectValue: 2, family: "field" },
  ],
};

const SPINE_EFFECTS: Record<string, TechNode["effects"]> = {
  "spine-tools": [{ kind: "knowledgeMul", value: 0.1 }],
  "spine-metallurgy": [{ kind: "damageMul", value: 0.15 }],
  "spine-ironwork": [{ kind: "maxHpAdd", value: 40 }],
  "spine-steam": [{ kind: "moveMul", value: 0.08 }],
  "spine-fission": [{ kind: "damageMul", value: 0.2 }],
  "spine-orbital": [{ kind: "weaponEvolve", value: 1 }],
};

/** Generate a deterministic tech DAG for (masterSeed, ascension). */
export function generateTechGraph(masterSeed: string, ascension = 0): TechGraph {
  const rng = createStreamRng(masterSeed, ascension === 0 ? "tech" : `ascension:${ascension}:tech`);
  const nodes: TechNode[] = [];

  // 1. Spine (guaranteed path).
  let prevSpine = "";
  for (const s of CRITICAL_SPINE) {
    const prereqs = prevSpine ? [prevSpine] : [];
    nodes.push({
      id: s.id,
      titleKey: `tech.${s.id}.name`,
      descriptionKey: `tech.${s.id}.description`,
      age: s.age,
      domain: "science",
      tags: ["spine", s.age],
      prerequisites: prereqs,
      exclusions: [],
      rarity: s.age === "stone" ? "common" : "uncommon",
      weight: 100,
      effects: SPINE_EFFECTS[s.id] ?? [{ kind: "damageMul", value: 0.1 }],
      synergyTags: ["spine"],
    });
    prevSpine = s.id;
  }

  // 2. Seeded side branches: pick 3-4 templates per age, wired as TWO
  // deterministic mini-paths (v0.23.1 progressive frontier):
  //   SPINE -> FOUNDATION A -> SPECIALIZATION A (+CAPSTONE when 4 nodes)
  //         -> FOUNDATION B (-> SPECIALIZATION B when 4 nodes)
  // Owning the spine opens only the two foundations — never the whole age.
  // Node ids, counts, and weights match the old wide frontier exactly; only
  // the prerequisite EDGES changed (CONTENT_VERSION 5 -> 6).
  const ages: AgeId[] = ["stone", "bronze", "iron", "industrial", "atomic", "space"];
  for (const age of ages) {
    const pool = [...SIDE_TEMPLATES[age]];
    rng.shuffleInPlace(pool);
    const count = age === "space" ? 3 : 3 + (rng.nextFloat() < 0.5 ? 1 : 0);
    const chosen = pool.slice(0, Math.min(count, pool.length));
    const spineForAge = CRITICAL_SPINE.find((c) => c.age === age)?.id ?? "spine-tools";
    // Positional split (no extra RNG): first half is chain A, rest chain B.
    const aCount = Math.ceil(chosen.length / 2);
    for (let i = 0; i < chosen.length; i++) {
      const t = chosen[i] as SideTemplate;
      const id = `${age}-${t.suffix}`;
      const chainHead = i === 0 || i === aCount;
      const prevId = chainHead ? spineForAge : `${age}-${(chosen[i - 1] as SideTemplate).suffix}`;
      nodes.push({
        id,
        titleKey: t.titleKey,
        descriptionKey: t.descriptionKey,
        age,
        domain: t.domain,
        tags: [...t.tags],
        prerequisites: [prevId],
        exclusions: [],
        rarity: t.rarity,
        weight: 40 + rng.nextInt(0, 60),
        effects: [{ kind: t.effectKind, value: t.effectValue, family: t.family }],
        synergyTags: [...t.synergyTags],
      });
    }
  }

  // 3. Seeded anomaly branch: 1 extra mythic node in atomic/space for highland seeds.
  const anomalyRoll = rng.nextFloat();
  if (anomalyRoll < 0.6) {
    const age: AgeId = anomalyRoll < 0.3 ? "atomic" : "space";
    nodes.push({
      id: `${age}-anomaly`,
      titleKey: "tech.anomaly.name",
      descriptionKey: "tech.anomaly.description",
      age,
      domain: "science",
      tags: ["anomaly", "offense"],
      prerequisites: [CRITICAL_SPINE.find((c) => c.age === age)?.id ?? "spine-orbital"],
      exclusions: [],
      rarity: "mythic",
      weight: 20,
      effects: [{ kind: "damageMul", value: 0.3 }],
      synergyTags: ["anomaly"],
    });
  }

  return { masterSeed, ascension, nodes };
}
