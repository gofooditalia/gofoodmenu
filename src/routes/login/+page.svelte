<script lang="ts">
  import { LogIn, Mail, Lock } from 'lucide-svelte';
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  // We don't actually need 'supabase' here for the form since we use 'enhance' which posts to server actions.
  // But if we did, we'd use data.supabase
  
  let email = $state('');
  let password = $state('');
  let loading = $state(false);
  let errorMsg = $state('');
</script>

<div class="min-h-screen bg-slate-50 flex items-center justify-center p-6">
  <div class="w-full max-w-md space-y-8 bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100">
    <div class="text-center space-y-2">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-3xl text-white shadow-lg shadow-orange-500/20 mb-4">
        <LogIn size={32} />
      </div>
      <h1 class="text-3xl font-black text-slate-900 tracking-tight">Benvenuto</h1>
      <p class="text-slate-400 font-medium">Accedi per gestire il tuo menu digitale</p>
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
            errorMsg = result.data?.error || 'Credenziali non valide';
          } else if (result.type === 'error') {
            errorMsg = 'Errore del server. Riprova più tardi.';
          }
          await update();
        };
      }}
    >
      <div class="space-y-4">
        <div class="space-y-2">
          <label for="email" class="text-xs font-black uppercase tracking-widest text-slate-400">Email</label>
          <div class="relative">
            <Mail class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              id="email"
              name="email"
              type="email" 
              bind:value={email}
              placeholder="latua@email.com" 
              class="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold transition-all"
              required 
            />
          </div>
        </div>

        <div class="space-y-2">
          <label for="password" class="text-xs font-black uppercase tracking-widest text-slate-400">Password</label>
          <div class="relative">
            <Lock class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              id="password"
              name="password"
              type="password" 
              bind:value={password}
              placeholder="••••••••" 
              class="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold transition-all"
              required 
            />
          </div>
        </div>
      </div>

      {#if errorMsg}
        <p class="text-red-500 text-sm font-bold text-center bg-red-50 py-3 rounded-xl border border-red-100">{errorMsg}</p>
      {/if}

      <button 
        type="submit" 
        disabled={loading}
        class="w-full bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {#if loading}
          <div class="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        {:else}
          Accedi
        {/if}
      </button>

      <div class="text-center pt-4">
        <p class="text-slate-400 text-sm font-medium">
          Dimenticato la password? <a href="/forgot-password" class="text-orange-500 font-bold hover:underline">Recuperala qui</a>
        </p>
      </div>
    </form>
  </div>
</div>
