import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = await locals.getUser();
		if (!user) {
			return fail(401, { error: 'Non autorizzato' });
		}

		const formData = await request.formData();
		const restaurant_name = formData.get('restaurant_name') as string;
		const slug = formData.get('slug') as string;

		if (!restaurant_name || !slug) {
			return fail(400, { error: 'Nome e Link sono obbligatori' });
		}

		// Validate slug (letters, numbers, hyphens only)
		if (!/^[a-z0-9-]+$/.test(slug)) {
			return fail(400, { error: 'Il link può contenere solo lettere, numeri e trattini' });
		}

		const { error } = await locals.supabase.from('profiles').insert({
			id: user.id,
			restaurant_name,
			slug,
			theme_color: 'orange'
		});

		if (error) {
			if (error.code === '23505') {
				return fail(400, { error: 'Questo link è già stato preso. Scegline un altro!' });
			}
			return fail(500, { error: 'Errore durante la creazione del profilo. Riprova.' });
		}

		throw redirect(303, '/dashboard');
	}
};
