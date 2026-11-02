export interface BaselineSpec {id:string;sourceSha:string;lockSha256:string;originalZipSha256?:string|null;originalContentTreeSha256?:string;}
export interface BaselineReceipt {
 contract:string;id:string;classification:'ORIGINAL_ARCHIVED'|'RECONSTRUCTED_FROM_SOURCE';
 sourceSha:string;sourceDirty:false;lockSha256:string;zipSha256:string;expectedOriginalZipSha256:string|null;
 files:Array<{path:string;bytes:number;sha256:string}>;contentTreeSha256:string;cacheRejection:string|null;
}
export interface BaselineOptions {
 root:string;toolchain:Record<string,string|number>;archive?:string;archives?:Record<string,string>;
 build:(spec:BaselineSpec)=>Promise<{sourceSha:string;sourceDirty:boolean;lockSha256:string;dist:string}>;
}
export declare function resolveBaseline(spec:BaselineSpec,options:BaselineOptions):Promise<BaselineReceipt>;
export declare function validateBaseline(spec:BaselineSpec,dir:string,toolchain:Record<string,string|number>):BaselineReceipt;
export declare function resolveRequiredBaselines(specs:BaselineSpec[],options:BaselineOptions):Promise<BaselineReceipt[]>;
