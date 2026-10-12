"""Deterministic slicing/alpha-preserving size+anchor normalization, not repainting.
Usage: python scripts/normalize-hero-atlas.py source.png origin
Generated sheet must be inspected first. Keeps untouched source for provenance.
"""
from pathlib import Path
from PIL import Image
import sys, json, shutil, hashlib
source, origin = Path(sys.argv[1]), sys.argv[2]
rows=2 if origin=='boss' else 3 if origin=='outposts' else 4
folder='structures' if origin=='outposts' else 'actors' if origin in ('boss','enemies') else 'heroes'
raw = Path('assets/original') / folder / (origin + '-v2.png')
raw.parent.mkdir(parents=True, exist_ok=True)
shutil.copy2(source, raw)
im = Image.open(raw).convert('RGBA')
if im.getextrema()[3][0] != 0:
    raise SystemExit('Missing real transparency')
cells = []
for i in range(rows*4):
    x, y = i % 4, i // 4
    crop = im.crop((x*im.width//4, y*im.height//rows, (x+1)*im.width//4, (y+1)*im.height//rows))
    box = crop.getchannel('A').getbbox()
    if not box:
        raise SystemExit(f'Empty frame {i}')
    cells.append(crop.crop(box))
# Uniform scale for every pose prevents walk/attack breathing. Dead frame lies
# low, normal poses share feet baseline; expanded attack silhouette kept intact.
scale = min(100 / max(c.width for c in cells), 110 / max(c.height for c in cells))
atlas = Image.new('RGBA',(512,128*rows))
for i,crop in enumerate(cells):
    crop = crop.resize((max(1,round(crop.width*scale)),max(1,round(crop.height*scale))),Image.Resampling.LANCZOS)
    x,y = (i%4)*128+(128-crop.width)//2, (i//4)*128+118-crop.height
    atlas.alpha_composite(crop,(x,y))
out=Path('assets/seed')/folder/(origin+'-v2.png')
out.parent.mkdir(parents=True,exist_ok=True); atlas.save(out,optimize=True)
manifest=Path('assets/ASSET_MANIFEST.json'); m=json.loads(manifest.read_text())
a=dict(m['assets'][-1]); a.update(id='seed-hero-v2-'+origin,projectPath=out.as_posix(),vendorSourcePath=raw.as_posix(),sourceFile=raw.as_posix(),sourcePack='-SEED original generated hero family',sourceLicense='MIT',author='-SEED contributors; OpenAI image generation',versionOrRelease='hero-v2-1',modifications='Original generated atlas; deterministic alpha-preserving 4x4 slicing, uniform resize and feet anchoring. Source retained.',presentationTransform='16 authored poses at128px; game hero72u; front/back; not six-age equipment coverage',purpose=origin+' combat pose hero; human acceptance pending',status='art-review-pending',byteSize=out.stat().st_size,vendorSourceSha256=hashlib.sha256(raw.read_bytes()).hexdigest(),productionSha256=hashlib.sha256(out.read_bytes()).hexdigest())
a['modified']=True
if origin=='boss':
    a.update(id='seed-boss-v2',modifications='Original generated atlas; alpha-preserving 4x2 slicing, uniform resize and anchoring',presentationTransform='8 posed128px cells; canonical warnings/fire/hurt and upright boss',purpose='Boss artwork; animation and human acceptance pending')
elif origin in ('enemies','outposts'):
    a.update(id='seed-'+origin+'-v2',modifications='Original generated atlas; alpha-preserving slicing, uniform resize and anchoring',presentationTransform='128px cached frame atlas; real family or specialization/state',purpose=origin+' artwork; human acceptance pending')
m['assets']=[a0 for a0 in m['assets'] if a0['id']!=a['id']]+[a];m['totalAssets']=len(m['assets'])
manifest.write_text(json.dumps(m,indent=2)+'\n')
print(out,atlas.size,'source',im.size,'scale',round(scale,3))
