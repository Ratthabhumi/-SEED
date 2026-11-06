import {fnv1a32} from '../../src/core/seed/hash';
import {it,expect} from 'vitest';
import {RunSimulation} from '../../src/core/sim/RunSimulation';
import {defaultSave,loadSave,storeSave} from '../../src/core/save/save';
function equipped(){const sim=new RunSimulation({masterSeed:'EPOCH-GOLDEN-001',originId:'hunters'});const n=sim.techGraph().find(n=>n.weaponFamily==='energy')!;sim.state.draftOpen=true;sim.state.pendingLevels=1;sim.state.draftOffers=[{nodeId:n.id,quality:'COMMON',modifierIds:[],effectiveEffects:[]}];sim.chooseDraft(0);for(let i=0;i<30;i++)sim.step(1/60,{moveX:0,moveY:0,dashPressed:false});return sim;}
it('actual save/load restores independent weapons and clocks then exactly replays future inputs',()=>{
 const sim=equipped(),save=defaultSave();expect(Object.values(sim.streamSnapshots()).flat().some(n=>n<0)).toBe(true);save.activeRun={simulation:sim.checkpoint(),attemptId:1,archiveEarned:0};const map=new Map<string,string>(),storage={getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>{map.set(k,v);}};expect(storeSave(storage,save)).toBe(true);
 const loaded=loadSave(storage),restored=RunSimulation.fromCheckpoint(loaded.activeRun!.simulation)!;expect(restored).not.toBeNull();expect(restored.snapshot()).toBe(sim.snapshot());
 for(let i=0;i<90;i++){const input={moveX:1,moveY:0,dashPressed:i===5};expect(restored.step(1/60,input)).toEqual(sim.step(1/60,input));}expect(restored.snapshot()).toBe(sim.snapshot());
});
it('rejects tampered/incompatible checkpoints without mutating metadata or old saves',()=>{
 const sim=equipped(),raw=sim.checkpoint();expect(RunSimulation.fromCheckpoint(raw.replace(sim.state.weapons.find(w=>w.family==='energy')!.id,'weapon-999-other'))).toBeNull();expect(RunSimulation.fromCheckpoint('{bad')).toBeNull();
 const save=defaultSave();save.schema=3;save.meta.insight=77;const old=JSON.stringify(save),storage={getItem:()=>old};const loaded=loadSave(storage);expect(loaded.meta.insight).toBe(77);expect(loaded.activeRun).toBeNull();expect(storage.getItem()).toBe(old);
});

it('World2 carries real weapon IDs, resets world clocks and resumes exact child RNG',()=>{
 const sim=equipped();const ids=sim.state.weapons.map(w=>w.id);sim.state.ascendReady=true;
 const legacy=sim.legacyOffers().find(l=>!l.requiredFamily||l.requiredFamily==='kinetic')!;expect(legacy).toBeDefined();sim.ascend(legacy.id,'hunters');
 expect(sim.state.ascension).toBe(1);expect(sim.state.weapons.map(w=>w.id)).toEqual(ids);expect(sim.state.weapons.every(w=>w.auraCd===0)).toBe(true);
 const restored=RunSimulation.fromCheckpoint(sim.checkpoint())!;expect(restored).not.toBeNull();
 for(let i=0;i<100;i++)expect(restored.step(1/60,{moveX:1,moveY:0,dashPressed:false})).toEqual(sim.step(1/60,{moveX:1,moveY:0,dashPressed:false}));expect(restored.snapshot()).toBe(sim.snapshot());
 const fresh=new RunSimulation({masterSeed:'EPOCH-GOLDEN-001'});expect(fresh.state.weapons).toHaveLength(2);
});

it('explicit World2 Origin changes preserve extras at capacity and never create a fourth slot',()=>{
 const sim=equipped(),s=sim.state,n=sim.techGraph().find(n=>n.weaponFamily==='field')!;s.draftOpen=true;s.pendingLevels=1;s.draftOffers=[{nodeId:n.id,quality:'COMMON',modifierIds:[],effectiveEffects:[]}];sim.chooseDraft(0);
 const ids=s.weapons.map(w=>w.id);s.ascendReady=true;const legacy=sim.legacyOffers().find(l=>!l.requiredFamily)!;sim.ascend(legacy.id,'resonant');
 expect(s.weapons).toHaveLength(3);expect(s.weapons[0]!.id).toBe(ids.find(id=>id.endsWith('-energy')));expect(new Set(s.weapons.map(w=>w.id))).toEqual(new Set(ids));expect(s.weapons.map(w=>w.slot)).toEqual([0,1,2]);expect(RunSimulation.fromCheckpoint(sim.checkpoint())).not.toBeNull();
});

it('resumes a genuine-shape Content28 single-starter Save4 checkpoint without granting the restored secondary',()=>{
 const sim=new RunSimulation({masterSeed:'EPOCH-GOLDEN-001'}),s=sim.state;s.weapons=s.weapons.slice(0,1);s.weaponSerial=1;
 const p=JSON.parse(JSON.parse(sim.checkpoint()).body);p.content=28;const body=JSON.stringify(p),restored=RunSimulation.fromCheckpoint(JSON.stringify({body,checksum:fnv1a32(body)}));
 expect(restored).not.toBeNull();expect(restored!.state.weapons).toHaveLength(1);expect(restored!.snapshot()).toBe(sim.snapshot());
});
