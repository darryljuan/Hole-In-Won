'use client';
import {useEffect,useState,useCallback,useRef} from 'react';
import {DndContext,MouseSensor,TouchSensor,useSensor,useSensors,useDraggable,useDroppable,DragOverlay,pointerWithin,rectIntersection} from '@dnd-kit/core';
const B='rounded-full bg-gold px-5 py-3 font-semibold tracking-wide text-deep active:scale-95 disabled:opacity-40';
const G='rounded-full border border-gold/70 px-4 py-2 text-gold active:scale-95 disabled:opacity-40';
const I='w-full rounded-xl border border-gold/30 bg-deep p-3 text-cream placeholder:text-cream/40';
const C='space-y-2 rounded-2xl border border-gold/25 bg-rolex/40 p-4';
const H='font-serif uppercase tracking-widest text-gold';
const post=(a:string,b:any={})=>fetch('/api/act',{method:'POST',body:JSON.stringify({a,...b})}).then(r=>r.json());
const fd=(s:string)=>new Date(s+'T00:00').toLocaleDateString('en-SG',{weekday:'short',day:'numeric',month:'short'});
const tp=(n:number)=>n===0?'E':n>0?`+${n}`:`${n}`;
const sum=(a:any[])=>a.reduce((x:number,y:any)=>x+(y||0),0);
const TH:any={tampines:'border-gold/40 border-l-gold bg-gold/10',garden:'border-teal-300/30 border-l-teal-300 bg-teal-400/10'};
const TG:any={tampines:'bg-gold text-deep',garden:'bg-teal-300 text-deep'};
function Chip({id,label}:{id:string;label:string}){const {setNodeRef,listeners,attributes,isDragging}=useDraggable({id});return <div ref={setNodeRef} {...listeners} {...attributes} style={{WebkitTouchCallout:'none',WebkitUserSelect:'none',userSelect:'none'} as any} className={`flex cursor-grab items-center justify-between rounded-lg bg-deep px-3 py-2 ${isDragging?'opacity-30':''}`}><span>{label}</span><span className="px-2 text-xl text-gold">⠿</span></div>}
function Drop({id,children}:{id:string;children:any}){const {setNodeRef,isOver}=useDroppable({id});return <div ref={setNodeRef} className={`min-h-[44px] rounded-xl border border-dashed p-1 ${isOver?'border-gold bg-gold/20':'border-gold/30'}`}>{children}</div>}
export default function Home(){
 const [d,setD]=useState<any>(null),[tab,setTab]=useState('fl'),[date,setDate]=useState(''),[crs,setCrs]=useState(''),[tgt,setTgt]=useState(''),[others,setOthers]=useState(false),[ceid,setCeid]=useState(''),[pick,setPick]=useState<number[]|null>(null),[busy,setBusy]=useState(0),[err,setErr]=useState(''),[f,setF]=useState<any>({gender:'M'}),[g,setG]=useState<any>({courseId:'tampines'});
 const pend=useRef(0),last=useRef(0),q=useRef<Promise<any>>(Promise.resolve());
 const [sub,setSub]=useState('fl'),[sp,setSp]=useState(0),[act,setAct]=useState('');
 const sens=useSensors(useSensor(MouseSensor,{activationConstraint:{distance:6}}),useSensor(TouchSensor,{activationConstraint:{delay:200,tolerance:8}}));
 useEffect(()=>{const f=()=>setSp(Math.min(1,scrollY/Math.max(1,document.body.scrollHeight-innerHeight)));const n=()=>{};addEventListener('scroll',f);addEventListener('touchmove',n,{passive:false});return()=>{removeEventListener('scroll',f);removeEventListener('touchmove',n)}},[]);
 const load=useCallback(async()=>{const j=await fetch('/api/state',{cache:'no-store'}).then(r=>r.json());if(pend.current>0||Date.now()-last.current<2500)return;setD(j)},[]);
 useEffect(()=>{const vis=()=>document.visibilityState==='visible';load();const t=setInterval(()=>vis()&&load(),tab==='sc'||tab==='bd'?3000:8000);const v=()=>vis()&&load();document.addEventListener('visibilitychange',v);return()=>{clearInterval(t);document.removeEventListener('visibilitychange',v)}},[load,tab]);
 const call=async(a:string,b:any={})=>{setBusy(n=>n+1);try{return await post(a,b)}finally{setBusy(n=>n-1)}};
 const run=async(a:string,b:any={})=>{const j=await call(a,b);setErr(j.error||'');await load();return j};
 const spin=(busy>0||!d)&&<div className="fixed right-3 top-3 z-50 h-7 w-7 animate-spin rounded-full border-2 border-gold border-t-transparent"/>;
 if(!d)return <main className="p-6">{spin}</main>;
 const Title=<h1 className={H+' text-center text-3xl'}>Hole-In-Won</h1>;
 if(!d.me){const first=!d.players.length;return(<main className="mx-auto max-w-md space-y-3 p-6 pt-16">{spin}{Title}<p className="pb-4 text-center text-xs uppercase tracking-[0.3em] text-cream/60">Good company · Great rounds</p>
  {first?<><p>First run: create the captain account.</p><input className={I} placeholder="Your name" onChange={e=>setF({...f,name:e.target.value})}/><select className={I} onChange={e=>setF({...f,gender:e.target.value})}><option value="M">Male</option><option value="F">Female</option></select><input className={I} placeholder="PIN" inputMode="numeric" onChange={e=>setF({...f,pin:e.target.value})}/><button className={B+' w-full'} onClick={()=>run('addPlayer',f)}>Create captain</button></>
  :<><select className={I} onChange={e=>setF({...f,id:e.target.value})}><option value="">Pick your name</option>{d.players.map((p:any)=><option key={p.id} value={p.id}>{p.name}</option>)}</select><input className={I} placeholder="PIN" inputMode="numeric" onChange={e=>setF({...f,pin:e.target.value})}/><button className={B+' w-full'} onClick={()=>run('login',f)}>Sign in</button></>}
  {err&&<p className="text-red-400">{err}</p>}</main>)}
 const cap=d.me.captain,me=d.me.id,P=(id:string|null)=>d.players.find((p:any)=>p.id===id)?.name||'',cn=(id:string)=>d.courses.find((c:any)=>c.id===id)?.name;
 const today=new Date().toISOString().slice(0,10),dates=[...new Set(d.events.map((e:any)=>e.date))] as string[];
 const dt=dates.includes(date)?date:dates.find(x=>x>=today)||dates[dates.length-1]||'';
 const dayEvs=d.events.filter((e:any)=>e.date===dt),cl=[...new Set(dayEvs.map((e:any)=>e.courseId))] as string[],cr=cl.includes(crs)?crs:cl[0];
 const pubs=dayEvs.filter((e:any)=>e.courseId===cr&&e.status==='published'),slots=(e:any)=>e.times.length*4;
 const dp=<div className="flex gap-2 overflow-x-auto pb-1">{dates.map(x=><button key={x} className={(x===dt?B:G)+' shrink-0 !px-4 !py-2'} onClick={()=>setDate(x)}>{fd(x)}</button>)}</div>;
 const cp=cl.length>1&&<div className="flex gap-2">{cl.map(c=><button key={c} className={(c===cr?B:G)+' !px-4 !py-2'} onClick={()=>setCrs(c)}>{cn(c)}</button>)}</div>;
 const evOf=(pid:string)=>pubs.find((e:any)=>e.flights.flat().includes(pid));
 const allPl=pubs.flatMap((e:any)=>e.flights.flat().filter(Boolean)) as string[];
 const t=tgt&&allPl.includes(tgt)?tgt:allPl.includes(me)?me:allPl[0],te=t&&evOf(t),course=te&&d.courses.find((c:any)=>c.id===te.courseId),cs=(te&&te.scores[t])||Array(18).fill(null);
 const sc=(pid:string,h:number,v:number|null)=>{const e=evOf(pid);setD((p:any)=>({...p,events:p.events.map((x:any)=>x.id===e.id?{...x,scores:{...x.scores,[pid]:Object.assign([...(x.scores[pid]||Array(18).fill(null))],{[h]:v})}}:x)}));pend.current++;last.current=Date.now();q.current=q.current.then(()=>post('score',{eid:e.id,pid,hole:h,v})).then(j=>{if(j.error)setErr(j.error)}).finally(()=>{pend.current--;last.current=Date.now()})};
 const rows=pubs.flatMap((e:any)=>{const c=d.courses.find((c:any)=>c.id===e.courseId);return e.flights.flat().filter(Boolean).map((id:string)=>{const s=e.scores[id]||[];const pl=s.map((v:any,i:number)=>v==null?-1:i).filter((i:number)=>i>=0);const gr=sum(pl.map((i:number)=>s[i]));return{id,g:gr,thru:pl.length,tp:gr-sum(pl.map((i:number)=>c.par[i]))}})}).sort((a:any,b:any)=>Number(b.thru>0)-Number(a.thru>0)||a.tp-b.tp||b.thru-a.thru);
 const ce=d.events.find((e:any)=>e.id===ceid)||d.events[d.events.length-1];
 const share=()=>{const x=`⛳ ${fd(ce.date)} · ${cn(ce.courseId)}\n${ce.flights.map((f:any,i:number)=>`Flight ${i+1} ${ce.times[i]}: ${f.filter(Boolean).map(P).join(', ')}`).join('\n')}\n\nGroupings & live scores: ${location.origin}`;navigator.clipboard?.writeText(x);window.open('https://wa.me/?text='+encodeURIComponent(x))};
 const list=[...d.events.filter((e:any)=>e.date>=today),...d.events.filter((e:any)=>e.date<today).reverse()];
 const onEnd=(x:any)=>{const a=String(x.active.id).split('|'),o=x.over&&String(x.over.id).split('|');if(!o||a[1]!==o[1])return;const eid=a[1],pid=a[2],to=o[0]==='s'?{f:+o[2],s:+o[3]}:null;
  setD((p:any)=>({...p,events:p.events.map((e:any)=>{if(e.id!==eid)return e;const fl=e.flights.map((f:any)=>[...f]);let from:any=null;fl.forEach((f:any,i:number)=>f.forEach((y:any,j:number)=>{if(y===pid)from=[i,j]}));if(to){const occ=fl[to.f][to.s];if(from)fl[from[0]][from[1]]=occ;fl[to.f][to.s]=pid}else if(from)fl[from[0]][from[1]]=null;return{...e,flights:fl}})}));
  pend.current++;last.current=Date.now();q.current=q.current.then(()=>post('place',{eid,pid,to})).then(j=>{if(j.error)setErr(j.error)}).finally(()=>{pend.current--;last.current=Date.now()})};
 const shareE=(e:any)=>{const x=`⛳ ${fd(e.date)} · ${cn(e.courseId)}\n${e.flights.map((f:any,i:number)=>`Flight ${i+1} ${e.times[i]}: ${f.filter(Boolean).map(P).join(', ')}`).join('\n')}\n\nGroupings & live scores: ${location.origin}`;navigator.clipboard?.writeText(x);window.open('https://wa.me/?text='+encodeURIComponent(x))};
 const tabs=[['fl','Flights'],['sc','Score'],['bd','Board'],...(cap?[['cap','Captain']]:[])];
 return(<main className="mx-auto max-w-md space-y-3 p-4">{spin}
  <header className="flex items-center justify-between"><span className={H+' text-lg'}>Hole-In-Won</span><button className="text-xs text-cream/60" onClick={()=>run('logout')}>{d.me.name} · Sign out</button></header>
  {err&&<p className="text-red-400">{err}</p>}
  {tab==='fl'&&<section className="space-y-3">{dp}{!dayEvs.length&&<p className="text-cream/60">No flights released yet.</p>}
   {dayEvs.map((e:any)=>{const mine=e.pool.includes(me),fi=e.flights.findIndex((x:any)=>x.includes(me)),full=e.n>=slots(e);return <div key={e.id} className={C}>
    <div className="flex items-baseline justify-between"><span className={H+' text-lg'}>{cn(e.courseId)}</span><span className="text-xs uppercase tracking-widest text-cream/60">{e.status}</span></div>
    <div>{fd(e.date)} · Tee {e.times.join(' · ')}</div><div className="text-sm text-cream/70">{e.n} of {slots(e)} slots taken</div>
    {e.status==='open'&&(mine?<><p className="text-gold">You're in ✓</p><button className={G} onClick={()=>run('leave',{eid:e.id})}>Leave</button></>:<button className={B} disabled={full} onClick={()=>run('claim',{eid:e.id})}>{full?'Full':'Claim a slot'}</button>)}
    {e.status==='closed'&&<p>{mine&&"You're in ✓ · "}Signups closed. Groupings coming soon.</p>}
    {e.status==='published'&&<>{fi>=0&&<p className="text-gold">You're in Flight {fi+1} · {e.times[fi]}</p>}{e.flights.map((x:any,i:number)=><div key={i} className="rounded-xl bg-deep/60 p-3 text-sm"><b className="text-gold">Flight {i+1} · {e.times[i]}</b><div>{x.filter(Boolean).map((p:string)=>(e.leaders.includes(p)?'★ ':'')+P(p)).join(', ')}</div></div>)}</>}
   </div>})}</section>}
  {tab==='sc'&&<section className="space-y-3">{dp}{cp}
   {!te?<p className="text-cream/60">Scoring opens once groupings are published.</p>:<>
    <div className="text-center"><div className={H+' text-xl'}>{P(t)}{t===me&&' (you)'}</div><div className="text-sm text-cream/60">{course.name} · Par {sum(course.par)}</div></div>
    {t!==me&&allPl.includes(me)&&<button className={G+' w-full'} onClick={()=>setTgt(me)}>← Back to my card</button>}
    {[0,1].map(h9=><div key={h9} className={C}>{course.par.slice(h9*9,h9*9+9).map((par:number,i:number)=>{const h=h9*9+i,v=cs[h];return <div key={h} className="flex items-center justify-between"><span>{h+1} <small className="text-cream/50">Par {par}</small></span><span className="flex items-center gap-3"><button className={G} onClick={()=>sc(t,h,v==null?null:Math.max(1,v-1))}>−</button><b className="w-8 text-center text-xl">{v??'–'}</b><button className={B+' !px-4 !py-2'} onClick={()=>sc(t,h,v==null?par:Math.min(15,v+1))}>+</button></span></div>})}<div className="border-t border-gold/20 pt-2 text-right text-gold">{h9?'IN':'OUT'} {sum(cs.slice(h9*9,h9*9+9))}</div></div>)}
    <div className="text-center font-serif text-2xl text-gold">Total {sum(cs)}</div>
    <button className={G+' w-full'} onClick={()=>setOthers(!others)}>Update for others</button>
    {others&&<div className={C}>{allPl.map(id=><button key={id} className={(id===t?B:G)+' mb-2 mr-2 !px-4 !py-2'} onClick={()=>{setTgt(id);setOthers(false);scrollTo(0,0)}}>{P(id)}{id===me&&' (me)'}</button>)}</div>}</>}</section>}
  {tab==='bd'&&<section className="space-y-2">{dp}{cp}{!rows.length&&<p className="text-cream/60">Leaderboard appears once groupings are published.</p>}{rows.map((x:any,i:number)=><div key={x.id} className={C+' flex items-center justify-between !space-y-0'}><span>{i+1}. {P(x.id)}</span><span><b className="font-serif text-2xl text-gold">{x.thru?tp(x.tp):'–'}</b> <small className="text-cream/60">{x.g} · thru {x.thru}</small></span></div>)}<p className="text-center text-xs text-cream/40">Live · gross · all flights this day & course</p></section>}
  {tab==='cap'&&cap&&<section className="space-y-3">
   <div className="flex gap-2">{[['fl','Manage flights'],['pl','Manage players']].map(([k,l])=><button key={k} className={(sub===k?B:G)+' flex-1 !px-3 !py-2 text-sm'} onClick={()=>setSub(k)}>{l}</button>)}</div>
   {sub==='pl'&&<div className={C}><b className={H}>Players ({d.players.length})</b>{d.players.map((p:any)=><div key={p.id} className="space-y-1 border-b border-gold/15 pb-2"><div className="flex items-center justify-between"><span>{p.name} · {p.gender}{p.captain&&' · ★ captain'}</span>{p.id!==me&&<button className="text-sm text-red-400" onClick={()=>confirm(`Remove ${p.name}?`)&&run('removePlayer',{pid:p.id})}>Remove</button>}</div><div className="flex items-center gap-2"><span className="text-xs text-cream/60">PIN</span><input key={p.id+p.pin} defaultValue={p.pin} inputMode="numeric" className={I+' !w-24 !p-2'} onBlur={e=>e.target.value!==p.pin&&run('setPin',{pid:p.id,pin:e.target.value})}/>{p.id!==me&&<button className={G+' !px-3 !py-1 text-sm'} onClick={()=>run('setCaptain',{pid:p.id,captain:!p.captain})}>{p.captain?'Remove captain':'Make captain'}</button>}</div></div>)}
    <p className="text-xs text-cream/50">PIN saves when you tap away from the box.</p><b className={H}>Add player</b><input className={I} placeholder="Name" onChange={e=>setF({...f,name:e.target.value})}/><select className={I} onChange={e=>setF({...f,gender:e.target.value})}><option value="M">Male</option><option value="F">Female</option></select><input className={I} placeholder="PIN (4-8 digits)" inputMode="numeric" onChange={e=>setF({...f,pin:e.target.value})}/><button className={B} onClick={()=>run('addPlayer',f)}>Add player</button></div>}
   {sub==='fl'&&<>
    <div className={C}><b className={H}>New flights</b><input className={I} type="date" onChange={e=>setG({...g,date:e.target.value})}/><select className={I} onChange={e=>setG({...g,courseId:e.target.value})}>{d.courses.map((c:any)=><option key={c.id} value={c.id}>{c.name}</option>)}</select><input className={I} placeholder="Tee times: 07:30, 07:42, 07:54" onChange={e=>setG({...g,times:e.target.value.split(',').map((s:string)=>s.trim()).filter(Boolean)})}/><button className={B} onClick={()=>run('createEvent',g)}>Create draft</button></div>
    <DndContext sensors={sens} collisionDetection={(a:any)=>{const q=pointerWithin(a);return q.length?q:rectIntersection(a)}} onDragStart={(x:any)=>setAct(String(x.active.id))} onDragCancel={()=>setAct('')} onDragEnd={(x:any)=>{setAct('');onEnd(x)}}>{list.map((e:any,i:number)=>{const un=e.pool.filter((p:string)=>!e.flights.flat().includes(p));return <div key={e.id}>
     {(i===0||list[i-1].date!==e.date)&&<div className="mb-2 mt-4 flex items-center gap-3"><span className={H+' text-sm'}>{fd(e.date)}{e.date<today&&' · past'}</span><span className="h-px flex-1 bg-gold/30"/></div>}
     <div className={`space-y-2 rounded-2xl border border-l-4 p-4 ${TH[e.courseId]||TH.tampines}`}>
      <div className="flex items-center justify-between"><span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest ${TG[e.courseId]||TG.tampines}`}>{cn(e.courseId)}</span><span className="text-xs text-cream/60">Tee {e.times.join(' · ')}</span></div>
      <div className="flex flex-wrap gap-2">{[['draft','Draft'],['open','Release'],['closed','Close'],['published','Publish']].map(([s,l])=><button key={s} className={(e.status===s?B:G)+' !px-3 !py-1 text-sm'} onClick={()=>run('status',{eid:e.id,status:s})}>{l}</button>)}</div>
      <b className="text-sm text-gold">Signed up {e.pool.length}/{slots(e)} · unassigned {un.length}</b>
      <Drop id={`t|${e.id}`}>{un.length?un.map((p:string)=><div key={p} className="my-1"><Chip id={`p|${e.id}|${p}`} label={P(p)}/></div>):<p className="p-2 text-xs text-cream/40">Everyone is placed</p>}</Drop>
      {e.flights.map((x:any,fi:number)=><div key={fi}><b className="text-sm text-gold">Flight {fi+1} · {e.times[fi]}</b>{x.map((s:string|null,si:number)=><div key={si} className="mt-1"><Drop id={`s|${e.id}|${fi}|${si}`}>{s?<Chip id={`p|${e.id}|${s}`} label={P(s)}/>:<p className="p-2 text-xs text-cream/40">Drop player here</p>}</Drop></div>)}</div>)}
      <div className="flex items-center justify-between"><button className={G+' !px-3 !py-1 text-sm'} onClick={()=>shareE(e)}>📲 WhatsApp</button><button className="text-sm text-red-400" onClick={()=>confirm('Delete these flights?')&&run('delEvent',{eid:e.id})}>Delete</button></div>
     </div></div>})}<DragOverlay>{act?<div className="rounded-lg bg-gold px-4 py-2 font-semibold text-deep shadow-xl">{P(act.split('|')[2])}</div>:null}</DragOverlay></DndContext>
    {!list.length&&<p className="text-cream/60">No flights yet.</p>}
    <div className="pointer-events-none fixed bottom-24 right-1 top-20 z-30 flex flex-col items-center justify-between text-[9px] uppercase tracking-widest text-gold/70"><span style={{writingMode:'vertical-rl'}}>Upcoming</span><div className="relative my-2 w-px flex-1 bg-gradient-to-b from-gold to-gold/10"><i className="absolute -left-[5px] h-3 w-3 rounded-full bg-gold" style={{top:`${sp*96}%`}}/></div><span style={{writingMode:'vertical-rl'}}>Future</span></div>
   </>}
  </section>}
  <nav className="fixed inset-x-0 bottom-0 flex border-t border-gold/30 bg-deep">{tabs.map(([k,l])=><button key={k} className={`flex-1 py-4 text-xs uppercase tracking-widest ${tab===k?'text-gold':'text-cream/50'}`} onClick={()=>setTab(k)}>{l}</button>)}</nav>
 </main>)}
