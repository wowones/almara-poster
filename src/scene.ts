import { Framebuffer, color, hash, mix } from './framebuffer.ts';
import { Draw } from './draw.ts';
import type { Point } from './draw.ts';
import { title, subtitle } from './glyphs.ts';

const cream = color('#fdf1d8');
const gold = color('#ffc48f');
const ink = color('#2b1a33');
const stone = color('#30203f');
const warm = color('#ffd59b');
const waterline = 640;

function lantern(d: Draw, x: number, y: number, scale = 1): void {
  d.glow(x,y,26*scale,35*scale,color('#f4a05f'),0.17);
  d.glow(x,y,13*scale,18*scale,color('#ffc47c'),0.25);
  d.line([[x,y-15*scale],[x,y-9*scale]],0.8*scale,ink);
  d.polygon([[x-4*scale,y-7*scale],[x,y-10*scale],[x+4*scale,y-7*scale]],ink);
  d.rect(x-3*scale,y-6*scale,6*scale,11*scale,color('#f5ac66'));
  d.rect(x-1.7*scale,y-4*scale,3.4*scale,7*scale,color('#ffe7b5'));
  d.line([[x-3*scale,y-6*scale],[x-3*scale,y+5*scale],[x+3*scale,y+5*scale],[x+3*scale,y-6*scale]],0.85*scale,ink);
  d.line([[x,y-6*scale],[x,y+5*scale]],0.6*scale,ink,0.8);
}

function gateway(d: Draw): void {
  // Construct only the left half: the exterior is exactly symmetric by reflection.
  const left: Point[] = [[322,640],[341,607],[357,440]];
  for (let j = 0; j <= 64; j++) {
    const t = Math.PI + j / 64 * Math.PI / 2;
    left.push([512+155*Math.cos(t),440+120*Math.sin(t)]);
  }
  left[left.length-1] = [512,320];
  const silhouette: Point[] = [...left,...left.slice(0,-1).reverse().map(([x,y]): Point => [1024-x,y])];
  const holeLeft: Point[] = [[440,640],[440,446]];
  for (let j = 0; j <= 48; j++) {
    const t = Math.PI + j / 48 * Math.PI / 2;
    holeLeft.push([512+72*Math.cos(t),446+72*Math.sin(t)]);
  }
  holeLeft[holeLeft.length-1] = [512,374];
  const opening = [...holeLeft,...holeLeft.slice(0,-1).reverse().map(([x,y]): Point => [1024-x,y])];
  d.gradientShape([opening],374,640,[[0,color('#33263e')],[0.55,color('#493247')],[0.84,color('#72505b')],[1,color('#b07966')]]);
  d.shape([silhouette,opening],stone);
  d.line(silhouette,2,gold,0.48);
  d.line(left,2.6,gold,0.82);
  d.line(holeLeft,2.1,gold,0.66);
  for (let j = 1; j < 14; j++) {
    const t = Math.PI + j / 14 * Math.PI;
    d.line([[512+79*Math.cos(t),446+79*Math.sin(t)],[512+150*Math.cos(t),440+115*Math.sin(t)]],1.4,color('#20172e'),0.64);
  }
  for (let j = 0; j < 5; j++) {
    const y = 472+j*35;
    const x = 357-(y-440)*16/167;
    d.line([[x+3,y],[438,y+1]],1.2,color('#20172e'),0.65);
    d.line([[586,y+1],[1021-x,y]],1.2,color('#20172e'),0.65);
    d.line([[x+8,y+2],[422,y+3]],0.7,gold,0.14);
  }
  // Warm light at the sill promises a passage, rather than a flat decorative panel.
  d.glow(512,630,70,46,color('#e99554'),0.40);
  d.glow(512,636,58,21,color('#ffd69c'),0.34);
  d.line([[443,629],[451,632],[573,632],[581,629]],0.9,gold,0.52);
  d.line([[441,638],[583,638]],1.5,color('#ffe1a8'),0.95);
  lantern(d,449,511,0.67);
  lantern(d,575,511,0.67);
  lantern(d,448,581,0.75);
  lantern(d,576,581,0.75);
}

