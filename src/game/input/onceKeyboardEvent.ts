/** Phaser can revisit its uncleared queue on the next DOM key event. */
export function onceKeyboardEvent(listener:(event?:KeyboardEvent)=>void):(event?:KeyboardEvent)=>void {
  const consumed=new WeakSet<KeyboardEvent>();
  return event=>{
    if(event){if(consumed.has(event))return;consumed.add(event);}
    listener(event);
  };
}
