import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const session = await locals.getSession();
	const user = await locals.getUser();

	// If no session and not on public pages
	if (!session || !user) {
		// For now, we assume if no user/session, we might need to redirect
		// throw redirect(303, '/login');
	}

	// Check if profile exists
	let profile = null;
	if (user) {
		const { data } = await locals.supabase.from('profiles').select('*').eq('id', user.id).single();

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
