<script lang="ts">
	import { Utensils, Clock } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import { Badge } from '$lib/components/ui/badge';

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let { data } = $props();
</script>

<!-- TOP SPACER (to clear the absolute identity header in layout) -->
<div class="h-[112px] w-full shrink-0"></div>

<div class="space-y-12 px-6 py-12 pt-10" in:fade>
	<div class="space-y-4 text-center">
		<span class="text-[10px] font-black tracking-[0.4em] text-orange-500 uppercase">News & Specialities</span>
		<h2 class="text-4xl leading-tight font-black tracking-tight text-white">Cosa bolle in pentola?</h2>
		<p class="mx-auto max-w-[280px] text-sm leading-relaxed font-medium text-zinc-400">
			Scopri le nostre iniziative speciali, i menu degustazione e le serate dedicate alla tradizione.
		</p>
	</div>

	<div class="space-y-6">
		<div class="group space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
			<div class="aspect-[16/9] overflow-hidden rounded-lg bg-white/[0.05]">
				<div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-900/40 to-[#141417]">
					<Utensils class="h-8 w-8 text-amber-600 opacity-40 transition-transform group-hover:scale-110" />
				</div>
			</div>
			<div class="space-y-2">
				<h3 class="font-serif text-lg text-white italic transition-colors group-hover:text-amber-500">
					Menu Capodanno 2026
				</h3>
				<p class="text-xs leading-relaxed text-neutral-500">
					Una selezione esclusiva dei nostri piatti iconici rivisitati per la notte più magica dell'anno.
				</p>
				<div class="pt-2">
					<Badge class="border-amber-900/30 bg-amber-600/20 px-2 text-[9px] tracking-widest text-amber-500 uppercase">
						Presto Disponibile
					</Badge>
				</div>
			</div>
		</div>

		<div class="group space-y-4 rounded-2xl border border-white/5 bg-neutral-900 p-6">
			<div class="aspect-[16/9] overflow-hidden rounded-lg bg-neutral-800">
				<div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-900/40 to-black">
					<Clock class="h-8 w-8 text-purple-600 opacity-40 transition-transform group-hover:scale-110" />
				</div>
			</div>
			<div class="space-y-2">
				<h3 class="font-serif text-lg text-white italic transition-colors group-hover:text-amber-500">
					Fuori Carta della Settimana
				</h3>
				<p class="text-xs leading-relaxed text-neutral-500">
					Ogni martedì il nostro Chef propone un piatto speciale basato sugli ingredienti più freschi del mercato.
				</p>
			</div>
		</div>
	</div>

	<div class="flex justify-center pt-10 opacity-30">
		<Utensils class="h-6 w-6 text-neutral-500" />
	</div>
</div>
