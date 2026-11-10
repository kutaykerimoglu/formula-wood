const $=id=>document.getElementById(id),txt=(id,t)=>$(id).textContent=t,fmt=t=>t.toFixed(3)+' s';
const data=JSON.parse(localStorage.getItem('tf.workshop.1')||'{}'),save=()=>localStorage.setItem('tf.workshop.1',JSON.stringify(data));
// Course revisions invalidate lap times while preserving each wooden setup.
if(data.courseVersion!==3){
 for(let i=0;i<names.length;i++){if(data[i]){delete data[i].best;delete data[i].ghost;delete data[i].previous;
  for(const key of ['s','snapshot']){
   const old=data[i][key];
   if(!old||old.cuts?.length!==4)continue;
   data[i][key]={...blank(),angles:old.angles,cuts:[...old.cuts,Array(nx*ny).fill(0)]};
  }}}
 data.courseVersion=3;
 save();
}
let id=Number(data.track)||0,part=0,mode='chisel',history=[],drag=null,tab='shop',race=null,rate=1,frame=0;
const car=$('car'),renderer=makeRenderer(car);
function setup(){const rec=data[id]??={};if(!valid(rec.s))rec.s=blank();return rec.s;}
function message(t){txt('status',t);}
let hover=null;
const hints=[
 'Shave the outer tips to narrow the front wing. Cuts along the leading or trailing edge change its profile.',
 'The nose contributes to drag. A gradual taper can lower drag, while abrupt steps can add it back.',
 'Sidepod cuts change body drag and the airflow reaching the rear wing. Watch rear downforce as you shape the tail.',
 'Rear wing shape changes rear tyre load. Shave the tips to reduce span, or shape the profile across the wing.',
 'Carve the floor progressively deeper toward the rear to form a diffuser ramp. Abrupt steps can disrupt airflow.'
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
function choosePart(p){hover=null;
 if(p===4||$('view').value==='Underside'){
  const view=p===4?'Underside':'Isometric';
  $('view').value=view;renderer.view(view);
 }
 txt('partHint',hints[p]);part=p;Array.from($('parts').children).forEach((b,i)=>b.classList.toggle('chosen',i===p));updateCue();if(tab==='shop')drawCar();}
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
 switchTab('shop');displaySlots();
 save();
 message('Drag the chisel across the selected surface.');
 window.scrollTo(0,0);
}
const cards=names.map((name,i)=>{
 const button=document.createElement('button');
 button.className='trackCard';
 
 button.innerHTML='<canvas aria-hidden="true"></canvas><span class="cardBody"><small></small><strong></strong><span class="sub"></span><span class="cardRecord"></span></span>';
 button.querySelector('strong').textContent=name;
 button.querySelector('small').textContent='Circuit '+String(i+1).padStart(2,'0')+' · '+profiles[i];
 button.onclick=()=>selectCircuit(i);
 $('tracks').append(button);
 return {button,points:circuit(i),stock:lap(blank(),i)};
});
// Put the street and speed circuits side by side in the gallery.
$('tracks').insertBefore(cards[14].button,cards[1].button);
const trialCircuits=[0,14,2];
const trialButtons=trialCircuits.map(track=>{
 const button=document.createElement('button');
 button.onclick=()=>selectCircuit(track);
 $('trialTracks').append(button);
 return button;
});
function showTracks(){
 let beaten=0;
 trialCircuits.forEach((track,index)=>{
  const won=data[track]?.best<cards[track].stock.total;
  if(won)beaten++;
  trialButtons[index].textContent=(won?'✓ ':'')+names[track];
 });
 txt('trialScore',Math.min(beaten,2)+' / 2 beaten');
 cards.forEach(({button,points,stock},i)=>{
   drawTrack(button.querySelector('canvas'),points);
   button.querySelector('.sub').textContent=stock.length.toFixed(1)+' m · Stock '+fmt(stock.total);
   const saved = data[i]?.slots?.filter(slot=>valid(slot?.car)).length || 0;
   const record = [saved ? saved+' saved setup'+(saved===1?'':'s') : '', data[i]?.best ? 'PB '+fmt(data[i].best) : ''];
   button.querySelector('.cardRecord').textContent = record.filter(Boolean).join(' · ');
 });
}
$('driver').value=data.name||'Guest driver';$('driver').onchange=e=>{data.name=e.target.value.trim().slice(0,20)||'Guest driver';e.target.value=data.name;save();};
for(let i=0;i<2;i++){const wrap=document.createElement('div');wrap.className='row';const label=document.createElement('label');label.htmlFor='a'+i;label.textContent=i?'Rear':'Front';const slider=document.createElement('input');slider.type='range';slider.min=0;slider.max=18;slider.step=1;slider.id='a'+i;const out=document.createElement('output');out.id='val'+i;slider.oninput=()=>{setup().angles[i]=+slider.value;save();refresh();};wrap.append(label,slider,out);$('angles').append(wrap);}
// Bring the original comparison setup into the first named slot.
for(const rec of Object.values(data)){
 if(valid(rec?.snapshot)){
  rec.slots??=[];
  rec.slots[0]??={name:'Comparison setup',car:rec.snapshot};
  delete rec.snapshot;
  save();
 }
}
$('wood').onchange=()=>{setup().wood=$('wood').value;save();refresh();};
function loadSlot(track,index){
 const slot=data[track]?.slots?.[index];
 if(!valid(slot?.car))return;
 data[track].s=structuredClone(slot.car);
 history=[];hover=null;selectCircuit(track);message('Loaded '+slot.name+'.');
}
const slotControls=Array.from({length:3},(_,index)=>{
 const row=document.createElement('div');row.className='slotRow';
 const name=document.createElement('input');name.maxLength=28;
 name.placeholder='Setup '+(index+1);name.setAttribute('aria-label',name.placeholder+' name');
 const title=()=>name.value.trim().slice(0,28)||name.placeholder;
 name.onchange=()=>{
  const slot=data[id].slots?.[index];
  if(slot){slot.name=title();name.value=slot.name;save();}
 };
 const keep=document.createElement('button'),load=document.createElement('button');
 keep.onclick=()=>{
  const rec=data[id];rec.slots??=[];
  rec.slots[index]={name:title(),car:structuredClone(setup())};
  save();displaySlots();message('Saved '+rec.slots[index].name+'.');
 };
 load.textContent='Load';load.onclick=()=>loadSlot(id,index);
 row.append(name,keep,load);$('slots').append(row);
 return {name,keep,load};
});
function displaySlots(){
 slotControls.forEach(({name,keep,load},index)=>{
  const slot=data[id]?.slots?.[index];
  name.value=slot?.name||'';keep.textContent=slot?'Overwrite':'Save';load.disabled=!slot;
 });
}
for(let axle=0;axle<2;axle++){
 const input=$('pressure'+axle);
 input.onchange=()=>{setup().pressure[axle]=Number(input.value);save();refresh();};
}
$('mount').onchange=()=>{setup().height=Number($('mount').value);save();refresh();};
$('lip').onchange=()=>{setup().gurney=$('lip').checked;save();refresh();};
function refresh(){const s=setup();
 s.pressure.forEach((value,axle)=>$('pressure'+axle).value=value);
 $('mount').value=s.height;$('lip').checked=s.gurney;
 $('wood').value=s.wood??'Maple';txt('woodLabel','TF–01 / '+$('wood').value);txt('woodHint',woods[$('wood').value].description);
 drawCar();updateAero();$('undo').disabled=!history.length;s.angles.forEach((v,i)=>{$('a'+i).value=v;txt('val'+i,v+'°');});txt('ballast',aero(s).ballast.toFixed(2)+' g');txt('stock',fmt(lap(blank(),id).total));txt('best',data[id].best?fmt(data[id].best):'—');txt('length',lap(s,id).length.toFixed(1)+' m');txt('trackNum','Circuit '+String(id+1).padStart(2,'0')+' of 20 · '+profiles[id]);drawTrack($('map'),circuit(id));}
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
function drawTrack(c,p,markers,sectorGaps){const rect=c.getBoundingClientRect(),w=rect.width,h=rect.height;if(w<1||h<1)return;let dpr=Math.min(2,devicePixelRatio);c.width=w*dpr;c.height=h*dpr;let g=c.getContext('2d');g.scale(dpr,dpr);let xs=p.map(v=>v[0]),ys=p.map(v=>v[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),k=.81*Math.min(w/(maxX-minX),h/(maxY-minY)),tr=([x,y])=>[(x-(minX+maxX)/2)*k+w/2,(y-(minY+maxY)/2)*k+h/2],q=p.map(tr);
 g.beginPath();q.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.lineJoin='round';g.strokeStyle='#58664f';g.lineWidth=markers?Math.max(12,k*.34):2.5;g.stroke();if(!markers)return;g.lineWidth-=3;g.strokeStyle='#b5b4a0';g.stroke();g.lineWidth=1;g.setLineDash([4,8]);g.strokeStyle='#ede8d6';g.stroke();g.setLineDash([]);
 const bounds=sectorBounds(id);
 for(let sector=0;sector<3;sector++){
  const from=bounds[sector],end=bounds[sector+1];
  g.beginPath();g.moveTo(...q[from]);
  for(let i=from+1;i<=end;i++)g.lineTo(...q[i%q.length]);
  g.strokeStyle=sectorColors[sector];g.lineWidth=3;g.stroke();
  const [x,y]=q[Math.floor((from+end)/2)];
  const gap = sectorGaps?.[sector];
  const label = 'S'+(sector+1)+(gap===undefined?'':' '+(gap>0?'+':'')+gap.toFixed(3)+' s');
  const halfWidth = gap===undefined?11:49;
  const center = Math.max(halfWidth,Math.min(w-halfWidth,x));
  g.fillStyle=gap===undefined||Math.abs(gap)<.0005?sectorColors[sector]:gap<0?'#12623e':'#962f38';
  g.fillRect(center-halfWidth,y-9,halfWidth*2,18);
  g.font='bold 11px monospace';g.fillStyle='#fff';g.textAlign='center';g.fillText(label,center,y+4);
 }
 const bearing=i=>Math.atan2(q[(i+1)%q.length][1]-q[i][1],q[(i+1)%q.length][0]-q[i][0]);g.save();g.translate(...q[0]);g.rotate(bearing(0));for(let j=-3;j<3;j++)for(let i=0;i<2;i++){g.fillStyle=(i+j)%2?'#faf6e8':'#334636';g.fillRect(i*3,j*3,3,3);}g.restore();
 for(let m of markers){let i=Math.min(q.length-1,Math.floor(m.progress)),f=m.progress-i,next=q[(i+1)%q.length];g.save();g.translate(q[i][0]*(1-f)+next[0]*f,q[i][1]*(1-f)+next[1]*f);g.rotate(bearing(i));g.globalAlpha=m.ghost?.55:1;g.fillStyle=m.ghost?'#fff':'#26382d';for(let x of [-6,3])for(let y of [-6,3])g.fillRect(x,y,4,3);g.fillStyle=m.ghost?'#fff':'#c58543';g.fillRect(-7,-3,14,6);g.fillRect(6,-5,2,10);g.restore();}}
const sectorColors=['#376b52','#965028','#485c8e'];
const gates=new Map();
function sectorBounds(track){
 if(gates.has(track))return gates.get(track);
 const route=circuit(track),bounds=[0],third=cards[track].stock.length/3;
 let distance=0;
 for(let i=1;i<route.length;i++){
  distance+=Math.hypot(route[i][0]-route[i-1][0],route[i][1]-route[i-1][1]);
  if(bounds.length<3&&distance>=third*bounds.length)bounds.push(i);
 }
 bounds.push(route.length);gates.set(track,bounds);return bounds;
}
function showReport(){
 const options=$('reference').options;
 for(const option of options)option.disabled=!race.references[option.value];
 const reference=race.references[$('reference').value];
 const bounds=sectorBounds(id),splits=$('splits');
 const sectorGaps = [];
 splits.replaceChildren();
 for(let i=0;i<3;i++){
  const duration=l=>l.time[bounds[i+1]]-l.time[bounds[i]];
  const time=duration(race.run),gap=time-duration(reference);
  sectorGaps.push(gap);
  const cell=document.createElement('div');
  cell.style.setProperty('--ink',sectorColors[i]);
  cell.innerHTML='<small>Sector '+(i+1)+'</small><b>'+fmt(time)+'</b><output>'+
    (Math.abs(gap)<.0005?'Even':fmt(Math.abs(gap))+(gap<0?' gained':' lost'))+'</output>';
  splits.append(cell);
 }
 drawTrack($('map'),race.run.p,[{progress:race.run.p.length}],sectorGaps);
 txt('lapBest','Personal best · '+fmt(data[id].best));
 $('sectorReport').classList.remove('hidden');
}
$('reference').onchange=showReport;
function progress(l,t){if(t>=l.total)return l.p.length;let i=0;while(l.time[i+1]<t)i++;return i+(t-l.time[i])/(l.time[i+1]-l.time[i]);}
function showGap(seconds,finished,target){
 const ms=Math.round(Math.abs(seconds)*1000);
 const state=ms===0?'level':seconds<0?'ahead':'behind';
 const panel=$('gapPanel');
 panel.setAttribute('data-state',state);
 panel.classList.remove('hidden');
 txt('gapPhase',finished?'Finish':'Lap 1 / 1');
 txt('gapState',state);
 const sign=ms===0?'':seconds<0?'−':'+';
 txt('gapTime',sign+(ms/1000).toFixed(3)+' s');
 txt('gapTarget','vs '+target);
}
function renderRace(){cancelAnimationFrame(frame);if(tab!=='race')return;if(!race){$('gapPanel').classList.add('hidden');$('sectorReport').classList.add('hidden');drawTrack($('map'),circuit(id),[]);txt('clock','0.000 s');txt('raceInfo','Ready on the grid');return;}
 let now=performance.now();race.elapsed=Math.min(race.run.total,race.elapsed+(now-race.last)*rate/1000);race.last=now;const t=race.elapsed,r=race.run,g=race.ghost,pos=progress(r,t),idx=Math.min(r.p.length-1,Math.floor(pos)),gt=g.time[idx]+(pos-idx)*(g.time[idx+1]-g.time[idx]),gap=t-gt;
 drawTrack($('map'),r.p,[{progress:progress(g,t),ghost:true},{progress:pos}]);txt('clock',fmt(t));showGap(gap,t>=r.total,race.label);
 if(t<r.total){frame=requestAnimationFrame(renderRace);return;}$('again').disabled=false;
 if(!race.finished){race.finished=true;const rec=data[id];if(!rec.best||r.total<rec.best){rec.best=r.total;rec.ghost=race.s;}rec.previous=race.s;save();submit(race,id);}showReport();}
function start(){$('again').disabled=true;txt('raceInfo','');let s=structuredClone(setup());
 const rec=data[id],references={stock:cards[id].stock};
 if(valid(rec.previous))references.previous=lap(rec.previous,id);
 for(let i=0;i<3;i++){
  const slot=rec.slots?.[i],opt=$('refSlot'+i);
  opt.textContent=slot?.name||'Empty slot';opt.hidden=!slot;
  if(valid(slot?.car))references['slot'+i]=lap(slot.car,id);
 }
 $('reference').value=references.previous?'previous':'stock';
 $('sectorReport').classList.add('hidden');
 race={s,references,run:lap(s,id),ghost:lap(valid(data[id].ghost)?data[id].ghost:blank(),id),label:data[id].best?'personal best':'stock',elapsed:0,last:performance.now()};txt('runSpec',(s.wood??'Maple')+' · Wings '+s.angles.join('° / ')+'° · Tyres '+s.pressure.map(v=>['low','standard','high'][v]).join(' / '));switchTab('race');}
async function submit(completed,track){
 if(location.protocol==='file:'){txt('raceInfo','Local lap');return;}
 txt('raceInfo','Confirming position…');
 try{
  const response=await fetch('/api/v3/scores/'+track,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({s:completed.s,name:data.name||'Guest driver'})});
  if(!response.ok)throw Error();
  const result=await response.json();
  if(track!==id||race!==completed)return;
  txt('raceInfo','Personal best · P'+result.position+' · '+(result.position===1?'Leader':'+'+fmt(result.gap)+' to P1'));
  board();
 }catch{if(race===completed)txt('raceInfo','Online submission unavailable');}
}
let boardRequest=0;
async function board(){
 const track=id,request=++boardRequest,scores=$('scores');
 txt('rankTarget','');
 txt('scores','Loading times…');
 try{
  const response=await fetch('/api/v3/scores/'+track+'?personal=1');
  if(!response.ok)throw Error();
  const rows=await response.json();
  if(!Array.isArray(rows))throw Error();
  if(request!==boardRequest||id!==track||!['shop','race'].includes(tab))return;
  scores.replaceChildren();
  if(!rows.length)txt('scores','Be the first to record a lap.');
  if(rows.length){
   const header=document.createElement('div');
   header.className='boardRow timingHead';
   for(const label of ['Pos','Driver','Best lap','Gap to P1']){
    const field=document.createElement('span');field.textContent=label;header.append(field);
   }
   scores.append(header);
  }
  const mine = rows.find(row=>row.isMine);
  const rival = mine && rows.find(row=>row.position===mine.position-1);
  if(rival)txt('rankTarget',fmt(mine.time-rival.time)+' to P'+rival.position);
  else if(mine)txt('rankTarget','P1 · '+fmt(mine.time));
  else if(rows.length)txt('rankTarget','P1 · '+fmt(rows[0].time));
  rows.forEach((row,index)=>{
   const line=document.createElement('div');
   line.className='boardRow'+(row.isMine?' ownTime':'')+(index===0?' leaderRow':'');
   const gap=index===0?'—':'+'+fmt(row.time-rows[0].time);
   for(const value of ['P'+(row.position??index+1),row.name+(row.isMine?' · You':''),fmt(row.time),gap]){
    const field=document.createElement('span');field.textContent=value;line.append(field);
   }
   scores.append(line);
  });
 }catch{
  if(request===boardRequest&&id===track&&['shop','race'].includes(tab))txt('scores','Online leaderboard unavailable.');
 }
}
function switchTab(t){
 tab=t;
 $('trial').classList.toggle('hidden',t!=='tracks');
 txt('sessionMode',t==='race'?'Timed lap':'Track setup');
 const active=['race','shop'].includes(t)?'tracks':t;
 $('shop').classList.toggle('running',t==='race');$('shop').classList.remove('showBoard');$('gapPanel').classList.add('hidden');
 document.querySelectorAll('header button').forEach(b=>b.classList.toggle('active',b.dataset.tab===active));
 for(const view of ['tracks','shop','race'])$(view).classList.toggle('hidden',view!==t&&!(view==='shop'&&t==='race'));
 txt('title',({tracks:'Tracks',shop:names[id],race:names[id]})[t]);
 if(t==='tracks')showTracks();

 if(t==='shop'){
  const profile = circuitProfile(id,cards[id].stock);
  txt('longStraight',profile.longestStraight.toFixed(1)+' m');
  txt('cornerMix',profile.counts.map((count,index)=>count+' '+['slow','medium','fast'][index]).join(' · '));
  cancelAnimationFrame(frame);refresh();displaySlots();board();}
 if(t==='race'){if(race)race.last=performance.now();renderRace();}
}
document.querySelectorAll('[data-tab],[data-go]').forEach(b=>b.onclick=()=>switchTab(b.dataset.tab||b.dataset.go));
$('run').onclick=start;
$('again').onclick=()=>{
 if(!race?.finished)return;
 race.elapsed=0;race.last=performance.now();$('again').disabled=true;
 $('sectorReport').classList.add('hidden');renderRace();
};
$('standings').onclick=()=>{$('shop').classList.add('showBoard');board();$('board').scrollIntoView({block:'nearest'});};
$('speed').onclick=()=>{rate=rate===1?2:1;txt('speed',rate+'× speed');};
window.addEventListener('resize',()=>{if(tab==='tracks')showTracks();if(tab==='shop')refresh();if(tab==='race')renderRace();});setup();switchTab('tracks');

$('fresh').onclick=()=>{history.push(structuredClone(setup().cuts));setup().cuts=blank().cuts;save();refresh();message('Fresh blank fitted. Undo restores the previous carving.');};

document.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>{
 document.querySelectorAll('[data-mode]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
 document.querySelectorAll('[data-pane]').forEach(panel=>panel.hidden=panel.dataset.pane!==button.dataset.mode);
 drawCar();
});
$('helpAero').onclick=()=>$('aeroHelp').showModal();
