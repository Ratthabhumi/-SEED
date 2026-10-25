import {it,expect} from 'vitest';
import manifest from '../../assets/original/terrain-periodic/manifest.json';
declare const require:(id:string)=>any;
const {readFileSync}=require('node:fs'),{createHash}=require('node:crypto');
const hash=(b:unknown)=>createHash('sha256').update(b).digest('hex');
it('retains all four exact prepared sources and provenance without detaching the shared cache',()=>{
 const raw=readFileSync('assets/seed/terrain/periodic/materials.rgba');expect(raw.length).toBe(4*256*256*4);expect(hash(raw)).toBe(manifest.packedSha256);
 for(const m of manifest.materials){expect(hash(readFileSync(m.source))).toBe(m.sourceSha256);expect(hash(readFileSync(m.path))).toBe(m.pngSha256);expect(hash(raw.subarray(m.offset,m.offset+256*256*4))).toBe(m.rgbaSha256);}
});
