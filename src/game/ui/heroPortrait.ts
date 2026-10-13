import {HERO_ASSETS} from "../assets/heroAssets";
export function heroPortrait(id:keyof typeof HERO_ASSETS):HTMLSpanElement {
  const portrait=document.createElement("span");portrait.className="painted-origin-portrait";
  portrait.setAttribute("aria-hidden","true");portrait.style.backgroundImage=`url("${HERO_ASSETS[id]}")`;
  return portrait;
}
