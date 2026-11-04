/** Presentation only: never tint actors, projectiles, warnings or the camera.
 * Alternating child rules remain pinned to Content18; this names the landscape,
 * not a replacement for the canonical scarce/frontier condition. */
export function worldPresentation(ascension:number,highContrast=false){
 const eclipse=ascension>0;
 return {eclipse,title:eclipse?'world.eclipse':'world.dawn',
  ground:highContrast?0xffffff:eclipse?0xa7b8ee:0xffffff,
  fallback:highContrast?0xffffff:eclipse?0x8798c8:0xb8b8b8,
  architecture:highContrast?0xffffff:eclipse?0xc0c8ff:0xffffff} as const;
}
