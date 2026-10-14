/** Only existing canonical sources receive art. No invented energy attack. */
export function hostileArtFrame(source:string):number|undefined {
 return source==="enemy-burst"?0:source==="enemy"?1:source==="boss-fan"?3:undefined;
}
