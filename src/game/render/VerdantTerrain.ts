import type Phaser from "phaser";
import type {ChunkDescriptor} from "../../core/world/chunks";
import {CHUNK_SIZE} from "../../core/world/chunks";
import verdant from "../../../assets/seed/terrain/verdant-v2.png";
export const VERDANT_TERRAIN=verdant;
/** Cached only on existing ground invalidation. Cosmetic, no collision/state. */
export class VerdantTerrain {
  private images:Phaser.GameObjects.Image[]=[];
  constructor(private scene:Phaser.Scene){}
  refresh(cx:number,cy:number,radius:number,chunk:(x:number,y:number)=>ChunkDescriptor,highContrast:boolean):void {
    let count=0;
    for(let x=cx-radius;x<=cx+radius;x++)for(let y=cy-radius;y<=cy+radius;y++) {
      if(highContrast||chunk(x,y).biome!=="verdant")continue;
      let image=this.images[count++];
      if(!image){image=this.scene.add.image(0,0,"verdant-v2").setDepth(-11).setOrigin(0,0);this.images.push(image);}
      image.setPosition(x*CHUNK_SIZE,y*CHUNK_SIZE).setDisplaySize(CHUNK_SIZE,CHUNK_SIZE).setVisible(true);
    }
    for(let i=count;i<this.images.length;i++)this.images[i].setVisible(false);
  }
}
