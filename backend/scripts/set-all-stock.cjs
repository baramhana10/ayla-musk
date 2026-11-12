const fs=require('node:fs/promises');
const path=require('node:path');
const assert=require('node:assert/strict');
require('dotenv').config({path:path.resolve(__dirname,'../.env.catalog.local'),quiet:true});
async function main(){
 const origin=process.env.CATALOG_API_URL,email=process.env.CATALOG_ADMIN_EMAIL,password=process.env.CATALOG_ADMIN_PASSWORD;
 if(!origin||!email||!password)throw Error('Missing local catalog admin configuration.');
 let cookie='';
 async function request(endpoint,method='GET',body){const r=await fetch(origin+endpoint,{method,headers:{Cookie:cookie,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`${method} ${endpoint}: HTTP ${r.status}`);if(r.headers.getSetCookie().length)cookie=r.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');return r.json();}
 const login=await request('/api/auth/login','POST',{email,password});assert.equal(login.user?.role,'ADMIN');
 const before=(await request('/api/products')).products;
 await fs.writeFile(path.resolve(__dirname,'../../testing/all-stock-before.json'),JSON.stringify(before,null,2));
 for(const p of before){assert.ok(p.variants.length,`No variants for ${p.slug}`);await request(`/api/products/${p.id}`,'PUT',{variants:p.variants.map(v=>({id:v.id,label:v.label??null,sizeMl:v.sizeMl??null,price:v.price,compareAtPrice:v.compareAtPrice??null,stock:100}))});}
 const after=(await request('/api/products')).products;
 assert.equal(after.length,before.length);
 for(const old of before){const current=after.find(p=>p.id===old.id);assert.ok(current,`Missing ${old.slug}`);assert.equal(current.variants.length,old.variants.length);for(let i=0;i<old.variants.length;i++){const a=old.variants[i],b=current.variants[i];assert.equal(b.stock,100,`${old.slug}/${b.label} stock`);for(const key of ['id','label','sizeMl','price','compareAtPrice'])assert.equal(b[key]??null,a[key]??null,`${old.slug} changed ${key}`);}}
 const report={verifiedAt:new Date().toISOString(),products:after.length,variants:after.reduce((sum,p)=>sum+p.variants.length,0),stockPerVariant:100,otherVariantDataPreserved:true};
 await fs.writeFile(path.resolve(__dirname,'../../testing/all-stock-verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
