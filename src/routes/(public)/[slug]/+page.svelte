<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut, backOut } from 'svelte/easing';
	import { Utensils, Camera } from 'lucide-svelte';
	import type { PageData } from './$types';
	import GlutenFreeIcon from '$lib/components/icons/GlutenFreeIcon.svelte';
	import type { Category, Dish, Allergen } from '$lib/db/schema';
	import { glutenSafety, uiState } from './state.svelte';

	let { data } = $props<{ data: PageData }>();
	let categories = $derived(data.categories);

	let activeCategory = $state<number | undefined>();
	let direction = $state(1); // 1 = right, -1 = left

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
	let tabsContainer = $state<HTMLElement>();

	function centerActiveTab(smooth = true) {
		if (!activeCategory || !tabsContainer || !categoryRefs[activeCategory]) return;
		
		const container = tabsContainer;
		const target = categoryRefs[activeCategory];
		const scrollTarget = target.offsetLeft - (container.offsetWidth / 2) + (target.offsetWidth / 2);
		
		container.scrollTo({
			left: scrollTarget,
			behavior: smooth ? 'smooth' : 'auto'
		});
	}

	let mounted = $state(false);
	onMount(() => {
		setTimeout(() => {
			mounted = true;
			centerActiveTab(false);
		}, 60);
	});

	// Auto-center the active category pill
	$effect(() => {
		if (activeCategory !== undefined && mounted) {
			centerActiveTab(true);
		}
	});

	let currentCat = $derived(categories.find((c: Category) => c.id === activeCategory));

	let hoveredTag = $state<string | null>(null);

	function selectCategory(id: number, forcedDirection?: number) {
		if (id === activeCategory) return;
		
		const newIndex = categories.findIndex((c: Category) => c.id === id);
		const oldIndex = categories.findIndex((c: Category) => c.id === activeCategory);
		
		if (forcedDirection !== undefined) {
			direction = forcedDirection;
		} else {
			direction = newIndex > oldIndex ? 1 : -1;
		}
		
		activeCategory = id;
		uiState.scrollToTop();
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

		if (isLeftSwipe) {
			if (currentIndex < categories.length - 1) {
				selectCategory(categories[currentIndex + 1].id, 1);
			} else {
				// Wrap to start
				selectCategory(categories[0].id, 1);
			}
		}

		if (isRightSwipe) {
			if (currentIndex > 0) {
				selectCategory(categories[currentIndex - 1].id, -1);
			} else {
				// Wrap to end
				selectCategory(categories[categories.length - 1].id, -1);
			}
		}

		touchStart = 0;
		touchEnd = 0;
	}

	// Haptic Logic
	let hapticTimer: ReturnType<typeof setTimeout>;

	function startHaptic(dish: Dish) {
		if (typeof navigator !== 'undefined') {
			hapticTimer = setTimeout(() => {
				if (navigator.vibrate) navigator.vibrate([40, 30, 30]);
				uiState.setPeekedDish(dish);
			}, 150);
		}
	}

	function stopHaptic() {
		clearTimeout(hapticTimer);
		uiState.setPeekedDish(null);
	}
</script>

<!-- TOP SPACER (to clear the absolute identity header in layout) -->
<div class="h-[112px] w-full shrink-0"></div>

