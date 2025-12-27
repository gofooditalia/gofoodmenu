import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const session = await locals.getSession();

    // Fetch some stats (mocked for now until we have visits table)
    // In a real scenario, we would count items in dishes table
    const { count: dishCount } = await locals.supabase
        .from('dishes')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', session?.user.id);

    // Get most viewed dish (mocked)
    const { data: topDish } = await locals.supabase
        .from('dishes')
        .select('name')
        .eq('restaurant_id', session?.user.id)
        .limit(1)
        .single();

    return {
        stats: {
            visits: 1240, // Mocked
            dishCount: dishCount || 0,
            topDish: topDish?.name || 'In attesa di dati'
        }
    };
};
