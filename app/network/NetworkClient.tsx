'use client'
import { useEffect, useMemo, useState } from 'react'
import { Bell, Check, MessageCircle, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Request = { id:string; requester_profile_id:string; addressee_profile_id:string; status:string; note:string|null; created_at:string }
type Notice = { id:string; title:string; body:string|null; notification_type:string; read_at:string|null; created_at:string }

export default function NetworkClient(){
 const supabase=useMemo(()=>createClient(),[])
 const [requests,setRequests]=useState<Request[]>([])
 const [notices,setNotices]=useState<Notice[]>([])
 const [busy,setBusy]=useState<string|null>(null)
 const [message,setMessage]=useState('')
 const [chatId,setChatId]=useState<string|null>(null)
 const [chatText,setChatText]=useState('')
 const [messages,setMessages]=useState<{id:string;body:string;sender_profile_id:string;created_at:string}[]>([])

 async function load(){
  const {data:user}=await supabase.auth.getUser(); const me=user.user?.id
  if(!me)return
  const [r,n]=await Promise.all([
   supabase.from('connection_requests').select('id,requester_profile_id,addressee_profile_id,status,note,created_at').or('requester_profile_id.eq.'+me+',addressee_profile_id.eq.'+me).order('created_at',{ascending:false}).limit(30),
   supabase.from('notifications').select('id,title,body,notification_type,read_at,created_at').order('created_at',{ascending:false}).limit(30)
  ])
  setRequests((r.data||[]) as Request[]); setNotices((n.data||[]) as Notice[])
 }
 useEffect(()=>{void load()},[])

 async function respond(req:Request,status:'accepted'|'declined'){
  setBusy(req.id); setMessage('')
  const {error}=await supabase.from('connection_requests').update({status,responded_at:new Date().toISOString()}).eq('id',req.id)
  if(!error && status==='accepted') await supabase.from('member_connections').update({status:'accepted',responded_at:new Date().toISOString()}).eq('id',req.id)
  setBusy(null); setMessage(error?error.message:'Connection updated.'); await load()
 }

 async function openChat(profileId:string){
  const {data:user}=await supabase.auth.getUser(); const me=user.user?.id
  if(!me||me===profileId)return
  const {data:existing}=await supabase.from('conversations').select('id').eq('context_type','connection').order('created_at',{ascending:false}).limit(20)
  let id=existing?.[0]?.id
  if(!id){
   const created=await supabase.from('conversations').insert({created_by_profile_id:me,subject:'BeLoved connection',context_type:'connection',status:'open'}).select('id').single()
   if(created.error){setMessage(created.error.message);return} id=created.data.id
   const participants=await supabase.from('conversation_participants').insert([{conversation_id:id,profile_id:me,status:'active'},{conversation_id:id,profile_id:profileId,status:'active'}])
   if(participants.error){setMessage(participants.error.message);return}
  }
  setChatId(id)
  const {data:msgs}=await supabase.from('messages').select('id,body,sender_profile_id,created_at').eq('conversation_id',id).order('created_at',{ascending:true}).limit(50)
  setMessages((msgs||[]) as typeof messages)
 }

 async function send(){
  if(!chatId||!chatText.trim())return
  const {data:user}=await supabase.auth.getUser(); const me=user.user?.id
  if(!me)return
  const {data,error}=await supabase.from('messages').insert({conversation_id:chatId,sender_profile_id:me,body:chatText.trim(),message_type:'text',metadata:{source:'beloved_network'}}).select('id,body,sender_profile_id,created_at').single()
  if(error){setMessage(error.message);return}
  setMessages(v=>[...v,data as typeof messages[number]]); setChatText('')
 }

 return <div className="mx-auto max-w-6xl px-6 pb-24 lg:px-10"><div className="pt-12"><p className="text-xs uppercase tracking-[.3em] opacity-50">My Network</p><h1 className="mt-3 text-5xl font-light">Relationships become action.</h1><p className="mt-5 max-w-2xl leading-7 opacity-65">Connection requests, private messages, and signals from the People Market live here.</p></div>
 {message&&<div className="mt-6 rounded-2xl bg-white p-4 text-sm">{message}</div>}
 <div className="mt-12 grid gap-8 lg:grid-cols-2"><section><div className="flex items-center gap-3"><UserPlus className="h-5 w-5"/><h2 className="text-2xl font-light">Connections</h2></div><div className="mt-5 space-y-4">{requests.map(r=><article key={r.id} className="rounded-3xl border border-[#17364d]/10 bg-white p-6"><p className="text-sm opacity-60">{r.status}</p><p className="mt-2 leading-6">{r.note||'BeLoved connection request'}</p>{r.status==='pending'&&<div className="mt-5 flex gap-3"><button disabled={busy===r.id} onClick={()=>void respond(r,'accepted')} className="rounded-full bg-[#17364d] px-4 py-2 text-sm text-white"><Check className="mr-1 inline h-4 w-4"/>Accept</button><button disabled={busy===r.id} onClick={()=>void respond(r,'declined')} className="rounded-full border border-[#17364d]/15 px-4 py-2 text-sm">Decline</button></div>}{r.status==='accepted'&&<button onClick={()=>void openChat(r.requester_profile_id)} className="mt-5 rounded-full border border-[#17364d]/15 px-4 py-2 text-sm"><MessageCircle className="mr-1 inline h-4 w-4"/>Open private message</button>}</article>)}{requests.length===0&&<div className="rounded-3xl border border-dashed border-[#17364d]/15 p-8 opacity-60">Your network will appear here as relationships form.</div>}</div></section>
 <section><div className="flex items-center gap-3"><Bell className="h-5 w-5"/><h2 className="text-2xl font-light">Signals</h2></div><div className="mt-5 space-y-4">{notices.map(n=><article key={n.id} className="rounded-3xl border border-[#17364d]/10 bg-white p-6"><p className="font-medium">{n.title}</p><p className="mt-2 text-sm leading-6 opacity-60">{n.body}</p><p className="mt-3 text-xs opacity-40">{new Date(n.created_at).toLocaleString()}</p></article>)}{notices.length===0&&<div className="rounded-3xl border border-dashed border-[#17364d]/15 p-8 opacity-60">No new signals yet.</div>}</div></section></div>
 {chatId&&<section className="mt-10 rounded-[2rem] bg-white p-7 shadow-sm"><div className="flex items-center gap-3"><MessageCircle className="h-5 w-5"/><h2 className="text-2xl font-light">Private message</h2></div><div className="mt-5 max-h-72 space-y-3 overflow-y-auto">{messages.map(m=><div key={m.id} className="rounded-2xl bg-[#f7f4ed] p-4 text-sm">{m.body}</div>)}</div><div className="mt-5 flex gap-3"><input value={chatText} onChange={e=>setChatText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')void send()}} placeholder="Write a private message..." className="flex-1 rounded-xl border border-[#17364d]/10 px-4 py-3 outline-none"/><button onClick={()=>void send()} className="rounded-full bg-[#17364d] px-5 py-3 text-sm text-white">Send</button></div></section>}
 </div>
}
