'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!email) redirect('/login?error=Email%20required')
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: siteUrl() + '/auth/callback' } })
  if (error) redirect('/login?error=' + encodeURIComponent(error.message))
  redirect('/login?sent=1')
}

export async function passwordLogin(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  if (!email || !password) redirect('/login?error=Email%20and%20password%20required')
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect('/login?error=' + encodeURIComponent(error.message))
  redirect('/')
}
