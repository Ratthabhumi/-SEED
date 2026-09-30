/**
 * Normalized game-ready seed assets mapped to their bundled URLs.
 * Provenance is strictly recorded in assets/ASSET_MANIFEST.json.
 */
import promptQ from "../../../assets/seed/input/prompt_q.png";
import promptE from "../../../assets/seed/input/prompt_e.png";
import promptR from "../../../assets/seed/input/prompt_r.png";
import promptF from "../../../assets/seed/input/prompt_f.png";
import promptT from "../../../assets/seed/input/prompt_t.png";
import promptM from "../../../assets/seed/input/prompt_m.png";

import outpostResearch from "../../../assets/seed/structures/outpost_research.png";
import outpostMilitary from "../../../assets/seed/structures/outpost_military.png";
import outpostEconomic from "../../../assets/seed/structures/outpost_economic.png";

import iconResearch from "../../../assets/seed/icons/icon_research.png";
import iconMilitary from "../../../assets/seed/icons/icon_military.png";
import iconEconomic from "../../../assets/seed/icons/icon_economic.png";

import buttonFrame from "../../../assets/seed/ui/button_frame.png";
import panelHeaderBar from "../../../assets/seed/ui/panel_header_bar.png";

import hitImpact from "../../../assets/seed/vfx/hit_impact.png";
import claimGlow from "../../../assets/seed/vfx/claim_glow.png";
import breakthroughSpark from "../../../assets/seed/vfx/breakthrough_spark.png";
import raidAlert from "../../../assets/seed/vfx/raid_alert.png";

export const SEED_ASSETS = {
  prompts: {
    q: promptQ,
    e: promptE,
    r: promptR,
    f: promptF,
    t: promptT,
    m: promptM,
  },
  structures: {
    research: outpostResearch,
    military: outpostMilitary,
    economy: outpostEconomic,
    economic: outpostEconomic,
  },
  icons: {
    research: iconResearch,
    military: iconMilitary,
    economy: iconEconomic,
    economic: iconEconomic,
  },
  ui: {
    buttonFrame,
    panelHeaderBar,
  },
  vfx: {
    hitImpact,
    claimGlow,
    breakthroughSpark,
    raidAlert,
  },
} as const;
