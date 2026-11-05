import {projectileSpreadAngle} from '../../core/combat/weaponGeometry';
import type {CombatChoiceFact} from './combatChoicePreview';
import {t} from '../../i18n/i18n';
/** Bounded static geometry, not simulated hits or a promise of damage. */
export function choiceDiagram(facts:readonly CombatChoiceFact[]):HTMLElement|null {
 const f=facts.find(f=>['volley','mines','orbit'].includes(f.kind)&&f.after>f.before);if(!f)return null;
 const box=document.createElement('figure');box.className='choice-diagram';box.setAttribute('aria-label',t('choice.diagram'));
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 240 60');svg.setAttribute('aria-hidden','true');
 const circle=(x:number,y:number,r:number)=>{const e=document.createElementNS(svg.namespaceURI,'circle');e.setAttribute('cx',String(x));e.setAttribute('cy',String(y));e.setAttribute('r',String(r));svg.append(e);};
 const count=Math.min(12,f.after);const maxSin=Math.max(.01,...Array.from({length:count},(_,i)=>Math.abs(Math.sin(projectileSpreadAngle(f.family,i,f.after)))));const reach=Math.min(155,24/maxSin);circle(35,30,5);
 for(let i=0;i<count;i++){
  if(f.kind==='volley'){const a=projectileSpreadAngle(f.family,i,f.after),line=document.createElementNS(svg.namespaceURI,'path');const x=45+Math.cos(a)*reach,y=30+Math.sin(a)*reach;line.setAttribute('d',`M45 30 L${x} ${y} l-8 -4 m8 4 l-8 4`);svg.append(line);}
  else if(f.kind==='mines')circle(85+(i%6)*25,18+Math.floor(i/6)*25,5);
  else{const a=i*Math.PI*2/f.after;circle(150+Math.cos(a)*45,30+Math.sin(a)*22,4);}
 }
 const caption=document.createElement('figcaption');caption.textContent=t('choice.diagram');box.append(svg,caption);return box;
}
