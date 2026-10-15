"""Read-only alpha measurements of existing original painted assets; no art edits."""
import json, hashlib
from pathlib import Path
from PIL import Image
rows={}
for key,path,count in [('world-props','assets/seed/combat/world-props-v1.png',6),('outposts-v2','assets/seed/structures/outposts-v2.png',12)]:
    image=Image.open(path).convert('RGBA'); frames=[]
    for i in range(count):
        alpha=image.crop((i%4*128,i//4*128,i%4*128+128,i//4*128+128)).getchannel('A')
        bounds=alpha.point(lambda p:255 if p>=32 else 0).getbbox()
        frames.append({'frame':i,'bounds':list(bounds),'groundY':bounds[3]})
    rows[key]={'path':path,'sha256':hashlib.sha256(Path(path).read_bytes()).hexdigest(),'frames':frames}
Path('src/game/assets/site-anchors.json').write_text(json.dumps({'classification':'MEASURED_ALPHA_BASE_NOT_ARTIST_ACCEPTANCE','threshold':32,'textures':rows},indent=2)+'\n',encoding='utf8')
print(json.dumps(rows))
