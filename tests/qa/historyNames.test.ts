import { it, expect, vi, afterEach } from "vitest";
import { historyTechName, currentWorldHistoryStart } from "../../src/game/ui/historyTechName";
import { setLang, t } from "../../src/i18n/i18n";
import { fallbackCards } from "../../src/core/sim/RunSimulation";
afterEach(() => vi.unstubAllGlobals());
for (const lang of ["en", "th"] as const) it(`localizes graph, fallback and previous-world entries in ${lang}`, () => {
  vi.stubGlobal("document", {documentElement:{lang:"en"}});
  setLang(lang);
  const node = {...fallbackCards(1)[0]!, id:"web:internal:0", web:{depth:2,slot:1,kind:"frontier" as const}};
  expect(historyTechName(node.id,[node],true)).toBe(t("chronicle.previousTech"));
  expect(historyTechName(node.id,[node])).toBe(t("tech.fallback.dmg.name")+" 2.2");
  expect(historyTechName("fb-hp-42",[])).toBe(t("tech.fallback.hp.name"));
  expect(historyTechName("web:previous-world:0",[])).toBe(t("chronicle.previousTech"));
  setLang("en");
});

it("uses the latest child root before the Ascension marker and tolerates FIFO trimming", () => {
  const h = [{kind:"tech",label:"web:repeat:0"},{kind:"tech",label:"spine-tools"},{kind:"tech",label:"foundation-science"},{kind:"ascension",label:"world-1"},{kind:"tech",label:"web:repeat:0"}];
  expect(currentWorldHistoryStart(h)).toBe(1);
  expect(currentWorldHistoryStart(h.slice(3))).toBe(0);
  expect(currentWorldHistoryStart(h.slice(4))).toBe(0);
});
