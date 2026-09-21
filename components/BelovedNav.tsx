'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, BookOpen, Compass, HeartHandshake, Home, MessageCircle, Network, ShieldCheck, Users, WalletCards } from 'lucide-react'

const links = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/journey', label: 'Journey', icon: Compass },
  { href: '/profile', label: 'Profile', icon: Users },
  { href: '/people', label: 'People', icon: Network },
  { href: '/formation', label: 'Formation', icon: BookOpen },
  { href: '/world', label: 'World', icon: HeartHandshake },
  { href: '/trust', label: 'Trust', icon: ShieldCheck },
  { href: '/market', label: 'Shared Resources', icon: WalletCards },
  { href: '/network', label: 'Network', icon: Network },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/social', label: 'Community', icon: Bell },
]

export function BelovedNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="BeLoved" className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6 lg:px-8">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link key={href} href={href} className={[
            'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition',
            active ? 'bg-[#17364d] text-white' : 'border border-[#17364d]/10 bg-white/60 hover:bg-white',
          ].join(' ')}>
            <Icon size={15} aria-hidden="true" />{label}
          </Link>
        )
      })}
    </nav>
  )
}
