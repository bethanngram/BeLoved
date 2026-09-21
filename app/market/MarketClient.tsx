'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, HeartHandshake, Loader2, MapPin, Plus, Search, Sparkles, Store, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Person = { profile_id:string; display_name:string|null; photo_url:string|null; city_region:string|null; interests:string[]; skills:string[]; help_offers:string[]; bio:string|null; accepts_asks:boolean; availability_status:string|null; professional_capability:string|null }
type Offer = { id:string; profile_id:string; title:string; description:string|null; category:string|null; offer_type:string|null; status:string; visibility:string|null }
type Ask = { id:string; profile_id:string; title:string; description:string|null; category:string|null; ask_type:string|null; urgency:string|null; status:string; visibility:string|null }
type Listing = { id:string; seller_id:string; title:string; description:string|null; category:string|null; price_cents:number|null; condition:string|null; image_url:string|null; location_text:string|null; status:string }

const actions = ['All','Help','Hire','Buy','Give','Join','Attend','Learn','Volunteer','Connect']

export default function MarketClient(){
  const supabase=useMemo(()=>createClient(),[])
  const [me,setMe]=useState<string|null>(null)
  const [people,setPeople]=useState<Person[]>([])
  const [offers,setOffers]=useState<Offer[]>([])
  const [asks,setAsks]=useState<Ask[]>([])
  const [listings,setListings]=useState<Listing[]>([])
  const [active,setActive]=useState('All')
  const [query,setQuery]=useState('')
  const [composer,setComposer]=useState(false)
  const [kind,setKind]=useState<'offer'|'ask'>('offer')
  const [title,setTitle]=useState('')
  const [description,setDescription]=useState('')
  const [category,setCategory]=useState('')
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')

  const load=useCallback(async()=>{
    setMessage('')
    const {data:user}=await supabase.auth.getUser()
    const id=user.user?.id||null
    setMe(id)
    if(!id)return
    const [p,o,a,l]=await Promise.all([
      supabase.from('member_directory').select('profile_id,display_name,photo_url,city_region,interests,skills,help_offers,bio,accepts_asks,availability_status,professional_capability').eq('discoverable',true).neq('profile_id',id).limit(60),
      supabase.from('offers').select('id,profile_id,title,description,category,offer_type,status,visibility').in('status',['open','active']).limit(60),
      supabase.from('asks').select('id,profile_id,title,description,category,ask_type,urgency,status,visibility').in('status',['open','active']).limit(60),
      supabase.from('marketplace_listings').select('id,seller_id,title,description,category,price_cents,condition,image_url,location_text,status').in('status',['active','available']).limit(60),
    ])
    const first=[p.error,o.error,a.error,l.error].find(Boolean)
    if(first){setMessage(first.message);return}
    setPeople((p.data||[]) as Person[]);setOffers((o.data||[]) as Offer[]);setAsks((a.data||[]) as Ask[]);setListings((l.data||[]) as Listing[])
  },[supabase])

  useEffect(()=>{void load()},[load])

  async function publish(){
    if(!me||!title.trim())return
    setBusy(true);setMessage('')
    const payload=kind==='offer'
      ? {profile_id:me,title:title.trim(),description:description.trim()||null,category:category.trim()||'community',offer_type:active==='All'?'Connect':active,status:'open',visibility:'community',metadata:{source:'people_market',action:active}}
      : {profile_id:me,title:title.trim(),description:description.trim()||null,category:category.trim()||'community',ask_type:active==='All'?'Help':active,urgency:'normal',status:'open',visibility:'community',metadata:{source:'people_market',action:active}}
    const {error}=await supabase.from(kind==='offer'?'offers':'asks').insert(payload)
    if(error)setMessage(error.message);else{setTitle('');setDescription('');setCategory('');setComposer(false);setMessage('Published to the People Market.');await load()}
    setBusy(false)
  }

  const q=query.trim().toLowerCase()
  const matches=(text:string)=>!q||text.toLowerCase().includes(q)
  const filteredPeople=people.filter(p=>matches([p.display_name,p.city_region,p.bio,p.professional_capability,...(p.skills||[]),...(p.interests||[])].filter(Boolean).join(' ')))
  const filteredOffers=offers.filter(o=>matches([o.title,o.description,o.category,o.offer_type].filter(Boolean).join(' '))&&(active==='All'||o.offer_type===active||active==='Help'))
  const filteredAsks=asks.filter(a=>matches([a.title,a.description,a.category,a.ask_type].filter(Boolean).join(' '))&&(active==='All'||a.ask_type===active||active==='Help'))
  const filteredListings=listings.filter(l=>matches([l.title,l.description,l.category,l.location_text].filter(Boolean).join(' '))&&(active==='All'||active==='Buy'))

  return <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
    <section className="pt-12 lg:pt-16"><p className="text-[10px] uppercase tracking-[.3em] text-[#557060]">The People Market</p><div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_.8fr]"><div><h1 className="max-w-5xl font-serif text-5xl font-light leading-[1.02] md:text-7xl">Discover people, capability, needs, and opportunity — locally.</h1><p className="mt-6 max-w-3xl text-lg leading-8 opacity-65">Not a catalog of people. A living market of what people can create, teach, repair, build, offer, need, and do together.</p></div><div className="rounded-[2rem] bg-[#17364d] p-7 text-[#f7f4ed]"><Sparkles/><h2 className="mt-6 text-2xl font-light">Human potential is the inventory.</h2><p className="mt-3 leading-7 opacity-65">Connection, learning, service, employment, giving, and belonging are all valid outcomes.</p></div></div></section>

    <section className="mt-10 flex flex-wrap gap-2">{actions.map(a=><button key={a} onClick={()=>setActive(a)} className={`rounded-full px-4 py-2 text-sm ${active===a?'bg-[#17364d] text-white':'border border-[#17364d]/10 bg-white/70'}`}>{a}</button>)}</section>
    <section className="mt-4 flex flex-col gap-3 md:flex-row"><label className="flex flex-1 items-center gap-3 rounded-2xl bg-white px-5 py-4"><Search size={18} className="opacity-40"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search people, skills, help, businesses, knowledge..." className="w-full bg-transparent outline-none"/></label><button onClick={()=>setComposer(v=>!v)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#17364d] px-6 py-4 text-sm text-white"><Plus size={17}/> Put something into the market</button></section>

    {message&&<div className="mt-4 rounded-2xl bg-white p-4 text-sm">{message}</div>}
    {composer&&<section className="mt-5 rounded-[2rem] bg-white p-7"><div className="flex flex-wrap gap-2"><button onClick={()=>setKind('offer')} className={`rounded-full px-4 py-2 text-sm ${kind==='offer'?'bg-[#17364d] text-white':'border border-[#17364d]/10'}`}>I can offer</button><button onClick={()=>setKind('ask')} className={`rounded-full px-4 py-2 text-sm ${kind==='ask'?'bg-[#17364d] text-white':'border border-[#17364d]/10'}`}>I need</button></div><div className="mt-5 grid gap-3 md:grid-cols-2"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder={kind==='offer'?'What can you offer?':'What do you need?'} className="rounded-xl border border-[#17364d]/10 px-4 py-3 outline-none"/><input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category" className="rounded-xl border border-[#17364d]/10 px-4 py-3 outline-none"/><textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Tell the community more..." rows={4} className="rounded-xl border border-[#17364d]/10 px-4 py-3 outline-none md:col-span-2"/></div><div className="mt-4 flex gap-3"><button disabled={busy||!title.trim()} onClick={()=>void publish()} className="rounded-full bg-[#17364d] px-5 py-3 text-sm text-white disabled:opacity-40">{busy?<Loader2 className="inline h-4 w-4 animate-spin"/>:'Publish'}</button><button onClick={()=>setComposer(false)} className="rounded-full border border-[#17364d]/10 px-5 py-3 text-sm">Close</button></div></section>}

    <section className="mt-12 grid gap-5 lg:grid-cols-3">
      <Panel title="People" icon={<Users/>}>{filteredPeople.slice(0,12).map(p=><Link href={`/people/${p.profile_id}`} key={p.profile_id} className="block rounded-2xl bg-[#f7f4ed] p-5"><div className="flex gap-4">{p.photo_url?<img src={p.photo_url} className="h-12 w-12 rounded-full object-cover" alt=""/>:<div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white">{(p.display_name||'B').charAt(0)}</div>}<div className="min-w-0"><p className="truncate font-medium">{p.display_name||'BeLoved member'}</p><p className="mt-1 text-xs opacity-45">{p.city_region||'Local member'}</p></div></div><p className="mt-4 text-sm leading-6 opacity-60">{p.professional_capability||p.bio||'Capability waiting to be discovered.'}</p><div className="mt-3 flex flex-wrap gap-1">{(p.skills||[]).slice(0,3).map(s=><span key={s} className="rounded-full bg-white px-2 py-1 text-[10px]">{s}</span>)}</div></Link>)}{!filteredPeople.length&&<Empty text="No people match this search yet."/>}</Panel>
      <Panel title="Offers & help" icon={<HeartHandshake/>}>{[...filteredOffers,...filteredAsks].slice(0,12).map((item:any)=><Link href={`/people/${item.profile_id}`} key={item.id} className="block rounded-2xl bg-[#f7f4ed] p-5"><p className="text-[9px] uppercase tracking-[.2em] text-[#557060]">{'offer_type' in item?'Offer':'Need'} · {item.category||'Community'}</p><p className="mt-2 font-medium">{item.title}</p>{item.description&&<p className="mt-2 text-sm leading-6 opacity-55">{item.description}</p>}<span className="mt-4 inline-flex items-center gap-1 text-xs">Open person <ArrowRight size={13}/></span></Link>)}{!filteredOffers.length&&!filteredAsks.length&&<Empty text="No live offers or needs match this search yet."/>}</Panel>
      <Panel title="Artifacts" icon={<Store/>}>{filteredListings.slice(0,12).map(l=><article key={l.id} className="rounded-2xl bg-[#f7f4ed] p-5">{l.image_url&&<img src={l.image_url} alt="" className="mb-4 h-36 w-full rounded-xl object-cover"/>}<p className="font-medium">{l.title}</p><p className="mt-1 text-xs opacity-45">{l.location_text||'Local'} · {l.category||'Artifact'}</p><p className="mt-3 text-sm leading-6 opacity-55">{l.description}</p>{l.price_cents!=null&&<p className="mt-4 font-medium">${(l.price_cents/100).toFixed(2)}</p>}<Link href={`/people/${l.seller_id}`} className="mt-4 inline-flex items-center gap-1 text-xs">Meet the maker <ArrowRight size={13}/></Link></article>)}{!filteredListings.length&&<Empty text="Local artifacts will appear here as members list what they make."/>}</Panel>
    </section>

    <section className="mt-10 grid gap-4 md:grid-cols-3"><Link href="/hey-neighbor" className="rounded-3xl bg-[#17364d] p-6 text-white"><MapPin/><h3 className="mt-4 text-xl font-light">Hey Neighbor</h3><p className="mt-2 text-sm opacity-60">Turn a need into a local action.</p></Link><Link href="/network" className="rounded-3xl bg-white p-6"><Users/><h3 className="mt-4 text-xl font-light">Relationships</h3><p className="mt-2 text-sm opacity-55">Build trust through actual connection.</p></Link><Link href="/journey" className="rounded-3xl bg-white p-6"><Sparkles/><h3 className="mt-4 text-xl font-light">Growth</h3><p className="mt-2 text-sm opacity-55">Let capability grow from formation.</p></Link></section>
  </div>
}

function Panel({title,icon,children}:{title:string;icon:React.ReactNode;children:React.ReactNode}){return <section className="rounded-[2rem] bg-white p-6"><div className="flex items-center gap-3"><span className="opacity-45">{icon}</span><h2 className="font-serif text-2xl font-light">{title}</h2></div><div className="mt-5 space-y-3">{children}</div></section>}
function Empty({text}:{text:string}){return <div className="rounded-2xl border border-dashed border-[#17364d]/10 p-6 text-sm opacity-50">{text}</div>}
