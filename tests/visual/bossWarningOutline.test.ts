import {describe,it,expect} from 'vitest';
import {bossCrossOutline} from '../../src/game/render/bossWarningOutline';
import {bossAreaHit,BOSS_ENCOUNTER} from '../../src/core/combat/bossEncounter';

describe('finite Cross visual union matches canonical hit area',()=>{
  for(const angle of [0,.37,Math.PI/2,2.8])it(`covers the exact area at angle ${angle}`,()=>{
    const x=-16384.375,y=9876.125,points=bossCrossOutline(x,y,angle);
    const contains=(px:number,py:number)=>{let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){
      const [ax,ay]=points[i],[bx,by]=points[j];if((ay>py)!==(by>py)&&px<(bx-ax)*(py-ay)/(by-ay)+ax)inside=!inside;
    }return inside;};
    for(let u=-420;u<420;u+=13.1)for(let v=-420;v<420;v+=17.3){
      const px=x+Math.cos(angle)*u-Math.sin(angle)*v,py=y+Math.sin(angle)*u+Math.cos(angle)*v;
      expect(contains(px,py)).toBe(bossAreaHit('cross',x-Math.cos(angle)*100,y-Math.sin(angle)*100,x,y,px,py));
    }
    expect(points).toHaveLength(12);expect(BOSS_ENCOUNTER.crossLength).toBeGreaterThan(BOSS_ENCOUNTER.crossHalfWidth);
  });
});
