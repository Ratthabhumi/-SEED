import type {CollectibleId} from '../../core/progression/legacyCollection';
type Segment=readonly [number,number,number,number];
/** Shared normalized silhouettes for the collection preview and world equipment. */
export const LEGACY_SHAPES:Record<CollectibleId,readonly Segment[]>={
 dawn:[[-7,0,7,0],[0,-7,0,7],[-4,-4,4,4],[-4,4,4,-4]],
 ward:[[-6,-6,6,-6],[6,-6,6,1],[6,1,0,8],[0,8,-6,1],[-6,1,-6,-6]],
 prism:[[-8,5,0,-3],[0,-3,8,5],[-8,-1,0,-9],[0,-9,8,-1]],
 star:[[0,-9,2,-2],[2,-2,9,0],[9,0,2,2],[2,2,0,9],[0,9,-2,2],[-2,2,-9,0],[-9,0,-2,-2],[-2,-2,0,-9]],
 chronicle:[[-7,-7,0,-5],[0,-5,7,-7],[7,-7,7,6],[7,6,0,8],[0,8,-7,6],[-7,6,-7,-7],[0,-5,0,8]],
};
export function legacyPreview(id:CollectibleId):SVGSVGElement{
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
 svg.setAttribute('viewBox','-12 -12 24 24');svg.setAttribute('width','40');svg.setAttribute('height','40');
 svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
 const path=document.createElementNS(ns,'path');
 path.setAttribute('d',LEGACY_SHAPES[id].map(([a,b,c,d])=>`M${a} ${b}L${c} ${d}`).join(''));
 path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','2');
 svg.append(path);return svg;
}
