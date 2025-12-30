import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const user = await locals.getUser();

	// Check if profile exists
	let profile = null;
	if (user) {
		const { data } = await locals.supabase.from('profiles').select('*').eq('id', user.id).single();
		profile = data;
	}

	// Redirect to onboarding if profile is missing and not already on onboarding
	if (user && !profile && !url.pathname.includes('/onboarding')) {
		throw redirect(303, '/onboarding');
	}

	// Redirect away from onboarding if profile already exists
	if (user && profile && url.pathname.includes('/onboarding')) {
		throw redirect(303, '/dashboard');
	}

	return {
		user,
		profile
	};
};
