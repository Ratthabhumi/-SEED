"""Read-only pixel evidence for authored sockets; no image generation/editing."""
import hashlib,json,re
from pathlib import Path
from PIL import Image
source=Path('assets/seed/combat/equipment-v1.png')
image=Image.open(source).convert('RGBA')
rows=[]
for i,m in enumerate(re.findall(r'\[(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(?:true|false)\]',Path('src/content/weaponSockets.ts').read_text())):
    values=list(map(int,m));points=[]
    for name,(x,y) in zip(['pivot','muzzle','rearAxis'],zip(values[::2],values[1::2])):
        nearest=min(((dx*dx+dy*dy)**.5 for dy in range(-6,7) for dx in range(-6,7)
            if 0<=x+dx<128 and 0<=y+dy<128 and image.getpixel((i%6*128+x+dx,i//6*128+y+dy))[3]>32),default=None)
        points.append({'name':name,'pixel':[x,y],'nearestVisibleInkPixels':nearest})
    rows.append({'frame':i,'points':points})
assert len(rows)==24
report={'classification':'READ_ONLY_AUTHORED_SOCKET_CALIBRATION_NOT_VISUAL_ACCEPTANCE','assetSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'frames':rows}
Path('test-results').mkdir(exist_ok=True)
Path('test-results/v35-socket-calibration.json').write_text(json.dumps(report,indent=2))
bad=[(r['frame'],p['name']) for r in rows for p in r['points'] if p['nearestVisibleInkPixels'] is None]
print(json.dumps({'frames':len(rows),'points':72,'noInkWithin6px':bad}))
assert not bad,'Reinspect source sockets: transparent region outside authored ink'
