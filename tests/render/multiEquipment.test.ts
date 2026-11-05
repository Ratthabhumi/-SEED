import {guardianCount} from '../../src/game/render/weaponPresentation';
import {equipWeapon} from '../helpers/equipWeapon';
import {it,expect} from 'vitest';
import {HeroEquipment} from '../../src/game/render/HeroEquipment';
import {RunSimulation} from '../../src/core/sim/RunSimulation';
it('renders a secondary emitter on consecutive frames without sparse-slot failure',()=>{
 const sim=new RunSimulation({masterSeed:'EPOCH-GOLDEN-001'}),s=sim.state;
 const n=sim.techGraph().find(n=>n.weaponFamily==='energy')!;s.draftOpen=true;s.pendingLevels=1;s.draftOffers=[{nodeId:n.id,quality:'COMMON',modifierIds:[],effectiveEffects:[]}];sim.chooseDraft(0);
 const image=()=>{const i:any={visible:true,frame:{name:'0'},texture:{key:'combat-equipment'}};for(const k of ['setDepth','setData','setTexture','setOrigin','setPosition','setDisplaySize','setRotation','setFlipY','setVisible'])i[k]=()=>i;return i;};
 const renderer=new HeroEquipment({add:{image}} as any),g:any=new Proxy({},{get:()=>()=>{}});
 renderer.draw(g,s,0,true);expect(()=>renderer.draw(g,s,0,true)).not.toThrow();
});

it('guardian presentation obeys the actual six-projectile-emitter cap',()=>{const sim=new RunSimulation({masterSeed:'EPOCH-GOLDEN-001'});equipWeapon(sim,'defense');sim.state.weaponStage.defense=4;sim.state.build.bonusGuardians=10;expect(guardianCount(sim.state)).toBe(6);});
