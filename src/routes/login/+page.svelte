	import { Mail, Lock } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { }: { data: PageData } = $props();
	// We don't actually need 'supabase' here for the form since we use 'enhance' which posts to server actions.
	// But if we did, we'd use data.supabase

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let errorMsg = $state('');
</script>

<div class="flex min-h-screen items-center justify-center bg-slate-50 p-6">
	<div
		class="w-full max-w-md space-y-8 rounded-[3rem] border border-slate-100 bg-white p-12 shadow-xl"
	>
		<div class="space-y-2 text-center">
			<div class="mb-4">
				<img src="/logo.svg" alt="go!foodmenu" class="mx-auto h-16 w-auto" />
			</div>
			<h1 class="text-3xl font-black tracking-tight text-slate-900">Benvenuto</h1>
			<p class="font-medium text-slate-400">Accedi per gestire il tuo menu digitale</p>
		</div>

		<form
			method="POST"
			class="space-y-6"
			use:enhance={() => {
				loading = true;
				errorMsg = '';
				return async ({ result, update }) => {
					loading = false;
					if (result.type === 'failure') {
						const failureData = result.data as { error?: string };
						errorMsg = failureData?.error || 'Credenziali non valide';
					} else if (result.type === 'error') {
						errorMsg = 'Errore del server. Riprova più tardi.';
					}
					await update();
				};
			}}
		>
			<div class="space-y-4">
				<div class="space-y-2">
					<label for="email" class="text-xs font-black tracking-widest text-slate-400 uppercase"
						>Email</label
					>
					<div class="relative">
						<Mail class="absolute top-1/2 left-4 -translate-y-1/2 text-slate-300" size={20} />
						<input
							id="email"
							name="email"
							type="email"
							bind:value={email}
							placeholder="latua@email.com"
							class="w-full rounded-2xl border-2 border-transparent bg-slate-50 py-4 pr-4 pl-12 font-bold transition-all outline-none focus:border-orange-500"
							required
						/>
					</div>
				</div>

				<div class="space-y-2">
					<label for="password" class="text-xs font-black tracking-widest text-slate-400 uppercase"
						>Password</label
					>
					<div class="relative">
						<Lock class="absolute top-1/2 left-4 -translate-y-1/2 text-slate-300" size={20} />
						<input
							id="password"
							name="password"
							type="password"
							bind:value={password}
							placeholder="••••••••"
							class="w-full rounded-2xl border-2 border-transparent bg-slate-50 py-4 pr-4 pl-12 font-bold transition-all outline-none focus:border-orange-500"
							required
						/>
					</div>
				</div>
			</div>

			{#if errorMsg}
				<p
					class="rounded-xl border border-red-100 bg-red-50 py-3 text-center text-sm font-bold text-red-500"
				>
					{errorMsg}
				</p>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 py-5 text-lg font-black text-white shadow-xl shadow-slate-900/10 transition-all hover:bg-slate-800 disabled:opacity-50"
			>
				{#if loading}
					<div
						class="h-6 w-6 animate-spin rounded-full border-4 border-white/20 border-t-white"
					></div>
				{:else}
					Accedi
				{/if}
			</button>

			<div class="pt-4 text-center">
				<p class="text-sm font-medium text-slate-400">
					Dimenticato la password? <a
						href="/forgot-password"
						class="font-bold text-orange-500 hover:underline">Recuperala qui</a
					>
				</p>
			</div>
		</form>
	</div>
</div>
