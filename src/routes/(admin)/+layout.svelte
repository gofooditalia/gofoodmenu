<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	import * as SidebarUI from '$lib/components/ui/sidebar/index.js';
	import type { LayoutData } from './$types';
	let { data, children }: { data: LayoutData; children: any } = $props();
</script>

<SidebarUI.Provider>
	<div class="flex min-h-screen w-full bg-slate-50">
		<Sidebar />

		<SidebarUI.Inset class="flex min-w-0 flex-1 flex-col">
			<header
				class="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200/60 bg-white/80 px-6 shadow-sm shadow-slate-200/20 backdrop-blur-xl"
			>
				<div class="flex items-center gap-4">
					<SidebarUI.Trigger class="group rounded-xl p-2 transition-colors hover:bg-orange-50">
						<div class="flex items-center gap-3">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20 transition-transform group-hover:scale-105"
							>
								<img src="/logo.svg" alt="go!" class="h-6 w-auto brightness-0 invert" />
							</div>
							<div class="flex flex-col">
								<span
									class="mb-1 text-xs leading-none font-black tracking-[0.2em] text-slate-400 uppercase"
									>Ristorante</span
								>
								<span class="max-w-[200px] truncate text-sm leading-none font-black text-slate-800"
									>{data.profile?.restaurant_name ?? 'Dashboard'}</span
								>
							</div>
						</div>
					</SidebarUI.Trigger>
				</div>

				<div class="flex items-center gap-4">
					<div class="mr-2 flex flex-col items-end">
						<span
							class="mb-1 text-[10px] leading-none font-black tracking-widest text-slate-400 uppercase"
							>Status</span
						>
						<div class="flex items-center gap-1.5">
							<div class="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500"></div>
							<span class="text-[10px] font-bold text-slate-600">Online</span>
						</div>
					</div>
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-black text-white shadow-md shadow-orange-500/20"
					>
						{(data.profile?.restaurant_name?.[0] ?? 'G').toUpperCase()}
					</div>
				</div>
			</header>

			<div class="flex-1 p-6 md:p-10">
				<div class="mx-auto max-w-7xl">
					{@render children()}
				</div>
			</div>
		</SidebarUI.Inset>
	</div>
</SidebarUI.Provider>
