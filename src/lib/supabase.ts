import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface User {
  id: string
  email: string
  role: 'seller' | 'buyer' | 'admin'
  full_name?: string
  phone?: string
  location?: string
  membership_type: 'free' | 'premium'
  membership_expires_at?: string
  created_at: string
  updated_at: string
}

export interface Ad {
  id: string
  seller_id: string
  title: string
  description: string
  price: number
  category: string
  location: string
  images: string[]
  status: 'pending' | 'approved' | 'rejected'
  is_featured: boolean
  is_premium: boolean
  created_at: string
  updated_at: string
  seller?: User
}

export interface Category {
  id: string
  name: string
  description?: string
  created_at: string
}
