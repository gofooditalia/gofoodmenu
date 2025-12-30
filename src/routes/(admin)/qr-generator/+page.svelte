<script lang="ts">
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';
	import { Download, Share2, ExternalLink, QrCode } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let profile = $derived(data.profile);

	let qrDataUrl = $state('');
	let menuUrl = $state('');

	onMount(async () => {
		if (profile) {
			// In a real production environment, this would be your actual domain
			const baseUrl = window.location.origin;
			menuUrl = `${baseUrl}/${profile.slug}`;

			try {
				qrDataUrl = await QRCode.toDataURL(menuUrl, {
					width: 1024,
					margin: 2,
					color: {
						dark: '#0f172a', // slate-900
						light: '#ffffff'
					}
				});
			} catch (err) {
				console.error('Errore generazione QR:', err);
			}
		}
	});

	function downloadQR() {
		const link = document.createElement('a');
		link.href = qrDataUrl;
		link.download = `qrcode-${profile?.slug}.png`;
		link.click();
	}
</script>

<div class="mx-auto max-w-4xl space-y-12">
	<div class="flex items-end justify-between">
		<div>
			<h1 class="text-4xl font-black tracking-tight text-slate-900">QR Code del Menu</h1>
			<p class="mt-2 font-medium text-slate-500">Scarica il codice e stampalo per i tuoi tavoli.</p>
		</div>
	</div>

	<div class="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
		<!-- QR Preview Card -->
		<div
			class="group relative flex flex-col items-center space-y-8 overflow-hidden rounded-[3rem] border border-slate-100 bg-white p-12 shadow-xl"
		>
			<div class="absolute top-0 left-0 h-2 w-full bg-orange-500"></div>

			<div
				class="rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 p-8 transition-colors duration-500 group-hover:border-orange-200"
			>
				{#if qrDataUrl}
					<img src={qrDataUrl} alt="QR Code" class="h-64 w-64 rounded-xl shadow-sm" />
				{:else}
					<div class="flex h-64 w-64 items-center justify-center text-slate-300">
						<QrCode size={80} class="animate-pulse" />
					</div>
				{/if}
			</div>

			<div class="text-center">
				<h3 class="text-2xl font-black tracking-tight text-slate-900">
					{profile?.restaurant_name}
				</h3>
				<p class="mt-1 text-sm font-bold text-slate-400">
					Eseguire la scansione per aprire il menù
				</p>
			</div>

			<div class="flex w-full gap-4 pt-4">
				<button
					onclick={downloadQR}
					class="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-slate-900 py-4 font-black text-white shadow-xl shadow-slate-900/10 transition-all hover:bg-slate-800"
				>
					<Download size={20} />
					Scarica PNG
				</button>
			</div>
		</div>

		<!-- Instructions & Link -->
		<div class="space-y-8">
			<div
				class="group relative overflow-hidden rounded-[2.5rem] bg-orange-500 p-10 text-white shadow-xl shadow-orange-500/20"
			>
				<div class="relative z-10 space-y-6">
					<h2 class="text-3xl leading-tight font-black tracking-tight">Il tuo link è pronto.</h2>
					<div class="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
						<div class="flex items-center justify-between gap-4">
							<span class="truncate overflow-hidden font-bold text-orange-50">{menuUrl}</span>
							<a
								href={menuUrl}
								target="_blank"
								rel="noreferrer"
								class="rounded-xl bg-white p-3 text-orange-500 transition-colors hover:bg-orange-50"
							>
								<ExternalLink size={20} />
							</a>
						</div>
					</div>
					<p class="leading-relaxed font-medium text-orange-100">
						I tuoi clienti potranno accedere istantaneamente al tuo menu inquadrando il codice con
						la fotocamera.
					</p>
				</div>
				<div
					class="absolute -right-10 -bottom-10 rotate-12 text-white/10 transition-transform duration-700 group-hover:scale-110"
				>
					<QrCode size={200} />
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2 rounded-3xl border border-slate-100 bg-white p-6">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500"
					>
						<Share2 size={20} />
					</div>
					<h4 class="text-sm font-black text-slate-900">Alta Qualità</h4>
					<p class="text-xs font-medium text-slate-500">
						QR generato a 1024px per una stampa perfetta.
					</p>
				</div>
				<div class="space-y-2 rounded-3xl border border-slate-100 bg-white p-6">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500"
					>
						<QrCode size={20} />
					</div>
					<h4 class="text-sm font-black text-slate-900">Sempre Attivo</h4>
					<p class="text-xs font-medium text-slate-500">
						Il link non scade mai e si aggiorna con il menu.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
