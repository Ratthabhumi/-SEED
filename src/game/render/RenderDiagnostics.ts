import Phaser from "phaser";

type Target = Record<string, unknown>;
interface TimerApi {
  create():WebGLQuery|null;begin(q:WebGLQuery):void;end():void;drop(q:WebGLQuery):void;
  available(q:WebGLQuery):boolean;result(q:WebGLQuery):number;disjoint():boolean;
}
export interface DiagnosticFrame {
  frame: number; at: number; spans: Record<string, number>; calls: Record<string, number>;
}
/** Opt-in only (?profile=1). Inclusive nested spans, never percentile subtraction.
 * Unique completed display frames; bounded storage. Does not mutate simulation.
 */
export class RenderDiagnostics {
  private current: DiagnosticFrame = {frame:0,at:0,spans:{},calls:{}};
  private frames: DiagnosticFrame[]=[];
  private restores: Array<()=>void>=[];
  private frameStart=0;
  private preRenderAt=0;
  private trace=false;
  private gpuPending: Array<{query:WebGLQuery;frame:number}>=[];
  private gpu: Array<{frame:number;ms:number}>=[];
  private timer?:TimerApi;
  private gpuExtension="unavailable";
  private activeQuery?:WebGLQuery;
  private gpuDisjoint=0;
  private observer?:PerformanceObserver;
  private longTasks:Array<{at:number;ms:number}>=[];
  constructor(private scene:Phaser.Scene) {
    this.trace=new URLSearchParams(location.search).get("profileTrace")==="1";
    const renderer=scene.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
    const gl=renderer.gl;
    if(gl&&"createQuery" in gl){
      const gl2=gl as unknown as WebGL2RenderingContext;
      const ext=gl2.getExtension("EXT_disjoint_timer_query_webgl2");
      if(ext){this.gpuExtension="EXT_disjoint_timer_query_webgl2";this.timer={
        create:()=>gl2.createQuery(),begin:q=>gl2.beginQuery(ext.TIME_ELAPSED_EXT,q),end:()=>gl2.endQuery(ext.TIME_ELAPSED_EXT),drop:q=>gl2.deleteQuery(q),
        available:q=>!!gl2.getQueryParameter(q,gl2.QUERY_RESULT_AVAILABLE),result:q=>Number(gl2.getQueryParameter(q,gl2.QUERY_RESULT)),disjoint:()=>!!gl2.getParameter(ext.GPU_DISJOINT_EXT)};}
    }else if(gl){
      const ext=gl.getExtension("EXT_disjoint_timer_query") as {
        TIME_ELAPSED_EXT:number;GPU_DISJOINT_EXT:number;QUERY_RESULT_AVAILABLE_EXT:number;QUERY_RESULT_EXT:number;
        createQueryEXT():WebGLQuery|null;beginQueryEXT(t:number,q:WebGLQuery):void;endQueryEXT(t:number):void;deleteQueryEXT(q:WebGLQuery):void;getQueryObjectEXT(q:WebGLQuery,p:number):unknown;
      }|null;
      if(ext){this.gpuExtension="EXT_disjoint_timer_query";this.timer={
        create:()=>ext.createQueryEXT(),begin:q=>ext.beginQueryEXT(ext.TIME_ELAPSED_EXT,q),end:()=>ext.endQueryEXT(ext.TIME_ELAPSED_EXT),drop:q=>ext.deleteQueryEXT(q),
        available:q=>!!ext.getQueryObjectEXT(q,ext.QUERY_RESULT_AVAILABLE_EXT),result:q=>Number(ext.getQueryObjectEXT(q,ext.QUERY_RESULT_EXT)),disjoint:()=>!!gl.getParameter(ext.GPU_DISJOINT_EXT)};}
    }
    if(gl)for(const key of ["drawArrays","drawElements","bufferData","bufferSubData","texImage2D","texSubImage2D","bindTexture"])
      this.wrap(gl,key,"gl."+key);
    for(const name of ["Graphics","Image","Mesh2D","Text"] as const){
      const proto=Phaser.GameObjects[name].prototype;
      this.wrap(proto,"renderWebGL","render."+name);
    }
    this.wrap(Phaser.GameObjects.Text.prototype,"updateText","text.canvasTexture");
    this.wrap(renderer,"render","renderer.total");
    scene.game.events.on(Phaser.Core.Events.PRE_STEP,this.begin,this);
    scene.game.events.on(Phaser.Core.Events.PRE_RENDER,this.preRender,this);
    scene.game.events.on(Phaser.Core.Events.POST_RENDER,this.end,this);
    if(typeof PerformanceObserver!=="undefined"){
      this.observer=new PerformanceObserver(list=>{for(const e of list.getEntries()){
        this.longTasks.push({at:e.startTime,ms:e.duration});if(this.longTasks.length>256)this.longTasks.shift();
      }});
      try{this.observer.observe({entryTypes:["longtask"]});}catch{/* unsupported browser */}
    }
    scene.events.once("shutdown",()=>this.dispose());
  }
  wrap(target:object,key:string,label:string):void {
    const obj=target as Target,fn=obj[key];if(typeof fn!=="function")return;
    const own=Object.prototype.hasOwnProperty.call(obj,key),self=this;
    const wrapped=function(this:unknown,...args:unknown[]){
      const at=performance.now();
      try{return Reflect.apply(fn,this,args);}finally{
        const end=performance.now();self.add(label,end-at);
        // Phaser4 snapshots render steps at object construction, so wrapping an
        // instance afterward misses it. Identify the actual src argument here.
        if(label==="render.Graphics"){
          const source=args[1] as {name?:string}|undefined;
          self.add("graphics."+(source?.name||"other"),end-at);
        }
        if(self.trace){performance.measure("seed."+label,{start:at,end});performance.clearMeasures("seed."+label);}
      }
    };
    obj[key]=wrapped;
    this.restores.push(()=>{if(obj[key]===wrapped){if(own)obj[key]=fn;else delete obj[key];}});
  }
  add(label:string,ms:number):void {
    this.current.spans[label]=(this.current.spans[label]??0)+ms;
    this.current.calls[label]=(this.current.calls[label]??0)+1;
  }
  private begin():void {
    const at=performance.now();this.current={frame:this.scene.game.loop.frame,at,spans:{},calls:{}};
    if(this.frameStart)this.add("browser.interval",at-this.frameStart);this.frameStart=at;
  }
  private preRender():void {
    this.preRenderAt=performance.now();
    const timer=this.timer;if(!timer)return;
    // Poll completed queries only; never block/read back or call finish/getError.
    if(timer.disjoint()){
      this.gpuDisjoint++;for(const q of this.gpuPending)timer.drop(q.query);this.gpuPending=[];return;
    }
    while(this.gpuPending.length&&timer.available(this.gpuPending[0]!.query)){
      const q=this.gpuPending.shift()!;
      this.gpu.push({frame:q.frame,ms:timer.result(q.query)/1e6});
      timer.drop(q.query);if(this.gpu.length>1200)this.gpu.shift();
    }
    if(this.gpuPending.length<8){const q=timer.create();if(q){this.activeQuery=q;timer.begin(q);}}
  }
  private end():void {
    this.add("renderer.boundary",performance.now()-this.preRenderAt);
    if(this.activeQuery&&this.timer){
      this.timer.end();
      this.gpuPending.push({query:this.activeQuery,frame:this.current.frame});this.activeQuery=undefined;
    }
    this.frames.push(this.current);if(this.frames.length>1200)this.frames.shift();
  }
  reset():void{this.frames=[];this.gpu=[];this.longTasks=[];}
  snapshot(){return {frames:this.frames,gpu:this.gpu,gpuSupported:!!this.timer,gpuExtension:this.gpuExtension,gpuDisjoint:this.gpuDisjoint,longTasks:this.longTasks,
    limitations:"Inclusive nested CPU/API spans overlap; not additive. GPU queries asynchronous, unavailable/disjoint results excluded. At most1200 unique frames/8 pending queries/256 long tasks. Instrumented timings require independent no-profiler comparison."};}
  dispose():void {
    this.scene.game.events.off(Phaser.Core.Events.PRE_STEP,this.begin,this);
    this.scene.game.events.off(Phaser.Core.Events.PRE_RENDER,this.preRender,this);
    this.scene.game.events.off(Phaser.Core.Events.POST_RENDER,this.end,this);
    this.observer?.disconnect();
    for(const restore of this.restores.reverse())restore();this.restores=[];
    if(this.timer){if(this.activeQuery){this.timer.end();this.timer.drop(this.activeQuery);}
      for(const q of this.gpuPending)this.timer.drop(q.query);}
    this.activeQuery=undefined;this.gpuPending=[];
  }
}
