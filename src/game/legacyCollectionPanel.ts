import {COLLECTIBLES,equipCollection,type LegacyCollection} from '../core/progression/legacyCollection';
import {loadSave,storeSave} from '../core/save/save';
import {t} from '../i18n/i18n';
import type {EnKeys} from '../i18n/en';
import {el,button} from './ui';
import {legacyPreview} from './render/legacyShapes';
/** Small earned collection. Uses the existing save transaction and native buttons. */
export function legacyCollectionPanel(onChange?:(c:LegacyCollection)=>void):HTMLElement {
 const panel=document.createElement('details');panel.className='legacy-collection';
 const title=document.createElement('summary');title.textContent=t('collection.title');panel.append(title);
 const progress=el('p','legacy-progress');panel.append(progress);
 const grid=el('div','legacy-grid');panel.append(grid);
 const render=(focusId?:string)=>{
  const c=loadSave(localStorage).collection;grid.replaceChildren();
  const next=COLLECTIBLES.find(item=>!c.owned.includes(item.id));
  progress.textContent=`${c.owned.length}/${COLLECTIBLES.length} · ${next?`${t('collection.next')}: ${t(`collection.${next.id}Rule` as EnKeys)}`:t('collection.complete')}`;
  for(const item of COLLECTIBLES){
   const owned=c.owned.includes(item.id),active=c.equipped[item.slot]===item.id;
   const card=el('section','legacy-card');card.dataset.collectible=item.id;
   const preview=el('div','legacy-preview');preview.append(legacyPreview(item.id));preview.style.color=item.color;preview.setAttribute('aria-hidden','true');
   card.append(preview,el('h3','',`collection.${item.id}` as EnKeys),el('p','',`collection.${item.id}Rule` as EnKeys));
   if(item.id==='prism'){const count=el('p','');count.textContent=`${t('collection.origins')}: ${Math.min(2,c.origins.length)}/2`;card.append(count);}
   const equip=button(active?'collection.unequip':'collection.equip',()=>{
    const fresh=loadSave(localStorage);fresh.collection=equipCollection(fresh.collection,item.id);
    if(storeSave(localStorage,fresh)){onChange?.(fresh.collection);render(item.id);}else card.append(el('p','','meta.storage'));
   });equip.disabled=!owned;equip.dataset.equip=item.id;equip.setAttribute('aria-pressed',String(active));
   if(!owned)equip.textContent=t('collection.locked');card.append(equip);grid.append(card);
  }
  if(focusId)grid.querySelector<HTMLButtonElement>(`[data-equip="${focusId}"]`)?.focus();
 };render();return panel;
}
