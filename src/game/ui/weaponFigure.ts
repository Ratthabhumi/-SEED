import {COMBAT_ASSETS} from '../assets/combatAssets';
import {weaponArtOrigin} from '../../core/combat/weaponInstances';
import {weaponFrame} from '../../core/combat/weaponGeometry';
import {originRow} from '../render/combatSpriteIdentity';
import type {WeaponFamily} from '../../core/combat/weapons';
import {t} from '../../i18n/i18n';import type {EnKeys} from '../../i18n/en';
export function weaponFigure(family:WeaponFamily,stage:number,origin:string,slot=1):HTMLElement {
 const figure=document.createElement('div');figure.className='weapon-figure';figure.dataset.family=family;figure.setAttribute('role','img');figure.setAttribute('aria-label',t(('weapon.label.'+family) as EnKeys));
 const sprite=document.createElement('span');sprite.className='weapon-illustration';let columns=6,rows=4,frame=weaponFrame(weaponArtOrigin(origin,family,slot),stage),url=COMBAT_ASSETS.equipment;
 if(family==='field'||family==='defense'){columns=rows=4;frame=(family==='field'?12:8)+originRow(origin);url=COMBAT_ASSETS.projectiles;}
 sprite.style.backgroundImage=`url("${url}")`;sprite.style.backgroundSize=`${columns*112}px ${rows*112}px`;sprite.style.backgroundPosition=`${-(frame%columns)*112}px ${-Math.floor(frame/columns)*112}px`;figure.append(sprite);return figure;
}