<!-- STICKY CATEGORIES -->
<div 
	class="sticky top-[112px] z-[55] border-t border-white/5 bg-[#141417]/80 backdrop-blur-xl transition-all duration-300" in:fade
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
>
	<!-- Edge Fades for Carousel Focus -->
	<div class="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#141417] via-[#141417]/40 to-transparent"></div>
	<div class="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#141417] via-[#141417]/40 to-transparent"></div>

	<!-- Categories Tabs -->
	<div 
		bind:this={tabsContainer} 
		class="no-scrollbar overflow-x-auto relative z-0"
	>
		<!-- Large horizontal padding to allow any item to reach the exact center -->
		<div class="flex gap-14 py-4 px-[50%]">
			{#each categories as category (category.id)}
				{@const isActive = activeCategory === category.id}
				<button
					bind:this={categoryRefs[category.id]}
					onclick={() => selectCategory(category.id)}
					class="relative shrink-0 text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-500 ease-out
					 {isActive ? 'scale-125 text-white' : 'text-zinc-500 opacity-40 hover:text-zinc-300 hover:opacity-80'}"
				>
					{category.name}
					{#if isActive}
						<div class="absolute inset-x-[-8px] -bottom-2 h-[2.5px] bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" in:fade></div>
					{/if}
				</button>
			{/each}
		</div>
	</div>
</div>

<main
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
	class="no-scrollbar relative z-20 w-full overflow-hidden bg-[#16161a] px-6 pt-10 pb-32"
>
	<!-- Noise texture layer for content -->
	<div
		class="pointer-events-none absolute inset-0 z-0 opacity-[0.12] mix-blend-overlay"
		style="background-image: url(&quot;data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/feTurbulence%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E&quot;);"
	></div>

	<!-- THE KEYED SECTION: This handles the horizontal sliding -->
	<div class="grid w-full grid-cols-1">
		{#key activeCategory}
			<div 
				in:fly={{ x: 300 * direction, duration: 600, easing: cubicOut, opacity: 0 }}
				out:fly={{ x: -300 * direction, duration: 600, easing: cubicOut, opacity: 0 }}
				class="col-start-1 row-start-1 flex flex-col space-y-4"
			>
				{#if currentCat}
					<div class="grid gap-4">
						{#each currentCat.dishes as dish, i (dish.id)}
							{@const hasGluten = (dish.allergens as string[])?.includes('glutine')}
							<div
								class="group relative cursor-pointer overflow-hidden rounded-[2.5rem] border-[1.5px] p-7 shadow-lg
								shadow-black/20 transition-all duration-500
								ease-out active:scale-[0.97]
								{glutenSafety.mode && hasGluten
									? 'border-red-500/30 bg-red-950/20 grayscale opacity-40 scale-[0.98] pointer-events-none'
									: 'border-amber-500/50 bg-white/[0.03] hover:bg-white/[0.06] active:border-amber-400 active:bg-white/[0.08] active:shadow-[0_0_25px_rgba(245,158,11,0.2)]'}"
								onpointerdown={() => !glutenSafety.mode && startHaptic(dish)}
								onpointerup={stopHaptic}
								onpointerleave={stopHaptic}
								onclick={() => stopHaptic()}
								onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') stopHaptic(); }}
								role="button"
								tabindex="0"
							>
								{#if glutenSafety.mode && hasGluten}
									<div class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]" in:fade>
										<div class="rounded-full bg-red-500 p-2 shadow-lg mb-2">
											<GlutenFreeIcon size={24} class="text-white" />
										</div>
										<span class="text-[10px] font-black tracking-widest text-white uppercase bg-red-500 px-3 py-1 rounded-lg">
											Contiene Glutine
										</span>
									</div>
								{/if}

								<div class="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"></div>

								<div class="relative z-10 flex items-start justify-between gap-6">
									<h3 class="max-w-[75%] text-[1.35rem] leading-tight font-black tracking-tight text-white transition-colors group-hover:text-amber-400">
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
									<p class="relative z-10 mt-3 mb-6 line-clamp-3 pr-2 text-[0.95rem] leading-relaxed font-medium text-zinc-300 transition-colors group-hover:text-white">
										{dish.description}
									</p>
								{/if}

								<div class="relative z-10 mt-auto flex items-center justify-between">
									<div class="flex flex-wrap gap-2">
										{#each dish.allergens || [] as allergenId (allergenId)}
											{@const allergen = (data.allergens as Allergen[]).find((a) => a.id === allergenId)}
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
													<div class="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-base leading-none transition-colors group-hover/allergen:bg-white/10">
														{allergen.icon}
													</div>
													<span class="max-w-[0px] overflow-hidden text-[9px] font-black tracking-widest text-zinc-400 uppercase transition-all duration-500 ease-out group-hover/allergen:max-w-[120px] group-hover/allergen:text-white
														   {hoveredTag === `${dish.id}-${allergen.id}` ? 'max-w-[120px] text-white' : ''}">
														{allergen.name}
													</span>
												</button>
											{/if}
										{/each}
									</div>
								</div>
							</div>
						{/each}
					</div>

					<!-- Info Footer -->
					<div class="mt-12 space-y-8">
						<div class="space-y-3 rounded-[2.5rem] border border-orange-500/20 bg-orange-500/10 p-[2.5rem] text-center">
							<span class="text-[10px] font-black tracking-[0.4em] text-orange-500 uppercase">Benvenuti da</span>
							<h4 class="text-3xl leading-none font-black tracking-tight text-white uppercase">{data.profile.restaurant_name}</h4>
							<p class="text-[10px] font-bold tracking-[0.2em] text-orange-500 uppercase opacity-80">Toccca il logo in alto per info e contatti</p>
						</div>
						<p class="pt-8 pb-12 text-center text-[10px] leading-relaxed font-medium text-zinc-600 opacity-50">
							* Gli ingredienti contrassegnati con asterisco potrebbero contenere ingredienti surgelati. Per informazioni dettagliate sugli allergeni, chiedi al nostro personale.
						</p>
					</div>

					<!-- Swipe Hint -->
					<div class="mt-8 pb-12 text-center">
						<p class="text-[10px] font-bold tracking-[0.2em] text-zinc-700 uppercase">← Scorri per esplorare le categorie →</p>
					</div>
				{/if}
			</div>
		{/key}
	</div>
</main>

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
