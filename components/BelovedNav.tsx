'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, BookOpen, Compass, HeartHandshake, Home, Landmark, MessageCircle, Network, Sparkles, UserRound, Users } from 'lucide-react'

const links = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/journey', label: 'Becoming', icon: Compass },
  { href: '/member/people', label: 'People', icon: Users },
  { href: '/member/formation', label: 'Formation', icon: BookOpen },
  { href: '/member/growth', label: 'Growth', icon: Compass },
  { href: '/member/work', label: 'Work', icon: Landmark },
  { href: '/member/money', label: 'Money', icon: Landmark },
  { href: '/member/world', label: 'World', icon: HeartHandshake },
  { href: '/member/trust', label: 'Trust', icon: Network },
  { href: '/give', label: 'Give', icon: HeartHandshake },
  { href: '/network', label: 'Connections', icon: Network },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/social', label: 'Community', icon: Bell },
  { href: '/companion', label: 'Companion', icon: Sparkles },
  { href: '/profile', label: 'Profile', icon: UserRound },
]

export function BelovedNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="BeLoved navigation" className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6 lg:px-8">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')
        return (
          <Link key={href} href={href} className={'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition ' + (active ? 'bg-[#17364d] text-white' : 'border border-[#17364d]/10 bg-white/60 hover:bg-white')}>
            <Icon size={15} aria-hidden="true" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
