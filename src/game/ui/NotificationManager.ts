export type NotificationPriority = "critical" | "important" | "info";
interface Notice {key:string;title:string;sub?:string;ms:number;priority:NotificationPriority;count:number;node?:HTMLElement;remaining:number;}
const rank={critical:2,important:1,info:0};
/** One bounded, presentation-only queue. Critical messages preempt routine
 * messages; paused/hidden tabs freeze dwell time rather than lose alerts. */
export class NotificationManager {
 private visible:Notice[]=[];
 private waiting:Notice[]=[];
 private timer:ReturnType<typeof setInterval>;
 private last=performance.now();
 private stack:HTMLElement;
 constructor(root:HTMLElement){
  this.stack=document.createElement("div");this.stack.id="notification-stack";
  this.stack.setAttribute("role","log");this.stack.setAttribute("aria-live","polite");root.append(this.stack);
  this.timer=setInterval(()=>this.tick(),250);
 }
 push(title:string,sub:string|undefined,ms:number,priority:NotificationPriority):void {
  const key=title+"\n"+(sub??"");
  const existing=[...this.visible,...this.waiting].find(n=>n.key===key);
  if(existing){existing.count++;existing.remaining=Math.max(existing.remaining,ms);this.render(existing);return;}
  const n:Notice={key,title,sub,ms,remaining:ms,priority,count:1};
  if(this.waiting.length>=64){
   const routine=this.waiting.findIndex(x=>x.priority!=="critical");
   if(routine>=0)this.waiting.splice(routine,1);
   else {
    // Preserve overflow explicitly as a counted critical summary, never an
    // unbounded event log. Current actionable message remains visible.
    const summary=this.waiting[this.waiting.length-1]!;summary.count++;summary.title=title;summary.sub=sub;return;
   }
  }
  this.waiting.push(n);this.waiting.sort((a,b)=>rank[b.priority]-rank[a.priority]);
  if(priority==="critical"&&this.visible.length===3){
   const i=this.visible.findIndex(v=>v.priority!=="critical");
   if(i>=0){const displaced=this.visible.splice(i,1)[0]!;displaced.node?.remove();displaced.node=undefined;if(this.waiting.length<64)this.waiting.push(displaced);}
  }
  this.fill();
 }
 private render(n:Notice):void {
  if(!n.node)return;
  n.node.replaceChildren();
  const title=document.createElement("div");title.className="toast-title";title.textContent=n.title+(n.count>1?` ×${n.count}`:"");n.node.append(title);
  if(n.sub){const sub=document.createElement("div");sub.className="toast-sub";sub.textContent=n.sub;n.node.append(sub);}
 }
 private fill():void {
  this.waiting.sort((a,b)=>rank[b.priority]-rank[a.priority]);
  while(this.visible.length<3&&this.waiting.length){
   const n=this.waiting.shift()!;n.node=document.createElement("div");n.node.className="toast show";n.node.dataset.priority=n.priority;
   if(n.priority==="critical")n.node.setAttribute("role","alert");
   this.visible.push(n);this.stack.append(n.node);this.render(n);
  }
 }
 private tick():void {
  const now=performance.now(),dt=now-this.last;this.last=now;
  if(document.hidden||document.querySelector("#ui > .screen"))return;
  for(const n of this.visible)n.remaining-=dt;
  this.visible=this.visible.filter(n=>{if(n.remaining>0)return true;n.node?.remove();return false;});this.fill();
 }
 counts():{visible:number;queued:number}{return {visible:this.visible.length,queued:this.waiting.length};}
 dispose():void{clearInterval(this.timer);this.stack.remove();this.visible=[];this.waiting=[];}
}
