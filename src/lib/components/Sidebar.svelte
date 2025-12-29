<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Home, Grid, QrCode, LogOut, Store } from 'lucide-svelte';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';

	let { restaurantName = 'Il Tuo Locale' } = $props();

	const menuItems = [
		{ name: 'Dashboard', icon: Home, href: '/dashboard' },
		{ name: 'Profilo Ristorante', icon: Store, href: '/restaurant-profile' },
		{ name: 'Gestione Menu', icon: Grid, href: '/menu-management' },
		{ name: 'QR Code', icon: QrCode, href: '/qr-generator' }
	];

	const isActive = (path: string) => page.url.pathname.includes(path);
</script>

<Sidebar.Root collapsible="icon">
	<Sidebar.Header class="flex items-center justify-between p-4">
		<div class="flex items-center gap-2 overflow-hidden">
			<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500">
				<img src="/logo.svg" alt="go!" class="h-6 w-auto brightness-0 invert" />
			</div>
			<div
				class="flex flex-col gap-0.5 leading-none transition-all group-data-[collapsible=icon]:hidden"
			>
				<span
					class="text-lg font-black tracking-tighter text-orange-500 underline decoration-orange-500/30 decoration-4 underline-offset-2"
					>GO!FOOD</span
				>
				<span class="text-[10px] font-bold tracking-widest text-slate-500 uppercase opacity-80"
					>Menù Manager</span
				>
			</div>
		</div>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel
				class="mb-2 px-4 text-[10px] font-black tracking-[0.2em] text-slate-400/70 uppercase"
				>Principale</Sidebar.GroupLabel
			>
			<Sidebar.Menu>
				{#each menuItems as item}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton
							isActive={isActive(item.href)}
							tooltip={item.name}
							class="group h-12 rounded-xl px-4 transition-all duration-300 hover:bg-orange-50/50"
						>
							{#snippet child({ props })}
								<a {...props} href={item.href} class="flex w-full items-center gap-3">
									<item.icon
										size={20}
										class={isActive(item.href)
											? 'text-orange-500'
											: 'text-slate-400 transition-colors group-hover:text-orange-400'}
									/>
									<span
										class="text-sm font-bold {isActive(item.href)
											? 'text-slate-900'
											: 'text-slate-600 group-hover:text-slate-900'}">{item.name}</span
									>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>
	</Sidebar.Content>

	<Sidebar.Footer class="border-t border-slate-100/50 p-4">
		<form method="POST" action="/logout" use:enhance class="w-full">
			<button
				type="submit"
				class="group flex w-full items-center gap-3 rounded-xl px-3 py-3 font-bold text-slate-500 transition-all hover:bg-red-50/50 hover:text-red-500"
			>
				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-red-100"
				>
					<LogOut size={16} />
				</div>
				<span class="text-sm group-data-[collapsible=icon]:hidden">Esci</span>
			</button>
		</form>
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
