import {r,me,Player,Ev} from '@/lib/db';
import {COURSES} from '@/lib/courses';
export const dynamic='force-dynamic';
export async function GET(){
 const u=await me();
 const ps=(await r.hgetall<Record<string,Player>>('hiw:players'))||{};
 const es=Object.values((await r.hgetall<Record<string,Ev>>('hiw:events'))||{});
 const cap=!!u?.captain;
 const events=es.filter(e=>cap||e.status!=='draft').sort((a,b)=>a.date.localeCompare(b.date)).map(e=>cap||e.status!=='closed'?e:{...e,leaders:[],flights:e.flights.map(f=>({...f,slots:f.slots.map(s=>s&&'?')}))});
 return Response.json({me:u&&{id:u.id,name:u.name,captain:u.captain},players:Object.values(ps).map(({pin,...p})=>p),events,courses:COURSES});
}
