/** Measured on the unchanged128px equipment cells: grip, exit, rear axis point.
 * Coordinates refer to source ink, before pivot/scale/mirror/rotation.
 * Bow/crossbow artwork is not axis-aligned; never compensate twice. */
export const WEAPON_SOCKETS:readonly (readonly [number,number,number,number,number,number,boolean])[]=[
 [92,64,113,62,30,78,true],[89,64,114,60,29,75,true],[89,64,115,61,21,77,true],
 [43,74,106,49,40,65,true],[43,74,110,58,44,72,true],[43,74,110,56,43,68,true],
 [49,93,109,38,55,73,true],[49,93,116,45,71,53,true],[48,84,114,36,74,47,true],
 [49,93,118,42,70,57,true],[47,77,116,42,78,51,true],[54,80,110,40,73,50,true],
 [30,64,113,59,20,66,false],[30,64,114,58,22,65,false],[30,64,115,57,22,65,false],
 [30,64,116,57,20,65,false],[30,64,107,57,21,65,false],[30,64,108,57,21,65,false],
 [63,67,116,46,85,47,false],[63,67,117,47,76,46,false],[63,67,118,47,81,51,false],
 [63,67,118,47,76,45,false],[63,67,119,46,81,49,false],[63,67,112,41,74,50,false],
];
