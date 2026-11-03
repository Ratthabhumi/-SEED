import {it,expect} from 'vitest';
import {drawLegacyCosmetics} from '../../src/game/render/LegacyCosmetics';
import {defaultCollection} from '../../src/core/progression/legacyCollection';
function render(id:'star'|'chronicle',hc=true){const geometry:unknown[]=[],colors:number[]=[];const g:any={lineStyle:(c:number,n:number)=>{colors.push(n);return g;},lineBetween:(...p:number[])=>{geometry.push(['line',...p]);},strokeCircle:(...p:number[])=>geometry.push(['circle',...p]),strokeTriangle:(...p:number[])=>geometry.push(['triangle',...p])};const c=defaultCollection();c.owned=[id];c.equipped.ornament=id;drawLegacyCosmetics(g,c,0,0,0,hc);return {geometry,colors};}
it('Star and Chronicle remain distinguishable without color',()=>{expect(render('star').geometry).not.toEqual(render('chronicle').geometry);});
it('high contrast uses a consistent bright outline rather than color-only ornament identity',()=>{expect(render('star').colors.every(c=>c===0xffffff)).toBe(true);});
