import {
	createBrowserClient,
	createServerClient,
	isBrowser,
	parseCookieHeader
} from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

/**
 * Creates a Supabase client that can be used in the browser.
 */
export function createBrowserSupabaseClient(customFetch?: any) {
	return createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: { fetch: customFetch }
	});
}

/**
 * Creates a Supabase client for server-side usage.
 * Requires event from SvelteKit hooks or load functions.
 */
export function createServerSupabaseClient(event: any) {
	return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll() {
				return event.cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) =>
					event.cookies.set(name, value, { ...options, path: '/' })
				);
			}
		}
	});
}
