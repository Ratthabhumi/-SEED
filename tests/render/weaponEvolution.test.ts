import{expect,test}from'vitest';
import{changedWeaponForms}from'../../src/game/ui/weaponEvolution';
test('milestone compares actual active forms, never invents improvement for already evolved or inactive families',()=>{
 const before={kinetic:5,energy:1,defense:0,field:1},after={kinetic:5,energy:2,defense:5,field:2};
 expect(changedWeaponForms(before,after,['kinetic','field'])).toEqual([{family:'field',before:1,after:2}]);
 expect(changedWeaponForms(after,after,['kinetic','field'])).toEqual([]);
});
