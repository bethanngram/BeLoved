'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  if (!email) redirect('/login?error=Email%20required')
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback` } })
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)
  redirect('/login?sent=1')
}