function headland(d: Draw): void {
  const land = color('#51405c');
  d.polygon([[667,612],[710,601],[758,586],[808,584],[851,572],[894,577],[939,584],[998,565],[998,637],[667,637]],land);
  for (let j = 0; j < 16; j++) {
    const x = 735+j*16;
    const base = 588-(j>6?6:0), h = 13+hash(j,40)*25, w = 4+hash(j,41)*4;
    d.rect(x,base-h,w,h+11,land);
    d.polygon([[x-1,base-h],[x+w/2,base-h-8-hash(j,42)*9],[x+w+1,base-h]],land);
    if (j%3===0) d.rect(x+w/2-1,base-h+7,2,3,color('#ffd69a'),0.90);
  }
}

function boats(d: Draw): void {
  for (const [x,y,s] of [[185,686,12],[289,663,7],[128,745,8]]) {
    const hull: Point[] = [[x-s,y],[x+s,y],[x+s*0.55,y+s*0.23],[x-s*0.55,y+s*0.23]];
    const sail: Point[] = [[x-1,y-s*1.7],[x-s*0.65,y-2],[x-1,y-3]];
    // Draw the inverted boat in separated scan strips, squashed to 55% height.
    const reflected = [hull,sail,[[x-0.5,y],[x+0.5,y],[x+0.5,y-s*1.85],[x-0.5,y-s*1.85]] as Point[]];
    for (let row = 0; row < Math.ceil(s*1.04); row++) {
      if (row%4===2) continue;
      const sample = y-row/0.55;
      const shift = Math.sin((y+row)*0.26)*0.7;
      for (const path of reflected) {
        const crossings: number[] = [];
        for (let j = 0; j < path.length; j++) {
          const a = path[j], b = path[(j+1)%path.length];
          if ((a[1]<=sample&&b[1]>sample)||(b[1]<=sample&&a[1]>sample)) crossings.push(a[0]+(sample-a[1])/(b[1]-a[1])*(b[0]-a[0]));
        }
        crossings.sort((a,b)=>a-b);
        for (let j=0;j+1<crossings.length;j+=2) d.rect(crossings[j]+shift,y+3+row,crossings[j+1]-crossings[j],0.8,color('#423044'),0.32);
      }
    }
    d.polygon(hull,ink);
    d.line([[x,y],[x,y-s*1.85]],0.9,ink);
    d.polygon(sail,cream,0.8);
    d.line([[x-s,y+2],[x-s*2.5,y+5]],0.7,gold,0.48);
    d.line([[x+s,y+2],[x+s*2.5,y+5]],0.7,gold,0.48);
  }
}

function lagoon(d: Draw, source: Uint8Array): void {
  d.gradient(640,998,[[0,color('#b88b83')],[0.4,color('#936a80')],[0.8,color('#67506f')],[1,color('#473651')]]);
  // Reflection begins at exactly the footings, with displacement ramping from zero.
  boats(d);
  for (let y=1920;y<2994;y++) {
    const py=(y+0.5)/3, depth=py-waterline;
    const sy=Math.max(78,Math.floor((waterline-depth*0.92)*3)-1);
    const displacement=(Math.sin(py*0.26)+Math.sin(py*0.77)*0.35)*Math.min(1,depth/24)*(0.6+depth*0.007);
    for (let x=78;x<2994;x++) {
      const sx=Math.max(84,Math.min(2987,Math.round(x+displacement*3)));
      const c: [number,number,number]=[0,0,0];
      for (let k=0;k<3;k++) {
        for (const dx of [-3,0,3]) c[k]+=source[(sy*3072+sx+dx)*3+k]/3;
        c[k]*=0.71;
      }
      const nearStone=x/3>=322&&x/3<=702;
      d.fb.blend(x,y,c,(nearStone?0.80:0.40)-depth/358*0.15);
    }
  }
  for (let j=0;j<34;j++) {
    const t=j/33,y=646+Math.pow(t,1.6)*345;
    const start=50+hash(j,91)*700;
    d.line([[start,y],[start+38+hash(j,92)*120,y]],0.5+t*0.65,cream,0.10+hash(j,93)*0.10);
    if(j%3===0) d.line([[354,y+2],[669,y+2]],0.8,color('#6d5269'),0.26);
  }
  // The diagonal light ladder follows open water to the right of the gate's shadow.
  for (let j=0;j<70;j++) {
    const t=j/69,y=646+Math.pow(t,1.22)*332;
    const axis=752+64*t,half=50+80*t;
    const x=axis+(hash(j,101)-0.5)*half*2;
    const len=8+hash(j,102)*(23+32*t);
    const opacity=(0.73-0.34*t)*(0.58+0.42*hash(j,103));
    d.line([[x-len/2,y],[x+len/2,y]],0.85+hash(j,104)*1.4,mix(gold,cream,0.25+hash(j,105)*0.5),opacity);
    if(j%3===0) d.line([[axis-half*0.5,y+1.9],[axis-half*0.5+len*0.55,y+1.9]],0.7,gold,opacity*0.55);
  }
  for (let k=0;k<7;k++) {
    d.rect(319,640+k,126,1,color('#20162b'),0.56*(1-k/8));
    d.rect(579,640+k,126,1,color('#20162b'),0.56*(1-k/8));
  }
  for(const y of [643,647,651,656]) {
    d.line([[307,y],[346,y]],0.9,gold,0.35);
    d.line([[421,y+1],[450,y+1]],0.8,gold,0.28);
    d.line([[576,y+1],[606,y+1]],0.8,gold,0.28);
    d.line([[681,y],[722,y]],0.9,gold,0.35);
  }
}

