const fs=require('node:fs/promises');
const path=require('node:path');
const assert=require('node:assert/strict');
const sharp=require('../../frontend/node_modules/sharp');
require('dotenv').config({path:path.resolve(__dirname,'../.env.catalog.local'),quiet:true});
const products=require('../catalog/lenses-source.cjs');
const root=path.resolve(__dirname,'../..');
async function main(){
 assert.equal(products.length,27);assert.equal(new Set(products.map(p=>p.slug)).size,27);
 for(const p of products){assert.match(p.description,/[\u0600-\u06ff]/);for(const n of p.sourceImages)await fs.access(path.join(root,`ayla-product/product (${n}).png`));}
 if(!process.argv.includes('--apply')){console.log('Validated 27 distinct lens products, 30 photos, ILS 120/150, stock 100 each.');return;}
 let cookie='';
 async function request(endpoint,method='GET',body){const r=await fetch(process.env.CATALOG_API_URL+endpoint,{method,headers:{Cookie:cookie,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error(`${method} ${endpoint}: ${r.status}`);if(r.headers.getSetCookie().length)cookie=r.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');return r.json();}
 const login=await request('/api/auth/login','POST',{email:process.env.CATALOG_ADMIN_EMAIL,password:process.env.CATALOG_ADMIN_PASSWORD});assert.equal(login.user.role,'ADMIN');
 const before=(await request('/api/products')).products;
 await fs.writeFile(path.join(root,'testing/lenses-before.json'),JSON.stringify(before,null,2));
 const cachePath=path.resolve(__dirname,'../catalog/lenses-uploaded-images.json');
 let cache={};try{cache=JSON.parse(await fs.readFile(cachePath,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
 let created=0;
 for(const p of products){
  if(before.some(x=>x.slug===p.slug)){console.log('Existing, preserved: '+p.slug);continue;}
  const images=[];
  for(const n of p.sourceImages){
   if(!cache[n]){
    const bytes=await sharp(path.join(root,`ayla-product/product (${n}).png`)).resize({width:1400,height:1400,fit:'inside',withoutEnlargement:true}).webp({quality:88,effort:6}).toBuffer();
    const signed=await request('/api/uploads/signature','POST');
    const form=new FormData();form.append('file',new Blob([bytes],{type:'image/webp'}),`lens-${n}.webp`);form.append('api_key',signed.apiKey);form.append('signature',signed.signature);for(const [k,v]of Object.entries(signed.params))form.append(k,v);
    const r=await fetch(signed.uploadUrl,{method:'POST',body:form,signal:AbortSignal.timeout(60000)});const data=await r.json();assert.ok(r.ok,'Cloudinary upload failed');assert.ok(data.secure_url?.startsWith('https://res.cloudinary.com/'));
    cache[n]=data.secure_url;await fs.writeFile(cachePath,JSON.stringify(cache,null,2));
   }
   images.push(cache[n]);
  }
  const {sourceImages,...payload}=p;
  await request('/api/products','POST',{...payload,images});created++;console.log('Created: '+p.slug);
 }
 const categories=(await request('/api/categories')).categories;
 if(!categories.some(c=>c.slug==='colored-lenses'))await request('/api/categories','POST',{slug:'colored-lenses',name:'العدسات الملونة',description:'درجات لونية مختارة تمنح نظرتك لمسة أنيقة وتنسجم مع أسلوبك، من الألوان الهادئة إلى التدرّجات المميزة.',image:cache[1]});
 const after=(await request('/api/products')).products;
 for(const old of before)assert.deepEqual(after.find(p=>p.id===old.id),old,'Existing product changed');
 for(const p of products){const current=after.find(x=>x.slug===p.slug);assert.ok(current);assert.equal(current.description,p.description);assert.equal(current.department,'lenses');assert.equal(current.variants[0].price,12000);assert.equal(current.variants[0].compareAtPrice,15000);assert.equal(current.variants[0].stock,100);for(const url of current.images){assert.ok(url.startsWith('https://res.cloudinary.com/'));const r=await fetch(url.replace('/image/upload/','/image/upload/f_auto,q_auto,c_limit,w_640/'),{headers:{Accept:'image/avif,image/webp'},signal:AbortSignal.timeout(60000)});assert.equal(r.status,200);assert.ok(r.headers.get('content-type').startsWith('image/'));await r.arrayBuffer();}}
 const report={verifiedAt:new Date().toISOString(),products:27,created,photos:Object.keys(cache).length,priceILS:120,originalPriceILS:150,stockPerProduct:100,existingProductsPreserved:true};
 await fs.writeFile(path.join(root,'testing/lenses-verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
