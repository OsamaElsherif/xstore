'use server'

import { createClient } from '@/lib/supabase/server'
import { Profile } from '@/types'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { toE164Egypt } from '@/lib/utils/phone'
import { sendWhatsAppMessage } from '@/lib/whatsapp/sendWhatsApp'

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      
    if (profile && profile.role !== 'CUSTOMER') {
      redirect('/admin')
    }
  }

  redirect('/')
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const whatsappOptIn = formData.get('whatsapp_opt_in') === 'true'
  const whatsappPhone = (formData.get('whatsapp_phone') as string | null) ?? null

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    console.error(error)
    return { error: error.message }
  }

  // Get the newly created user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Signup failed' }

  // Save opt-in preference + phone to profile
  // (trigger already created the profile row — just update it)
  await supabaseAdmin
    .from('profiles')
    .update({
      whatsapp_opted_in: whatsappOptIn,
      whatsapp_phone: whatsappPhone
        ? toE164Egypt(whatsappPhone)
        : null,
    })
    .eq('id', user.id)

  // If they opted in, send the welcome WhatsApp message immediately
  // This establishes the conversation on Wasender
  if (whatsappOptIn && whatsappPhone) {
    try {
      await sendWhatsAppMessage({
        to: whatsappPhone,
        eventKey: 'whatsapp_optin',
        variables: [fullName],
      })
    } catch (e) {
      console.error('Opt-in WhatsApp message failed:', e)
      // Never fail signup because of WhatsApp
    }
  }

  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  return profile as Profile
}

