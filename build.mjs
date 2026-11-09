import fs from 'node:fs';
const read=f=>fs.readFileSync(f,'utf8');
const physics=read('physics.mjs').replaceAll('export ','');
const page=read('index.html').replace('/* APP */',()=>[physics,read('renderer.js'),read('app.js')].join('\n'));
fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});
fs.writeFileSync('dist/server/index.js','const PAGE='+JSON.stringify(page)+';\n'+physics+'\n'+read('api.mjs'));
fs.writeFileSync('Timber Formula.html',page);fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
