import { createServerSupabaseClient } from '$lib/supabase';
import { type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerSupabaseClient(event);

	/**
	 * Helper to get the authenticated user.
	 * This is more secure than getSession() as it validates the session with the server.
	 */
	/**
	 * Returns the current session. 
	 * Useful for client-side reactivity and passing session data to layouts.
	 */
	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		return session;
	};

	/**
	 * Returns the authenticated user.
	 * Secure: validates the session with the Supabase Auth server.
	 * Recommended for protection checks in server-side load functions.
	 */
	event.locals.getUser = async () => {
		const {
			data: { user }
		} = await event.locals.supabase.auth.getUser();
		return user;
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-parse-leaked-password';
		}
	});
};
