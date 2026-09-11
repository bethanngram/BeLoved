import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

type MemberHeaderProps = {
  section: string
  title: string
  signal?: string
  score?: number | null
}

export function MemberHeader({ section, title, signal, score }: MemberHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#17364d]/10 bg-[#f7f4ed]/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[58px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <Link
            href="/"
            aria-label="BeLoved home"
            className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#17364d]"
          >
            B
          </Link>
          <span className="h-5 w-px bg-[#17364d]/10" aria-hidden="true" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-[9px] font-semibold uppercase tracking-[0.24em] text-[#557060]">
                {section}
              </p>
              {signal ? (
                <span className="hidden truncate text-[10px] text-[#17364d]/40 sm:inline">
                  · {signal}
                </span>
              ) : null}
            </div>
            <p className="truncate font-serif text-sm text-[#17364d] sm:text-[15px]">{title}</p>
          </div>
        </div>

        <Link
          href="/journey"
          className="group flex shrink-0 items-center gap-2 rounded-full border border-[#17364d]/10 bg-white/70 px-2.5 py-1.5 transition hover:border-[#17364d]/20 hover:bg-white sm:gap-3 sm:px-3"
          aria-label="Open your Journey intelligence"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles size={12} strokeWidth={1.5} className="text-[#a8863a]" />
            <span className="hidden text-[8px] font-semibold uppercase tracking-[0.2em] text-[#17364d]/50 sm:inline">
              Journey
            </span>
          </span>
          <span className="text-xs font-semibold tabular-nums text-[#17364d]">
            {score == null ? '—' : score}
          </span>
          <ArrowRight
            size={13}
            strokeWidth={1.5}
            className="text-[#17364d]/35 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </header>
  )
}
