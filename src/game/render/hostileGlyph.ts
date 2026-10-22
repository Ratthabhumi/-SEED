/** Velocity-space silhouettes, shared by the cached WebGL and Canvas paths.
 * Tip = +X. No extra hitboxes or attacks; identity comes from canonical source. */
const dart:ReadonlyArray<readonly[number,number]>=[[1.6,0],[0,.85],[-.7,.5],[-.35,0],[-.7,-.5],[0,-.85]];
const bolt:ReadonlyArray<readonly[number,number]>=[[1.6,0],[.35,.9],[-.65,.9],[-.4,0],[-.65,-.9],[.35,-.9]];
const fan:ReadonlyArray<readonly[number,number]>=[[1.6,0],[.2,.42],[-.65,1.1],[-.3,.15],[-.7,0],[-.3,-.15],[-.65,-1.1],[.2,-.42]];
export function hostileGlyph(source:string){return source==="boss-fan"?fan:source==="enemy-burst"?bolt:dart;}
