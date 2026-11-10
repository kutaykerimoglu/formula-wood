export default {async fetch(req,env){
 const url=new URL(req.url),api=url.pathname.match(/^\/api\/v3\/scores\/(\d+)$/);
 if(!api)return url.pathname==='/'?new Response(PAGE,{headers:{'content-type':'text/html; charset=utf-8'}}):new Response('Not found',{status:404});
 const track=Number(api[1]);if(track>=names.length)return new Response('Unknown track',{status:404});
 const courseKey=2000+track;
 const existing=req.headers.get('cookie')?.match(/(?:^|; )tfdriver=([a-f0-9-]{36})(?:;|$)/)?.[1];
 if(req.method==='GET')return Response.json((await env.DB.prepare('SELECT name,time FROM scores WHERE track=? ORDER BY time,player LIMIT 100').bind(courseKey).all()).results,{headers:{'cache-control':'no-store'}});
 if(req.method!=='POST')return new Response('Unsupported method',{status:405});
 if(req.headers.get('origin')!==url.origin)return new Response('Invalid origin',{status:403});
 const raw=await req.text();if(raw.length>5000)return new Response('Too large',{status:413});let body;try{body=JSON.parse(raw);}catch{return new Response('Invalid payload',{status:400});}
 if(!valid(body?.s)||typeof body.name!=='string')return new Response('Invalid setup',{status:400});
 const player=existing||crypto.randomUUID(),name=body.name.trim().slice(0,20)||'Guest driver',time=lap(body.s,track).total;
 await env.DB.prepare('INSERT INTO scores(track,player,name,time) VALUES(?,?,?,?) ON CONFLICT(track,player) DO UPDATE SET name=excluded.name,time=excluded.time WHERE excluded.time<scores.time').bind(courseKey,player,name,time).run();
 const ranking=await env.DB.prepare('SELECT position,time-leader AS gap FROM (SELECT player,time,ROW_NUMBER() OVER (ORDER BY time,player) AS position,MIN(time) OVER () AS leader FROM scores WHERE track=?) WHERE player=?').bind(courseKey,player).all();
 return Response.json({time,...ranking.results[0]},{headers:{'set-cookie':'tfdriver='+player+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=31536000'}});
}};
