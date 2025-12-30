<script lang="ts">
	import {
		Store,
		MapPin,
		Phone,
		Globe,
		Instagram,
		Facebook,
		MessageCircle,
		Save,
		Camera,
		Plus,
		Trash2
	} from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { fade, slide } from 'svelte/transition';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const initialProfile = data.profile;
	let profile = $state({ ...initialProfile });
	let isSaving = $state(false);
	let isUploading = $state(false);
	let fileInput: HTMLInputElement;

	async function uploadLogo(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		try {
			isUploading = true;
			const fileExt = file.name.split('.').pop();
			const fileName = `${data.session?.user.id}/logo-${Math.random()}.${fileExt}`;
			const filePath = `${fileName}`;

			const { error: uploadError } = await data.supabase.storage
				.from('menu-images')
				.upload(filePath, file, {
					upsert: true
				});

			if (uploadError) throw uploadError;

			const {
				data: { publicUrl }
			} = data.supabase.storage.from('menu-images').getPublicUrl(filePath);

			profile.logo_url = publicUrl;
		} catch (error) {
			console.error('Error uploading logo:', error);
			alert('Errore durante il caricamento del logo');
		} finally {
			isUploading = false;
		}
	}

	// Initialize opening hours if empty
	const daysOfWeek = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

	let openingHours = $state(
		profile.opening_hours ||
			daysOfWeek.map((day) => ({
				day,
				isOpen: false,
				periods: [{ open: '09:00', close: '18:00' }]
			}))
	);

	function addPeriod(dayIndex: number) {
		openingHours[dayIndex].periods.push({ open: '19:00', close: '23:00' });
	}

	function removePeriod(dayIndex: number, periodIndex: number) {
		openingHours[dayIndex].periods = openingHours[dayIndex].periods.filter(
			(_: unknown, i: number) => i !== periodIndex
		);
	}

	function toggleDay(dayIndex: number) {
		openingHours[dayIndex].isOpen = !openingHours[dayIndex].isOpen;
	}
</script>

