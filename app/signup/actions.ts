'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!name || !email || password.length < 8) redirect('/signup?error=Please%20complete%20all%20fields.')

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name }, emailRedirectTo: siteUrl + '/auth/callback' },
  })

  if (error) redirect('/signup?error=' + encodeURIComponent(error.message))
  if (data.session) redirect('/')
  redirect('/signup?sent=1')
}
