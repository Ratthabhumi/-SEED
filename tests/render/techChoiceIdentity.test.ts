import{it,expect}from'vitest';
import{choicePresentation}from'../../src/game/ui/choicePresentation';
import{RunSimulation}from'../../src/core/sim/RunSimulation';
import type{TechNode}from'../../src/core/tech/graph';
const node=(effects:TechNode['effects']):TechNode=>({id:'ui-sample',age:'stone',domain:'science',titleKey:'tech.tools',descriptionKey:'tech.toolsDesc',rarity:'common',weight:1,effects,tags:[],synergyTags:[],prerequisites:[],exclusions:[]});
it('shows the technology domain rather than inventing a weapon identity for passive knowledge',()=>{const s=new RunSimulation({masterSeed:'CLARITY',originId:'hunters'}).state;const n=node([{kind:'knowledgeMul',value:.1}]);n.tags=['kinetic'];expect(choicePresentation(n,n.effects,s).visualFamily).toBeUndefined();});
it('uses the actual targeted weapon family for a family upgrade',()=>{const s=new RunSimulation({masterSeed:'CLARITY',originId:'hunters'}).state;const n=node([{kind:'damageMul',family:'energy',value:.1}]);expect(choicePresentation(n,n.effects,s).visualFamily).toBe('energy');});
