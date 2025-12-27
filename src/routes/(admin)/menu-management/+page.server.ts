import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const user = await locals.getUser();
    if (!user) {
        throw redirect(303, '/login');
    }

    // Fetch categories
    const { data: categories } = await locals.supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', user.id)
        .order('sort_order', { ascending: true });

    // Fetch dishes
    const { data: dishes } = await locals.supabase
        .from('dishes')
        .select('*, categories(name)')
        .eq('restaurant_id', user.id)
        .order('created_at', { ascending: false });

    return {
        categories: categories || [],
        dishes: dishes || []
    };
};

export const actions: Actions = {
    addCategory: async ({ request, locals }) => {
        const user = await locals.getUser();
        if (!user) return fail(401);

        const formData = await request.formData();
        const name = formData.get('name') as string;

        if (!name) return fail(400, { error: 'Nome categoria obbligatorio' });

        const { error } = await locals.supabase
            .from('categories')
            .insert({
                name,
                restaurant_id: user.id
            });

        if (error) return fail(500, { error: 'Errore durante il salvataggio' });

        return { success: true };
    },

    editCategory: async ({ request, locals }) => {
        const user = await locals.getUser();
        if (!user) return fail(401);

        const formData = await request.formData();
        const id = formData.get('id');
        const name = formData.get('name') as string;

        if (!name) return fail(400, { error: 'Nome categoria obbligatorio' });

        const { error } = await locals.supabase
            .from('categories')
            .update({ name })
            .eq('id', id)
            .eq('restaurant_id', user.id);

        if (error) return fail(500, { error: 'Errore durante l\'aggiornamento' });

        return { success: true };
    },

    deleteCategory: async ({ request, locals }) => {
        const user = await locals.getUser();
        if (!user) return fail(401);

        const formData = await request.formData();
        const id = formData.get('id');

        const { error } = await locals.supabase
            .from('categories')
            .delete()
            .eq('id', id)
            .eq('restaurant_id', user.id);

        if (error) return fail(500, { error: 'Errore durante l\'eliminazione' });

        return { success: true };
    },

    addDish: async ({ request, locals }) => {
        const user = await locals.getUser();
        if (!user) return fail(401);

        const formData = await request.formData();
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const price = formData.get('price') as string;
        const category_id = formData.get('category_id') as string;
        const allergensStr = formData.get('allergens') as string;
        const image = formData.get('image') as File;

        if (!name || !price || !category_id) {
            return fail(400, { error: 'Nome, prezzo e categoria sono obbligatori' });
        }

        const allergens = allergensStr ? allergensStr.split(',').map(s => s.trim()).filter(Boolean) : [];

        let image_url = null;

        // Handle Image Upload
        if (image && image.size > 0) {
            const fileExt = image.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError, data } = await locals.supabase.storage
                .from('menu-images')
                .upload(filePath, image);

            if (uploadError) {
                return fail(500, { error: 'Errore durante il caricamento dell\'immagine' });
            }

            const { data: { publicUrl } } = locals.supabase.storage
                .from('menu-images')
                .getPublicUrl(filePath);

            image_url = publicUrl;
        }

        const { error } = await locals.supabase
            .from('dishes')
            .insert({
                name,
                description,
                price: parseFloat(price),
                category_id: parseInt(category_id),
                restaurant_id: user.id,
                image_url,
                allergens
            });

        if (error) return fail(500, { error: 'Errore durante il salvataggio del piatto' });

        return { success: true };
    },

    editDish: async ({ request, locals }) => {
        const user = await locals.getUser();
        if (!user) return fail(401);

        const formData = await request.formData();
        const id = formData.get('id');
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const price = formData.get('price') as string;
        const category_id = formData.get('category_id') as string;
        const allergensStr = formData.get('allergens') as string;
        const image = formData.get('image') as File;

        if (!name || !price || !category_id) {
            return fail(400, { error: 'Nome, prezzo e categoria sono obbligatori' });
        }

        const allergens = allergensStr ? allergensStr.split(',').map(s => s.trim()).filter(Boolean) : [];

        let updates: any = {
            name,
            description,
            price: parseFloat(price),
            category_id: parseInt(category_id),
            allergens,
            updated_at: new Date().toISOString()
        };

        // Handle Image Upload if provided
        if (image && image.size > 0) {
            const fileExt = image.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await locals.supabase.storage
                .from('menu-images')
                .upload(filePath, image);

            if (!uploadError) {
                const { data: { publicUrl } } = locals.supabase.storage
                    .from('menu-images')
                    .getPublicUrl(filePath);
                updates.image_url = publicUrl;
            }
        }

        const { error } = await locals.supabase
            .from('dishes')
            .update(updates)
            .eq('id', id)
            .eq('restaurant_id', user.id);

        if (error) return fail(500, { error: 'Errore durante l\'aggiornamento del piatto' });

        return { success: true };
    },

    deleteDish: async ({ request, locals }) => {
        const user = await locals.getUser();
        if (!user) return fail(401);

        const formData = await request.formData();
        const id = formData.get('id');

        const { error } = await locals.supabase
            .from('dishes')
            .delete()
            .eq('id', id)
            .eq('restaurant_id', user.id);

        if (error) return fail(500, { error: 'Errore durante l\'eliminazione del piatto' });

        return { success: true };
    }
};
