import { createServerSupabaseClient } from '$lib/supabase';
import { type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.supabase = createServerSupabaseClient(event);

    /**
     * Helper to get the authenticated user.
     * This is more secure than getSession() as it validates the session with the server.
     */
    event.locals.getUser = async () => {
        const {
            data: { user }
        } = await event.locals.supabase.auth.getUser();
        return user;
    };

    /**
     * Undocumented helper to get the user session.
     * @deprecated Use getUser() instead for security.
     */
    event.locals.getSession = async () => {
        const {
            data: { session }
        } = await event.locals.supabase.auth.getSession();
        return session;
    };

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === 'content-range' || name === 'x-supabase-parse-leaked-password';
        }
    });
};
