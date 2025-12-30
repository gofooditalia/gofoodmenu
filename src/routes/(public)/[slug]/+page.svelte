<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut, backOut } from 'svelte/easing';
	import {
		Utensils,
		Info,
		MapPin,
		Clock,
		ChevronRight,
		LayoutGrid,
		Camera,
		Phone,
		Globe,
		Instagram,
		Facebook
	} from 'lucide-svelte';
	import type { PageData } from './$types';
	import { Badge } from '$lib/components/ui/badge';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import PreviewWrapper from '$lib/components/PreviewWrapper.svelte';
	import GlutenFreeIcon from '$lib/components/icons/GlutenFreeIcon.svelte';
	import type { Category, Dish, Allergen } from '$lib/db/schema';

	let { data } = $props<{ data: PageData }>();
	let profile = $derived(data.profile);
	let categories = $derived(data.categories);

	let activeCategory = $state<number | undefined>();
	$effect(() => {
		if (!activeCategory && data.categories?.length) {
			activeCategory = data.categories[0].id;
		}
	});

	// Swipe State
	let touchStart = $state(0);
	let touchEnd = $state(0);

	// Category Refs for centering
	let categoryRefs = $state<Record<number, HTMLElement>>({});

	// Gluten Safety Mode
	let glutenSafetyMode = $state(false);

	function toggleGlutenSafety() {
		glutenSafetyMode = !glutenSafetyMode;
		// Small toast or visual feedback could be added here
	}

	// Set initial category once data is available (already handled in initialization above)

	// Auto-center the active category pill
	$effect(() => {
		if (activeCategory !== undefined && categoryRefs[activeCategory]) {
			categoryRefs[activeCategory].scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
				inline: 'center'
			});
		}
	});

	let currentCat = $derived(categories.find((c: Category) => c.id === activeCategory));

	// Page Navigation State
	type NavPage = 'menu' | 'events' | 'contacts';
	let currentPage = $state<NavPage>('menu');
	let isSidebarOpen = $state(false);

	let hoveredTag = $state<string | null>(null);
	let scrollContainer = $state<HTMLElement>();

	onMount(() => {
		const handleScroll = () => {
			if (scrollContainer) {
				// Higher threshold for sticky header feel
				// isScrolled = scrollContainer.scrollTop > 60;
			}
		};
		if (scrollContainer) {
			scrollContainer.addEventListener('scroll', handleScroll);
		}
		return () => {
			if (scrollContainer) scrollContainer.removeEventListener('scroll', handleScroll);
		};
	});

	function selectCategory(id: number) {
		activeCategory = id;
		if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function handleTouchStart(e: TouchEvent) {
		touchStart = e.touches[0].clientX;
	}

	function handleTouchMove(e: TouchEvent) {
		touchEnd = e.touches[0].clientX;
	}

	function handleTouchEnd() {
		if (!touchStart || !touchEnd) return;

		const distance = touchStart - touchEnd;
		const isLeftSwipe = distance > 50;
		const isRightSwipe = distance < -50;

		const currentIndex = categories.findIndex((c: Category) => c.id === activeCategory);

		if (isLeftSwipe && currentIndex < categories.length - 1) {
			selectCategory(categories[currentIndex + 1].id);
		}

		if (isRightSwipe && currentIndex > 0) {
			selectCategory(categories[currentIndex - 1].id);
		}

		touchStart = 0;
		touchEnd = 0;
	}

	// Haptic & Peek State
	let hapticTimer: ReturnType<typeof setTimeout>;
	let peekedDish = $state<Dish | null>(null);

	function startHaptic(dish: Dish) {
		if (typeof navigator !== 'undefined') {
			hapticTimer = setTimeout(() => {
				// 1. Trigger Vibration
				if (navigator.vibrate) navigator.vibrate([40, 30, 30]);

				// 2. Show Peek Preview
				peekedDish = dish;
			}, 150); // Faster, more tactile response
		}
	}

	function stopHaptic() {
		clearTimeout(hapticTimer);
		peekedDish = null;
	}

	function openDish() {
		// No longer opens a sheet, but could trigger haptic again or nothing
		stopHaptic();
	}
</script>

<PreviewWrapper>
	<!-- TOP FIXED NAVBAR -->
	<div
		class="absolute inset-x-0 top-0 z-[60] flex flex-col border-b border-white/5 bg-[#141417]/80 pt-6 backdrop-blur-xl select-none"
	>
		<!-- Identity Row -->
		<div class="flex items-center justify-between gap-4 px-6 pb-6">
			<!-- Restaurant Icon / Sidebar Trigger -->
			<Sheet.Root bind:open={isSidebarOpen}>
				<Sheet.Trigger
					class="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/10 transition-transform hover:scale-105 active:scale-95"
				>
					{#if profile.logo_url}
						<img
							src={profile.logo_url}
							alt={profile.restaurant_name}
							class="h-full w-full object-cover"
						/>
					{:else}
						<Utensils class="h-8 w-8 text-white" />
					{/if}
				</Sheet.Trigger>
				<Sheet.Content
					side="left"
					portalProps={{ to: '#preview-device-frame' }}
					overlayProps={{ class: 'absolute z-[90]' }}
					class="no-scrollbar absolute z-[100] w-[300px] overflow-y-auto border-white/5 bg-[#141417] p-0 sm:w-[350px]"
				>
					<div class="space-y-8 p-8">
						<!-- Navigation Section -->
						<div class="space-y-4">
							<div class="mb-2 flex items-center gap-3 text-orange-500">
								<LayoutGrid size={16} />
								<span class="text-[10px] font-black tracking-[0.2em] uppercase">Navigazione</span>
							</div>
							<nav class="grid gap-2">
								<button
									onclick={() => {
										currentPage = 'menu';
										isSidebarOpen = false;
									}}
									class="group flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300
                           {currentPage === 'menu'
										? 'bg-orange-500 text-white'
										: 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
								>
									<Utensils
										size={18}
										class={currentPage === 'menu' ? 'text-white' : 'text-orange-500'}
									/>
									<span class="text-sm font-bold">Il Nostro Menù</span>
								</button>
								<button
									onclick={() => {
										currentPage = 'events';
										isSidebarOpen = false;
									}}
									class="group flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300
                           {currentPage === 'events'
										? 'bg-orange-500 text-white'
										: 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
								>
									<Clock
										size={18}
										class={currentPage === 'events' ? 'text-white' : 'text-orange-500'}
									/>
									<span class="text-sm font-bold">Eventi Speciali</span>
								</button>
								<button
									onclick={() => {
										currentPage = 'contacts';
										isSidebarOpen = false;
									}}
									class="group flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300
                           {currentPage === 'contacts'
										? 'bg-orange-500 text-white'
										: 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
								>
									<Info
										size={18}
										class={currentPage === 'contacts' ? 'text-white' : 'text-orange-500'}
									/>
									<span class="text-sm font-bold">Contatti & Info</span>
								</button>
							</nav>
						</div>
					</div>
				</Sheet.Content>
			</Sheet.Root>

			<!-- Right: Gluten-Free Toggle/Icon -->
			<button
				onclick={toggleGlutenSafety}
				class="relative flex h-16 w-16 items-center justify-center rounded-2xl border shadow-lg transition-all active:scale-95
                       {glutenSafetyMode 
                         ? 'bg-orange-500 border-orange-400 shadow-orange-500/20' 
                         : 'bg-white/5 border-white/5 hover:bg-white/10'}"
				aria-label="Filtro senza glutine"
			>
				<GlutenFreeIcon size={32} class={glutenSafetyMode ? 'text-white' : 'text-orange-500'} />
				{#if glutenSafetyMode}
					<div class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-orange-600 shadow-sm" in:scale>
						ON
					</div>
				{/if}
			</button>
		</div>

		<!-- Categories Tabs -->
		{#if currentPage === 'menu'}
			<div class="no-scrollbar overflow-x-auto border-t border-white/5 px-6" in:fade>
				<div class="flex gap-8 pt-4">
					{#each categories as category (category.id)}
						<button
							bind:this={categoryRefs[category.id]}
							onclick={() => selectCategory(category.id)}
							class="relative shrink-0 pb-3 text-[10px] font-black tracking-[0.2em] uppercase transition-all
                     {activeCategory === category.id
								? 'text-white'
								: 'text-zinc-500 hover:text-zinc-300'}"
						>
							{category.name}
							{#if activeCategory === category.id}
								<div class="absolute inset-x-0 bottom-0 h-[2px] bg-orange-500" in:fade></div>
							{/if}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<!-- SCROLLABLE CONTENT AREA -->
	<div
		bind:this={scrollContainer}
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
		class="no-scrollbar relative h-full w-full overflow-y-auto pt-[180px] select-none"
		style="-webkit-touch-callout: none;"
	>
		{#if currentPage === 'menu'}
			<!-- Menu Content -->
			<main class="relative z-20 min-h-screen bg-[#16161a] px-6 pt-8 pb-32">
				<!-- Noise texture layer for content -->
				<div
					class="pointer-events-none absolute inset-0 z-0 opacity-[0.12] mix-blend-overlay"
					style="background-image: url(&quot;data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/feTurbulence%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E&quot;);"
				></div>

				{#key activeCategory}
					<div
						in:fly={{ y: 20, duration: 400, delay: 100, easing: cubicOut }}
						class="animate-initial-bounce space-y-4"
					>
						{#if currentCat}
							<div class="grid gap-4">
								{#each currentCat.dishes as dish, i (dish.id)}
									{@const hasGluten = (dish.allergens as string[])?.includes('glutine')}
									<div
										in:fly={{ y: 30, duration: 600, delay: i * 50, easing: cubicOut }}
										class="group relative cursor-pointer overflow-hidden rounded-[2.5rem] border-[1.5px] p-7 shadow-lg
                                shadow-black/20 transition-all duration-500
                                ease-out active:scale-[0.97]
                                {glutenSafetyMode && hasGluten 
                                    ? 'border-red-500/30 bg-red-950/20 grayscale opacity-40 scale-[0.98] pointer-events-none' 
                                    : 'border-amber-500/50 bg-white/[0.03] hover:bg-white/[0.06] active:border-amber-400 active:bg-white/[0.08] active:shadow-[0_0_25px_rgba(245,158,11,0.2)]'}"
										onclick={() => openDish()}
										onpointerdown={() => !glutenSafetyMode && startHaptic(dish)}
										onpointerup={stopHaptic}
										onpointerleave={stopHaptic}
										onkeydown={(e) => e.key === 'Enter' && !glutenSafetyMode && openDish()}
										role="button"
										tabindex="0"
									>
										{#if glutenSafetyMode && hasGluten}
											<div class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]" in:fade>
												<div class="rounded-full bg-red-500 p-2 shadow-lg mb-2">
													<GlutenFreeIcon size={24} class="text-white" />
												</div>
												<span class="text-[10px] font-black tracking-widest text-white uppercase bg-red-500 px-3 py-1 rounded-lg">
													Contiene Glutine
												</span>
											</div>
										{/if}
										<!-- Subtle Card Inner Gradient -->
										<div
											class="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"
										></div>

										<div class="relative z-10 flex items-start justify-between gap-6">
											<h3
												class="max-w-[75%] text-[1.35rem] leading-tight font-black tracking-tight text-white transition-colors group-hover:text-amber-400"
											>
												{dish.name}
											</h3>
											<div class="flex flex-col items-end">
												<span class="text-3xl font-black tracking-tighter text-orange-500">
													{dish.price}
												</span>
												{#if dish.image_url}
													<div class="mt-1 opacity-40 transition-opacity group-hover:opacity-70">
														<Camera class="h-4 w-4 text-amber-500" />
													</div>
												{/if}
											</div>
										</div>

										{#if dish.description}
											<p
												class="relative z-10 mt-3 mb-6 line-clamp-3 pr-2 text-[0.95rem] leading-relaxed font-medium text-zinc-300 transition-colors group-hover:text-white"
											>
												{dish.description}
											</p>
										{/if}

										<div class="relative z-10 mt-auto flex items-center justify-between">
											<div class="flex flex-wrap gap-2">
												{#each dish.allergens || [] as allergenId (allergenId)}
													{@const allergen = (data.allergens as Allergen[]).find(
														(a) => a.id === allergenId
													)}
													{#if allergen}
														<button
															class="group/allergen relative flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5 pr-3 shadow-lg shadow-black/20 transition-all duration-300 hover:bg-white/10 active:scale-95
                                                                   {hoveredTag === `${dish.id}-${allergen.id}` ? 'border-orange-500/30 bg-orange-500/5' : ''}"
															onmouseenter={() => (hoveredTag = `${dish.id}-${allergen.id}`)}
															onmouseleave={() => (hoveredTag = null)}
															onclick={(e) => {
																e.stopPropagation();
																hoveredTag = hoveredTag === `${dish.id}-${allergen.id}` ? null : `${dish.id}-${allergen.id}`;
															}}
														>
															<div
																class="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-base leading-none transition-colors group-hover/allergen:bg-white/10"
															>
																{allergen.icon}
															</div>
															<span
																class="max-w-[0px] overflow-hidden text-[9px] font-black tracking-widest text-zinc-400 uppercase transition-all duration-500 ease-out group-hover/allergen:max-w-[120px] group-hover/allergen:text-white
                                                                       {hoveredTag === `${dish.id}-${allergen.id}` ? 'max-w-[120px] text-white' : ''}"
															>
																{allergen.name}
															</span>
														</button>
													{/if}
												{/each}
											</div>
											<div class="flex gap-1.5 opacity-30">
												<div class="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
												<div class="h-1.5 w-1.5 rounded-full bg-zinc-800"></div>
											</div>
										</div>
									</div>
								{/each}
							</div>

							<!-- Info Footer -->
							<div class="mt-12 space-y-8">
								<!-- Basic Info & Description -->
								<div
									class="space-y-3 rounded-[2.5rem] border border-orange-500/20 bg-orange-500/10 p-[2.5rem] text-center"
								>
									<span class="text-[10px] font-black tracking-[0.4em] text-orange-500 uppercase"
										>Benvenuti da</span
									>
									<h4 class="text-3xl leading-none font-black tracking-tight text-white uppercase">
										{profile.restaurant_name}
									</h4>
									<p
										class="text-[10px] font-bold tracking-[0.2em] text-orange-500 uppercase opacity-80"
									>
										Toccca il logo in alto per info e contatti
									</p>
								</div>

								<p
									class="pt-8 pb-12 text-center text-[10px] leading-relaxed font-medium text-zinc-600 opacity-50"
								>
									* Gli ingredienti contrassegnati con asterisco potrebbero contenere ingredienti
									surgelati. Per informazioni dettagliate sugli allergeni, chiedi al nostro
									personale.
								</p>
							</div>

							<!-- Swipe Hint -->
							<div class="mt-8 pb-12 text-center">
								<p class="text-[10px] font-bold tracking-[0.2em] text-zinc-700 uppercase">
									← Scorri per esplorare le categorie →
								</p>
							</div>
						{/if}
					</div>
				{/key}
			</main>
		{:else}
			<!-- OTHER PAGES -->
			<div class="space-y-12 px-6 py-12" in:fade>
				{#if currentPage === 'events'}
					<div class="space-y-4 text-center">
						<span class="text-[10px] font-black tracking-[0.4em] text-orange-500 uppercase"
							>News & Specialities</span
						>
						<h2 class="text-4xl leading-tight font-black tracking-tight text-white">
							Cosa bolle in pentola?
						</h2>
						<p class="mx-auto max-w-[280px] text-sm leading-relaxed font-medium text-zinc-400">
							Scopri le nostre iniziative speciali, i menu degustazione e le serate dedicate alla
							tradizione.
						</p>
					</div>

					<div class="space-y-6">
						<div class="group space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
							<div class="aspect-[16/9] overflow-hidden rounded-lg bg-white/[0.05]">
								<div
									class="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-900/40 to-[#141417]"
								>
									<Utensils
										class="h-8 w-8 text-amber-600 opacity-40 transition-transform group-hover:scale-110"
									/>
								</div>
							</div>
							<div class="space-y-2">
								<h3
									class="font-serif text-lg text-white italic transition-colors group-hover:text-amber-500"
								>
									Menu Capodanno 2026
								</h3>
								<p class="text-xs leading-relaxed text-neutral-500">
									Una selezione esclusiva dei nostri piatti iconici rivisitati per la notte più
									magica dell'anno.
								</p>
								<div class="pt-2">
									<Badge
										class="border-amber-900/30 bg-amber-600/20 px-2 text-[9px] tracking-widest text-amber-500 uppercase"
										>Presto Disponibile</Badge
									>
								</div>
							</div>
						</div>

						<div class="group space-y-4 rounded-2xl border border-white/5 bg-neutral-900 p-6">
							<div class="aspect-[16/9] overflow-hidden rounded-lg bg-neutral-800">
								<div
									class="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-900/40 to-black"
								>
									<Clock
										class="h-8 w-8 text-purple-600 opacity-40 transition-transform group-hover:scale-110"
									/>
								</div>
							</div>
							<div class="space-y-2">
								<h3
									class="font-serif text-lg text-white italic transition-colors group-hover:text-amber-500"
								>
									Fuori Carta della Settimana
								</h3>
								<p class="text-xs leading-relaxed text-neutral-500">
									Ogni martedì il nostro Chef propone un piatto speciale basato sugli ingredienti
									più freschi del mercato.
								</p>
							</div>
						</div>
					</div>
				{:else if currentPage === 'contacts'}
					<div class="space-y-12" in:fly={{ y: 20, duration: 600 }}>
						<div class="space-y-4 text-center">
							<div
								class="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-500 shadow-2xl shadow-orange-500/20"
							>
								{#if profile.logo_url}
									<img
										src={profile.logo_url}
										alt={profile.restaurant_name}
										class="h-full w-full rounded-3xl object-cover"
									/>
								{:else}
									<Utensils class="h-10 w-10 text-white" />
								{/if}
							</div>
							<div class="space-y-2">
								<h2 class="text-4xl leading-tight font-black tracking-tight text-white uppercase">
									{profile.restaurant_name}
								</h2>
								<span class="text-[10px] font-black tracking-[0.4em] text-orange-500 uppercase"
									>Contatti & Info</span
								>
							</div>
							<p class="mx-auto max-w-[280px] text-sm leading-relaxed font-medium text-zinc-400">
								{profile.description ||
									'Siamo qui per accoglierti. Trova tutte le informazioni per raggiungerci e contattarci.'}
							</p>
						</div>

						<div class="grid grid-cols-1 gap-4">
							<!-- Location Card -->
							<div
								class="space-y-6 rounded-[2.5rem] border border-white/[0.05] bg-white/[0.03] p-8"
							>
								<div class="flex items-center gap-4 text-orange-500">
									<div
										class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-orange-500"
									>
										<MapPin size={24} />
									</div>
									<div>
										<p class="text-[10px] font-black tracking-widest text-zinc-500 uppercase">
											Dove trovarci
										</p>
										<p class="text-lg font-black text-white">
											{profile.address || 'Indirizzo non specificato'}
										</p>
									</div>
								</div>
								{#if profile.address}
									<a
										href="https://www.google.com/maps/search/?api=1&query={encodeURIComponent(
											profile.address
										)}"
										target="_blank"
										class="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-white/5 bg-white/5 text-[10px] font-black tracking-[0.2em] text-white uppercase transition-colors hover:bg-white/10"
									>
										Apri su Google Maps <ChevronRight size={14} />
									</a>
								{/if}
							</div>

							<!-- Contacts Grid -->
							<div class="grid grid-cols-1 gap-4">
								<div
									class="space-y-6 rounded-[2.5rem] border border-white/[0.05] bg-white/[0.03] p-8"
								>
									<div class="flex items-center gap-4 text-orange-500">
										<div
											class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-orange-500"
										>
											<Phone size={24} />
										</div>
										<div>
											<p class="text-[10px] font-black tracking-widest text-zinc-500 uppercase">
												Contatti diretti
											</p>
											<p class="text-lg font-black text-white">{profile.phone || '—'}</p>
										</div>
									</div>
									<div class="grid grid-cols-2 gap-3">
										{#if profile.phone}
											<a
												href="tel:{profile.phone}"
												class="flex h-20 flex-col items-center justify-center gap-2 rounded-2xl border border-white/5 bg-white/5 text-white transition-colors hover:bg-white/10"
											>
												<Phone size={20} class="text-orange-500" />
												<span class="text-[9px] font-black tracking-widest uppercase">Chiama</span>
											</a>
										{/if}
										{#if profile.whatsapp_number}
											<a
												href="https://wa.me/39{profile.whatsapp_number
													?.toString()
													.replace(/\s+/g, '')}"
												target="_blank"
												class="flex h-20 flex-col items-center justify-center gap-2 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 text-emerald-500 transition-colors hover:bg-emerald-500/10"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="20"
													height="20"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2.5"
													stroke-linecap="round"
													stroke-linejoin="round"
													><path
														d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
													></path></svg
												>
												<span class="text-[9px] font-black tracking-widest uppercase">WhatsApp</span
												>
											</a>
										{/if}
									</div>
								</div>
							</div>

							<!-- Socials & Website -->
							<div class="rounded-[2.5rem] border border-white/[0.05] bg-white/[0.03] p-8">
								<p
									class="mb-6 text-center text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase"
								>
									Seguici sui social
								</p>
								<div class="flex justify-center gap-6">
									{#if profile.instagram_url}
										<a
											href={profile.instagram_url}
											target="_blank"
											rel="noreferrer"
											class="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-zinc-400 transition-all hover:bg-pink-500/10 hover:text-pink-500"
										>
											<Instagram size={28} />
										</a>
									{/if}
									{#if profile.facebook_url}
										<a
											href={profile.facebook_url}
											target="_blank"
											rel="noreferrer"
											class="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-zinc-400 transition-all hover:bg-blue-500/10 hover:text-blue-500"
										>
											<Facebook size={28} />
										</a>
									{/if}
									{#if profile.website_url}
										<a
											href={profile.website_url}
											target="_blank"
											rel="noreferrer"
											class="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-zinc-400 transition-all hover:bg-white/10 hover:text-white"
										>
											<Globe size={28} />
										</a>
									{/if}
								</div>
							</div>
						</div>
					</div>
				{/if}

				<div class="flex justify-center pt-10 opacity-30">
					<Utensils class="h-6 w-6 text-neutral-500" />
				</div>
			</div>
		{/if}
	</div>
</PreviewWrapper>

<!-- TACTILE PEEK OVERLAY (Image Preview on Long Press) -->
{#if peekedDish}
	<div
		class="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center p-8"
		transition:fade={{ duration: 200 }}
	>
		<!-- Backdrop Blur -->
		<div class="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

		<!-- The Peek Card -->
		<div
			class="relative aspect-square w-full max-w-[320px] overflow-hidden rounded-[2rem] border-[2px] border-amber-500/50 bg-[#1a1a1e] shadow-[0_0_50px_rgba(245,158,11,0.3)]"
			in:scale={{ duration: 400, start: 0.8, easing: backOut }}
			out:scale={{ duration: 200, start: 0.9, easing: cubicOut }}
		>
			{#if peekedDish.image_url}
				<img src={peekedDish.image_url} alt={peekedDish.name} class="h-full w-full object-cover" />

				<!-- Information Overlay (Only for Images) -->
				<div
					class="absolute inset-x-0 bottom-0 space-y-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-6"
				>
					<div class="flex items-center justify-between gap-4">
						<h4 class="text-2xl leading-none font-black tracking-tight text-white">
							{peekedDish.name}
						</h4>
						<span class="text-3xl font-black text-orange-500 drop-shadow-lg"
							>{peekedDish.price}</span
						>
					</div>
					{#if peekedDish.description}
						<p class="line-clamp-4 text-sm leading-relaxed font-medium text-zinc-300">
							{peekedDish.description}
						</p>
					{/if}
				</div>
			{:else}
				<!-- Special Design for No-Image Dishes -->
				<div
					class="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a1a1e] to-[#0d0d0f] p-8 text-center"
				>
					<!-- Background Decorative Icon -->
					<Utensils class="absolute -top-4 -right-4 h-32 w-32 rotate-12 text-amber-500/5" />
					<Utensils class="absolute -bottom-8 -left-8 h-40 w-40 -rotate-12 text-amber-500/5" />

					<div class="relative z-10 space-y-6">
						<div class="space-y-2">
							<p class="text-[10px] font-black tracking-[0.3em] text-amber-500/60 uppercase">
								L'Autentico Sapore
							</p>
							<h4
								class="mb-2 text-3xl leading-tight font-black tracking-tight text-white uppercase"
							>
								{peekedDish.name}
							</h4>

							{#if (peekedDish.allergens?.length ?? 0) > 0}
								<div class="mb-4 flex gap-2">
									{#each peekedDish.allergens ?? [] as allergenId (allergenId)}
										{@const allergen = (data.allergens as Allergen[]).find(
											(a) => a.id === allergenId
										)}
										{#if allergen}
											<div
												class="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
											>
												<span class="text-lg">{allergen.icon}</span>
												<span class="text-[10px] font-black tracking-wider text-white/50 uppercase"
													>{allergen.name}</span
												>
											</div>
										{/if}
									{/each}
								</div>
							{/if}
						</div>

						{#if peekedDish.description}
							<p class="px-2 text-sm leading-relaxed font-medium text-zinc-400">
								{peekedDish.description}
							</p>
						{/if}

						<div class="pt-4">
							<span class="text-5xl font-black text-orange-500">{peekedDish.price}</span>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	:global(body) {
		background-color: #0d0d0f;
		overflow: hidden; /* Hide outer scroll on desktop */
		user-select: none;
		-webkit-user-select: none;
		-webkit-touch-callout: none;
	}
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	@keyframes initial-bounce {
		0%,
		100% {
			transform: translateX(0);
		}
		20% {
			transform: translateX(-15px);
		}
		40% {
			transform: translateX(10px);
		}
		60% {
			transform: translateX(-5px);
		}
		80% {
			transform: translateX(2px);
		}
	}

	.animate-initial-bounce {
		animation: initial-bounce 1.2s cubic-bezier(0.45, 0, 0.55, 1);
		animation-delay: 0.8s; /* Wait for initial fly-in to finish */
	}
</style>
