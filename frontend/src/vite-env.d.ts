// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STABILITY_API_KEY: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  // Add any other VITE_ environment variables you use
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
