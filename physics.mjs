export const parts=['Front wing','Nose','Sidepods','Rear wing'];
export const names=['Maple Bend','Spool Circuit','Walnut Esses','Drafting Loop','Cedar Crest','Tinplate Ring','Pencil Mill','Oak Switchback','Bobbin Park','Beech Hollow','Plywood Sprint','Inkpot Lane','Copper Curve','Ash Valley','Ruler Straight','Birch Bowl','Sawdust Point','Threadneedle','End Grain','The Long Table'];
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
 load+=cl/ny;drag+=(.07+.13*cl*cl+.14*rough-.03*avg(h))/ny;
 }return {load,drag};});
 const taper=s.cuts[2].slice(-4*ny).reduce((a,b)=>a+b,0)/(4*ny*12);
 const noseSlope=s.cuts[1].slice(ny).reduce((a,v,i)=>a+Math.abs(v-s.cuts[1][i]),0)/(11*ny*12);
 return {front:.0032*wings[0].load,rear:.0036*wings[1].load*(1+.17*taper-.23*cut[2]),drag:.0034+.0019*(wings[0].drag+wings[1].drag)-.00022*cut[1]-.00026*cut[2]+.00018*noseSlope,ballast:cut.reduce((a,v,i)=>a+v*[5,9,14,6][i],0)};
}
export function circuit(id){
 const pts=[],n=180,stretch=1.2+(id%5)*.13;
 for(let i=0;i<n;i++){const t=2*Math.PI*i/n,r=1+.19*Math.cos(3*t+id*.71)+.095*Math.sin((2+id%4)*t+.5)+.06*Math.cos(5*t+id);
 pts.push([Math.cos(t)*r*stretch*2.6,Math.sin(t)*r*2.6]);}return pts;
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
