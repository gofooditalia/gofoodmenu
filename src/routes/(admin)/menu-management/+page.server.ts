import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/db';
import { categories as categoriesTable, dishes as dishesTable, allergens as allergensTable, profiles as profilesTable } from '$lib/db/schema';
import { eq, asc, desc } from 'drizzle-orm';
import { QueryClient, dehydrate } from '@tanstack/svelte-query';

export const load: PageServerLoad = async ({ locals }) => {
    const user = await locals.getUser();
    if (!user) {
        throw redirect(303, '/login');
    }

    // Fetch profile
    const profile = await db.query.profiles.findFirst({
        where: eq(profilesTable.id, user.id)
    });

    if (!profile) {
        throw redirect(303, '/settings');
    }

    const queryClient = new QueryClient();

    // Prefetch categories
    await queryClient.prefetchQuery({
        queryKey: ['categories', profile.id],
        queryFn: async () => {
            return await db.select()
                .from(categoriesTable)
                .where(eq(categoriesTable.restaurant_id, profile.id))
                .orderBy(asc(categoriesTable.sort_order));
        }
    });

    // Prefetch dishes
    await queryClient.prefetchQuery({
        queryKey: ['dishes', profile.id],
        queryFn: async () => {
            return await db.select({
                id: dishesTable.id,
                name: dishesTable.name,
                description: dishesTable.description,
                price: dishesTable.price,
                image_url: dishesTable.image_url,
                is_available: dishesTable.is_available,
                allergens: dishesTable.allergens,
                category_id: dishesTable.category_id,
                categories: {
                    name: categoriesTable.name
                }
            })
                .from(dishesTable)
                .leftJoin(categoriesTable, eq(dishesTable.category_id, categoriesTable.id))
                .where(eq(dishesTable.restaurant_id, profile.id))
                .orderBy(desc(dishesTable.created_at));
        }
    });

    // Prefetch allergens
    await queryClient.prefetchQuery({
        queryKey: ['allergens'],
        queryFn: async () => {
            return await db.select()
                .from(allergensTable)
                .orderBy(asc(allergensTable.number));
        }
    });

    return {
        profile,
        dehydratedState: dehydrate(queryClient),
        // Keep these for now to avoid breaking existing code while refactoring frontend
        categories: await queryClient.getQueryData(['categories', profile.id]),
        dishes: await queryClient.getQueryData(['dishes', profile.id]),
        allergens: await queryClient.getQueryData(['allergens'])
    };
};

export const actions: Actions = {
    addCategory: async ({ request, locals }) => {
        const user = await locals.getUser();
        if (!user) return fail(401);

        const formData = await request.formData();
        const name = formData.get('name') as string;

        if (!name) return fail(400, { error: 'Nome categoria obbligatorio' });

        try {
            await db.insert(categoriesTable).values({
                name,
                restaurant_id: user.id
            });
        } catch (e) {
            return fail(500, { error: 'Errore durante il salvataggio' });
        }

        return { success: true };
    },

    editCategory: async ({ request, locals }) => {
        const user = await locals.getUser();
        if (!user) return fail(401);

        const formData = await request.formData();
        const id = formData.get('id');
        const name = formData.get('name') as string;

        if (!id || !name) return fail(400, { error: 'Dati mancanti' });

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

        if (!id) return fail(400);

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
        const price = formData.get('price') as string;
        const category_id = formData.get('category_id') as string;
        const description = formData.get('description') as string;
        const allergens = formData.get('allergens') as string;
        const image = formData.get('image') as File;

        if (!name || !price || !category_id) return fail(400, { error: 'Dati obbligatori mancanti' });

        let image_url = null;
        if (image && image.size > 0) {
            const fileExt = image.name.split('.').pop();
            const fileName = `${user.id}/${Math.random()}.${fileExt}`;
            const { error: uploadError } = await locals.supabase.storage
                .from('dish-images')
                .upload(fileName, image);

            if (uploadError) return fail(500, { error: 'Errore upload immagine' });

            const { data: { publicUrl } } = locals.supabase.storage
                .from('dish-images')
                .getPublicUrl(fileName);

            image_url = publicUrl;
        }

        const allergensList = allergens ? allergens.split(',').map(a => a.trim()) : [];

        const { error } = await locals.supabase
            .from('dishes')
            .insert({
                name,
                price: parseFloat(price).toString(),
                category_id: parseInt(category_id),
                description,
                image_url,
                restaurant_id: user.id,
                allergens: allergensList
            });

        if (error) {
            console.error('Error adding dish:', error);
            return fail(500, { error: 'Errore durante il salvataggio' });
        }

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
