import { createClient } from '@supabase/supabase-js'

// Development fallback values - replace with your actual Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8tcHJvamVjdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ1MTkyMDAwLCJleHAiOjE5NjA3NjgwMDB9.demo-key-for-development'

// Validate Supabase URL format
function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

// Warn if using demo credentials
if (supabaseUrl === 'https://demo-project.supabase.co') {
  console.warn('⚠️  Using demo Supabase credentials. Please update .env.local with your actual Supabase project URL and API key.')
  console.warn('📝 Get your credentials from: https://supabase.com/dashboard → Your Project → Settings → API')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'admin' | 'user'
          avatar: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role?: 'admin' | 'user'
          avatar?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'admin' | 'user'
          avatar?: string | null
          updated_at?: string
        }
      }
      quotations: {
        Row: {
          id: string
          title: string
          client: string
          amount: number
          date: string
          status: 'pendiente' | 'aprobada' | 'rechazada'
          description: string
          purchase_order_created: boolean
          invoice_generated: boolean
          invoice_paid: boolean
          purchase_order_file: any | null
          invoice_file: any | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          client: string
          amount: number
          date: string
          status?: 'pendiente' | 'aprobada' | 'rechazada'
          description: string
          purchase_order_created?: boolean
          invoice_generated?: boolean
          invoice_paid?: boolean
          purchase_order_file?: any | null
          invoice_file?: any | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          client?: string
          amount?: number
          date?: string
          status?: 'pendiente' | 'aprobada' | 'rechazada'
          description?: string
          purchase_order_created?: boolean
          invoice_generated?: boolean
          invoice_paid?: boolean
          purchase_order_file?: any | null
          invoice_file?: any | null
          updated_at?: string
        }
      }
    }
  }
}