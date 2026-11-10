function makeRenderer(canvas){
 let yaw=-.68,pitch=.54,faces=[],hits=[],project,scale;
 const ctx=canvas.getContext('2d');
 function fit(){const b=canvas.getBoundingClientRect(),d=Math.min(2,devicePixelRatio);canvas.width=Math.max(1,Math.round(b.width*d));canvas.height=Math.max(1,Math.round(b.height*d));ctx.setTransform(d,0,0,d,0,0);return b;}
 function face(vertices,color,edge='',hit=null){const pts=vertices.map(project);faces.push({pts,color,edge,hit,z:pts.reduce((a,v)=>a+v[2],0)/pts.length});}
 function ringBody(sections,colors){
 const rings=sections.map(([x,w,z,h])=>[[x,-w,z],[x,-w,z+h*.6],[x,-w*.70,z+h],[x,w*.70,z+h],[x,w,z+h*.6],[x,w,z]]);
 for(let i=0;i<rings.length-1;i++)for(let j=0;j<6;j++)face([rings[i][j],rings[i+1][j],rings[i+1][(j+1)%6],rings[i][(j+1)%6]],colors[j%colors.length]);
 face(rings[0],colors[0]);face(rings.at(-1),colors[0]);}
 function tube(x,y,z,r,w,colors,axis=1){
 const n=24,pt=(t,side)=>[x+r*Math.cos(t),y+side*w/2,z+r*Math.sin(t)];
 const rings=[-1,1].map(s=>Array.from({length:n},(_,i)=>pt(i*2*Math.PI/n,s)));
 for(let i=0;i<n;i++)face([rings[0][i],rings[1][i],rings[1][(i+1)%n],rings[0][(i+1)%n]],colors[i%colors.length]);
 for(let j=0;j<2;j++)face(rings[j],colors[0]);}
 function carved(s,p,side=1){
 const palettes=[['#ca904b','#ce9450','#ca8e48'],['#dba55e','#dfa961','#dba35d'],['#c28c4f','#c89052','#c68d4d'],['#ce995c','#d29b5d','#ce9555'],['#ab7849','#b78350','#b17e4b']];
 function pt(i,j,bottom=false){const u=i/nx,v=2*j/ny-1,ix=Math.min(nx-1,i),iy=Math.min(ny-1,j),cut=s.cuts[p][ix*ny+iy]/12;
 if(p===0||p===3){const rear=p===3,ang=s.angles[rear?1:0]*Math.PI/180;return [(rear?2.04:-2.9)+u*.76,v*(rear?1.13:1.38)*spanFraction(s,p,ix), (rear?1.16:[.23,.35,.47][s.height])+u*Math.sin(ang)*.76+(bottom?-.14:.06*Math.sin(u*Math.PI)-cut*.115)];}
 if(p===4)return [.40+u*1.8,v*.76,bottom?.27:.085+.15*cut];
 if(p===1)return [-2.63+1.98*u,v*(.14+.25*u)*(1-.16*cut),bottom?.37:.55+.37*u-.12*v*v-.13*cut];
 const width=.55+.32*Math.sin(u*Math.PI)-.26*u-.18*cut;
 return [-.88+2.55*u,side*(.40+(v+1)/2*width),bottom?.29:.63+.22*Math.sin(Math.PI*u)-.08*v-.15*cut];}
 for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){let a=pt(i,j),b=pt(i+1,j),c=pt(i+1,j+1),d=pt(i,j+1),hit={p,i,j};let col=palettes[p][(Math.floor(j/2)+Math.floor(i/7))%3];
 face([a,b,c,d],col,col,hit);
 for(const [test,v,w,ib,jb,ic,jc] of [[i===0,a,d,i,j,i,j+1],[i===nx-1,b,c,i+1,j,i+1,j+1],[j===0,a,b,i,j,i+1,j],[j===ny-1,d,c,i,j+1,i+1,j+1]])if(test)face([v,w,pt(ic,jc,true),pt(ib,jb,true)],'#a97440','',hit);
 }}
 function draw(s,tool){let {width:w,height:h}=fit();if(w<5)return;faces=[];hits=[];scale=Math.min(w/7.6,h/4.8);
 project=([x,y,z])=>{let xx=x*Math.cos(yaw)-y*Math.sin(yaw),yy=x*Math.sin(yaw)+y*Math.cos(yaw);return [w*.5+scale*xx,h*.61+scale*(yy*Math.sin(pitch)-z*Math.cos(pitch)),yy*Math.cos(pitch)+z*Math.sin(pitch)];};
 const shadow=project([0,0,0]);ctx.save();ctx.translate(shadow[0],shadow[1]);ctx.rotate(-.22);ctx.scale(1,.35);ctx.fillStyle='#47543826';ctx.beginPath();ctx.ellipse(0,0,scale*3.1,scale*1.85,0,0,Math.PI*2);ctx.fill();ctx.restore();
 ringBody([[-2.55,.14,.3,.17],[-.75,.49,.26,.56],[.55,.49,.25,.62],[2.22,.28,.31,.3]],['#ae7945','#bf894f','#dcae73','#c18c50','#b98348','#956738']);
 ringBody([[.36,.4,.65,.23],[.71,.43,.6,.72],[1.46,.27,.54,.52],[2.18,.15,.46,.28]],['#ba8349','#d49d5c','#e6b77a','#d7a566']);
 ringBody([[-.64,.29,.76,.07],[-.38,.36,.75,.15],[.38,.33,.78,.16],[.57,.18,.8,.09]],['#6e5137','#433d31','#34392f','#705337']);
 for(let x of [-1.8,1.65]){tube(x,0,.45,.075,2.5,['#735638']);for(let sign of [-1,1]){let y=sign*1.15,r=x>0?.52:.46;
 tube(x,y,r,r,.46,['#353c34','#3a4037','#3e443b']);tube(x,y+sign*.236,r,r*.73,.018,['#282f28']);tube(x,y+sign*.252,r,r*.43,.024,['#b29260']);tube(x,y+sign*.274,r,r*.19,.027,['#535644']);}}
 for(let side of [-1,1]){carved(s,2,side);ringBody([[2.12,.04,.57,.61],[2.29,.04,.57,.61]],['#98693e']);}
 carved(s,1);carved(s,0);carved(s,3);carved(s,4);
 if(s.gurney){
  const top=1.16+.76*Math.sin(s.angles[1]*Math.PI/180),width=1.13*spanFraction(s,3,nx-1);
  for(let j=0;j<ny;j++){
   const y=k=>width*(2*k/ny-1);
   const z=k=>top-.115*s.cuts[3][(nx-1)*ny+Math.min(k,ny-1)]/12;
   face([[2.8,y(j),z(j)],[2.8,y(j+1),z(j+1)],[2.8,y(j+1),z(j+1)+.09],[2.8,y(j),z(j)+.09]],'#956738');
  }
 }
 faces.sort((a,b)=>a.z-b.z);for(let f of faces){ctx.beginPath();f.pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=f.color;ctx.fill();
 if(f.hit){
  const {p,i,j}=f.hit,depth=s.cuts[p][i*ny+j];
  if(s.wood==='Ash'||s.wood==='Birch'){
   ctx.fillStyle=s.wood==='Ash'?'rgba(105,61,30,.34)':'rgba(255,245,208,.52)';ctx.fill();
  }
  if(depth){ctx.fillStyle='rgba(100,53,20,'+Math.min(.49,.15+.032*depth)+')';ctx.fill();}
  if(tool?.part===p){
   ctx.fillStyle='rgba(255,221,120,.24)';ctx.fill();
   const h=tool.hover;
   if(h?.p===p){
    const dy=p===2?Math.abs(j-h.j):Math.min(Math.abs(j-h.j),Math.abs(ny-1-j-h.j));
    if(Math.hypot(i-h.i,dy)<=tool.radius){ctx.fillStyle='rgba(51,100,83,.6)';ctx.fill();}
   }
  }
 }if(f.edge){ctx.strokeStyle=f.edge;ctx.lineWidth=.6;ctx.stroke();}hits.push(f);}
 }
 function pick(x,y){for(let k=hits.length-1;k>=0;k--){let f=hits[k],inside=false;for(let i=0,j=f.pts.length-1;i<f.pts.length;j=i++){let a=f.pts[i],b=f.pts[j];if((a[1]>y)!=(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}if(inside)return f.hit;}return null;}
 return {draw,pick,turn(dx,dy){yaw+=dx*.011;pitch=Math.max(-1.57,Math.min(1.57,pitch+dy*.009));},view(v){[yaw,pitch]=({Underside:[0,-1.57],Top:[0,1.57],Side:[0,.05],Front:[Math.PI/2,.12],Isometric:[-.68,.54]})[v];}};
}
