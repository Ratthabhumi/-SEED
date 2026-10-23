"""Read unchanged alpha masks; projected native bounds, not occlusion/display latency."""
from PIL import Image
from pathlib import Path
import json, hashlib

families = [
    ("Hunters reference Stone/Space", "content15-animation/hunters-reference-v1.png",128,126),
    ("Hunters authored release", "content153/hunters-attack-v2.png",128,126),
    ("six-age bodies", "content15/heroes-neutral-v1.png",128,126),
    ("chaser/ranged/tank/swarm", "actors/enemies-v2.png",128,None),
    ("Boss", "actors/boss-v2.png",256,240),
    ("squad Hunters", "heroes/hunters-v2.png",128,60),
    ("POI", "combat/world-props-v1.png",128,160),
    ("outpost tier1", "structures/outposts-v2.png",128,176),
    ("outpost tier2", "structures/outposts-v2.png",128,208),
    ("equipment", "combat/equipment-v1.png",128,None),
    ("hostile projectiles", "content153/hostile-attacks-v1.png",128,30),
]
rows=[]
for label, relative, cell, size in families:
    path=Path('assets/seed')/relative
    image=Image.open(path).convert('RGBA'); cols=image.width//cell
    frames=[]
    for i in range(cols*(image.height//cell)):
        alpha=image.crop(((i%cols)*cell,(i//cols)*cell,(i%cols+1)*cell,(i//cols+1)*cell)).getchannel('A').point(lambda a:255 if a>64 else 0)
        box=alpha.getbbox()
        if not box: continue
        units=size
        if label=='chaser/ranged/tank/swarm': units=[68,76,92,52][i//4]
        if label=='equipment': units=56+(i%6)*2
        w,h=box[2]-box[0],box[3]-box[1]
        frames.append({'frame':i,'alphaBox':box,'occupiedSourcePixels':alpha.histogram()[255],
          'worldSize':units,'native720':[round(w*units/cell,2),round(h*units/cell,2)],
          'native1080':[round(w*units/cell*1.2,2),round(h*units/cell*1.2,2)]})
    rows.append({'role':label,'file':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'frames':frames})
result={'classification':'MEASURED_ALPHA_GT64_PROJECTED_UNOCCLUDED_BOUNDS_NOT_VISIBLE_FRAMEBUFFER_PIXELS',
 'limitations':'720 zoom1;1080 zoom1.2. UI scale does not resize world actors. POI160 and hostile30 are representative sizes, not every site/projectile; elite1.4x ordinary. Skills use canonical radii (Nova etc), not bitmap bounds. Native captures remain necessary for overlap/occlusion.', 'rows':rows}
out=Path('docs/evidence/v32');out.mkdir(parents=True,exist_ok=True)
(out/'alpha-scale.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print('Read-only alpha audit:',len(rows),'roles',sum(len(r['frames']) for r in rows),'cells')
