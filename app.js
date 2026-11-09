const $=id=>document.getElementById(id),txt=(id,t)=>$(id).textContent=t,fmt=t=>t.toFixed(3)+' s';
const data=JSON.parse(localStorage.getItem('tf.workshop.1')||'{}'),save=()=>localStorage.setItem('tf.workshop.1',JSON.stringify(data));
// Course revisions invalidate lap times while preserving each wooden setup.
if(data.courseVersion!==2){
 for(let i=0;i<names.length;i++){if(data[i]){delete data[i].best;delete data[i].ghost;}}
 data.courseVersion=2;
 save();
}
let id=Number(data.track)||0,part=0,mode='chisel',history=[],drag=null,tab='shop',race=null,rate=1,frame=0;
const car=$('car'),renderer=makeRenderer(car);
function setup(){const rec=data[id]??={};if(!valid(rec.s))rec.s=blank();return rec.s;}
function message(t){txt('status',t);}
let hover=null;
const hints=[
 'Front wing shape changes front tyre load. A cut near the leading edge can have a different effect from one near the trailing edge.',
 'The nose contributes to drag. A gradual taper can lower drag, while abrupt steps can add it back.',
 'Sidepod cuts change body drag and the airflow reaching the rear wing. Watch rear downforce as you shape the tail.',
 'Rear wing shape changes rear tyre load. Removing wood from different parts of the profile can raise or lower downforce.'
];
const stockAero=aero(blank());
function updateAero(){
 const current=aero(setup());
 for(const key of ['drag','front','rear']){
  const delta=(current[key]/stockAero[key]-1)*100;
  const value=Math.abs(delta)<.000001?'0%':(delta>0?'+':'−')+(Math.abs(delta)<.01?'<0.01':Math.abs(delta).toFixed(2))+'%';
  txt(key+'Delta',value);
 }
}
function drawCar(){
 renderer.draw(setup(),mode==='chisel'?{part,hover,radius:Number($('blade').value)*.65}:null);
}
const knifeMarkup=$('chisel').querySelector('svg').outerHTML;
const knifeCursor='url("data:image/svg+xml,'+encodeURIComponent(knifeMarkup)+'") 2 29, crosshair';
car.style.cursor=knifeCursor;
function updateCue(){
 txt('cutCue',mode==='orbit'?'Drag to rotate the car.':'Drag the knife over the gold '+parts[part].toLowerCase()+'.');
}
function choosePart(p){hover=null;txt('partHint',hints[p]);part=p;Array.from($('parts').children).forEach((b,i)=>b.classList.toggle('chosen',i===p));updateCue();if(tab==='shop')drawCar();}
parts.forEach((p,i)=>{let b=document.createElement('button');b.textContent=p;b.onclick=()=>choosePart(i);$('parts').append(b);});choosePart(0);
const widths=['Fine','Medium','Wide','Extra wide'];
function updateWidth(){
 const size=Number($('blade').value);
 txt('widthName',widths[size-1]);
 $('blade').setAttribute('aria-valuetext',widths[size-1]);
 $('widthSample').style.setProperty('--sample',(size*5)+'px');
}
$('blade').oninput=()=>{updateWidth();drawCar();};
updateWidth();
function selectCircuit(next){
 if(id!==next){history=[];race=null;}
 id=next;
 data.track=id;
 switchTab('shop');
 save();
 message('Drag the chisel across the selected surface.');
 window.scrollTo(0,0);
}
const cards=names.map((name,i)=>{
 const button=document.createElement('button');
 button.className='trackCard';
 button.setAttribute('aria-label','Open '+name+' workshop');
 button.innerHTML='<canvas aria-hidden="true"></canvas><span class="cardBody"><small></small><strong></strong><span class="sub"></span></span>';
 button.querySelector('strong').textContent=name;
 button.querySelector('small').textContent='Circuit '+String(i+1).padStart(2,'0')+' · '+profiles[i];
 button.onclick=()=>selectCircuit(i);
 $('tracks').append(button);
 return {button,points:circuit(i),stock:lap(blank(),i)};
});
// Put the street and speed circuits side by side in the gallery.
$('tracks').insertBefore(cards[14].button,cards[1].button);
function showTracks(){
 cards.forEach(({button,points,stock},i)=>{
   drawTrack(button.querySelector('canvas'),points);
   button.querySelector('.sub').textContent=stock.length.toFixed(1)+' m · '+(data[i]?.best?'Best '+fmt(data[i].best):'Stock '+fmt(stock.total));
 });
}
$('driver').value=data.name||'Guest driver';$('driver').onchange=e=>{data.name=e.target.value.trim().slice(0,20)||'Guest driver';e.target.value=data.name;save();};
for(let i=0;i<2;i++){const wrap=document.createElement('div');wrap.className='row';const label=document.createElement('label');label.htmlFor='a'+i;label.textContent=i?'Rear':'Front';const slider=document.createElement('input');slider.type='range';slider.min=0;slider.max=18;slider.step=1;slider.id='a'+i;const out=document.createElement('output');out.id='val'+i;slider.oninput=()=>{setup().angles[i]=+slider.value;save();refresh();};wrap.append(label,slider,out);$('angles').append(wrap);}
function refresh(){const s=setup();txt('currentTrack',names[id]);drawCar();updateAero();$('undo').disabled=!history.length;s.angles.forEach((v,i)=>{$('a'+i).value=v;txt('val'+i,v+'°');});txt('ballast',aero(s).ballast.toFixed(2)+' g');txt('stock',fmt(lap(blank(),id).total));txt('best',data[id].best?fmt(data[id].best):'—');txt('length',lap(s,id).length.toFixed(1)+' m');txt('trackNum','Circuit '+String(id+1).padStart(2,'0')+' of 20 · '+profiles[id]);drawTrack($('map'),circuit(id));}
function setMode(m){mode=m;for(let v of ['orbit','chisel'])$(v).classList.toggle('chosen',v===m);hover=null;car.style.cursor=m==='orbit'?'grab':knifeCursor;updateCue();drawCar();message(m==='orbit'?'Drag to rotate the car.':'Drag the chisel across the selected surface.');}
$('orbit').onclick=()=>setMode('orbit');$('chisel').onclick=()=>setMode('chisel');$('view').onchange=e=>{renderer.view(e.target.value);drawCar();};
$('undo').onclick=()=>{if(history.length){setup().cuts=history.pop();save();refresh();message('Last stroke undone.');}};
function cut(x,y){const h=renderer.pick(x,y);if(!h||h.p!==part)return false;const r=+$('blade').value*.65,arr=setup().cuts[part];let changed=false;
 for(let i=Math.max(0,Math.floor(h.i-r));i<=Math.min(nx-1,h.i+r);i++)for(let j=0;j<ny;j++){const d=Math.hypot(i-h.i,j-h.j);if(d>r)continue;
 const k=i*ny+j,m=part===2?k:i*ny+ny-1-j;if(drag.seen.has(k))continue;drag.seen.add(k);drag.seen.add(m);if(arr[k]<12){arr[k]=arr[m]=Math.min(12,arr[k]+1);changed=true;}}
 return changed;}
