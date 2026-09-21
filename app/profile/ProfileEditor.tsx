'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Check, Loader2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function csv(value: string[] | null | undefined) { return (value || []).join(', ') }
function arr(value: string) { return value.split(',').map(x => x.trim()).filter(Boolean) }

export default function ProfileEditor({ profile, directory }: { profile: any; directory: any }) {
  const supabase = useMemo(() => createClient(), [])
  const [name, setName] = useState(profile?.name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [location, setLocation] = useState(profile?.location_text || directory?.city_region || '')
  const [capability, setCapability] = useState(directory?.professional_capability || '')
  const [skills, setSkills] = useState(csv(directory?.skills))
  const [interests, setInterests] = useState(csv(directory?.interests))
  const [help, setHelp] = useState(csv(directory?.help_offers))
  const [communities, setCommunities] = useState(csv(directory?.communities))
  const [discoverable, setDiscoverable] = useState(directory?.discoverable !== false)
  const [acceptsAsks, setAcceptsAsks] = useState(directory?.accepts_asks !== false)
  const [availability, setAvailability] = useState(directory?.availability_status || 'available')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function save() {
    setSaving(true); setMessage('')
    const { data: user } = await supabase.auth.getUser()
    const id = user.user?.id
    if (!id) { setMessage('Please sign in again.'); setSaving(false); return }

    const profileUpdate = await supabase.from('profiles').update({
      name: name.trim() || null,
      bio: bio.trim() || null,
      location_text: location.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq('id', id)

    if (profileUpdate.error) { setMessage(profileUpdate.error.message); setSaving(false); return }

    const directoryUpdate = await supabase.from('member_directory').upsert({
      profile_id: id,
      display_name: name.trim() || null,
      city_region: location.trim() || null,
      bio: bio.trim() || null,
      professional_capability: capability.trim() || null,
      skills: arr(skills),
      interests: arr(interests),
      help_offers: arr(help),
      communities: arr(communities),
      discoverable,
      accepts_asks: acceptsAsks,
      availability_status: availability,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'profile_id' })

    setMessage(directoryUpdate.error ? directoryUpdate.error.message : 'Your living profile is updated.')
    setSaving(false)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 sm:px-6 lg:px-8">
      <section className="py-12">
        <p className="text-[10px] uppercase tracking-[.3em] text-[#557060]">Living profile</p>
        <h1 className="mt-3 font-serif text-5xl font-light">Who I am · what I can do · what I need · what I’m building</h1>
        <p className="mt-5 max-w-2xl leading-7 opacity-60">Your profile is the bridge between your Journey and the people, opportunities, and needs around you.</p>
      </section>

      <section className="rounded-[2rem] bg-white p-7">
        <Field label="Name" value={name} setValue={setName} />
        <Field label="Location / community" value={location} setValue={setLocation} />
        <Field label="Professional capability" value={capability} setValue={setCapability} />
        <Text label="Bio" value={bio} setValue={setBio} />
        <Text label="Skills · comma separated" value={skills} setValue={setSkills} />
        <Text label="Interests · comma separated" value={interests} setValue={setInterests} />
        <Text label="What I can offer · comma separated" value={help} setValue={setHelp} />
        <Text label="Communities · comma separated" value={communities} setValue={setCommunities} />

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <label className="rounded-2xl bg-[#f7f4ed] p-4 text-sm"><input type="checkbox" checked={discoverable} onChange={e => setDiscoverable(e.target.checked)} className="mr-2" />Discoverable</label>
          <label className="rounded-2xl bg-[#f7f4ed] p-4 text-sm"><input type="checkbox" checked={acceptsAsks} onChange={e => setAcceptsAsks(e.target.checked)} className="mr-2" />Accepts asks</label>
          <select value={availability} onChange={e => setAvailability(e.target.value)} className="rounded-2xl bg-[#f7f4ed] p-4 text-sm">
            <option value="available">Available</option><option value="busy">Busy</option><option value="away">Away</option>
          </select>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={() => void save()} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-[#17364d] px-6 py-3 text-sm text-white disabled:opacity-40">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save living profile
          </button>
          <Link href="/market" className="rounded-full border border-[#17364d]/10 px-6 py-3 text-sm">See People Market</Link>
        </div>

        {message && <div className="mt-5 flex items-center gap-2 rounded-2xl bg-[#f7f4ed] p-4 text-sm"><Check className="h-4 w-4" />{message}</div>}
      </section>
    </div>
  )
}

function Field({ label, value, setValue }: { label: string; value: string; setValue: (value: string) => void }) {
  return <label className="mb-4 block text-sm"><span className="mb-2 block opacity-55">{label}</span><input value={value} onChange={e => setValue(e.target.value)} className="w-full rounded-xl border border-[#17364d]/10 px-4 py-3 outline-none" /></label>
}
function Text({ label, value, setValue }: { label: string; value: string; setValue: (value: string) => void }) {
  return <label className="mb-4 block text-sm"><span className="mb-2 block opacity-55">{label}</span><textarea value={value} onChange={e => setValue(e.target.value)} rows={3} className="w-full rounded-xl border border-[#17364d]/10 px-4 py-3 outline-none" /></label>
}
