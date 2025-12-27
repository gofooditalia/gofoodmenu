<script lang="ts">
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
  let profile = $derived(data.profile);
</script>

<div class="flex h-screen w-full flex-col items-center justify-center bg-slate-50 p-4">
  <div class="text-center space-y-6 max-w-md">
    
    <h1 class="text-4xl font-bold text-slate-900 tracking-tight">
      go!foodmenu
    </h1>
    <p class="text-slate-600">
      Il sistema operativo per il tuo ristorante.
      <br>Scegli dove vuoi andare:
    </p>

    <div class="grid gap-4 w-full">
      <a 
        href={profile ? `/${profile.slug}` : "/osteria-test"} 
        class="flex items-center justify-center w-full p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold shadow-lg transition-all transform hover:-translate-y-1"
      >
        🍕 {profile ? 'Il Mio Menu' : 'Vai al Menu (Cliente)'}
      </a>

      <a 
        href="/demo" 
        class="flex items-center justify-center w-full p-4 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-xl font-semibold transition-all"
      >
        ✨ Vedi Demo (Menu Premium)
      </a>

      <div class="py-2 flex items-center gap-4">
        <div class="h-px flex-1 bg-slate-200"></div>
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Oppure</span>
        <div class="h-px flex-1 bg-slate-200"></div>
      </div>

      <a 
        href="/dashboard" 
        class="flex items-center justify-center w-full p-4 bg-white border border-slate-200 text-slate-700 hover:border-slate-800 rounded-xl font-semibold transition-all"
      >
        👨‍🍳 Area Ristorante (Admin)
      </a>
    </div>

  </div>
</div>