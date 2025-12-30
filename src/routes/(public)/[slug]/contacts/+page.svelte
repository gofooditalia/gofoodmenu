<script lang="ts">
	import { Utensils, MapPin, Phone, Globe, Instagram, Facebook, ChevronRight } from 'lucide-svelte';
	import { fly } from 'svelte/transition';

	let { data } = $props();
	let profile = $derived(data.profile);
</script>

<!-- TOP SPACER (to clear the absolute identity header in layout) -->
<div class="h-[112px] w-full shrink-0"></div>

<div class="space-y-12 px-6 py-12 pt-10" in:fly={{ y: 20, duration: 600 }}>
	<div class="space-y-4 text-center">
		<div class="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-500 shadow-2xl shadow-orange-500/20">
			{#if profile.logo_url}
				<img src={profile.logo_url} alt={profile.restaurant_name} class="h-full w-full rounded-3xl object-cover" />
			{:else}
				<Utensils class="h-10 w-10 text-white" />
			{/if}
		</div>
		<div class="space-y-2">
			<h2 class="text-4xl leading-tight font-black tracking-tight text-white uppercase">{profile.restaurant_name}</h2>
			<span class="text-[10px] font-black tracking-[0.4em] text-orange-500 uppercase">Contatti & Info</span>
		</div>
		<p class="mx-auto max-w-[280px] text-sm leading-relaxed font-medium text-zinc-400">
			{profile.description || 'Siamo qui per accoglierti. Trova tutte le informazioni per raggiungerci e contattarci.'}
		</p>
	</div>

	<div class="grid grid-cols-1 gap-4">
		<!-- Location Card -->
		<div class="space-y-6 rounded-[2.5rem] border border-white/[0.05] bg-white/[0.03] p-8">
			<div class="flex items-center gap-4 text-orange-500">
				<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-orange-500">
					<MapPin size={24} />
				</div>
				<div>
					<p class="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Dove trovarci</p>
					<p class="text-lg font-black text-white">{profile.address || 'Indirizzo non specificato'}</p>
				</div>
			</div>
			{#if profile.address}
				<!-- svelte-ignore svelte/no-navigation-without-resolve -->
				<a href="https://www.google.com/maps/search/?api=1&query={encodeURIComponent(profile.address)}"
					target="_blank"
					class="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-white/5 bg-white/5 text-[10px] font-black tracking-[0.2em] text-white uppercase transition-colors hover:bg-white/10"
				>
					Apri su Google Maps <ChevronRight size={14} />
				</a>
			{/if}
		</div>

		<!-- Contacts Grid -->
		<div class="grid grid-cols-1 gap-4">
			<div class="space-y-6 rounded-[2.5rem] border border-white/[0.05] bg-white/[0.03] p-8">
				<div class="flex items-center gap-4 text-orange-500">
					<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-orange-500">
						<Phone size={24} />
					</div>
					<div>
						<p class="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Contatti diretti</p>
						<p class="text-lg font-black text-white">{profile.phone || '—'}</p>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-3">
					{#if profile.phone}
						<!-- svelte-ignore svelte/no-navigation-without-resolve -->
						<a href="tel:{profile.phone}"
							class="flex h-20 flex-col items-center justify-center gap-2 rounded-2xl border border-white/5 bg-white/5 text-white transition-colors hover:bg-white/10"
						>
							<Phone size={20} class="text-orange-500" />
							<span class="text-[9px] font-black tracking-widest uppercase">Chiama</span>
						</a>
					{/if}
					{#if profile.whatsapp_number}
						<!-- svelte-ignore svelte/no-navigation-without-resolve -->
						<a href="https://wa.me/39{profile.whatsapp_number?.toString().replace(/\s+/g, '')}"
							target="_blank"
							class="flex h-20 flex-col items-center justify-center gap-2 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 text-emerald-500 transition-colors hover:bg-emerald-500/10"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
								<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
							</svg>
							<span class="text-[9px] font-black tracking-widest uppercase">WhatsApp</span>
						</a>
					{/if}
				</div>
			</div>
		</div>

		<!-- Socials & Website -->
		<div class="rounded-[2.5rem] border border-white/[0.05] bg-white/[0.03] p-8">
			<p class="mb-6 text-center text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase">Seguici sui social</p>
			<div class="flex justify-center gap-6">
				{#if profile.instagram_url}
					<!-- svelte-ignore svelte/no-navigation-without-resolve -->
					<a href={profile.instagram_url} target="_blank" rel="noreferrer" class="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-zinc-400 transition-all hover:bg-pink-500/10 hover:text-pink-500">
						<Instagram size={28} />
					</a>
				{/if}
				{#if profile.facebook_url}
					<!-- svelte-ignore svelte/no-navigation-without-resolve -->
					<a href={profile.facebook_url} target="_blank" rel="noreferrer" class="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-zinc-400 transition-all hover:bg-blue-500/10 hover:text-blue-500">
						<Facebook size={28} />
					</a>
				{/if}
				{#if profile.website_url}
					<!-- svelte-ignore svelte/no-navigation-without-resolve -->
					<a href={profile.website_url} target="_blank" rel="noreferrer" class="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-zinc-400 transition-all hover:bg-white/10 hover:text-white">
						<Globe size={28} />
					</a>
				{/if}
			</div>
		</div>
	</div>

	<div class="flex justify-center pt-10 opacity-30">
		<Utensils class="h-6 w-6 text-neutral-500" />
	</div>
</div>
