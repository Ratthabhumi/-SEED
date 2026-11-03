import{expect,test}from'vitest';
import{RunSimulation}from'../../src/core/sim/RunSimulation';
import{NOVA_RADIUS}from'../../src/core/combat/squad';
import{powerOpportunity}from'../../src/game/ui/powerOpportunity';
test('Origin advice recurs for a real opportunity after first use, respects cooldown and actual Nova radius, mutates nothing',()=>{
 const s=new RunSimulation({masterSeed:'EPOCH-GOLDEN-001',originId:'resonant'}).state;
 s.stats.abilityUses=1;
 for(const e of s.enemies)e.active=false;
 for(const e of s.enemies.slice(0,3)){e.active=true;e.x=s.px+NOVA_RADIUS;e.y=s.py;}
 const before=JSON.stringify(s);expect(powerOpportunity(s)).toBe(true);expect(JSON.stringify(s)).toBe(before);
 s.enemies[0]!.x++;expect(powerOpportunity(s)).toBe(false);
 s.originId='hunters';expect(powerOpportunity(s)).toBe(true);
 s.abilityCd=.1;expect(powerOpportunity(s)).toBe(false);
 s.abilityCd=0;s.originId='sentinels';s.build.hp=s.build.maxHp;expect(powerOpportunity(s)).toBe(false);
 s.build.hp=s.build.maxHp*.6;expect(powerOpportunity(s)).toBe(true);
 s.originId='engineers';expect(powerOpportunity(s)).toBe(false);
 s.enemies[0]!.boss=true;s.enemies[0]!.encounter={phase:'recover'} as any;expect(powerOpportunity(s)).toBe(true);
 s.over=true;expect(powerOpportunity(s)).toBe(false);
});
