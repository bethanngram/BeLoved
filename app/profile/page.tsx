import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { BelovedHeader } from '@/components/BelovedHeader'
import { createClient } from '@/lib/supabase/server'

function listValue(value: string) { return value.split(',').map((item) => item.trim()).filter(Boolean) }

async function saveProfile(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const profileId = auth?.claims?.sub ? String(auth.claims.sub) : null
  if (!profileId) redirect('/login')

  const name = String(formData.get('name') ?? '').trim()
  const bio = String(formData.get('bio') ?? '').trim()
  const location = String(formData.get('location') ?? '').trim()
  const season = String(formData.get('season') ?? '').trim()
  const vision = String(formData.get('vision') ?? '').trim()
  const priorities = String(formData.get('priorities') ?? '').trim()
  const skills = listValue(String(formData.get('skills') ?? ''))
  const interests = listValue(String(formData.get('interests') ?? ''))
  const helpOffers = listValue(String(formData.get('help_offers') ?? ''))
  const capability = String(formData.get('capability') ?? '').trim()
  const community = String(formData.get('community') ?? '').trim()
  const tradition = String(formData.get('tradition') ?? '').trim()
  const church = String(formData.get('church') ?? '').trim()
  const timezone = String(formData.get('timezone') ?? '').trim() || 'America/Chicago'

  await Promise.all([
    supabase.from('profiles').update({ name: name || null, bio: bio || null, location_text: location || null, updated_at: new Date().toISOString() }).eq('id', profileId),
    supabase.from('life').upsert({ profile_id: profileId, current_season: season || null, vision: vision || null, priorities: priorities || null, updated_at: new Date().toISOString() }, { onConflict: 'profile_id' }),
    supabase.from('member_directory').upsert({ profile_id: profileId, discoverable: true, display_name: name || null, city_region: location || null, bio: bio || null, skills, interests, help_offers: helpOffers, professional_capability: capability || null, accepts_asks: true, updated_at: new Date().toISOString() }, { onConflict: 'profile_id' }),
    supabase.from('member_settings').upsert({ profile_id: profileId, timezone, morning_start: String(formData.get('morning') ?? '06:00'), evening_start: String(formData.get('evening') ?? '18:00'), night_start: String(formData.get('night') ?? '22:00'), updated_at: new Date().toISOString() }, { onConflict: 'profile_id' }),
    supabase.from('member_belonging').upsert({ profile_id: profileId, christian_tradition: tradition || null, church_name: church || null, community_name: community || null, updated_at: new Date().toISOString() }, { onConflict: 'profile_id' }),
  ])

  revalidatePath('/')
  revalidatePath('/profile')
  revalidatePath('/journey')
  redirect('/profile')
}

