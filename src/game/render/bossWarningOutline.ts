import {BOSS_ENCOUNTER} from '../../core/combat/bossEncounter';
/** Perimeter of the UNION of the two finite hit rectangles, not four infinite
 * lane edges through the already-dangerous center. Canonical geometry is read-only. */
export function bossCrossOutline(x:number,y:number,angle:number):Array<[number,number]>{
  const l=BOSS_ENCOUNTER.crossLength,w=BOSS_ENCOUNTER.crossHalfWidth,c=Math.cos(angle),s=Math.sin(angle);
  const points:Array<[number,number]>=[[-l,-w],[-w,-w],[-w,-l],[w,-l],[w,-w],[l,-w],[l,w],[w,w],[w,l],[-w,l],[-w,w],[-l,w]];
  return points.map(([a,b])=>[x+c*a-s*b,y+s*a+c*b]);
}
