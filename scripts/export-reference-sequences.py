"""Export distinct reference cells for optional Krita/PNG sequence editing.
python scripts/export-reference-sequences.py SOURCE_PNG DESTINATION_DIRECTORY
Then pack-animation-reference.py DESTINATION/source.json RUNTIME METADATA
No artistic editing, interpolation or pose synthesis is performed.
"""
import json,sys
from pathlib import Path
from PIL import Image
source=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
image=Image.open(source).convert('RGBA');names=[]
states=['idle','walk-left','walk-right','attack','recover','hurt','dash','ability','death']
for row in range(4):
    for col,state in enumerate(states):
        name=f"{'space' if row>=2 else 'stone'}-{'back' if row%2 else 'front'}-{state}.png"
        target=out/name
        if target.exists():raise ValueError('Refusing to overwrite authored sequence:'+name)
        image.crop((col*image.width//9,row*image.height//4,(col+1)*image.width//9,(row+1)*image.height//4)).save(target)
        names.append(name)
(out/'source.json').write_text(json.dumps({'schema':1,'classification':'EXPORTED_DISTINCT_KEY_POSES_NOT_INBETWEENS','frames':names},indent=2)+'\n')
print('Exported36 editable PNG poses and source manifest')
