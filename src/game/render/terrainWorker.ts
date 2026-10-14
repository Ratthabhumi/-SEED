import {paintTerrainTile} from "./terrainTile";
import {periodicTerrainSource} from "./naturalTerrain";
import {terrainUploadPixels} from "./terrainUpload";
let sources:Uint8ClampedArray[]=[];
onmessage=(event:MessageEvent)=>{
 const message=event.data;
 if(message.type==="sources"){sources=message.sources.map(periodicTerrainSource);return;}
 const start=performance.now(),pixels=paintTerrainTile(message.cx,message.cy,message.ids,sources);
 const uploadPixels=terrainUploadPixels(pixels,256);
 (self as unknown as {postMessage(message:unknown,transfer:Transferable[]):void}).postMessage({epoch:message.epoch,key:message.key,serial:message.serial,pixels,uploadPixels,paintMs:performance.now()-start},[pixels.buffer,uploadPixels.buffer]);
};
