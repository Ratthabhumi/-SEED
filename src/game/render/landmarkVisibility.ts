import {CHUNK_SIZE} from '../../core/world/chunks';
/** Prepare the whole possible camera sweep before the next chunk refresh.
 * Current-position culling can otherwise hide art during a 511u move. */
export function landmarkEligible(px:number,py:number,x:number,y:number,width:number,height:number,zoom:number):boolean{
 const left=Math.floor(px/CHUNK_SIZE)*CHUNK_SIZE,top=Math.floor(py/CHUNK_SIZE)*CHUNK_SIZE;
 const halfW=width/zoom/2+144,halfH=height/zoom/2+144;
 return x>=left-halfW&&x<=left+CHUNK_SIZE+halfW&&y>=top-halfH&&y<=top+CHUNK_SIZE+halfH;
}
