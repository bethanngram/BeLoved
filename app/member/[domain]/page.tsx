import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BelovedHeader } from '@/components/BelovedHeader'

const domains = {
  people: { title: 'People', eyebrow: 'RELATIONSHIP', description: 'The people entrusted to your life, the circles you belong to, and the ways capacity can become care.', table: 'people', key: 'user_id', order: 'updated_at' },
  formation: { title: 'Formation', eyebrow: 'LEARN', description: 'Learning becomes practice, capability, judgment, character, leadership, and contribution.', table: 'formation', key: 'profile_id', order: 'updated_at' },
  growth: { title: 'Growth', eyebrow: 'BECOME', description: 'A living record of what you are practicing, what capability is emerging, and where evidence is taking shape.', table: 'growth', key: 'profile_id', order: 'updated_at' },
  work: { title: 'Work', eyebrow: 'VOCATION', description: 'Work belongs within stewardship: craft, responsibility, contribution, and what you are becoming capable of carrying.', table: 'profession', key: 'profile_id', order: 'updated_at' },
  money: { title: 'Money', eyebrow: 'STEWARDSHIP', description: 'Money belongs within a larger life of responsibility, generosity, provision, and faithful stewardship.', table: 'money', key: 'profile_id', order: 'updated_at' },
  world: { title: 'World', eyebrow: 'SERVICE', description: 'See where real need, available capacity, response, and impact meet.', table: 'world', key: 'profile_id', order: 'updated_at' },
  trust: { title: 'Trust', eyebrow: 'ENTRUSTMENT', description: 'Trust grows through lived relationship, contribution, responsibility, and evidence—not scores alone.', table: 'trust_actions', key: 'actor_profile_id', order: 'created_at' },
} as const

type Domain = keyof typeof domains

export const dynamic = 'force-dynamic'

export default async function MemberDomainPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params
  if (!(domain in domains)) redirect('/')
  const config = domains[domain as Domain]
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const profileId = claims?.claims?.sub ? String(claims.claims.sub) : null
  if (!profileId) redirect('/login')

  const { data, error } = await supabase.from(config.table).select('*').eq(config.key, profileId).order(config.order, { ascending: false }).limit(24)
  const { data: life } = await supabase.from('life').select('current_season,vision,priorities').eq('profile_id', profileId).maybeSingle()
  const { data: thread } = await supabase.from('personal_thread_entries').select('*').eq('profile_id', profileId).order('created_at', { ascending: false }).limit(6)

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#17364d]">
      <BelovedHeader />
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <section className="grid gap-8 border-b border-[#17364d]/10 py-12 lg:grid-cols-[1.15fr_.85fr] lg:py-16">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[.3em] text-[#557060]">{config.eyebrow}</p>
            <h1 className="mt-4 font-serif text-5xl font-light leading-[1.04] sm:text-6xl">{config.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#17364d]/65">{config.description}</p>
          </div>
          <div className="rounded-[2rem] bg-[#17364d] p-7 text-[#f7f4ed]">
            <p className="text-[9px] uppercase tracking-[.28em] opacity-45">Your season</p>
            <p className="mt-4 font-serif text-3xl font-light">{life?.current_season || 'This season'}</p>
            <p className="mt-3 text-sm leading-6 opacity-55">{life?.vision || life?.priorities || 'Your life context gives this part of BeLoved its meaning.'}</p>
          </div>
        </section>

        <section className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Records" value={String(data?.length || 0)} />
          <Stat label="Season" value={life?.current_season || 'Open'} />
          <Stat label="Thread entries" value={String(thread?.length || 0)} />
          <Stat label="Connection" value={error ? 'Needs attention' : 'Live'} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-[2rem] bg-white p-7">
            <div className="flex items-center justify-between gap-4">
              <div><p className="text-[9px] uppercase tracking-[.28em] text-[#557060]">Living record</p><h2 className="mt-2 font-serif text-3xl font-light">What is here now</h2></div>
              <Link href="/journey" className="text-sm underline underline-offset-4">Becoming</Link>
            </div>
            <div className="mt-6 space-y-3">
              {(data || []).map((item: Record<string, unknown>, index: number) => {
                const title = String(item.title || item.name || item.growth_area || item.formation_area || item.action_type || item.record_type || (config.title + ' record'))
                const description = String(item.description || item.reflection || item.contribution || item.evidence || item.status || item.location || '')
                return (
                  <article key={String(item.id || index)} className="rounded-2xl bg-[#f7f4ed] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-sm font-medium">{title}</h3>
                      <span className="text-[9px] uppercase tracking-[.18em] opacity-40">{String(item.status || item.member_status || item.trust_level || '')}</span>
                    </div>
                    {description && <p className="mt-2 text-sm leading-6 opacity-60">{description}</p>}
                  </article>
                )
              })}
              {!data?.length && <div className="rounded-2xl border border-dashed border-[#17364d]/15 p-8 text-center"><p className="font-serif text-2xl font-light">Nothing needs to be invented here.</p><p className="mt-3 text-sm leading-6 opacity-50">As you live, learn, relate, practice, work, steward, and serve, BeLoved will preserve what is genuinely yours.</p></div>}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-[#17364d]/10 bg-white/60 p-7">
            <p className="text-[9px] uppercase tracking-[.28em] text-[#557060]">Personal Thread</p>
            <h2 className="mt-2 font-serif text-3xl font-light">Carry the story forward.</h2>
            <p className="mt-3 text-sm leading-6 opacity-55">What I noticed → what I am learning → what I am becoming → what I am practicing → what I am stewarding.</p>
            <div className="mt-6 space-y-3">
              {(thread || []).slice(0, 4).map((entry: Record<string, unknown>, index: number) => (
                <div key={String(entry.id || index)} className="rounded-2xl bg-white p-4">
                  <p className="text-sm">{String(entry.title || entry.content || 'A thread entry')}</p>
                  {entry.created_at && <p className="mt-1 text-[10px] opacity-35">{new Date(String(entry.created_at)).toLocaleDateString()}</p>}
                </div>
              ))}
              {!thread?.length && <p className="rounded-2xl bg-white p-4 text-sm leading-6 opacity-50">Your thread will begin with real moments, not manufactured engagement.</p>}
            </div>
            <Link href="/journey" className="mt-6 inline-flex rounded-full bg-[#17364d] px-5 py-3 text-sm text-white">Return to Becoming</Link>
          </aside>
        </section>
      </div>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-[#17364d]/10 bg-white p-5"><p className="text-[9px] uppercase tracking-[.2em] opacity-40">{label}</p><p className="mt-3 font-serif text-2xl font-light">{value}</p></div>
}
