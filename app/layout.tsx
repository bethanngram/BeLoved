import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BeLoved — A Living Journey',
  description: 'An intelligent, ecumenical Christian formation ecosystem rooted in John 17:21.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
