export const parts=['Front wing','Nose','Sidepods','Rear wing'];
export const nx=12,ny=10;
export const blank=()=>({cuts:parts.map(()=>Array(nx*ny).fill(0)),angles:[6,8]});
export function valid(s){return !!s&&Array.isArray(s.angles)&&s.angles.length===2&&s.angles.every(x=>Number.isInteger(x)&&x>=0&&x<=18)&&Array.isArray(s.cuts)&&s.cuts.length===4&&s.cuts.every((a,p)=>Array.isArray(a)&&a.length===nx*ny&&a.every((x,i)=>Number.isInteger(x)&&x>=0&&x<=12&&(p===2||x===a[Math.floor(i/ny)*ny+ny-1-i%ny])));}
export function aero(s){
 const avg=a=>a.reduce((v,n)=>v+n,0)/a.length;
 const cut=s.cuts.map(a=>avg(a)/12);
 const wings=[0,3].map((p,j)=>{
 let load=0,drag=0;
 for(let y=0;y<ny;y++){
 const h=Array.from({length:nx},(_,x)=>s.cuts[p][x*ny+y]/12);
 const camber=(h[0]+h[nx-1])/2-avg(h.slice(3,9));
 const angle=s.angles[j]+3+7*(h[nx-1]-h[0])+5*camber;
 const cl=Math.max(-.2,Math.min(angle,16)*.09-Math.max(0,angle-16)*.085);
 const rough=avg(h.slice(1).map((v,i)=>Math.abs(v-h[i])));
 load+=cl/ny;drag+=(.07+.13*cl*cl+.028*Math.max(0,angle-16)+.14*rough-.03*avg(h))/ny;
 }return {load,drag};});
 const taper=s.cuts[2].slice(-4*ny).reduce((a,b)=>a+b,0)/(4*ny*12);
 const noseSlope=s.cuts[1].slice(ny).reduce((a,v,i)=>a+Math.abs(v-s.cuts[1][i]),0)/(11*ny*12);
 return {front:.0032*wings[0].load,rear:.0036*wings[1].load*(1+.17*taper-.23*cut[2]),drag:.0034+.025*(wings[0].drag+wings[1].drag)-.00022*cut[1]-.00026*cut[2]+.00018*noseSlope,ballast:cut.reduce((a,v,i)=>a+v*[5,9,14,6][i],0)};
}
// Control points are in tabletop metres. Each bend rounds off a fraction of
// its shorter adjacent leg, leaving the rest of each straight genuinely flat.
const layouts = [
 ['Harbour Steps','Street circuit',.24, [[0,0],[2.8,0],[2.8,.7],[4.2,.7],[4.2,1.5],[3,1.5],[3,2.1],[4.2,2.1],[4.2,3],[1.8,3],[1.8,2.35],[.6,2.35],[.6,1.77],[2,1.77],[2,1.18],[0,1.18]]],
 ['Spool Circuit','Twin hairpins',.45, [[0,0],[8,0],[8,1.5],[2.3,1.5],[2.3,3.5],[7,3.5],[7,4.5],[0,4.5]]],
 ['Walnut Esses','Linked esses',.46, [[0,0],[2,0],[3,1.1],[4.3,.1],[5.6,1.2],[7,.1],[9,.6],[9,3],[6.5,3.4],[5,2.4],[3.5,3.5],[2.2,2.4],[0,3]]],
 ['Drafting Loop','Triangular speedway',.38, [[0,0],[12,.5],[9,4.3]]],
 ['Cedar Crest','Double apex',.36, [[0,0],[6,-.8],[8,0],[8,1.8],[6.4,2.4],[7.4,3.6],[6,4.8],[3.8,4.2],[2.8,2.5],[0,2]]],
 ['Tinplate Ring','Short oval',.5, [[0,0],[4,0],[5.5,.8],[5.5,2],[4,2.8],[0,2.8],[-1.5,2],[-1.5,.8]]],
 ['Pencil Mill','Industrial circuit',.22, [[0,0],[6,0],[6,1],[4.7,1],[4.7,2],[6.5,2],[6.5,4],[3.4,4],[3.4,2.8],[1.7,2.8],[1.7,4],[0,4]]],
 ['Oak Switchback','Switchbacks',.41, [[0,0],[6,0],[6,.8],[1.2,.8],[1.2,1.7],[6,1.7],[6,2.6],[1.2,2.6],[1.2,3.6],[6.5,3.6],[6.5,4.8],[0,4.8]]],
 ['Bobbin Park','Parkland sweepers',.48, [[0,0],[3,-1],[6,0],[8.2,2.4],[7,4.5],[4,5],[4.6,2.9],[2.4,2.1],[.6,3],[-1,1.8]]],
 ['Beech Hollow','Keyhole',.45, [[0,0],[5,0],[5.8,-1.5],[8,-1.6],[9,0],[8,1.8],[5.8,1.8],[5,1],[0,1]]],
 ['Plywood Sprint','Stop and go',.25, [[0,0],[9,0],[9,2],[6,2],[5.5,1.4],[4.7,1.4],[4.7,3.5],[0,3.5]]],
 ['Inkpot Lane','Old town',.27, [[0,0],[2,-.7],[3.1,-.1],[3.7,-.7],[5,-.5],[5,1.3],[3.7,1.3],[3.7,2.5],[2.6,2.5],[2.6,3.4],[.6,3.4],[-.6,2],[.6,1.2]]],
 ['Copper Curve','Crescent',.48, [[0,0],[2,-1.5],[5,-2],[8,-1],[9,1],[7,3.4],[5.8,3.6],[6.7,1.3],[5,.2],[3,.4],[1.2,2]]],
 ['Ash Valley','Technical infield',.36, [[0,0],[7,0],[8,2],[7,4],[5,4],[5.5,1.7],[4,1.3],[3.4,3.2],[1.5,3.8],[-.7,2.6]]],
 ['Ruler Straight','Drag strip loop',.46, [[0,0],[20,0],[20,2.2],[1.2,2.2],[-.8,1.7],[-.9,.7]]],
 ['Birch Bowl','Broad oval',.49, [[0,0],[6,-1],[9,.5],[10,3],[8,5.2],[2,6],[0,4.2],[-1,2]]],
 ['Sawdust Point','Chicane circuit',.28, [[0,0],[4,0],[4.8,.85],[5.7,0],[9,0],[9,3.5],[7,3.5],[6.4,2.7],[5.6,3.5],[0,3.5]]],
 ['Threadneedle','Narrow esses',.4, [[0,0],[2,-.6],[3,.1],[3.7,-.7],[5,.2],[5.5,1.6],[4.1,2.3],[2.7,1.5],[2,2.4],[1.2,1.6],[0,2.1]]],
 ['End Grain','Perimeter circuit',.26, [[0,0],[8,0],[8,2.5],[6.8,3.7],[2,3.7],[0,2.4]]],
 ['The Long Table','Endurance circuit',.38, [[0,0],[15,0],[16.2,1.6],[15,3],[12,3],[11,2],[9.5,2],[9,4.3],[6.5,4.8],[4.5,3.2],[2,4],[0,3]]]
];
export const names=layouts.map(layout=>layout[0]);
export const profiles=layouts.map(layout=>layout[1]);
const paths=new Map();
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
export function circuit(id){
 if(paths.has(id))return paths.get(id);
 const [, ,round,vertices]=layouts[id],n=vertices.length;
 const corners=vertices.map((vertex,i)=>{
  const prev=vertices[(i+n-1)%n],next=vertices[(i+1)%n];
  const trim=round*Math.min(distance(prev,vertex),distance(next,vertex));
  return {vertex,entry:mix(vertex,prev,trim/distance(prev,vertex)),exit:mix(vertex,next,trim/distance(vertex,next))};
 });
 const points=[];
 for(let i=0;i<n;i++){
  const current=corners[i],next=corners[(i+1)%n];
  const steps=Math.ceil(distance(current.exit,next.entry)/.09);
  for(let j=0;j<steps;j++)points.push(mix(current.exit,next.entry,j/steps));
  const bendSteps=Math.max(8,Math.ceil((distance(next.entry,next.vertex)+distance(next.vertex,next.exit))/.07));
  for(let j=0;j<bendSteps;j++){const t=j/bendSteps;points.push(mix(mix(next.entry,next.vertex,t),mix(next.vertex,next.exit,t),t));}
 }
 paths.set(id,points);return points;
}
export function lap(s,id){
 const p=circuit(id),n=p.length,a=aero(s),dist=p.map((v,i)=>Math.hypot(v[0]-p[(i+1)%n][0],v[1]-p[(i+1)%n][1]));
 const v=p.map((b,i)=>{const prev=p[(i+n-1)%n],next=p[(i+1)%n],u=Math.atan2(b[1]-prev[1],b[0]-prev[0]),w=Math.atan2(next[1]-b[1],next[0]-b[0]),curv=Math.abs(Math.atan2(Math.sin(w-u),Math.cos(w-u)))/((dist[i]+dist[(i+n-1)%n])/2);
 return Math.sqrt(9.2/Math.max(.04,curv-2*Math.min(a.front/.44,a.rear/.56)/.18));});
 for(let k=0;k<3;k++){
 for(let i=0;i<n;i++){const j=(i+1)%n,acc=(Math.min(1.25,7/Math.max(.1,v[i]))-a.drag*v[i]**2)/.18;v[j]=Math.min(v[j],Math.sqrt(Math.max(1,v[i]**2+2*acc*dist[i])));}
 for(let i=n-1;i>=0;i--){const j=(i+1)%n;v[i]=Math.min(v[i],Math.sqrt(v[j]**2+2*10*dist[i]));}}
 const time=[0];for(let i=0;i<n;i++)time.push(time[i]+2*dist[i]/(v[i]+v[(i+1)%n]));
 return {p,v,time,total:time[n],length:dist.reduce((a,b)=>a+b)};
}
