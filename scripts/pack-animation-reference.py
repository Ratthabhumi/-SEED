"""Reproducible PNG key-pose import; no pose synthesis or duplicate fake frames.
python scripts/pack-animation-reference.py SOURCE OUTPUT_DIRECTORY [METADATA_DIRECTORY]
Pillow is the existing offline artwork utility, not a runtime dependency.
"""
import hashlib,json,sys
from pathlib import Path
from PIL import Image

def pack(source,out,metadata_out=None):
    sequence_hashes={}
    if source.suffix=='.json':
        spec=json.loads(source.read_text(encoding='utf-8'))
        if len(spec['frames'])!=36:raise ValueError('Reference contract requires36 authored poses')
        cells=[]
        for name in spec['frames']:
            p=(source.parent/name).resolve();cells.append(Image.open(p).convert('RGBA'))
            sequence_hashes[name]=hashlib.sha256(p.read_bytes()).hexdigest()
        width=max(c.width for c in cells);height=max(c.height for c in cells)
        image=Image.new('RGBA',(width*9,height*4))
        for i,cell in enumerate(cells):image.paste(cell,((i%9)*width,(i//9)*height))
    else:image=Image.open(source).convert('RGBA')
    if image.getchannel('A').getextrema()[0]!=0: raise ValueError('Transparent source required')
    out.mkdir(parents=True,exist_ok=True)
    metadata_out=metadata_out or out;metadata_out.mkdir(parents=True,exist_ok=True)
    atlas=Image.new('RGBA',(1152,512));frames=[];hashes=set()
    clips={'idle':([0],1000,True),'walk':([1,2],125,True),'attack':([3,4],80,False),
           'hurt':([5],180,False),'dash':([6],160,False),'special':([7],350,False),'death':([8],1000,False),'recover':([4],80,False)}
    for row in range(4):
        cells=[image.crop((col*image.width//9,row*image.height//4,(col+1)*image.width//9,(row+1)*image.height//4)) for col in range(9)]
        idle=cells[0].getchannel('A').getbbox()
        if not idle:raise ValueError('Missing idle frame')
        scale=min(94/(idle[2]-idle[0]),104/(idle[3]-idle[1]))
        for col,cell in enumerate(cells):
            bounds=cell.getchannel('A').getbbox()
            if not bounds:raise ValueError(f'Empty pose{row}/{col}')
            sprite=cell.crop(bounds);digest=hashlib.sha256(sprite.tobytes()).hexdigest()
            if digest in hashes:raise ValueError('Duplicated pose pixels: no fake animation')
            hashes.add(digest)
            sprite=sprite.resize((round(sprite.width*scale),round(sprite.height*scale)),Image.Resampling.LANCZOS)
            if sprite.width>124 or sprite.height>116:raise ValueError(f'Pose exceeds locked scale: {row}/{col}')
            x=(128-sprite.width)//2;y=116-sprite.height
            atlas.alpha_composite(sprite,(col*128+x,row*128+y))
            frames.append({'frame':row*9+col,'bounds':[x,y,sprite.width,sprite.height],'ground':[64,116],
                'collisionAnchor':[64,83.2],'socket':[64+(10 if col==3 else -3 if col==4 else 0),65],
                'sourcePoseHash':digest})
    atlas.save(out/'hunters-reference-v1.png')
    metadata={'schema':1,'origin':'hunters','ages':[0,5],'directions':['front','back'],
      'columns':9,'cell':128,'atlas':[1152,512],'rgbaBytes':1152*512*4,'frameCount':36,
      'classification':'AUTHORED_KEY_POSES_SPARSE_WALK_ATTACK_CLIPS','humanArtAcceptance':'PENDING',
      'sourceSha256':hashlib.sha256(Path(source).read_bytes()).hexdigest(),'frames':frames,
      'clips':{key:{'columns':cols,'frameMs':ms,'loop':loop} for key,(cols,ms,loop) in clips.items()}}
    if sequence_hashes:metadata['sourceSequenceHashes']=sequence_hashes
    (metadata_out/'hunters-reference-v1.json').write_text(json.dumps(metadata,indent=2)+'\n',encoding='utf-8')
    phaser={'frames':{str(f['frame']):{'frame':{'x':f['frame']%9*128,'y':f['frame']//9*128,'w':128,'h':128},'rotated':False,'trimmed':False,'spriteSourceSize':{'x':0,'y':0,'w':128,'h':128},'sourceSize':{'w':128,'h':128}} for f in frames},'meta':{'image':'hunters-reference-v1.png','size':{'w':1152,'h':512},'scale':'1'}}
    (metadata_out/'hunters-reference-v1.atlas.json').write_text(json.dumps(phaser,indent=2)+'\n',encoding='utf-8')
    print('Packed36 distinct key poses;2-frame walk/attack; remaining motion states incomplete')

def pack_attack_supplement(source,out,metadata_out):
    from PIL import ImageFilter,ImageChops
    def isolate(cell):
        # Extract one existing connected body. Generation bled detached pixels
        # across grid borders; never synthesize anatomy or animation here.
        alpha=cell.getchannel('A');w,h=cell.size;data=alpha.tobytes();seen=set();best=[]
        for start,value in enumerate(data):
            if value<8 or start in seen:continue
            group=[];stack=[start];seen.add(start)
            while stack:
                p=stack.pop();group.append(p);x=p%w;y=p//w
                for dy in [-1,0,1]:
                    for dx in [-1,0,1]:
                        nx=x+dx;ny=y+dy;q=ny*w+nx
                        if 0<=nx<w and 0<=ny<h and q not in seen and data[q]>=8:seen.add(q);stack.append(q)
            if len(group)>len(best):best=group
        body=set(best);mask=Image.new('L',(w,h));mask.putdata([255 if i in body else 0 for i in range(w*h)])
        cell.putalpha(ImageChops.multiply(alpha,mask.filter(ImageFilter.MaxFilter(3))));return cell
    image=Image.open(source).convert('RGBA');atlas=Image.new('RGBA',(1024,128));frames=[];distinct=set()
    if image.getchannel('A').getextrema()[0]!=0:raise ValueError('Transparent motion source required')
    # Reviewed release -> follow-through -> returning elbow -> guard. The
    # experimental walk rows and raised-hand pose are deliberately excluded.
    for age,row in [(0,1),(5,3)]:
        cells=[isolate(image.crop((c*image.width//8,row*image.height//4,(c+1)*image.width//8,(row+1)*image.height//4))) for c in range(8)]
        guard=cells[0].getchannel('A').getbbox();scale=104/(guard[3]-guard[1])
        for col,hand in [(3,[113,44]),(5,[105,50]),(6,[113,83]),(7,[97,82])]:
            cell=cells[col];box=cell.getchannel('A').getbbox()
            if not box:raise ValueError('Empty authored supplement pose')
            sprite=cell.crop(box);body_hash=hashlib.sha256(sprite.tobytes()).hexdigest()
            if body_hash in distinct:raise ValueError('Duplicate authored supplement body')
            distinct.add(body_hash)
            sprite=sprite.resize((round(sprite.width*scale),round(sprite.height*scale)),Image.Resampling.LANCZOS)
            if sprite.width>124 or sprite.height>116:raise ValueError('Supplement exceeds fixed body scale')
            x=(128-sprite.width)//2;y=116-sprite.height;frame=len(frames)
            atlas.alpha_composite(sprite,(frame*128+x,y))
            frames.append({'frame':frame,'socket':hand,'bounds':[x,y,sprite.width,sprite.height],'ground':[64,116],'sourceRow':row,'sourceColumn':col,'sourcePoseHash':hashlib.sha256(cell.tobytes()).hexdigest()})
    out.mkdir(parents=True,exist_ok=True);metadata_out.mkdir(parents=True,exist_ok=True)
    atlas.save(out/'hunters-attack-v2.png')
    front=[[92,76],[93,68],[109,64],[121,57],[93,68],[99,80],[83,69],[104,80],[90,100]]
    back=[[93,80],[94,84],[109,77],[121,61],[94,76],[96,84],[86,72],[103,84],[90,100]]
    metadata={'schema':2,'classification':'GENERATED_RELEASE_RECOVERY_CANDIDATE_NOT_FULL_MOTION_FAMILY','humanArtAcceptance':'PENDING','frames':frames,'socketOverrides':{str(row*9+col):point for row in range(4) for col,point in enumerate(back if row%2 else front)},'overrides':{f'{age}:front:attack':{'frames':list(range(i,i+4)),'frameMs':40,'loop':False,'sockets':[f['socket'] for f in frames[i:i+4]]} for age,i in [(0,0),(5,4)]}}
    (metadata_out/'hunters-attack-v2.json').write_text(json.dumps(metadata,indent=2)+'\n')
    print('Packed eight distinct release/recovery poses; no walk certification')

if __name__=='__main__':
    if sys.argv[1]=='--attack-supplement':pack_attack_supplement(Path(sys.argv[2]),Path(sys.argv[3]),Path(sys.argv[4]))
    else:pack(Path(sys.argv[1]),Path(sys.argv[2]),Path(sys.argv[3]) if len(sys.argv)>3 else None)
