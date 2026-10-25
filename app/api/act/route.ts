import {cookies} from 'next/headers';
import {r,me,lock,uid,Ev,Player} from '@/lib/db';
export const dynamic='force-dynamic';
const ok=(x:any={})=>Response.json({ok:true,...x});const no=(error:string)=>Response.json({error});
const sess=(p:Player)=>cookies().set('hiw',`${p.id}:${p.pin}`,{httpOnly:true,maxAge:60*60*24*90,path:'/',sameSite:'lax'});
const shuf=<T,>(a:T[])=>a.map(x=>[Math.random(),x] as const).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
function gen(ev:Ev,mode:string,ps:Record<string,Player>){
 const keep=new Set(ev.locked);const all=ev.flights.flatMap(f=>f.slots).filter(Boolean) as string[];
 ev.flights.forEach(f=>f.slots=f.slots.map(s=>s&&keep.has(s)?s:null));
 const g=(id:string)=>ps[id]?.gender==='F'?0:1;const free=all.filter(p=>!keep.has(p));
 let leads=shuf(free.filter(p=>ev.leaders.includes(p)));const rest=shuf(free.filter(p=>!ev.leaders.includes(p)));
 if(mode==='gender'){leads.sort((a,b)=>g(a)-g(b));rest.sort((a,b)=>g(a)-g(b))}
 const hasL=(f:Ev['flights'][0])=>f.slots.some(s=>s&&ev.leaders.includes(s));
 for(const l of leads){const f=ev.flights.find(f=>!hasL(f)&&f.slots.includes(null));if(f)f.slots[f.slots.indexOf(null)]=l;else rest.unshift(l)}
 for(const f of ev.flights)for(let i=0;i<4;i++)if(!f.slots[i]&&rest.length)f.slots[i]=rest.shift()!;
}
export async function POST(req:Request){
 const b=await req.json();const A=b.a;
 try{return await lock(async()=>{
  const u=await me();const ps=(await r.hgetall<Record<string,Player>>('hiw:players'))||{};
  if(A==='login'){const p=ps[b.id];if(!p||p.pin!==String(b.pin))return no('Wrong PIN');sess(p);return ok()}
  if(A==='logout'){cookies().delete('hiw');return ok()}
  if(A==='addPlayer'){const first=!Object.keys(ps).length;if(!first&&!u?.captain)return no('Captain only');if(!b.name?.trim()||!b.pin)return no('Name and PIN required');
   const p:Player={id:uid(),name:b.name.trim(),gender:b.gender==='F'?'F':'M',pin:String(b.pin),captain:first||!!b.captain};await r.hset('hiw:players',{[p.id]:p});if(first)sess(p);return ok()}
  if(!u)return no('Sign in first');
  if(A==='createEvent'){if(!u.captain)return no('Captain only');if(!b.date||!b.times?.length)return no('Date and tee times required');
   const e:Ev={id:uid(),title:b.title||'Golf day',date:b.date,courseId:b.courseId||'tampines',status:'draft',flights:b.times.map((time:string)=>({time,slots:[null,null,null,null]})),leaders:[],locked:[],scores:{}};
   await r.hset('hiw:events',{[e.id]:e});return ok({id:e.id})}
  const ev=await r.hget<Ev>('hiw:events',b.eid);if(!ev)return no('Event not found');
  const save=async()=>{await r.hset('hiw:events',{[ev.id]:ev});return ok()};
  if(['status','leader','generate','swap','lockp','delEvent'].includes(A)&&!u.captain)return no('Captain only');
  const tog=(a:string[],x:string)=>a.includes(x)?a.filter(y=>y!==x):[...a,x];
  switch(A){
   case 'status':ev.status=b.status;return save();
   case 'delEvent':await r.hdel('hiw:events',ev.id);return ok();
   case 'claim':{if(ev.status!=='open')return no('Signups are not open');if(ev.flights.some(f=>f.slots.includes(u.id)))return no('You already have a slot');const s=ev.flights[b.f]?.slots;if(!s||s[b.s])return no('Slot just taken');s[b.s]=u.id;return save()}
   case 'leave':if(ev.status!=='open')return no('Signups are closed');ev.flights.forEach(f=>f.slots=f.slots.map(x=>x===u.id?null:x));return save();
   case 'leader':ev.leaders=tog(ev.leaders,b.pid);return save();
   case 'lockp':ev.locked=tog(ev.locked,b.pid);return save();
   case 'generate':gen(ev,b.mode,ps);return save();
   case 'swap':{const x=ev.flights[b.x.f].slots,y=ev.flights[b.y.f].slots;[x[b.x.s],y[b.y.s]]=[y[b.y.s],x[b.x.s]];return save()}
   case 'score':{const fl=ev.flights.find(f=>f.slots.includes(b.pid));if(!(u.captain||b.pid===u.id||(fl&&fl.slots.includes(u.id))))return no('Not your flight');
    const v=b.v==null?null:Math.max(1,Math.min(15,+b.v));const s=ev.scores[b.pid]||Array(18).fill(null);s[b.hole]=v;ev.scores[b.pid]=s;return save()}
  }
  return no('Unknown action');
 })}catch(e:any){return no(e.message)}
}
