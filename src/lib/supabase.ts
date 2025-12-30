import {
	createBrowserClient,
	createServerClient,
} from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Creates a Supabase client that can be used in the browser.
 */
export function createBrowserSupabaseClient(customFetch?: typeof fetch) {
	return createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
		global: { fetch: customFetch }
	});
}

/**
 * Creates a Supabase client for server-side usage.
 * Requires event from SvelteKit hooks or load functions.
 */
export function createServerSupabaseClient(event: RequestEvent) {
	return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
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
