import projectiles from "../../../assets/seed/combat/projectiles-v1.png";
import equipment from "../../../assets/seed/combat/equipment-v1.png";
import props from "../../../assets/seed/combat/world-props-v1.png";
import type Phaser from "phaser";
export const COMBAT_ASSETS={projectiles,equipment,props};
export function combatFrames(scene:Phaser.Scene):void{
 const shots=scene.textures.get("combat-projectiles"),weapons=scene.textures.get("combat-equipment");
 for(let i=0;i<16;i++)if(!shots.has(String(i)))shots.add(i,0,i%4*96,Math.floor(i/4)*96,96,96);
 for(let i=0;i<24;i++)if(!weapons.has(String(i)))weapons.add(i,0,i%6*128,Math.floor(i/6)*128,128,128);
 const world=scene.textures.get("world-props");for(let i=0;i<12;i++)if(!world.has(String(i)))world.add(i,0,i%4*128,Math.floor(i/4)*128,128,128);
}
