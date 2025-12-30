<script lang="ts">
	import { Plus, Trash2, Edit3, Grid, Utensils } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { createQuery, useQueryClient } from '@tanstack/svelte-query';

	let { data }: { data: PageData & { categories: Category[], dishes: Dish[], allergens: Allergen[] } } = $props();
	import type { Category, Dish, Allergen } from '$lib/db/schema';
	let supabase = $derived(data.supabase);
	const queryClient = useQueryClient();

	// 1. Categories Query
	const categoriesQuery = createQuery<Category[]>(() => ({
		queryKey: ['categories', data.profile?.id],
		queryFn: async () => {
			if (!data.profile?.id) return [];
			const { data: categories, error } = await supabase
				.from('categories')
				.select('*')
				.eq('restaurant_id', data.profile.id)
				.order('sort_order', { ascending: true });
			if (error) throw error;
			return categories;
		},
		staleTime: 1000 * 60 * 5
	}));

	// 2. Dishes Query
	const dishesQuery = createQuery<(Dish & { categories: { name: string } | null })[]>(() => ({
		queryKey: ['dishes', data.profile?.id],
		queryFn: async () => {
			if (!data.profile?.id) return [];
			const { data: dishes, error } = await supabase
				.from('dishes')
				.select('*, categories(name)')
				.eq('restaurant_id', data.profile.id)
				.order('created_at', { ascending: false });
			if (error) throw error;
			return dishes;
		},
		staleTime: 1000 * 60 * 5
	}));

	// 3. Allergens Query
	const allergensQuery = createQuery<Allergen[]>(() => ({
		queryKey: ['allergens'],
		queryFn: async () => {
			const { data: allergens, error } = await supabase
				.from('allergens')
				.select('*')
				.order('number', { ascending: true });
			if (error) throw error;
			return allergens;
		},
		staleTime: 1000 * 60 * 60
	}));

	let showAddCategory = $state(false);
	let showAddDish = $state(false);

	let editingCategory = $state<Category | null>(null);
	let editingDish = $state<(Dish & { categories: { name: string } | null }) | null>(null);

	let dishName = $state('');
	let dishDescription = $state('');
	let dishPrice = $state('');
	let dishCategory = $state('');
	let selectedAllergenIds = $state<string[]>([]);
	let imagePreview: string | null = $state(null);

	function handleImageChange(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (event) => {
				imagePreview = event.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	// 4. Reactive Hydration Sync: Ensure TanStack Query cache matches SvelteKit data
	$effect(() => {
		if (data.categories && data.profile?.id) {
			queryClient.setQueryData(['categories', data.profile.id], data.categories);
		}
	});

	$effect(() => {
		if (data.dishes && data.profile?.id) {
			queryClient.setQueryData(['dishes', data.profile.id], data.dishes);
		}
	});

	$effect(() => {
		if (data.allergens) {
			queryClient.setQueryData(['allergens'], data.allergens);
		}
	});
</script>

<div class="space-y-8">
	<div class="flex items-end justify-between">
		<div>
			<h1 class="text-4xl font-black tracking-tight text-slate-900">Gestione Menu</h1>
			<p class="mt-2 font-medium text-slate-500">Organizza le tue categorie e i tuoi piatti.</p>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-4">
		<!-- Categories Sidebar -->
		<div class="space-y-6 lg:col-span-1">
			<div class="flex items-center justify-between">
				<h2 class="flex items-center gap-2 text-xl font-black tracking-tight text-slate-900">
					<Grid size={20} class="text-orange-500" />
					Categorie
				</h2>
				<button
					onclick={() => (showAddCategory = !showAddCategory)}
					class="rounded-xl bg-orange-50 p-2 text-orange-500 transition-colors hover:bg-orange-100"
				>
					<Plus size={20} />
				</button>
			</div>

			{#if showAddCategory}
				<form
					method="POST"
					action="?/addCategory"
					use:enhance={() => {
						return async ({ update }) => {
							showAddCategory = false;
							await update();
							queryClient.invalidateQueries({ queryKey: ['categories', data.profile?.id] });
						};
					}}
					class="space-y-3 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm"
				>
					<input
						type="text"
						name="name"
						placeholder="Nome (es. Antipasti)"
						class="w-full rounded-xl border-2 border-transparent bg-slate-50 p-3 text-sm font-bold outline-none focus:border-orange-500"
						required
					/>
					<div class="flex gap-2">
						<button
							type="submit"
							class="flex-1 rounded-xl bg-orange-500 py-2 text-sm font-bold text-white"
							>Salva</button
						>
						<button
							type="button"
							onclick={() => (showAddCategory = false)}
							class="flex-1 rounded-xl bg-slate-100 py-2 text-sm font-bold text-slate-500"
						>
							Annulla
						</button>
					</div>
				</form>
			{/if}

			<div class="space-y-2">
				{#each (categoriesQuery.data as Category[]) ?? [] as category (category.id)}
					<div
						class="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:border-orange-200 hover:shadow-md"
					>
						<span class="font-bold text-slate-700">{category.name}</span>
						<div
							class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
						>
							<button
								onclick={() => (editingCategory = category)}
								class="p-2 text-slate-400 transition-colors hover:text-orange-500"
							>
								<Edit3 size={16} />
							</button>
							<form
								method="POST"
								action="?/deleteCategory"
								use:enhance={() => {
									return async ({ update }) => {
										await update();
										queryClient.invalidateQueries({ queryKey: ['categories', data.profile?.id] });
									};
								}}
							>
								<input type="hidden" name="id" value={category.id} />
								<button
									type="submit"
									class="p-2 text-slate-400 transition-colors hover:text-red-500"
								>
									<Trash2 size={16} />
								</button>
							</form>
						</div>
					</div>
				{/each}

				{#if editingCategory}
					<div
						class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
					>
						<div class="w-full max-w-sm space-y-6 rounded-3xl bg-white p-8 shadow-xl">
							<h3 class="text-xl font-black text-slate-900">Modifica Categoria</h3>
							<form
								method="POST"
								action="?/editCategory"
								use:enhance={() => {
									return async ({ update }) => {
										editingCategory = null;
										await update();
										queryClient.invalidateQueries({ queryKey: ['categories', data.profile?.id] });
										queryClient.invalidateQueries({ queryKey: ['dishes', data.profile?.id] });
									};
								}}
								class="space-y-4"
							>
								<input type="hidden" name="id" value={editingCategory.id} />
								<div class="space-y-2">
									<label for="edit_cat_name" class="text-xs font-black text-slate-400 uppercase"
										>Nome</label
									>
									<input
										id="edit_cat_name"
										type="text"
										name="name"
										value={editingCategory.name}
										class="w-full rounded-2xl border-2 border-transparent bg-slate-50 p-4 font-bold outline-none focus:border-orange-500"
										required
									/>
								</div>
								<div class="flex gap-2">
									<button
										type="submit"
										class="flex-1 rounded-xl bg-orange-500 py-3 font-bold text-white"
										>Aggiorna</button
									>
									<button
										type="button"
										onclick={() => (editingCategory = null)}
										class="flex-1 rounded-xl bg-slate-100 py-3 font-bold text-slate-500"
										>Annulla</button
									>
								</div>
							</form>
						</div>
					</div>
				{/if}

				{#if (data.categories as Category[]).length === 0}
					<div
						class="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center"
					>
						<p class="text-sm font-medium text-slate-400">Nessuna categoria</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Dishes Main Area -->
		<div class="space-y-6 lg:col-span-3">
			<div class="flex items-center justify-between">
				<h2 class="flex items-center gap-2 text-xl font-black tracking-tight text-slate-900">
					<Utensils size={20} class="text-orange-500" />
					Piatti
				</h2>
				<button
					onclick={() => {
						showAddDish = true;
						selectedAllergenIds = [];
						dishName = '';
						dishDescription = '';
						dishPrice = '';
						dishCategory = '';
					}}
					class="flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-600"
				>
					<Plus size={20} />
					Nuovo Piatto
				</button>
			</div>

			{#if showAddDish}
				<div
					class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
				>
					<div
						class="animate-in fade-in zoom-in w-full max-w-xl space-y-8 rounded-[2.5rem] bg-white p-10 shadow-2xl duration-300"
					>
						<div class="flex items-center justify-between">
							<h3 class="text-3xl font-black tracking-tight text-slate-900">Nuovo Piatto</h3>
							<button
								onclick={() => (showAddDish = false)}
								class="text-slate-400 transition-colors hover:text-slate-900"
							>
								<Plus size={32} class="rotate-45" />
							</button>
						</div>

						<form
							method="POST"
							action="?/addDish"
							enctype="multipart/form-data"
							use:enhance={() => {
								return async ({ update }) => {
									showAddDish = false;
									dishName = '';
									dishPrice = '';
									dishDescription = '';
									dishCategory = '';
									selectedAllergenIds = [];
									imagePreview = null;
									await update();
									queryClient.invalidateQueries({ queryKey: ['dishes', data.profile?.id] });
								};
							}}
							class="space-y-6"
						>
							<div class="grid grid-cols-2 gap-6">
								<div class="col-span-2 space-y-2">
									<label
										for="new_dish_name"
										class="text-xs font-black tracking-wider text-slate-400 uppercase"
										>Nome del Piatto</label
									>
									<input
										id="new_dish_name"
										type="text"
										name="name"
										bind:value={dishName}
										placeholder="es. Carbonara Speciale"
										class="w-full rounded-2xl border-2 border-transparent bg-slate-50 p-4 font-bold outline-none focus:border-orange-500"
										required
									/>
								</div>

								<div class="space-y-2">
									<label
										for="new_dish_price"
										class="text-xs font-black tracking-wider text-slate-400 uppercase"
										>Prezzo (€)</label
									>
									<input
										id="new_dish_price"
										type="number"
										name="price"
										step="0.50"
										bind:value={dishPrice}
										placeholder="12.00"
										class="w-full rounded-2xl border-2 border-transparent bg-slate-50 p-4 font-bold outline-none focus:border-orange-500"
										required
									/>
								</div>

								<div class="space-y-2">
									<label
										for="new_dish_cat"
										class="text-xs font-black tracking-wider text-slate-400 uppercase"
										>Categoria</label
									>
									<select
										id="new_dish_cat"
										name="category_id"
										bind:value={dishCategory}
										class="w-full appearance-none rounded-2xl border-2 border-transparent bg-slate-50 p-4 font-bold outline-none focus:border-orange-500"
										required
									>
										<option value="" disabled>Scegli...</option>
										{#each categoriesQuery.data ?? [] as category (category.id)}
											<option value={category.id}>{category.name}</option>
										{/each}
									</select>
								</div>

								<div class="col-span-2 space-y-2">
									<label
										for="new_dish_desc"
										class="text-xs font-black tracking-wider text-slate-400 uppercase"
										>Descrizione</label
									>
									<textarea
										id="new_dish_desc"
										name="description"
										bind:value={dishDescription}
										rows="3"
										placeholder="Ingredienti, allergeni..."
										class="w-full rounded-2xl border-2 border-transparent bg-slate-50 p-4 font-bold outline-none focus:border-orange-500"
									></textarea>
								</div>

								<div class="col-span-2 space-y-3">
									<p class="text-xs font-black tracking-wider text-slate-400 uppercase">
										Allergeni Presenti
									</p>
									<div class="grid grid-cols-4 gap-2 sm:grid-cols-7">
										{#each allergensQuery.data ?? [] as allergen (allergen.id)}
											<button
												type="button"
												onclick={() => {
													if (selectedAllergenIds.includes(allergen.id)) {
														selectedAllergenIds = selectedAllergenIds.filter(
															(id) => id !== allergen.id
														);
													} else {
														selectedAllergenIds = [...selectedAllergenIds, allergen.id];
													}
												}}
												class="group relative flex flex-col items-center rounded-2xl border-2 p-3 transition-all {selectedAllergenIds.includes(
													allergen.id
												)
													? 'border-orange-500 bg-orange-50'
													: 'border-slate-50 bg-slate-50 hover:border-slate-200'}"
												title={allergen.name}
											>
												<span class="text-2xl">{allergen.icon}</span>
												<span
													class="mt-1 line-clamp-1 text-center text-[9px] leading-tight font-black text-slate-500 uppercase group-hover:text-slate-900"
													>{allergen.name}</span
												>
												{#if selectedAllergenIds.includes(allergen.id)}
													<div
														class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-orange-500"
													>
														<div class="h-1.5 w-1.5 rounded-full bg-white"></div>
													</div>
												{/if}
											</button>
										{/each}
									</div>
									<input type="hidden" name="allergens" value={selectedAllergenIds.join(', ')} />
								</div>

								<div class="col-span-2 space-y-2">
									<label
										for="new_dish_img"
										class="text-xs font-black tracking-wider text-slate-400 uppercase"
										>Immagine del Piatto</label
									>
									<div class="flex items-center gap-4">
										<div
											class="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50"
										>
											{#if imagePreview}
												<img src={imagePreview} class="h-full w-full object-cover" alt="Preview" />
											{:else}
												<Utensils size={24} class="text-slate-300" />
											{/if}
											<input
												id="new_dish_img"
												type="file"
												name="image"
												accept="image/*"
												onchange={handleImageChange}
												class="absolute inset-0 cursor-pointer opacity-0"
											/>
										</div>
										<div class="flex-1 text-sm font-medium text-slate-500">
											Carica una foto per rendere il piatto più appetitoso. (Max 2MB)
										</div>
									</div>
								</div>
							</div>

							<div class="flex gap-4 pt-4">
								<button
									type="submit"
									class="flex-1 rounded-2xl bg-orange-500 py-5 text-lg font-black text-white shadow-xl shadow-orange-500/20 transition-all hover:bg-orange-600"
									>Salva Piatto</button
								>
								<button
									type="button"
									onclick={() => (showAddDish = false)}
									class="flex-1 rounded-2xl bg-slate-100 py-5 text-lg font-black text-slate-500 transition-all hover:bg-slate-200"
									>Annulla</button
								>
							</div>
						</form>
					</div>
				</div>
			{/if}

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				{#each dishesQuery.data ?? [] as dish (dish.id)}
					<div
						class="group flex gap-6 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl"
					>
						<div class="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100">
							{#if dish.image_url}
								<img src={dish.image_url} alt={dish.name} class="h-full w-full object-cover" />
							{:else}
								<div class="flex h-full w-full items-center justify-center text-slate-300">
									<Utensils size={40} />
								</div>
							{/if}
						</div>
						<div class="flex-1 space-y-2">
							<div class="flex items-start justify-between">
								<span class="text-xs font-black tracking-widest text-orange-500 uppercase"
									>{dish.categories?.name}</span
								>
								<span class="font-black text-slate-900">€{dish.price}</span>
							</div>
							<h3 class="text-xl leading-tight font-bold text-slate-900">{dish.name}</h3>
							<p class="line-clamp-2 text-sm leading-relaxed text-slate-500">
								{dish.description || 'Nessuna descrizione.'}
							</p>
							<div
								class="flex items-center gap-4 pt-4 opacity-0 transition-all group-hover:opacity-100"
							>
								<button
									onclick={() => {
										editingDish = dish;
										imagePreview = dish.image_url;
										selectedAllergenIds = dish.allergens || [];
									}}
									class="text-slate-400 transition-colors hover:text-orange-500"
								>
									<Edit3 size={18} />
								</button>
								<form
									method="POST"
									action="?/deleteDish"
									use:enhance={() => {
										return async ({ update }) => {
											await update();
											queryClient.invalidateQueries({ queryKey: ['dishes', data.profile?.id] });
										};
									}}
								>
									<input type="hidden" name="id" value={dish.id} />
									<button type="submit" class="text-slate-400 transition-colors hover:text-red-500">
										<Trash2 size={18} />
									</button>
								</form>
							</div>
						</div>
					</div>
				{/each}

				{#if editingDish}
					<div
						class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
					>
						<div
							class="animate-in fade-in zoom-in w-full max-w-xl space-y-8 rounded-[2.5rem] bg-white p-10 shadow-2xl duration-300"
						>
							<div class="flex items-center justify-between">
								<h3 class="text-3xl font-black tracking-tight text-slate-900">Modifica Piatto</h3>
								<button
									onclick={() => {
										editingDish = null;
										imagePreview = null;
									}}
									class="text-slate-400 transition-colors hover:text-slate-900"
								>
									<Plus size={32} class="rotate-45" />
								</button>
							</div>

							<form
								method="POST"
								action="?/editDish"
								enctype="multipart/form-data"
								use:enhance={() => {
									return async ({ update }) => {
										editingDish = null;
										imagePreview = null;
										await update();
										queryClient.invalidateQueries({ queryKey: ['dishes', data.profile?.id] });
									};
								}}
								class="space-y-6"
							>
								<input type="hidden" name="id" value={editingDish.id} />
								<div class="grid grid-cols-2 gap-6">
									<div class="col-span-2 space-y-2">
										<label
											for="edit_dish_name"
											class="text-xs font-black tracking-wider text-slate-400 uppercase"
											>Nome del Piatto</label
										>
										<input
											id="edit_dish_name"
											type="text"
											name="name"
											value={editingDish.name}
											class="w-full rounded-2xl border-2 border-transparent bg-slate-50 p-4 font-bold outline-none focus:border-orange-500"
											required
										/>
									</div>

									<div class="space-y-2">
										<label
											for="edit_dish_price"
											class="text-xs font-black tracking-wider text-slate-400 uppercase"
											>Prezzo (€)</label
										>
										<input
											id="edit_dish_price"
											type="number"
											name="price"
											step="0.50"
											value={editingDish.price}
											class="w-full rounded-2xl border-2 border-transparent bg-slate-50 p-4 font-bold outline-none focus:border-orange-500"
											required
										/>
									</div>

									<div class="space-y-2">
										<label
											for="edit_dish_cat"
											class="text-xs font-black tracking-wider text-slate-400 uppercase"
											>Categoria</label
										>
										<select
											id="edit_dish_cat"
											name="category_id"
											value={editingDish.category_id}
											class="w-full appearance-none rounded-2xl border-2 border-transparent bg-slate-50 p-4 font-bold outline-none focus:border-orange-500"
											required
										>
											{#each categoriesQuery.data ?? [] as category (category.id)}
												<option value={category.id}>{category.name}</option>
											{/each}
										</select>
									</div>

									<div class="col-span-2 space-y-2">
										<label
											for="edit_dish_desc"
											class="text-xs font-black tracking-wider text-slate-400 uppercase"
											>Descrizione</label
										>
										<textarea
											id="edit_dish_desc"
											name="description"
											rows="3"
											class="w-full rounded-2xl border-2 border-transparent bg-slate-50 p-4 font-bold outline-none focus:border-orange-500"
											>{editingDish.description || ''}</textarea
										>
									</div>

									<div class="col-span-2 space-y-3">
										<p class="text-xs font-black tracking-wider text-slate-400 uppercase">
											Allergeni Presenti
										</p>
										<div class="grid grid-cols-4 gap-2 sm:grid-cols-7">
											{#each allergensQuery.data ?? [] as allergen (allergen.id)}
												<button
													type="button"
													onclick={() => {
														if (selectedAllergenIds.includes(allergen.id)) {
															selectedAllergenIds = selectedAllergenIds.filter(
																(id) => id !== allergen.id
															);
														} else {
															selectedAllergenIds = [...selectedAllergenIds, allergen.id];
														}
													}}
													class="group relative flex flex-col items-center rounded-2xl border-2 p-3 transition-all {selectedAllergenIds.includes(
														allergen.id
													)
														? 'border-orange-500 bg-orange-50'
														: 'border-slate-50 bg-slate-50 hover:border-slate-200'}"
													title={allergen.name}
												>
													<span class="text-2xl">{allergen.icon}</span>
													<span
														class="mt-1 line-clamp-1 text-center text-[9px] leading-tight font-black text-slate-500 uppercase group-hover:text-slate-900"
														>{allergen.name}</span
													>
													{#if selectedAllergenIds.includes(allergen.id)}
														<div
															class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-orange-500"
														>
															<div class="h-1.5 w-1.5 rounded-full bg-white"></div>
														</div>
													{/if}
												</button>
											{/each}
										</div>
										<input type="hidden" name="allergens" value={selectedAllergenIds.join(', ')} />
									</div>

									<div class="col-span-2 space-y-2">
										<label
											for="edit_dish_img"
											class="text-xs font-black tracking-wider text-slate-400 uppercase"
											>Immagine del Piatto</label
										>
										<div class="flex items-center gap-4">
											<div
												class="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50"
											>
												{#if imagePreview}
													<img
														src={imagePreview}
														class="h-full w-full object-cover"
														alt="Preview"
													/>
												{:else}
													<Utensils size={24} class="text-slate-300" />
												{/if}
												<input
													id="edit_dish_img"
													type="file"
													name="image"
													accept="image/*"
													onchange={handleImageChange}
													class="absolute inset-0 cursor-pointer opacity-0"
												/>
											</div>
											<div class="flex-1 text-sm font-medium text-slate-500">
												Carica una nuova foto se vuoi sostituire quella attuale.
											</div>
										</div>
									</div>
								</div>

								<div class="flex gap-4 pt-4">
									<button
										type="submit"
										class="flex-1 rounded-2xl bg-orange-500 py-5 text-lg font-black text-white shadow-xl shadow-orange-500/20 transition-all hover:bg-orange-600"
										>Aggiorna Piatto</button
									>
									<button
										type="button"
										onclick={() => {
											editingDish = null;
											imagePreview = null;
										}}
										class="flex-1 rounded-2xl bg-slate-100 py-5 text-lg font-black text-slate-500 transition-all hover:bg-slate-200"
										>Annulla</button
									>
								</div>
							</form>
						</div>
					</div>
				{/if}

				{#if (data.dishes as Dish[]).length === 0}
					<div
						class="rounded-[2rem] border-2 border-dashed border-slate-100 bg-white p-16 text-center md:col-span-2"
					>
						<div class="mx-auto max-w-xs space-y-4">
							<div
								class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300"
							>
								<Utensils size={32} />
							</div>
							<h3 class="text-lg font-bold text-slate-900">Inizia ad aggiungere piatti</h3>
							<p class="text-sm text-slate-500">
								Crea una categoria e aggiungi il tuo primo piatto per vederlo apparire qui.
							</p>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