<div class="mx-auto max-w-4xl space-y-12 pb-24">
	<!-- Header -->
	<header
		class="flex flex-col justify-between gap-6 border-b border-slate-100 pb-8 md:flex-row md:items-end"
	>
		<div>
			<h1 class="flex items-center gap-3 text-4xl font-black tracking-tight text-slate-900">
				<Store size={36} class="text-orange-500" />
				Profilo Ristorante
			</h1>
			<p class="mt-2 font-medium text-slate-500">
				Gestisci le informazioni del tuo locale visibili ai clienti.
			</p>
		</div>

		<div class="flex gap-3">
			<button
				type="submit"
				form="profile-form"
				disabled={isSaving}
				class="group flex items-center gap-2 rounded-2xl bg-orange-500 px-8 py-4 font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-600 disabled:opacity-50"
			>
				{#if isSaving}
					<div
						class="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
					></div>
				{:else}
					<Save size={20} />
				{/if}
				Salva Modifiche
			</button>
		</div>
	</header>

	{#if form?.success}
		<div
			transition:fade
			class="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-6 py-4 font-bold text-emerald-700"
		>
			<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
				<Save size={18} />
			</div>
			Profilo aggiornato con successo!
		</div>
	{/if}

	{#if form?.error}
		<div
			transition:fade
			class="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-6 py-4 font-bold text-red-700"
		>
			<div
				class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-sm text-white"
			>
				!
			</div>
			{form.error}
		</div>
	{/if}

	<form
		id="profile-form"
		method="POST"
		action="?/updateProfile"
		use:enhance={() => {
			isSaving = true;
			return async ({ update }) => {
				isSaving = false;
				await update();
			};
		}}
		class="space-y-12"
	>
		<!-- Hidden input for JSON opening hours -->
		<input type="hidden" name="opening_hours" value={JSON.stringify(openingHours)} />

		<!-- Section: Basic Info -->
		<section class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<div class="space-y-2">
				<h3 class="text-xl font-black text-slate-900">Informazioni Base</h3>
				<p class="text-sm font-medium text-slate-500">
					Il nome e il volto del tuo ristorante sul web.
				</p>
			</div>

			<div
				class="space-y-6 rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm lg:col-span-2"
			>
				<div class="flex flex-col items-start gap-8 md:flex-row">
					<div class="group relative">
						<div
							class="relative flex h-32 w-32 flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400"
						>
							{#if isUploading}
								<div
									class="h-8 w-8 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500"
								></div>
							{:else if profile.logo_url}
								<img src={profile.logo_url} alt="Logo" class="h-full w-full object-cover" />
							{:else}
								<Camera size={28} />
								<span class="mt-2 text-[10px] font-bold uppercase">Logo</span>
							{/if}
						</div>
						<button
							type="button"
							onclick={() => fileInput.click()}
							class="absolute -right-2 -bottom-2 transform rounded-xl bg-orange-500 p-2 text-white shadow-lg transition-transform group-hover:scale-110"
						>
							<Plus size={16} />
						</button>
						<input
							type="file"
							bind:this={fileInput}
							onchange={uploadLogo}
							accept="image/*"
							class="hidden"
						/>
						<input type="hidden" name="logo_url" value={profile.logo_url || ''} />
					</div>

					<div class="w-full flex-1 space-y-6">
						<div class="space-y-2">
							<label
								for="restaurant_name"
								class="text-xs font-black tracking-widest text-slate-400 uppercase"
								>Nome Ristorante</label
							>
							<input
								type="text"
								id="restaurant_name"
								name="restaurant_name"
								bind:value={profile.restaurant_name}
								class="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 font-bold text-slate-900 transition-all outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
								placeholder="Esempio: Osteria da Giorgio"
							/>
						</div>

						<div class="space-y-2">
							<label
								for="description"
								class="text-xs font-black tracking-widest text-slate-400 uppercase"
								>Breve Descrizione</label
							>
							<textarea
								id="description"
								name="description"
								bind:value={profile.description}
								rows="3"
								class="w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 font-medium text-slate-700 transition-all outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
								placeholder="Racconta brevemente chi sei..."
							></textarea>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Section: Contact & Location -->
		<section class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<div class="space-y-2">
				<h3 class="text-xl font-black text-slate-900">Contatti e Località</h3>
				<p class="text-sm font-medium text-slate-500">
					Aiuta i tuoi clienti a trovarti e a prenotare.
				</p>
			</div>

			<div
				class="space-y-6 rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm lg:col-span-2"
			>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div class="space-y-2">
						<label
							for="address"
							class="flex items-center gap-2 text-xs font-black tracking-widest text-slate-400 uppercase"
						>
							<MapPin size={14} /> Indirizzo
						</label>
						<input
							type="text"
							id="address"
							name="address"
							bind:value={profile.address}
							class="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 font-bold text-slate-900 transition-all outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
							placeholder="Via Roma 1, Milano"
						/>
					</div>

					<div class="space-y-2">
						<label
							for="phone"
							class="flex items-center gap-2 text-xs font-black tracking-widest text-slate-400 uppercase"
						>
							<Phone size={14} /> Numero di Telefono
						</label>
						<input
							type="text"
							id="phone"
							name="phone"
							bind:value={profile.phone}
							class="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 font-bold text-slate-900 transition-all outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
							placeholder="+39 012 3456789"
						/>
					</div>

					<div class="space-y-2 md:col-span-2">
						<label
							for="website_url"
							class="flex items-center gap-2 text-xs font-black tracking-widest text-slate-400 uppercase"
						>
							<Globe size={14} /> Sito Web
						</label>
						<input
							type="url"
							id="website_url"
							name="website_url"
							bind:value={profile.website_url}
							class="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 font-bold text-slate-900 transition-all outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
							placeholder="https://www.tuoristorante.it"
						/>
					</div>
				</div>
			</div>
		</section>

		<!-- Section: Opening Hours -->
		<section class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<div class="space-y-2">
				<h3 class="text-xl font-black text-slate-900">Orari di Apertura</h3>
				<p class="text-sm font-medium text-slate-500">
					Configura i giorni e gli orari in cui sei operativo.
				</p>
			</div>

			<div
				class="space-y-4 rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm lg:col-span-2"
			>
				{#each openingHours as day, i (day.day)}
					<div
						class="rounded-2xl p-4 transition-all duration-300 {day.isOpen
							? 'bg-slate-50'
							: 'border border-slate-50 bg-transparent'}"
					>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-4">
								<button
									type="button"
									aria-label="Toggle day open"
									onclick={() => toggleDay(i)}
									class="relative h-6 w-12 rounded-full transition-colors duration-200 focus:outline-none {day.isOpen
										? 'bg-orange-500'
										: 'bg-slate-200'}"
								>
									<div
										class="absolute top-1 h-4 w-4 rounded-full bg-white transition-all duration-200 {day.isOpen
											? 'right-1'
											: 'left-1'}"
									></div>
								</button>
								<span class="text-sm font-black tracking-wider text-slate-900 uppercase"
									>{day.day}</span
								>
							</div>

							{#if !day.isOpen}
								<span class="text-xs font-bold text-slate-400 uppercase italic">Chiuso</span>
							{/if}
						</div>

						{#if day.isOpen}
							<div transition:slide class="mt-4 space-y-3">
								{#each day.periods as period, pi (pi)}
									<div class="flex items-center gap-3">
										<input
											type="time"
											bind:value={period.open}
											class="rounded-xl border border-slate-100 bg-white px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500/20"
										/>
										<span class="font-black text-slate-300">-</span>
										<input
											type="time"
											bind:value={period.close}
											class="rounded-xl border border-slate-100 bg-white px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500/20"
										/>
										{#if day.periods.length > 1}
											<button
												type="button"
												onclick={() => removePeriod(i, pi)}
												class="p-2 text-slate-400 hover:text-red-500"
											>
												<Trash2 size={16} />
											</button>
										{/if}
										{#if pi === day.periods.length - 1}
											<button
												type="button"
												onclick={() => addPeriod(i)}
												class="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-orange-500 transition-colors hover:bg-orange-50"
											>
												<Plus size={14} /> Aggiungi Fascia
											</button>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</section>

		<!-- Section: Social Media -->
		<section class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<div class="space-y-2">
				<h3 class="text-xl font-black text-slate-900">Social Media</h3>
				<p class="text-sm font-medium text-slate-500">
					Collega i tuoi profili social per farti seguire.
				</p>
			</div>

			<div
				class="space-y-6 rounded-[2.5rem] border border-slate-100 bg-white p-8 leading-relaxed shadow-sm lg:col-span-2"
			>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div class="space-y-2">
						<label
							for="instagram"
							class="flex items-center gap-2 text-xs font-black tracking-widest text-slate-400 uppercase"
						>
							<Instagram size={14} class="text-pink-500" /> Instagram URL
						</label>
						<input
							type="url"
							id="instagram"
							name="instagram_url"
							bind:value={profile.instagram_url}
							class="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 font-bold text-slate-900 transition-all outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
							placeholder="https://instagram.com/tuo-profilo"
						/>
					</div>

					<div class="space-y-2">
						<label
							for="facebook"
							class="flex items-center gap-2 text-xs font-black tracking-widest text-slate-400 uppercase"
						>
							<Facebook size={14} class="text-blue-600" /> Facebook URL
						</label>
						<input
							type="url"
							id="facebook"
							name="facebook_url"
							bind:value={profile.facebook_url}
							class="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 font-bold text-slate-900 transition-all outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
							placeholder="https://facebook.com/tua-pagina"
						/>
					</div>

					<div class="space-y-2 md:col-span-2">
						<label
							for="whatsapp"
							class="flex items-center gap-2 text-xs font-black tracking-widest text-slate-400 uppercase"
						>
							<MessageCircle size={14} class="text-emerald-500" /> WhatsApp (Numero)
						</label>
						<div class="relative">
							<span class="absolute top-1/2 left-6 -translate-y-1/2 font-bold text-slate-400"
								>+39</span
							>
							<input
								type="text"
								id="whatsapp"
								name="whatsapp_number"
								bind:value={profile.whatsapp_number}
								class="w-full rounded-2xl border border-slate-100 bg-slate-50 py-4 pr-6 pl-16 font-bold text-slate-900 transition-all outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
								placeholder="333 1234567"
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	</form>
</div>
