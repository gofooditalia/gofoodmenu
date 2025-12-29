<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	let profile = $derived(data.profile);
</script>

<div class="flex h-screen w-full flex-col items-center justify-center bg-slate-50 p-4">
	<div class="max-w-md space-y-6 text-center">
		<h1 class="text-4xl font-bold tracking-tight text-slate-900">go!foodmenu</h1>
		<p class="text-slate-600">
			Il sistema operativo per il tuo ristorante.
			<br />Scegli dove vuoi andare:
		</p>

		<div class="grid w-full gap-4">
			<a
				href={profile ? `/${profile.slug}` : '/osteria-test'}
				class="flex w-full transform items-center justify-center rounded-xl bg-orange-500 p-4 font-semibold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-orange-600"
			>
				🍕 {profile ? 'Il Mio Menu' : 'Vai al Menu (Cliente)'}
			</a>

			<a
				href="/demo"
				class="flex w-full items-center justify-center rounded-xl border border-orange-200 bg-orange-50 p-4 font-semibold text-orange-600 transition-all hover:bg-orange-100"
			>
				✨ Vedi Demo (Menu Premium)
			</a>

			<div class="flex items-center gap-4 py-2">
				<div class="h-px flex-1 bg-slate-200"></div>
				<span class="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Oppure</span>
				<div class="h-px flex-1 bg-slate-200"></div>
			</div>

			<a
				href={data.user ? '/dashboard' : '/login'}
				class="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white p-4 font-semibold text-slate-700 transition-all hover:border-slate-800"
			>
				{data.user ? '👨‍🍳 Area Ristorante (Admin)' : '🔑 Accedi / Login'}
			</a>
		</div>

		{#if data.user}
			<p class="text-[10px] font-medium text-slate-400">
				Sei loggato come <span class="font-bold text-slate-600">{data.user.email}</span>
			</p>
		{/if}
	</div>
</div>
