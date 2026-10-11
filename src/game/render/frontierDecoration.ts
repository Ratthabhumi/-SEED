import { deriveUint32 } from "../../core/seed/hash";
import { CHUNK_SIZE } from "../../core/world/chunks";
/** Cosmetic hash namespace: no mutable gameplay stream, no collision geometry. */
export function frontierDecoration(seed: string,cx:number,cy:number) {
 return Array.from({length:12},(_,i)=>{
 const h=deriveUint32(seed, `frontier-decoration:${cx},${cy}:${i}`);
 return {x:cx*CHUNK_SIZE+24+h%(CHUNK_SIZE-48),y:cy*CHUNK_SIZE+24+((h>>>12)%(CHUNK_SIZE-48)),size:14+(h%17)};
 });
}
