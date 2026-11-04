import {it,expect} from 'vitest';
import {worldPresentation} from '../../src/game/render/worldPresentation';
import {childCondition,childKnowledgeFactor,childRaidInterval} from '../../src/core/progression/childWorld';

it('Dawn and Eclipse change ground/materials without new canonical child rules',()=>{
 expect(worldPresentation(0).ground).toBe(0xffffff);
 expect(worldPresentation(1).ground).not.toBe(worldPresentation(0).ground);
 expect(worldPresentation(1).architecture).not.toBe(0xffffff);
 expect(worldPresentation(1,true).ground).toBe(0xffffff);
 expect(worldPresentation(1,true).architecture).toBe(0xffffff);
 // Scarcity/research is the actual World2 choice, not a fictional new raid rule.
 expect(childCondition(1)).toBe('scarce');expect(childKnowledgeFactor(1,0)).toBe(.8);
 expect(childKnowledgeFactor(1,.15)).toBeGreaterThan(1);
 expect(childRaidInterval(1,100)).toBe(100);
 expect(childRaidInterval(2,100)).toBe(75);
});
