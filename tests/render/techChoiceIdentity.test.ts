import{it,expect}from'vitest';
import{choicePresentation}from'../../src/game/ui/choicePresentation';
import{RunSimulation}from'../../src/core/sim/RunSimulation';
import type{TechNode}from'../../src/core/tech/graph';
const node=(effects:TechNode['effects']):TechNode=>({id:'ui-sample',age:'stone',domain:'science',titleKey:'tech.tools',descriptionKey:'tech.toolsDesc',rarity:'common',weight:1,effects,tags:[],synergyTags:[],prerequisites:[],exclusions:[]});
it('shows the technology domain rather than inventing a weapon identity for passive knowledge',()=>{const s=new RunSimulation({masterSeed:'CLARITY',originId:'hunters'}).state;const n=node([{kind:'knowledgeMul',value:.1}]);n.tags=['kinetic'];expect(choicePresentation(n,n.effects,s).visualFamily).toBeUndefined();});
it('uses the actual targeted weapon family for a family upgrade',()=>{const s=new RunSimulation({masterSeed:'CLARITY',originId:'hunters'}).state;const n=node([{kind:'damageMul',family:'energy',value:.1}]);expect(choicePresentation(n,n.effects,s).visualFamily).toBe('energy');});

it('never draws a weapon for global knowledge even when family metadata gates the node',()=>{const s=new RunSimulation({masterSeed:'CLARITY',originId:'hunters'}).state;const n=node([{kind:'knowledgeMul',family:'field',value:.06}]);const info=choicePresentation(n,n.effects,s);expect(info.visualFamily).toBeUndefined();expect(info.visualKind).toBe('knowledge');});
it('identifies health and movement by their actual benefit rather than their domain',()=>{const s=new RunSimulation({masterSeed:'CLARITY',originId:'hunters'}).state;for(const [kind,visual]of [['maxHpAdd','health'],['moveMul','movement']]as const){const n=node([{kind,value:1,family:'field'}]);expect(choicePresentation(n,n.effects,s).visualKind).toBe(visual);}});
