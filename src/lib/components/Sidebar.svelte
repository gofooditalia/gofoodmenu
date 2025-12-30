<script lang="ts">
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

<aside class="fixed flex h-screen w-64 flex-col bg-slate-900 text-white hidden md:flex">
	<div class="p-6">
		<a href="/dashboard" class="group flex items-center gap-2">
			<img src="/logo.svg" alt="go!foodmenu" class="h-10 w-auto" />
		</a>
	</div>

	<nav class="mt-4 flex-1 space-y-1 px-4">
		{#each menuItems as item}
			<a
				href={item.href}
				class="group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 {isActive(
					item.href
				)
					? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
					: 'text-slate-400 hover:bg-slate-800 hover:text-white'}"
			>
				<item.icon
					size={20}
					class={isActive(item.href)
						? 'text-white'
						: 'text-slate-500 transition-colors group-hover:text-orange-500'}
				/>
				<span class="font-medium">{item.name}</span>
			</a>
		{/each}
	</nav>

	<div class="border-t border-slate-800 p-4">
		<form method="POST" action="/logout" class="mt-auto pt-8" use:enhance>
			<button
				type="submit"
				class="group flex w-full font-bold items-center gap-4 rounded-2xl px-4 py-4 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
			>
				<div
					class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 transition-colors group-hover:bg-red-100"
				>
					<LogOut size={20} />
				</div>
				<span>Esci</span>
			</button>
		</form>
	</div>
</aside>
