import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const user = await locals.getUser();
    let profile = null;

    if (user) {
        const { data } = await locals.supabase
            .from('profiles')
            .select('slug')
            .eq('id', user.id)
            .single();
        profile = data;
    }

    return {
        user,
        profile
    };
};
