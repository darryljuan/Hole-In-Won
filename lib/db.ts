import {neon} from '@neondatabase/serverless';
import {cookies} from 'next/headers';
const sql=neon(process.env.DATABASE_URL!);
let ready:Promise<any>|null=null;
const init=()=>(ready??=sql`create table if not exists kv(h text not null,k text not null,v jsonb not null,primary key(h,k))`);
// Small Redis-style adapter over one Postgres table, so the API routes stay unchanged.
export const r={
 async hget<T>(h:string,k:string):Promise<T|null>{await init();const x=await sql`select v from kv where h=${h} and k=${k}`;return x.length?(x[0].v as T):null},
 async hgetall<T>(h:string):Promise<T|null>{await init();const x=await sql`select k,v from kv where h=${h}`;return Object.fromEntries(x.map((o:any)=>[o.k,o.v])) as T},
 async hset(h:string,o:Record<string,any>){await init();for(const [k,v] of Object.entries(o))await sql`insert into kv(h,k,v) values(${h},${k},${JSON.stringify(v)}::jsonb) on conflict(h,k) do update set v=excluded.v`},
 async hdel(h:string,k:string){await init();await sql`delete from kv where h=${h} and k=${k}`},
 async acquire(){await init();const t=Date.now();await sql`delete from kv where h='lock' and (v->>'t')::bigint<${t-5000}`;const x=await sql`insert into kv(h,k,v) values('lock','l',${JSON.stringify({t})}::jsonb) on conflict do nothing returning k`;return x.length>0},
 async release(){await sql`delete from kv where h='lock'`}};
export type Player={id:string;name:string;gender:'M'|'F';pin:string;captain:boolean};
export type Ev={id:string;date:string;courseId:string;status:'draft'|'open'|'closed'|'published';times:string[];flights:(string|null)[][];pool:string[];leaders:string[];locked:string[];scores:Record<string,(number|null)[]>};
export const uid=()=>Math.random().toString(36).slice(2,10);
export async function me():Promise<Player|null>{const c=cookies().get('hiw')?.value;if(!c)return null;const [id,pin]=c.split(':');const p=await r.hget<Player>('hiw:players',id);return p&&p.pin===pin?p:null}
export async function lock<T>(fn:()=>Promise<T>):Promise<T>{for(let i=0;i<30;i++){if(await r.acquire()){try{return await fn()}finally{await r.release()}}await new Promise(s=>setTimeout(s,100))}throw new Error('Busy, try again')}