function baluster(d: Draw, x: number, y: number, height: number): void {
  const profile: Point[]=[[x-10,y],[x+10,y],[x+10,y+7],[x+5,y+12],[x+5,y+height*0.28],[x+10,y+height*0.43],[x+9,y+height*0.57],[x+4,y+height*0.72],[x+5,y+height-10],[x+11,y+height-5],[x+11,y+height],[x-11,y+height],[x-11,y+height-5],[x-5,y+height-10],[x-4,y+height*0.72],[x-9,y+height*0.57],[x-10,y+height*0.43],[x-5,y+height*0.28],[x-5,y+12],[x-10,y+7]];
  d.polygon(profile,ink);
  d.line([[x-8,y+8],[x-4,y+17],[x-4,y+height*0.28],[x-8,y+height*0.43]],0.7,gold,0.18);
}

function visitors(d: Draw): void {
  // Distinct arms and shoulders, separated bodies, and hats seen from behind.
  d.polygon([[318,813],[328,806],[342,806],[353,814],[362,838],[350,850],[344,842],[349,834],[344,825],[345,879],[326,879],[325,826],[320,841],[310,847],[302,842],[315,833]],color('#241529'));
  d.ellipse(336,797,8,11,color('#241529'));
  d.ellipse(335,792,22,4.3,color('#241529'));
  d.polygon([[325,791],[327,778],[341,778],[346,791]],color('#241529'));
  d.line([[315,790],[328,788],[347,791],[355,793]],2,gold,0.71);
  d.curve([319,813],[325,806],[331,807],2.1,gold,0.56);
  d.line([[327,878],[326,891]],5,color('#241529'));
  d.line([[340,878],[343,891]],5,color('#241529'));

  d.ellipse(392,813,7.6,10,color('#25162b'));
  d.polygon([[383,805],[387,800],[397,801],[401,808],[400,817],[384,816]],color('#25162b'));
  d.polygon([[379,824],[387,820],[397,820],[406,826],[414,842],[427,845],[424,851],[407,848],[400,837],[403,883],[382,883],[382,837],[376,849],[363,852],[360,847],[371,841]],color('#25162b'));
  d.curve([379,825],[386,819],[393,821],2,gold,0.55);
  d.line([[384,805],[390,801],[398,803]],1.6,gold,0.45);
  d.line([[386,882],[385,895]],4,color('#25162b'));
  d.line([[398,882],[401,895]],4,color('#25162b'));
}

