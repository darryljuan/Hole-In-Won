import {r,me,Player,Ev} from '@/lib/db';
import {COURSES} from '@/lib/courses';
export const dynamic='force-dynamic';
export async function GET(){
 const [u,ps0,es0]=await Promise.all([me(),r.hgetall<Record<string,Player>>('hiw:players'),r.hgetall<Record<string,Ev>>('hiw:events')]);
 const ps=ps0||{};const es=Object.values(es0||{});
 const cap=!!u?.captain;
 const events=es.filter(e=>e.pool&&(cap||e.status!=='draft')).sort((a,b)=>(a.date+a.times[0]).localeCompare(b.date+b.times[0])).map(e=>({...(cap||e.status==='published'?e:{...e,leaders:[],locked:[],scores:{},flights:e.flights.map(f=>f.map(()=>null)),pool:e.pool.filter(p=>p===u?.id)}),n:e.pool.length}));
 return Response.json({me:u&&{id:u.id,name:u.name,captain:u.captain},players:Object.values(ps).map(({pin,...p})=>cap?{...p,pin}:p),events,courses:COURSES});
}