car.onpointerdown=e=>{if(drag)return;car.setPointerCapture(e.pointerId);drag={x:e.offsetX,y:e.offsetY,seen:new Set(),before:structuredClone(setup().cuts),changed:false};};
car.onpointerleave=()=>{if(!drag&&hover){hover=null;drawCar();}};
car.onpointermove=e=>{
 if(mode==='chisel'){
  const h=renderer.pick(e.offsetX,e.offsetY),next=h?.p===part?h:null;
  const changed=hover?.p!==next?.p||hover?.i!==next?.i||hover?.j!==next?.j;
  hover=next;
  if(!drag&&changed)drawCar();
 }
 if(!drag)return;let x=e.offsetX,y=e.offsetY,dx=x-drag.x,dy=y-drag.y;if(mode==='orbit'){renderer.turn(dx,dy);$('view').value='Free orbit';}else{const steps=Math.ceil(Math.hypot(dx,dy)/4);for(let i=1;i<=steps;i++)if(cut(drag.x+i*dx/steps,drag.y+i*dy/steps))drag.changed=true;}
 drag.x=x;drag.y=y;drawCar();if(drag.changed)updateAero();};
car.onpointerup=car.onpointercancel=()=>{if(!drag)return;if(drag.changed){history.push(drag.before);if(history.length>60)history.shift();save();message('Mirrored shaving removed.');}else if(mode==='chisel')message('Drag across the '+parts[part].toLowerCase()+' to remove a shaving.');drag=null;hover=null;refresh();};
function drawTrack(c,p,markers){const rect=c.getBoundingClientRect(),w=rect.width,h=rect.height;if(w<1||h<1)return;let dpr=Math.min(2,devicePixelRatio);c.width=w*dpr;c.height=h*dpr;let g=c.getContext('2d');g.scale(dpr,dpr);let xs=p.map(v=>v[0]),ys=p.map(v=>v[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),k=.81*Math.min(w/(maxX-minX),h/(maxY-minY)),tr=([x,y])=>[(x-(minX+maxX)/2)*k+w/2,(y-(minY+maxY)/2)*k+h/2],q=p.map(tr);
 g.beginPath();q.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.lineJoin='round';g.strokeStyle='#58664f';g.lineWidth=markers?Math.max(12,k*.34):2.5;g.stroke();if(!markers)return;g.lineWidth-=3;g.strokeStyle='#b5b4a0';g.stroke();g.lineWidth=1;g.setLineDash([4,8]);g.strokeStyle='#ede8d6';g.stroke();g.setLineDash([]);
 const bearing=i=>Math.atan2(q[(i+1)%q.length][1]-q[i][1],q[(i+1)%q.length][0]-q[i][0]);g.save();g.translate(...q[0]);g.rotate(bearing(0));for(let j=-3;j<3;j++)for(let i=0;i<2;i++){g.fillStyle=(i+j)%2?'#faf6e8':'#334636';g.fillRect(i*3,j*3,3,3);}g.restore();
 for(let m of markers){let i=Math.min(q.length-1,Math.floor(m.progress)),f=m.progress-i,next=q[(i+1)%q.length];g.save();g.translate(q[i][0]*(1-f)+next[0]*f,q[i][1]*(1-f)+next[1]*f);g.rotate(bearing(i));g.globalAlpha=m.ghost?.55:1;g.fillStyle=m.ghost?'#fff':'#26382d';for(let x of [-6,3])for(let y of [-6,3])g.fillRect(x,y,4,3);g.fillStyle=m.ghost?'#fff':'#c58543';g.fillRect(-7,-3,14,6);g.fillRect(6,-5,2,10);g.restore();}}
function progress(l,t){if(t>=l.total)return l.p.length;let i=0;while(l.time[i+1]<t)i++;return i+(t-l.time[i])/(l.time[i+1]-l.time[i]);}
function renderRace(){cancelAnimationFrame(frame);if(tab!=='race')return;txt('raceName',names[id]);if(!race){drawTrack($('raceMap'),circuit(id),[]);txt('clock','0.000 s');txt('raceInfo','Ready on the grid');return;}
 let now=performance.now();race.elapsed=Math.min(race.run.total,race.elapsed+(now-race.last)*rate/1000);race.last=now;const t=race.elapsed,r=race.run,g=race.ghost,pos=progress(r,t),idx=Math.min(r.p.length-1,Math.floor(pos)),gt=g.time[idx]+(pos-idx)*(g.time[idx+1]-g.time[idx]),gap=t-gt;
 drawTrack($('raceMap'),r.p,[{progress:progress(g,t),ghost:true},{progress:pos}]);txt('clock',fmt(t));txt('raceInfo',(t>=r.total?'Finish':'Lap 1 / 1')+' · '+(gap>=0?'+':'')+gap.toFixed(3)+' s vs '+race.label);
 if(t<r.total){frame=requestAnimationFrame(renderRace);return;}if(!race.finished){race.finished=true;const rec=data[id];if(!rec.best||r.total<rec.best){rec.best=r.total;rec.ghost=race.s;save();}submit(race.s,id);}}
function start(){let s=structuredClone(setup());race={s,run:lap(s,id),ghost:lap(valid(data[id].ghost)?data[id].ghost:blank(),id),label:data[id].best?'personal best':'stock',elapsed:0,last:performance.now()};switchTab('race');}
async function submit(s,track){if(location.protocol==='file:')return;try{let res=await fetch('/api/v2/scores/'+track,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({s,name:data.name||'Guest driver'})});if(!res.ok)throw Error();}catch{if(tab==='race')$('raceInfo').textContent+=' · Online submission unavailable';}}
async function board(){let track=id;txt('boardName',names[id]);txt('scores','Loading times…');let rows;try{const res=await fetch('/api/v2/scores/'+id);rows=await res.json();if(!Array.isArray(rows))throw Error();}catch{txt('scores','Online leaderboard unavailable. Personal best: '+(data[id].best?fmt(data[id].best):'—'));return;}if(id!==track)return;$('scores').replaceChildren();if(!rows.length)txt('scores','No recorded laps on this circuit.');rows.forEach((r,i)=>{const el=document.createElement('div');el.className='boardRow';for(let t of [i+1,r.name,fmt(r.time)]){const v=document.createElement('span');v.textContent=t;el.append(v);}$('scores').append(el);});}
function switchTab(t){tab=t;document.querySelectorAll('header button').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));for(let v of ['tracks','shop','race','board'])$(v).classList.toggle('hidden',v!==t);txt('title',({tracks:'Tracks',shop:'Carving bench',race:'Lap view',board:'Leaderboard'})[t]);if(t==='tracks')showTracks();if(t==='shop')refresh();if(t==='race'){if(race)race.last=performance.now();renderRace();}if(t==='board')board();}
document.querySelectorAll('[data-tab],[data-go]').forEach(b=>b.onclick=()=>switchTab(b.dataset.tab||b.dataset.go));
$('run').onclick=$('again').onclick=start;$('speed').onclick=()=>{rate=rate===1?2:1;txt('speed',rate+'× speed');};
window.addEventListener('resize',()=>{if(tab==='tracks')showTracks();if(tab==='shop')refresh();if(tab==='race')renderRace();});setup();switchTab('tracks');

$('fresh').onclick=()=>{history.push(structuredClone(setup().cuts));setup().cuts=blank().cuts;save();refresh();message('Fresh blank fitted. Undo restores the previous carving.');};
