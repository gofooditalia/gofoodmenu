<script lang="ts">
	import { page } from '$app/state';
	import { Utensils, LayoutGrid, Info, Clock } from 'lucide-svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import PreviewWrapper from '$lib/components/PreviewWrapper.svelte';
	import GlutenFreeIcon from '$lib/components/icons/GlutenFreeIcon.svelte';
	import { scale, fade } from 'svelte/transition';
	import { backOut, cubicOut } from 'svelte/easing';
	import { glutenSafety, uiState } from './state.svelte';
	import type { Allergen } from '$lib/db/schema';

	let { data, children } = $props();
	let profile = $derived(data.profile);
	let slug = $derived(page.params.slug);
	let currentPath = $derived(page.url.pathname);

	let isSidebarOpen = $state(false);
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
								<!-- svelte-ignore no-navigation-without-resolve -->
								<a href="/{slug}"
									onclick={() => (isSidebarOpen = false)}
									class="group flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300
                                   {currentPath === `/${slug}`
										? 'bg-orange-500 text-white'
										: 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
								>
									<Utensils
										size={18}
										class={currentPath === `/${slug}` ? 'text-white' : 'text-orange-500'}
									/>
									<span class="text-sm font-bold">Il Nostro Menù</span>
								</a>
								<!-- svelte-ignore no-navigation-without-resolve -->
								<a href="/{slug}/events"
									onclick={() => (isSidebarOpen = false)}
									class="group flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300
                                   {currentPath.includes('/events')
										? 'bg-orange-500 text-white'
										: 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
								>
									<Clock
										size={18}
										class={currentPath.includes('/events') ? 'text-white' : 'text-orange-500'}
									/>
									<span class="text-sm font-bold">Eventi Speciali</span>
								</a>
								<!-- svelte-ignore no-navigation-without-resolve -->
								<a href="/{slug}/contacts"
									onclick={() => (isSidebarOpen = false)}
									class="group flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300
                                   {currentPath.includes('/contacts')
										? 'bg-orange-500 text-white'
										: 'text-zinc-400 hover:bg-white/5 hover:text-white'}"
								>
									<Info
										size={18}
										class={currentPath.includes('/contacts') ? 'text-white' : 'text-orange-500'}
									/>
									<span class="text-sm font-bold">Contatti & Info</span>
								</a>
							</nav>
						</div>
					</div>
				</Sheet.Content>
			</Sheet.Root>

			<!-- Right: Gluten-Free Toggle/Icon -->
			<button
				onclick={() => glutenSafety.toggle()}
				class="relative flex h-16 w-16 items-center justify-center rounded-2xl border shadow-lg transition-all active:scale-95
                       {glutenSafety.mode 
                         ? 'bg-orange-500 border-orange-400 shadow-orange-500/20' 
                         : 'bg-white/5 border-white/5 hover:bg-white/10'}"
				aria-label="Filtro senza glutine"
			>
				<GlutenFreeIcon size={32} class={glutenSafety.mode ? 'text-white' : 'text-orange-500'} />
				{#if glutenSafety.mode}
					<div class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-orange-600 shadow-sm" in:scale>
						ON
					</div>
				{/if}
			</button>
		</div>
	</div>

	<!-- SCROLLABLE CONTENT AREA -->
	<div
		bind:this={uiState.scrollContainer}
		class="no-scrollbar relative h-full w-full overflow-y-auto select-none"
		style="-webkit-touch-callout: none;"
	>
		{@render children()}
	</div>

	<!-- TACTILE PEEK OVERLAY (Shared for all menu pages) -->
	{#if uiState.peekedDish}
		<div
			class="pointer-events-none absolute inset-0 z-[100] flex items-center justify-center p-8"
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
				{#if uiState.peekedDish.image_url}
					<img
						src={uiState.peekedDish.image_url}
						alt={uiState.peekedDish.name}
						class="h-full w-full object-cover"
					/>

					<!-- Information Overlay (Only for Images) -->
					<div
						class="absolute inset-x-0 bottom-0 space-y-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-6"
					>
						<div class="flex items-center justify-between gap-4">
							<h4 class="text-2xl leading-none font-black tracking-tight text-white">
								{uiState.peekedDish.name}
							</h4>
							<span class="text-3xl font-black text-orange-500 drop-shadow-lg"
								>{uiState.peekedDish.price}</span
							>
						</div>
						{#if uiState.peekedDish.description}
							<p class="line-clamp-4 text-sm leading-relaxed font-medium text-zinc-300">
								{uiState.peekedDish.description}
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
									{uiState.peekedDish.name}
								</h4>

								{#if (uiState.peekedDish.allergens?.length ?? 0) > 0}
									<div class="mb-4 flex gap-2">
										{#each uiState.peekedDish.allergens ?? [] as allergenId (allergenId)}
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

							{#if uiState.peekedDish.description}
								<p class="px-2 text-sm leading-relaxed font-medium text-zinc-400">
									{uiState.peekedDish.description}
								</p>
							{/if}

							<div class="pt-4">
								<span class="text-5xl font-black text-orange-500">{uiState.peekedDish.price}</span>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</PreviewWrapper>

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
</style>
