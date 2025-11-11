declare module "@supabase/ssr" {
  // Minimal declarations to satisfy TypeScript in the shared package.
  // We keep the types loose to avoid introducing a direct dependency on
  // @supabase/supabase-js here. If you want stronger typing, replace `any`
  // with the proper Supabase client types and add the dependency to package.json.

  /**
   * Create a browser Supabase client configured for Next.js SSR/edge usage.
   * The real implementation comes from the @supabase/ssr package.
   */
  export function createBrowserClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: any
  ): any;

  export function createServerClient(...args: any[]): any;

  export type CookieOptions = any;

  export {};
}
