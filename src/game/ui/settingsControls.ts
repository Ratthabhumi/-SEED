import{loadSave,storeSave,type Settings}from'../../core/save/save';
import{el,applyUiScale}from'../ui';import{t}from'../../i18n/i18n';import{sfx}from'../audio/sfx';
/** One presentation and save transaction for Main and Pause. No sim state. */
export function settingsControls(context:'title'|'pause',changed:(key:keyof Settings)=>void):HTMLElement{
 const root=el('div','settings-controls'),settings=()=>loadSave(localStorage).settings;
 const save=<K extends keyof Settings>(key:K,value:Settings[K])=>{const fresh=loadSave(localStorage);fresh.settings[key]=value;if(!storeSave(localStorage,fresh)){root.append(el('p','settings-error','meta.storage'));return false;}changed(key);return true;};
 const range=el('label','settings-row');range.append(el('span','','ui.volume'));
 const volume=document.createElement('input');volume.type='range';volume.id=context+'-volume';volume.min='0';volume.max='100';volume.value=String(Math.round(settings().volume*100));
 volume.addEventListener('input',()=>{const v=Number(volume.value)/100;if(save('volume',v))sfx.setVolume(v);else volume.value=String(Math.round(settings().volume*100));});range.append(volume);root.append(range);
 for(const[key,label]of[['shake','ui.shake'],['reducedEffects','settings.reduced']]as const){
  const row=el('label','settings-row');row.append(el('span','',label));const input=document.createElement('input');input.type='checkbox';input.id=key==='reducedEffects'&&context==='title'?'reduced-effects':context+'-'+key;input.checked=settings()[key];
  input.addEventListener('change',()=>{if(!save(key,input.checked))input.checked=settings()[key];});row.append(input);root.append(row);
 }
 const choices=<K extends 'uiScale'|'lang'|'contrast'>(key:K,label:Parameters<typeof el>[2],values:readonly(readonly[Settings[K],string])[])=>{
  const row=el('div','settings-row');const title=el('span','',label);title.id=context+'-'+key+'-label';row.append(title);
  const group=el('div','lang-row '+(key==='uiScale'?'scale-row':''));group.setAttribute('role','group');group.setAttribute('aria-labelledby',title.id);
  for(const[value,text]of values){const b=document.createElement('button');b.className='btn'+(settings()[key]===value?' active':'');b.textContent=text;b.setAttribute('aria-pressed',String(settings()[key]===value));b.addEventListener('click',()=>{
   if(!save(key,value))return;if(key==='uiScale')applyUiScale(value as Settings['uiScale']);if(key==='contrast')document.documentElement.dataset.contrast=String(value);
   group.querySelectorAll('button').forEach(btn=>{const active=btn===b;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));});
   // Enlarging text can move the already-focused control below the scrollport.
   if(key==='uiScale')b.scrollIntoView({block:'nearest',inline:'nearest'});
  });group.append(b);}row.append(group);root.append(row);
 };
 choices('uiScale','ui.uiScale',[[1,'100%'],[1.25,'125%'],[1.5,'150%'],[2,'200%']]);
 choices('lang','ui.language',[['en','English'],['th','ไทย']]);
 choices('contrast','ui.contrast',[['normal',t('ui.contrastNormal')],['high',t('ui.contrastHigh')]]);
 return root;
}
