import{el,button,uiRoot}from'../ui';import type{EnKeys}from'../../i18n/en';import{menuNavigation}from'./menuNavigation';
/** Shared optional reference. Closing restores the caller, never resumes sim. */
export function showGuide(returnFocus=document.activeElement as HTMLElement|null):void{
 const screen=el('div','screen');screen.id='guide-screen';const panel=el('section','panel panel-lg');panel.append(el('h2','','guide.title'));
 const content=el('div','guide-content');
 for(const[title,text]of[['ui.nextAge','guide.advancement'],['ui.squad','guide.controls'],['guide.originAbilities','guide.originAbilitiesDesc'],['guide.worldLaws','guide.worldLawsDesc'],['ui.techMap','guide.techStacking'],['ui.outpostSpec','guide.territory']]as readonly(readonly[EnKeys,EnKeys])[]){const section=el('section','guide-section');section.append(el('h3','',title),el('p','',text));content.append(section);}
 const back=()=>{screen.remove();if(returnFocus?.isConnected)returnFocus.focus();};panel.append(content,button('ui.back',back,'btn primary'));screen.append(panel);uiRoot().append(screen);menuNavigation(screen,back,returnFocus);
}
