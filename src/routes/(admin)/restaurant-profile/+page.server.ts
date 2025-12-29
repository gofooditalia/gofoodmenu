import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/db';
import { profiles } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
    const { profile } = await parent();
    return {
        profile
    };
};

export const actions: Actions = {
    updateProfile: async ({ request, locals }) => {
        const user = await locals.getUser();
        if (!user) {
            return fail(401, { error: 'Non autorizzato' });
        }

        const formData = await request.formData();

        const restaurant_name = formData.get('restaurant_name') as string;
        const description = formData.get('description') as string;
        const address = formData.get('address') as string;
        const phone = formData.get('phone') as string;
        const website_url = formData.get('website_url') as string;
        const instagram_url = formData.get('instagram_url') as string;
        const facebook_url = formData.get('facebook_url') as string;
        const whatsapp_number = formData.get('whatsapp_number') as string;
        const logo_url = formData.get('logo_url') as string;

        // Opening hours parsing (expected as JSON string from client)
        let opening_hours = null;
        const hoursRaw = formData.get('opening_hours') as string;
        if (hoursRaw) {
            try {
                opening_hours = JSON.parse(hoursRaw);
            } catch (e) {
                console.error('Error parsing opening hours:', e);
            }
        }

        try {
            await db.update(profiles)
                .set({
                    restaurant_name,
                    description,
                    address,
                    phone,
                    website_url,
                    instagram_url,
                    facebook_url,
                    whatsapp_number,
                    logo_url,
                    opening_hours,
                    updated_at: new Date()
                })
                .where(eq(profiles.id, user.id));

            return { success: true };
        } catch (e) {
            console.error('Error updating profile:', e);
            return fail(500, { error: 'Errore durante l\'aggiornamento del profilo' });
        }
    }
};
