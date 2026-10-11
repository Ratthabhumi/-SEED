import { it, expect, vi, afterEach } from "vitest";
import { historyTechName } from "../../src/game/ui/historyTechName";
import { setLang, t } from "../../src/i18n/i18n";
import { fallbackCards } from "../../src/core/sim/RunSimulation";
afterEach(() => vi.unstubAllGlobals());
for (const lang of ["en", "th"] as const) it(`localizes graph, fallback and previous-world entries in ${lang}`, () => {
  vi.stubGlobal("document", {documentElement:{lang:"en"}});
  setLang(lang);
  const node = {...fallbackCards(1)[0]!, id:"web:internal:0", web:{depth:2,slot:1,kind:"frontier" as const}};
  expect(historyTechName(node.id,[node])).toBe(t("tech.fallback.dmg.name")+" 2.2");
  expect(historyTechName("fb-hp-42",[])).toBe(t("tech.fallback.hp.name"));
  expect(historyTechName("web:previous-world:0",[])).toBe(t("chronicle.previousTech"));
  setLang("en");
});
