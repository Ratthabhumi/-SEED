/** Read the binary actually served, never infer provenance from the checkout. */
export async function readPreviewBuild(url){
 const base=new URL(url),html=await (await fetch(base,{signal:AbortSignal.timeout(15000)})).text();
 const entry=html.match(/<script[^>]*src=["']([^"']+\.js)["']/)?.[1];
 const asset=entry?new URL(entry,base):null;
 const bundle=asset?await (await fetch(asset,{signal:AbortSignal.timeout(15000)})).text():'';
 const stamp=bundle.match(/buildSha:"([a-f0-9]+)",buildDirty:(![01])/);
 if(!stamp)throw Error('No compiled build identity in served bundle');
 return {sha:stamp[1],dirty:stamp[2]!=='!1',asset:asset.href};
}
