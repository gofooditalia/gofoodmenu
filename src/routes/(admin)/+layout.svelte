<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	import type { LayoutData } from './$types';
	let { data, children }: { data: LayoutData; children: any } = $props();
</script>

<div class="flex min-h-screen bg-slate-50">
	<Sidebar />

	<main class="flex-1 transition-all duration-300 md:ml-64">
		<header
			class="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md"
		>
			<div class="flex items-center gap-2">
				<span class="text-sm font-medium text-slate-500"
					>Benvenuto, {data.profile?.restaurant_name ?? 'Ristoratore'}</span
				>
			</div>

			<div class="flex items-center gap-4">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full border border-orange-200 bg-orange-100 font-bold text-orange-600"
				>
					{(data.profile?.restaurant_name?.[0] ?? 'G').toUpperCase()}
				</div>
			</div>
		</header>

		<div class="p-8">
			{@render children()}
		</div>
	</main>
</div>
