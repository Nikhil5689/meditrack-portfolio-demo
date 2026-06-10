/// <reference types="vite/client" />

declare module '@supabase/supabase-js' {
  export function createClient<T = any>(supabaseUrl: string, supabaseKey: string, options?: any): any;
  export type Session = any;
  export type AuthChangeEvent = any;
}
