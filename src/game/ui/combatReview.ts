import {t} from '../../i18n/i18n';
import type {EnKeys} from '../../i18n/en';
interface ReviewActions {
 stage(origin:string,tier:number):void;
 target(x:number,y:number,moving:boolean):void;
 mount(mode:'float'|'hand'):void;
 boss():void;
 world():void;
 resume():void;
}
export function combatReviewRequested(search:string):boolean{
 const params=new URLSearchParams(search);return params.has('e2e')&&params.get('combatReview')==='1';
}
/** Explicit operator staging surface; never mounted in ordinary play or
 * natural Human QA. Native buttons retain Tab/Enter/Space navigation. */
export function mountCombatReview(actions:ReviewActions):()=>void{
 const root=document.createElement('details');root.id='combat-review';root.open=true;
 const style=document.createElement('style');style.textContent=`
 #combat-review{position:fixed;bottom:12px;left:12px;right:12px;margin:auto;max-width:1040px;max-height:32vh;overflow:auto;z-index:10000;padding:10px 14px;border:2px solid #ffd56b;border-radius:12px;background:#0b1424f5;color:#fff;font:inherit;font-size:clamp(14px,1.2vw,18px);line-height:1.8}
 #combat-review summary{cursor:pointer;font-weight:700;color:#ffd56b}#combat-review p{margin:4px 0 8px}
 #combat-review .review-actions{display:grid;grid-template-columns:repeat(auto-fit,minmax(115px,1fr));gap:6px}
 #combat-review button{font:inherit;line-height:1.8;min-height:44px;padding:4px 10px;white-space:normal;background:#1d304c;color:#fff;border:1px solid #7393bb;border-radius:7px}
 #combat-review button:focus-visible,#combat-review summary:focus-visible{outline:3px solid #ffd56b;outline-offset:2px}
 `;
 const labels:Array<[HTMLElement,EnKeys]>=[];
 const label=(element:HTMLElement,key:EnKeys)=>{labels.push([element,key]);element.textContent=t(key);return element;};
 root.append(label(document.createElement('summary'),'review.combat.title'));
 root.append(label(document.createElement('p'),'review.combat.warning'));
 const buttons=document.createElement('div');buttons.className='review-actions';root.append(buttons);
 const stage=(origin:string,tier:number,x=400,y=0,moving=true)=>{actions.stage(origin,tier);actions.mount('float');actions.target(x,y,moving);};
 const entries:Array<[EnKeys,()=>void]>=[
  ['review.combat.bow',()=>stage('hunters',0)],
  ['review.combat.near',()=>{actions.stage('engineers',4);actions.mount('hand');actions.target(0,0,false);}],
  ['review.combat.stationary',()=>stage('hunters',0,400,0,false)],
  ['review.combat.moving',()=>stage('hunters',0,400,100,true)],
  ['review.combat.left',()=>actions.target(-400,0,false)],
  ['review.combat.right',()=>actions.target(400,0,false)],
  ['review.combat.multi',()=>stage('hunters',2)],
  ['review.combat.beam',()=>stage('resonant',4,-400,250)],
  ['review.combat.float',()=>actions.mount('float')],
  ['review.combat.hand',()=>actions.mount('hand')],
  ['review.combat.boss',actions.boss],
  ['review.combat.world',()=>{root.open=false;actions.world();}],
  ['review.combat.resume',actions.resume],
 ];
 for(const [key,run] of entries){const button=label(document.createElement('button'),key) as HTMLButtonElement;
  button.type='button';button.dataset.reviewAction=key.slice('review.combat.'.length);button.addEventListener('click',e=>{run();if(e.detail>0)button.blur();});buttons.append(button);
 }
 const refresh=()=>labels.forEach(([element,key])=>element.textContent=t(key));
 const observer=new MutationObserver(refresh);observer.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 const onEscape=(e:KeyboardEvent)=>{if(e.key==='Escape')root.open=false;};
 root.addEventListener('keydown',e=>{if(e.key!=='Escape')e.stopPropagation();});
 window.addEventListener('keydown',onEscape);document.head.append(style);document.body.append(root);
 return ()=>{observer.disconnect();window.removeEventListener('keydown',onEscape);root.remove();style.remove();};
}
