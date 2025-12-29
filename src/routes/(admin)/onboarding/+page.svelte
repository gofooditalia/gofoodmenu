<script lang="ts">
	import { Store, Globe, ArrowRight } from 'lucide-svelte';

	let { data, form } = $props();

	let restaurantName = $state('');
	let slug = $state('');

	// Auto-generate slug from restaurant name
	$effect(() => {
		if (restaurantName) {
			slug = restaurantName
				.toLowerCase()
				.replace(/[^a-z0-9]/g, '-')
				.replace(/-+/g, '-')
				.replace(/^-|-$/g, '');
		}
	});
</script>

<div class="mx-auto max-w-2xl py-12">
	<div
		class="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-12 shadow-xl shadow-orange-500/5"
	>
		<div class="absolute top-0 right-0 rotate-12 p-12 text-orange-500/5">
			<Store size={200} />
		</div>

		<div class="relative z-10">
			<div class="mb-8">
				<img src="/logo.svg" alt="go!foodmenu" class="h-12 w-auto" />
			</div>
			<h1 class="mb-4 text-4xl font-black tracking-tight text-slate-900">
				Iniziamo l'avventura! 🚀
			</h1>
			<p class="mb-12 text-lg font-medium text-slate-500">
				Configura il tuo ristorante in pochi secondi e crea il tuo menu digitale.
			</p>

			<form method="POST" class="space-y-8">
				<div class="space-y-4">
					<label
						for="restaurant_name"
						class="block text-sm font-black tracking-wider text-slate-900 uppercase"
					>
						Nome del Ristorante
					</label>
					<div class="group relative">
						<div
							class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6 text-slate-400 transition-colors group-focus-within:text-orange-500"
						>
							<Store size={22} />
						</div>
						<input
							type="text"
							name="restaurant_name"
							id="restaurant_name"
							bind:value={restaurantName}
							placeholder="Esempio: Trattoria da Mario"
							class="block w-full rounded-2xl border-2 border-transparent bg-slate-50 py-5 pr-6 pl-14 text-lg font-bold text-slate-900 transition-all outline-none placeholder:text-slate-300 focus:border-orange-500 focus:bg-white"
							required
						/>
					</div>
				</div>

				<div class="space-y-4">
					<label
						for="slug"
						class="block text-sm font-black tracking-wider text-slate-900 uppercase"
					>
						Il tuo link personalizzato
					</label>
					<div class="group relative">
						<div
							class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6 text-slate-400 transition-colors group-focus-within:text-orange-500"
						>
							<Globe size={22} />
						</div>
						<input
							type="text"
							name="slug"
							id="slug"
							bind:value={slug}
							placeholder="trattoria-da-mario"
							class="block w-full rounded-2xl border-2 border-transparent bg-slate-50 py-5 pr-6 pl-14 text-lg font-bold text-slate-900 transition-all outline-none placeholder:text-slate-300 focus:border-orange-500 focus:bg-white"
							required
						/>
						<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-6">
							<span class="font-bold text-slate-300">.gofoodmenu.it</span>
						</div>
					</div>
					<p class="pl-2 text-xs font-bold text-slate-400">
						Questo sarà l'indirizzo che i tuoi clienti useranno. Puoi cambiarlo in seguito.
					</p>
				</div>

				{#if form?.error}
					<div
						class="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-500"
					>
						<span>⚠️</span>
						{form.error}
					</div>
				{/if}

				<button
					type="submit"
					class="group flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 py-6 text-xl font-black text-white shadow-xl shadow-slate-900/10 transition-all hover:bg-slate-800"
				>
					Crea il mio Ristorante
					<ArrowRight size={24} class="transition-transform group-hover:translate-x-1" />
				</button>
			</form>
		</div>
	</div>
</div>
