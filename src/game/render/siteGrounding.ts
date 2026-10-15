import anchors from '../assets/site-anchors.json';
/** Put the actual painted support edge on the existing site's contact shadow.
 * Canonical POI/hit/claim coordinates are unchanged. */
export function siteOriginY(texture:'world-props'|'outposts-v2',frame:number):number{
 return anchors.textures[texture].frames[frame]!.groundY/128;
}
