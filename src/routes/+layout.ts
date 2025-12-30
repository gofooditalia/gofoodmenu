import { createBrowserSupabaseClient } from '$lib/supabase';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, depends }) => {
	depends('supabase:auth');

	const supabase = createBrowserSupabaseClient(fetch);

	const {
		data: { user }
	} = await supabase.auth.getUser();

	return {
		supabase,
		user
	};
};
