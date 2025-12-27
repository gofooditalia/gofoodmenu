import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
    const { slug } = params;

    // Fetch restaurant profile
    const { data: profile, error: profileError } = await locals.supabase
        .from('profiles')
        .select('*')
        .eq('slug', slug)
        .single();

    if (profileError || !profile) {
        throw error(404, 'Ristorante non trovato');
    }

    // Fetch categories with dishes
    const { data: categories } = await locals.supabase
        .from('categories')
        .select(`
      id,
      name,
      dishes (
        id,
        name,
        description,
        price,
        image_url,
        is_available,
        allergens
      )
    `)
        .eq('restaurant_id', profile.id)
        .order('sort_order', { ascending: true });

    return {
        profile,
        categories: categories || []
    };
};
