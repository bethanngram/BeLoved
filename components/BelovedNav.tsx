'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Compass, HeartHandshake, Home, MessageCircle, Network, Users } from 'lucide-react'

const links = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/journey', label: 'Journey', icon: Compass },
  { href: '/market', label: 'People Market', icon: Users },
  { href: '/hey-neighbor', label: 'Hey Neighbor', icon: HeartHandshake },
  { href: '/network', label: 'Network', icon: Network },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/social', label: 'Community', icon: Bell },
]

export function BelovedNav() {
  const pathname = usePathname()
  return (
    <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6 lg:px-8">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link key={href} href={href} className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition ${active ? 'bg-[#17364d] text-white' : 'border border-[#17364d]/10 bg-white/60 hover:bg-white'}`}>
            <Icon size={15} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
