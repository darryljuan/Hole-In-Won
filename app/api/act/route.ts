import {cookies} from 'next/headers';
import {r,me,lock,uid,Ev,Player} from '@/lib/db';
export const dynamic='force-dynamic';
const ok=(x:any={})=>Response.json({ok:true,...x});const no=(error:string)=>Response.json({error});
const sess=(p:Player)=>cookies().set('hiw',`${p.id}:${p.pin}`,{httpOnly:true,maxAge:60*60*24*90,path:'/',sameSite:'lax'});
const shuf=<T,>(a:T[])=>a.map(x=>[Math.random(),x] as const).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
function gen(ev:Ev,mode:string,ps:Record<string,Player>){
 const keep=new Set(ev.locked.filter(p=>ev.pool.includes(p)));
 ev.flights=ev.times.map((_,i)=>[0,1,2,3].map(j=>{const s=ev.flights[i]?.[j];return s&&keep.has(s)?s:null}));
 const placed=new Set(ev.flights.flat().filter(Boolean));const g=(id:string)=>ps[id]?.gender==='F'?0:1;
 const free=ev.pool.filter(p=>!placed.has(p));
 const leads=shuf(free.filter(p=>ev.leaders.includes(p)));const rest=shuf(free.filter(p=>!ev.leaders.includes(p)));
 if(mode==='gender'){leads.sort((a,b)=>g(a)-g(b));rest.sort((a,b)=>g(a)-g(b))}
 const hasL=(f:(string|null)[])=>f.some(s=>s&&ev.leaders.includes(s));
 for(const l of leads){const f=ev.flights.find(f=>!hasL(f)&&f.includes(null));if(f)f[f.indexOf(null)]=l;else rest.unshift(l)}
 for(const f of ev.flights)for(let i=0;i<4;i++)if(!f[i]&&rest.length)f[i]=rest.shift()!;
}
export async function POST(req:Request){
 const b=await req.json();const A=b.a;
 if(A==='score'){try{const [u,ev]=await Promise.all([me(),r.hget<Ev>('hiw:events',b.eid)]);if(!u)return no('Sign in first');if(!ev)return no('Event not found');const inEv=ev.flights.flat();if(ev.status!=='published'||!inEv.includes(b.pid))return no('Not playing');if(!(u.captain||inEv.includes(u.id)))return no('Not in this round');const v=b.v==null?null:Math.max(1,Math.min(15,+b.v));await r.setScore(ev.id,b.pid,+b.hole,v);return ok()}catch(e:any){return no(e.message)}}
 try{return await lock(async()=>{
  const u=await me();const ps=(await r.hgetall<Record<string,Player>>('hiw:players'))||{};
  if(A==='login'){const p=ps[b.id];if(!p||p.pin!==String(b.pin))return no('Wrong PIN');sess(p);return ok()}
  if(A==='logout'){cookies().delete('hiw');return ok()}
  if(A==='addPlayer'){const first=!Object.keys(ps).length;if(!first&&!u?.captain)return no('Captain only');if(!b.name?.trim()||!b.pin)return no('Name and PIN required');
   const p:Player={id:uid(),name:b.name.trim(),gender:b.gender==='F'?'F':'M',pin:String(b.pin),captain:first||!!b.captain};await r.hset('hiw:players',{[p.id]:p});if(first)sess(p);return ok()}
  if(!u)return no('Sign in first');
  if(A==='setCaptain'){if(!u.captain)return no('Captain only');const p=ps[b.pid];if(!p)return no('No such player');
   if(!b.captain&&Object.values(ps).filter(x=>x.captain).length<2)return no('Keep at least one captain');p.captain=!!b.captain;await r.hset('hiw:players',{[p.id]:p});return ok()}
  if(A==='setPin'){if(!u.captain)return no('Captain only');const p=ps[b.pid];if(!p||!/^\d{4,8}$/.test(String(b.pin)))return no('PIN must be 4-8 digits');p.pin=String(b.pin);await r.hset('hiw:players',{[p.id]:p});if(p.id===u.id)sess(p);return ok()}
  if(A==='removePlayer'){if(!u.captain)return no('Captain only');if(b.pid===u.id)return no("You can't remove yourself");if(!ps[b.pid])return no('No such player');await r.hdel('hiw:players',b.pid);const all=(await r.hgetall<Record<string,Ev>>('hiw:events'))||{};for(const e of Object.values(all)){if(e.pool?.includes(b.pid)){e.pool=e.pool.filter(x=>x!==b.pid);e.flights=e.flights.map(f=>f.map(x=>x===b.pid?null:x));await r.hset('hiw:events',{[e.id]:e})}}return ok()}
  if(A==='createEvent'){if(!u.captain)return no('Captain only');if(!b.date||!b.times?.length)return no('Date and tee times required');
   const e:Ev={id:uid(),date:b.date,courseId:b.courseId||'tampines',status:'draft',times:b.times,flights:b.times.map(()=>[null,null,null,null]),pool:[],leaders:[],locked:[],scores:{}};
   await r.hset('hiw:events',{[e.id]:e});return ok({id:e.id})}
  const ev=await r.hget<Ev>('hiw:events',b.eid);if(!ev)return no('Event not found');
  const save=async()=>{await r.hset('hiw:events',{[ev.id]:ev});return ok()};
  if(['status','leader','generate','swap','lockp','delEvent','place'].includes(A)&&!u.captain)return no('Captain only');
  const tog=(a:string[],x:string)=>a.includes(x)?a.filter(y=>y!==x):[...a,x];
  switch(A){
   case 'status':ev.status=b.status;return save();
   case 'delEvent':await r.hdel('hiw:events',ev.id);return ok();
   case 'claim':if(ev.status!=='open')return no('Signups are not open');if(ev.pool.includes(u.id))return no('You already have a slot');if(ev.pool.length>=ev.times.length*4)return no('All slots taken');ev.pool.push(u.id);return save();
   case 'leave':if(ev.status!=='open')return no('Signups are closed');ev.pool=ev.pool.filter(x=>x!==u.id);ev.flights=ev.flights.map(f=>f.map(x=>x===u.id?null:x));return save();
   case 'leader':ev.leaders=tog(ev.leaders,b.pid);return save();
   case 'lockp':ev.locked=tog(ev.locked,b.pid);return save();
   case 'generate':gen(ev,b.mode,ps);return save();
   case 'place':{const fl=ev.flights;let from:number[]|null=null;fl.forEach((f,i)=>f.forEach((x,j)=>{if(x===b.pid)from=[i,j]}));if(!ev.pool.includes(b.pid))return no('Player not signed up');
    if(b.to){const occ=fl[b.to.f]?.[b.to.s];if(occ===undefined)return no('Bad slot');if(from)fl[from[0]][from[1]]=occ;fl[b.to.f][b.to.s]=b.pid}else if(from)fl[from[0]][from[1]]=null;return save()}
   case 'swap':{const x=ev.flights[b.x.f],y=ev.flights[b.y.f];[x[b.x.s],y[b.y.s]]=[y[b.y.s],x[b.x.s]];return save()}
   case 'score':{const inEv=ev.flights.flat();if(ev.status!=='published'||!inEv.includes(b.pid))return no('Not playing');if(!(u.captain||inEv.includes(u.id)))return no('Not in this round');
    const v=b.v==null?null:Math.max(1,Math.min(15,+b.v));const s=ev.scores[b.pid]||Array(18).fill(null);s[b.hole]=v;ev.scores[b.pid]=s;return save()}
  }
  return no('Unknown action');
 })}catch(e:any){return no(e.message)}
}
