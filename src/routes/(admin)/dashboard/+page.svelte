<script lang="ts">
	import { TrendingUp, Users, UtensilsCrossed, Plus } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-8">
	<div class="flex items-end justify-between">
		<div>
			<h1 class="text-4xl font-black tracking-tight text-slate-900">Dashboard</h1>
			<p class="mt-2 font-medium text-slate-500">Ecco cosa succede nel tuo ristorante oggi.</p>
		</div>

		<button
			class="group flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-600"
		>
			<Plus size={20} class="transition-transform group-hover:rotate-90" />
			Nuovo Piatto
		</button>
	</div>

	<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
		<div
			class="group relative space-y-4 overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm transition-all duration-500 hover:shadow-xl"
		>
			<div
				class="absolute top-0 right-0 -mt-8 -mr-8 h-24 w-24 rounded-bl-[4rem] bg-orange-50 transition-transform group-hover:scale-110"
			></div>
			<div
				class="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600"
			>
				<Users size={28} />
			</div>
			<div>
				<h3 class="text-sm font-bold tracking-widest text-slate-400 uppercase">Visite Menu oggi</h3>
				<p class="mt-1 text-4xl font-black text-slate-900">{data.stats.visitsToday}</p>
			</div>
		</div>

		<div
			class="group relative space-y-4 overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm transition-all duration-500 hover:shadow-xl"
		>
			<div
				class="absolute top-0 right-0 -mt-8 -mr-8 h-24 w-24 rounded-bl-[4rem] bg-emerald-50 transition-transform group-hover:scale-110"
			></div>
			<div
				class="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600"
			>
				<TrendingUp size={28} />
			</div>
			<div>
				<h3 class="text-sm font-bold tracking-widest text-slate-400 uppercase">Piatto Top</h3>
				<p class="mt-1 truncate text-2xl font-black text-slate-900">
					{data.stats.topDish || 'Nessun dato'}
				</p>
			</div>
		</div>

		<div
			class="group relative overflow-hidden rounded-[2rem] bg-orange-500 p-8 text-white shadow-lg shadow-orange-500/20 transition-all duration-500 hover:scale-[1.02]"
		>
			<div class="relative z-10">
				<div class="mb-2 text-xs font-bold tracking-wider text-orange-200 uppercase">
					Prossimo Obiettivo
				</div>
				<div class="mb-4 text-3xl font-black">Ottimizza il tuo Menu</div>
				<p class="mb-6 text-sm leading-relaxed text-orange-100">
					Aggiungi le foto ai tuoi piatti per aumentare le vendite del 30%.
				</p>
				<button class="rounded-xl bg-white px-6 py-2 text-sm font-bold text-orange-500">
					Inizia Ora
				</button>
			</div>
			<div class="absolute -right-4 -bottom-4 rotate-12 text-white/10">
				<UtensilsCrossed size={120} />
			</div>
		</div>
	</div>

	<div class="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
		<div class="flex items-center justify-between border-b border-slate-50 p-8">
			<h2 class="text-2xl font-black tracking-tight text-slate-900">Ultimi Aggiornamenti</h2>
			<a href="/menu-management" class="text-sm font-bold text-orange-500 hover:underline"
				>Vedi tutto</a
			>
		</div>
		<div class="p-16 text-center">
			<div class="mx-auto max-w-xs space-y-4">
				<div
					class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300"
				>
					<UtensilsCrossed size={32} />
				</div>
				<h3 class="text-lg font-bold text-slate-900">Ancora nessun piatto</h3>
				<p class="text-sm text-slate-500">
					Il tuo menu è vuoto. Inizia aggiungendo il tuo primo piatto delizioso!
				</p>
			</div>
		</div>
	</div>
</div>
