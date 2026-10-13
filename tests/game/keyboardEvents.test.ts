import {describe,it,expect} from "vitest";
import {onceKeyboardEvent} from "../../src/game/input/onceKeyboardEvent";
const key=(keyCode:number,type="keydown",repeat=false)=>({keyCode,type,timeStamp:7,repeat} as KeyboardEvent);
describe("one browser event owns one adapter command",()=>{
  it("a same-frame Phaser queue revisit cannot toggle Pause back behind Resume",()=>{
    const events=[key(27),key(27,"keyup"),key(90),key(90,"keyup")];
    let previous:KeyboardEvent|undefined,paused=false,changes=0;
    const escape=onceKeyboardEvent(()=>{paused=!paused;changes++;});
    // KeyboardManager emits PROCESS for each appended event; KeyboardPlugin
    // checks only the previous code/time/type while revisiting the whole queue.
    for(let size=1;size<=events.length;size++)for(const event of events.slice(0,size)){
      if(previous&&event.keyCode===previous.keyCode&&event.type===previous.type&&event.timeStamp===previous.timeStamp)continue;
      previous=event;if(event.type==="keydown"&&event.keyCode===27)escape(event);
    }
    expect(changes).toBe(1);expect(paused).toBe(true);
    paused=!paused;expect(paused).toBe(false); // the one native Resume action
  });
  it("distinct physical presses with identical code/time remain distinct",()=>{
    let commands=0;const handler=onceKeyboardEvent(()=>commands++);
    handler(key(27));handler(key(27));expect(commands).toBe(2);
  });
  it("preserves repeat information and payload-free manual callbacks",()=>{
    const received:Array<boolean|undefined>=[],handler=onceKeyboardEvent(event=>received.push(event?.repeat));
    const held=key(70,"keydown",true);handler(held);handler(held);handler();handler();
    expect(received).toEqual([true,undefined,undefined]);
  });
});
