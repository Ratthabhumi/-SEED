import type Phaser from "phaser";
import { ACTOR_ASSETS, type ActorId } from "../assets/actorAssets";
/** Bound matches canonical enemy pool; allies use a separate bounded pool. */
export class ActorRenderer {
  private images: Phaser.GameObjects.Image[] = [];
  private count = 0;
  constructor(private scene: Phaser.Scene, private max: number, private depth: number) {}
  static frames(scene: Phaser.Scene): void {
    for (const id of Object.keys(ACTOR_ASSETS)) {
      if (!scene.textures.exists("actor-" + id)) throw new Error("Mandatory actor art missing: " + id);
      const texture = scene.textures.get("actor-" + id);
      for (let frame = 0; frame < 18; frame++) if (!texture.has(String(frame))) texture.add(frame,0,frame*64,0,64,64);
    }
  }
  begin(): void { this.count = 0; }
  draw(id: ActorId,x: number,y: number,size: number,facing: number,time: number,moving: boolean,tint = 0xffffff, age = 0): void {
    if (this.count >= this.max) throw new Error("Actor pool exceeded " + this.max);
    let image = this.images[this.count++];
    if (!image) { image=this.scene.add.image(0,0,"actor-"+id,0).setDepth(this.depth); this.images.push(image); }
    image.setTexture("actor-"+id,Math.max(0,Math.min(5,age))*3 + (moving ? Math.floor(time*8)%3 : 0)).setPosition(x,y).setDisplaySize(size,size).setRotation(facing+Math.PI/2).setTint(tint).setVisible(true);
  }
  end(): void { for(let i=this.count;i<this.images.length;i++)this.images[i]!.setVisible(false); }
  get size(): number { return this.images.length; }
}