async function recordReflection(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const profileId = auth?.claims?.sub ? String(auth.claims.sub) : null
  if (!profileId) redirect('/login')
  const body = String(formData.get('reflection') ?? '').trim()
  if (!body) redirect('/profile')
  await supabase.from('personal_thread_entries').insert({ profile_id: profileId, entry_key: 'reflection', entry_title: 'What I noticed', entry_body: body, reflected_at: new Date().toISOString() })
  revalidatePath('/profile')
  revalidatePath('/journey')
  redirect('/profile')
}

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  if (!auth?.claims?.sub) {
    return <main className="grid min-h-screen place-items-center bg-[#f7f4ed] px-6 text-[#17364d]"><div className="text-center"><p className="text-[10px] uppercase tracking-[.3em] text-[#557060]">BeLoved</p><h1 className="mt-5 font-serif text-5xl font-light">Your life has a place here.</h1><Link href="/login" className="mt-8 inline-flex rounded-full bg-[#17364d] px-6 py-3 text-sm text-white">Enter BeLoved</Link></div></main>
  }

  const id = String(auth.claims.sub)
  const [{ data: profile }, { data: life }, { data: settings }, { data: directory }, { data: belonging }, { data: thread }] = await Promise.all([
    supabase.from('profiles').select('name,email,bio,location_text,membership_tier,account_status').eq('id', id).maybeSingle(),
    supabase.from('life').select('life_stage,current_season,vision,priorities').eq('profile_id', id).maybeSingle(),
    supabase.from('member_settings').select('timezone,morning_start,evening_start,night_start').eq('profile_id', id).maybeSingle(),
    supabase.from('member_directory').select('display_name,city_region,interests,skills,help_offers,professional_capability,bio').eq('profile_id', id).maybeSingle(),
    supabase.from('member_belonging').select('christian_tradition,church_name,community_name').eq('profile_id', id).maybeSingle(),
    supabase.from('personal_thread_entries').select('id,entry_title,entry_body,reflection_text,reflected_at,created_at').eq('profile_id', id).order('created_at', { ascending: false }).limit(8),
  ])

  return <main className="min-h-screen bg-[#f7f4ed] text-[#17364d]"><BelovedHeader /><div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
    <section className="border-b border-[#17364d]/10 py-12"><p className="text-[10px] uppercase tracking-[.3em] text-[#557060]">Profile · Life · Rhythm</p><h1 className="mt-4 max-w-4xl font-serif text-5xl font-light leading-[1.02] sm:text-6xl">Nothing to prove. Everything to steward.</h1><p className="mt-5 max-w-2xl leading-8 opacity-65">Keep the living parts of your life in one place so BeLoved can connect relevance without reducing you to a profile.</p></section>
    <form action={saveProfile} className="mt-8 grid gap-6 lg:grid-cols-[1fr_.82fr]">
      <section className="rounded-[2rem] bg-white p-7"><p className="text-[9px] uppercase tracking-[.28em] text-[#557060]">Who I am</p><div className="mt-5 grid gap-4">
        <Field name="name" label="Name" defaultValue={profile?.name ?? directory?.display_name ?? ''} />
        <Field name="location" label="Place" defaultValue={profile?.location_text ?? directory?.city_region ?? ''} />
        <Field name="bio" label="A few words about me" defaultValue={profile?.bio ?? directory?.bio ?? ''} textarea />
        <Field name="capability" label="Professional capability" defaultValue={directory?.professional_capability ?? ''} />
        <Field name="skills" label="Skills · comma separated" defaultValue={(directory?.skills ?? []).join(', ')} />
        <Field name="interests" label="Interests · comma separated" defaultValue={(directory?.interests ?? []).join(', ')} />
        <Field name="help_offers" label="What I can offer · comma separated" defaultValue={(directory?.help_offers ?? []).join(', ')} />
      </div></section>
      <section className="rounded-[2rem] bg-[#17364d] p-7 text-[#f7f4ed]"><p className="text-[9px] uppercase tracking-[.28em] opacity-45">This season</p><div className="mt-5 grid gap-4">
        <Field dark name="season" label="Current season" defaultValue={life?.current_season ?? ''} />
        <Field dark name="vision" label="What I am moving toward" defaultValue={life?.vision ?? ''} textarea />
        <Field dark name="priorities" label="What matters now" defaultValue={life?.priorities ?? ''} textarea />
      </div></section>
      <section className="rounded-[2rem] bg-white p-7"><p className="text-[9px] uppercase tracking-[.28em] text-[#557060]">Day Rhythm</p><div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field name="timezone" label="Timezone" defaultValue={settings?.timezone ?? 'America/Chicago'} /><Field name="morning" label="Morning" defaultValue={settings?.morning_start ?? '06:00'} /><Field name="evening" label="Evening" defaultValue={settings?.evening_start ?? '18:00'} /><Field name="night" label="Night" defaultValue={settings?.night_start ?? '22:00'} />
      </div></section>
      <section className="rounded-[2rem] bg-white p-7"><p className="text-[9px] uppercase tracking-[.28em] text-[#557060]">Belonging</p><div className="mt-5 grid gap-4">
        <Field name="tradition" label="Christian tradition" defaultValue={belonging?.christian_tradition ?? ''} /><Field name="church" label="Church / parish" defaultValue={belonging?.church_name ?? ''} /><Field name="community" label="Community" defaultValue={belonging?.community_name ?? ''} />
      </div></section>
      <div className="lg:col-span-2 flex flex-wrap gap-3"><button className="rounded-full bg-[#17364d] px-7 py-3 text-sm text-white">Save my living profile</button><Link href="/journey" className="rounded-full border border-[#17364d]/10 bg-white px-7 py-3 text-sm">Return to Journey</Link></div>
    </form>
    <section className="mt-8 rounded-[2rem] bg-white p-7"><p className="text-[9px] uppercase tracking-[.28em] text-[#557060]">Personal Thread</p><h2 className="mt-2 font-serif text-3xl font-light">What I noticed · What I am learning · What I am becoming</h2>
      <form action={recordReflection} className="mt-6"><textarea name="reflection" rows={4} placeholder="Sit with this for a moment. What is actually true today?" className="w-full rounded-2xl border border-[#17364d]/10 bg-[#f7f4ed] px-5 py-4 outline-none" /><button className="mt-3 rounded-full border border-[#17364d]/15 px-5 py-2.5 text-sm">Add to my thread</button></form>
      <div className="mt-7 grid gap-3 md:grid-cols-2">{(thread ?? []).map((entry) => <article key={entry.id} className="rounded-2xl bg-[#f7f4ed] p-5"><p className="text-[9px] uppercase tracking-[.2em] text-[#557060]">{entry.entry_title ?? 'Reflection'}</p><p className="mt-3 text-sm leading-6">{entry.entry_body ?? entry.reflection_text}</p></article>)}{!thread?.length && <p className="rounded-2xl border border-dashed border-[#17364d]/10 p-6 text-sm opacity-50 md:col-span-2">Your Personal Thread will begin with what you actually notice and choose to carry forward.</p>}</div>
    </section>
  </div></main>
}

function Field({ name, label, defaultValue, textarea = false, dark = false }: { name: string; label: string; defaultValue: string; textarea?: boolean; dark?: boolean }) {
  const className = dark ? 'mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[#f7f4ed] outline-none' : 'mt-2 w-full rounded-xl border border-[#17364d]/10 bg-white px-4 py-3 text-[#17364d] outline-none'
  return <label className="block text-sm">{label}{textarea ? <textarea name={name} defaultValue={defaultValue} rows={3} className={className} /> : <input name={name} defaultValue={defaultValue} className={className} />}</label>
}
