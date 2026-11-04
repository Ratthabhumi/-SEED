/** Optional menu navigation only. Mandatory gameplay decisions keep their
 * existing DecisionInputBoundary and canonical modal queue. */
export function menuNavigation(screen:HTMLElement,onBack:()=>void,returnFocus?:HTMLElement|null):void{
 const heading=screen.querySelector<HTMLElement>('h2');
 screen.setAttribute('role','dialog');screen.setAttribute('aria-modal','true');
 if(heading){heading.id=screen.id+'-heading';heading.tabIndex=-1;screen.setAttribute('aria-labelledby',heading.id);heading.focus();}
 screen.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();onBack();if(returnFocus?.isConnected)returnFocus.focus();return;}
  if(event.key!=='Tab')return;
  const controls=Array.from(screen.querySelectorAll<HTMLElement>('button:not(:disabled),summary,input:not(:disabled),select:not(:disabled),a[href],[tabindex="0"]')).filter(c=>c.getClientRects().length>0);
  if(!controls.length)return;
  event.preventDefault();event.stopPropagation();const index=controls.indexOf(document.activeElement as HTMLElement);
  const next=index<0?(event.shiftKey?controls.length-1:0):(index+(event.shiftKey?-1:1)+controls.length)%controls.length;
  controls[next]?.focus();
 },true);
}
