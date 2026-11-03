/** Historical builds have no outpost target field; absence means no target.
 * Preserve all other encounter fields and reject different actual targets. */
export function bossVisualSignature(b) {
  const encounter=b.encounter?{...b.encounter,outpostId:b.encounter.outpostId??"",assaultLeft:b.encounter.assaultLeft??0,defenseCd:b.encounter.defenseCd??0}:b.encounter;
  return JSON.stringify({x:b.x,y:b.y,hp:b.hp,maxHp:b.maxHp,radius:b.radius,encounter});
}
