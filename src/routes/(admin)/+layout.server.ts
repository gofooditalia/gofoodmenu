import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
    const session = await locals.getSession();

    // If no session and not on public pages (handled by routing groups, but just in case)
    // Public pages are in (public) group, which won't hit this layout.
    if (!session) {
        // For now, if no session, we might want to redirect to a login page
        // but the requirement didn't specify a login page yet.
        // Let's assume there is a /login route.
        // throw redirect(303, '/login');
    }

    // Check if profile exists
    let profile = null;
    if (session) {
        const { data } = await locals.supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        profile = data;
    }

    // Redirect to onboarding if profile is missing and not already on onboarding
    if (session && !profile && !url.pathname.includes('/onboarding')) {
        throw redirect(303, '/onboarding');
    }

    // Redirect away from onboarding if profile already exists
    if (session && profile && url.pathname.includes('/onboarding')) {
        throw redirect(303, '/dashboard');
    }

    return {
        session,
        profile
    };
};
