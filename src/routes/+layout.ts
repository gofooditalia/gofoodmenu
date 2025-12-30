import { createBrowserSupabaseClient } from '$lib/supabase';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, depends }) => {
	depends('supabase:auth');

	const supabase = createBrowserSupabaseClient(fetch);

	const {
		data: { session }
	} = await supabase.auth.getSession();

	return {
		supabase,
		session
	};
};
