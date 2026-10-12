import { SEED_ASSETS } from "./seedAssets";
/** Warfare and military buildings intentionally have different semantics. */
export const DOMAIN_ICONS: Record<string, string | undefined> = {
  warfare: SEED_ASSETS.icons.warfareSword,
  science: SEED_ASSETS.icons.research,
  industry: SEED_ASSETS.icons.economy,
};