function terrace(d: Draw): void {
  // The low, receding parapet creates an occupied viewpoint, cropped by the frame.
  d.polygon([[26,967],[720,980],[806,998],[26,998]],ink);
  d.polygon([[26,943],[731,972],[790,989],[26,975]],color('#35203c'));
  for(let j=0;j<9;j++) {
    const x=48+j*79,top=854+(x-26)*0.047;
    baluster(d,x,top,91-(x-26)*0.026);
  }
  d.polygon([[26,840],[723,873],[778,891],[778,902],[26,862]],ink);
  d.line([[26,840],[723,873],[778,891]],2.2,gold,0.75);
  d.line([[27,858],[721,891],[776,903]],0.8,color('#a66e6b'),0.45);
  d.polygon([[26,940],[732,968],[791,985],[791,994],[26,960]],ink);
  d.line([[26,940],[731,968],[790,985]],1.2,gold,0.27);

  // An empty chair and a small round table: enough detail to suggest a quiet stay.
  d.curve([212,958],[199,895],[212,873],3.5,ink);
  d.curve([243,961],[253,901],[243,876],3.5,ink);
  d.curve([212,874],[228,864],[244,877],3.5,ink);
  d.line([[215,885],[239,887]],2,ink);
  d.line([[216,895],[239,897]],2,ink);
  d.line([[214,923],[244,925]],5,ink);
  d.line([[215,924],[207,974]],3.2,ink);
  d.line([[241,925],[250,975]],3.2,ink);
  d.ellipse(144,908,48,8,ink);
  d.curve([98,907],[145,896],[189,909],1.5,gold,0.42);
  d.line([[144,915],[144,981]],5,ink);
  d.line([[144,979],[119,990]],3,ink);
  d.line([[144,979],[165,990]],3,ink);
  lantern(d,135,890,1.04);
  d.line([[160,887],[170,887],[168,898],[162,898],[160,887]],0.9,cream,0.65);
  d.line([[165,898],[165,904],[161,904],[169,904]],0.8,cream,0.65);
  d.line([[162,893],[168,893]],0.8,gold,0.75);
  visitors(d);

  // Only the frame-edge flowers carry a saturated hue.
  for(const branch of [0,1]) {
    const y=branch===0?835:933;
    d.curve([20,y],[45,y-61],[100,y-78],3.4,color('#3b2440'));
    d.curve([27,y-20],[36,y-75],[19,y-110],2.3,color('#3b2440'));
    for(let j=0;j<7;j++) {
      const x=27+j*10,yb=y-35-j*7;
      d.polygon([[x,yb],[x+12,yb-13],[x+18,yb-14],[x+11,yb-3]],color('#483345'));
      if(j%2===0) d.polygon([[x-2,yb],[x-12,yb-10],[x-16,yb-9],[x-10,yb]],color('#483345'));
      for(let k=0;k<4;k++) {
        const fx=x+(hash(j+branch*9,k)-0.5)*15;
        const fy=yb-13+(hash(k,j+branch*8)-0.5)*12;
        d.polygon([[fx,fy-4],[fx+4,fy-1],[fx+3,fy+3],[fx-1,fy+4],[fx-4,fy]],mix(color('#a43e69'),color('#d46d89'),hash(j,k)),0.94);
      }
    }
  }
}

export function renderScene(): Uint8Array {
  const fb=new Framebuffer(color('#f3e7cf'));
  const d=new Draw(fb);
  d.gradient(26,640,[[0,color('#2a1f45')],[0.22,color('#493052')],[0.40,color('#6b3c5e')],[0.57,color('#974967')],[0.73,color('#c26179')],[0.93,color('#ffb271')],[1,color('#e6b18c')]]);
  d.glow(492,578,351,306,color('#ee9b78'),0.26);
  d.glow(492,578,263,245,color('#ffc689'),0.21);
  d.ellipse(492,578,196,196,color('#ffe0ac'));
  d.glow(492,578,222,222,color('#ffe4ad'),0.12);
  for(let y=569;y<640;y++) d.rect(26,y,972,1,color('#ffe0ad'),Math.exp(-Math.pow((y-618)/28,2))*0.21);
  headland(d);
  gateway(d);
  const source=fb.data.slice();
  lagoon(d,source);
  for(const [x,y,s] of [[738,307,9],[775,292,6],[263,352,7]]) {
    d.curve([x-s,y],[x-s*0.45,y-4],[x,y],1.1,stone,0.6);
    d.curve([x,y],[x+s*0.4,y-4],[x+s,y+1],1.1,stone,0.6);
  }
  title(d,'ALMARA',197,132,color('#23182f'),0.19);
  title(d,'ALMARA',193,132,cream);
  subtitle(d,'THE GATE OF THE MIRROR SEA',239,26,cream,0.80);
  terrace(d);
  d.line([[38,38],[986,38],[986,986],[38,986],[38,38]],1.5,cream,0.63);
  return fb.finish();
}
