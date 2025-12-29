<script lang="ts">
	import { Tablet, Smartphone, LogIn } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';

	let { children } = $props();

	type ViewMode = 'smartphone' | 'tablet';
	let viewMode = $state<ViewMode>('smartphone');

	function setMode(mode: ViewMode) {
		viewMode = mode;
	}
</script>

<!-- OUTER BACKGROUND LAYER -->
<div class="fixed inset-0 flex flex-col items-center overflow-hidden bg-[#0d0d0f] font-sans">
	<!-- Ambient Background Effects -->
	<div class="pointer-events-none absolute inset-0 z-0 overflow-hidden">
		<!-- Base Gradient -->
		<div class="absolute inset-0 bg-transparent"></div>

		<!-- Moving Mesh Orbs (Desktop Only for Performance) -->
		<div class="absolute inset-0 hidden opacity-60 blur-[120px] filter lg:block">
			<div
				class="animate-mesh-1 absolute top-[-15%] left-[-15%] h-[60%] w-[60%] rounded-full bg-amber-600/40"
			></div>
			<div
				class="animate-mesh-2 absolute right-[-15%] bottom-[-15%] h-[60%] w-[60%] rounded-full bg-amber-400/20"
			></div>
			<div
				class="animate-mesh-3 absolute top-[10%] right-[10%] h-[50%] w-[50%] rounded-full bg-neutral-700/60"
			></div>
			<div
				class="animate-mesh-4 absolute bottom-[10%] left-[10%] h-[45%] w-[45%] rounded-full bg-amber-900/40"
			></div>
		</div>

		<!-- Texture Overlay (Unified Noise) -->
		<div
			class="pointer-events-none absolute inset-0 opacity-[0.08]"
			style="background-image: url(&quot;data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/feTurbulence%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E&quot;);"
		></div>

		<!-- Subtle Vignette -->
		<div
			class="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.3)_100%)]"
		></div>
	</div>

	<!-- PLATFORM HEADER (GO!FOOD) - Desktop Only -->
	<header
		class="relative z-50 hidden h-16 w-full shrink-0 items-center justify-between border-b border-white/5 bg-neutral-950/50 px-8 backdrop-blur-xl lg:flex"
	>
		<div class="flex items-center gap-2">
			<div
				class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 font-black tracking-tighter text-white italic shadow-lg shadow-amber-900/40"
			>
				GO!
			</div>
			<span class="text-lg font-bold tracking-tight text-white"
				>FOOD<span class="text-amber-500">MENU</span></span
			>
		</div>

		<!-- Toggle Controls -->
		<div class="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
			<button
				onclick={() => setMode('tablet')}
				class="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300
        {viewMode === 'tablet'
					? 'border border-white/10 bg-white/10 text-white shadow-sm'
					: 'bg-transparent text-neutral-400 hover:text-neutral-200'}"
			>
				<Tablet class="h-3.5 w-3.5" />
				Tablet
			</button>
			<button
				onclick={() => setMode('smartphone')}
				class="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300
        {viewMode === 'smartphone'
					? 'border border-white/10 bg-white/10 text-white shadow-sm'
					: 'bg-transparent text-neutral-400 hover:text-neutral-200'}"
			>
				<Smartphone class="h-3.5 w-3.5" />
				Smartphone
			</button>
		</div>

		<div class="flex items-center gap-4">
			<Button
				variant="ghost"
				size="sm"
				class="gap-2 text-neutral-400 hover:bg-white/10 hover:text-white"
			>
				<LogIn class="h-4 w-4" />
				Accedi
			</Button>
		</div>
	</header>

	<!-- CONTENT WRAPPER -->
	<div
		class="relative z-10 flex h-full w-full items-center justify-center overflow-hidden p-0 lg:p-12"
	>
		<!-- "DEVICE" CARD CONTAINER -->
		<div
			id="preview-device-frame"
			class="relative h-full transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
      {viewMode === 'smartphone'
				? 'w-full lg:h-[915px] lg:max-h-[85vh] lg:w-[412px] lg:rounded-[3.5rem] lg:border-[12px]'
				: 'w-full lg:h-[1180px] lg:max-h-[90vh] lg:w-[800px] lg:rounded-[2.5rem] lg:border-[14px]'} 
      flex flex-col overflow-hidden border-neutral-900/50 shadow-2xl shadow-black outline-1 outline-white/10 lg:outline"
		>
			<!-- Notch/Sensor simulation based on mode -->
			{#if viewMode === 'smartphone'}
				<div
					class="pointer-events-none absolute inset-x-0 top-0 z-50 hidden h-10 items-center justify-center transition-opacity duration-500 lg:flex"
				>
					<div
						class="flex h-6 w-32 items-center justify-center gap-3 rounded-b-3xl border-x border-b border-white/5 bg-neutral-900"
					>
						<div class="h-1 w-1 rounded-full bg-white/10"></div>
						<div class="h-1 w-8 rounded-full bg-white/5"></div>
					</div>
				</div>
			{:else}
				<div
					class="pointer-events-none absolute inset-x-0 top-0 z-50 hidden h-12 items-center justify-center opacity-40 lg:flex"
				>
					<div class="h-2 w-2 rounded-full border border-white/5 bg-neutral-800"></div>
				</div>
			{/if}

			<!-- THE SLOTTED MENU CONTENT -->
			<div class="relative flex-1 overflow-hidden">
				{@render children()}
			</div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		overflow: hidden;
	}

	@keyframes mesh-1 {
		0% {
			transform: translate(0, 0) scale(1);
		}
		33% {
			transform: translate(10%, 15%) scale(1.1);
		}
		66% {
			transform: translate(-5%, 10%) scale(0.9);
		}
		100% {
			transform: translate(0, 0) scale(1);
		}
	}

	@keyframes mesh-2 {
		0% {
			transform: translate(0, 0) scale(1.1);
		}
		33% {
			transform: translate(-15%, -10%) scale(0.9);
		}
		66% {
			transform: translate(10%, -15%) scale(1);
		}
		100% {
			transform: translate(0, 0) scale(1.1);
		}
	}

	@keyframes mesh-3 {
		0% {
			transform: translate(0, 0) scale(0.9);
		}
		50% {
			transform: translate(-10%, 10%) scale(1.1);
		}
		100% {
			transform: translate(0, 0) scale(0.9);
		}
	}

	@keyframes mesh-4 {
		0% {
			transform: translate(0, 0) rotate(0deg);
		}
		50% {
			transform: translate(15%, -5%) rotate(10deg);
		}
		100% {
			transform: translate(0, 0) rotate(0deg);
		}
	}

	.animate-mesh-1 {
		animation: mesh-1 15s ease-in-out infinite;
	}
	.animate-mesh-2 {
		animation: mesh-2 18s ease-in-out infinite;
	}
	.animate-mesh-3 {
		animation: mesh-3 22s ease-in-out infinite;
	}
	.animate-mesh-4 {
		animation: mesh-4 28s ease-in-out infinite;
	}
</style>
