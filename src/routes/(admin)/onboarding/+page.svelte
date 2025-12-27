<script lang="ts">
  import { Store, Globe, ArrowRight } from 'lucide-svelte';
  
  let { data, form } = $props();
  
  let restaurantName = $state('');
  let slug = $state('');

  // Auto-generate slug from restaurant name
  $effect(() => {
    if (restaurantName) {
      slug = restaurantName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }
  });
</script>

<div class="max-w-2xl mx-auto py-12">
  <div class="bg-white rounded-[2.5rem] shadow-xl shadow-orange-500/5 border border-slate-100 p-12 relative overflow-hidden">
    <div class="absolute top-0 right-0 p-12 text-orange-500/5 rotate-12">
      <Store size={200} />
    </div>

    <div class="relative z-10">
      <div class="mb-8">
        <img src="/logo.svg" alt="go!foodmenu" class="h-12 w-auto" />
      </div>
      <h1 class="text-4xl font-black text-slate-900 tracking-tight mb-4">Iniziamo l'avventura! 🚀</h1>
      <p class="text-slate-500 text-lg font-medium mb-12">
        Configura il tuo ristorante in pochi secondi e crea il tuo menu digitale.
      </p>

      <form method="POST" class="space-y-8">
        <div class="space-y-4">
          <label for="restaurant_name" class="block text-sm font-black text-slate-900 uppercase tracking-wider">
            Nome del Ristorante
          </label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
              <Store size={22} />
            </div>
            <input
              type="text"
              name="restaurant_name"
              id="restaurant_name"
              bind:value={restaurantName}
              placeholder="Esempio: Trattoria da Mario"
              class="block w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-lg text-slate-900 placeholder:text-slate-300"
              required
            />
          </div>
        </div>

        <div class="space-y-4">
          <label for="slug" class="block text-sm font-black text-slate-900 uppercase tracking-wider">
            Il tuo link personalizzato
          </label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
              <Globe size={22} />
            </div>
            <input
              type="text"
              name="slug"
              id="slug"
              bind:value={slug}
              placeholder="trattoria-da-mario"
              class="block w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-lg text-slate-900 placeholder:text-slate-300"
              required
            />
            <div class="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
              <span class="text-slate-300 font-bold">.gofoodmenu.it</span>
            </div>
          </div>
          <p class="text-slate-400 text-xs font-bold pl-2">
            Questo sarà l'indirizzo che i tuoi clienti useranno. Puoi cambiarlo in seguito.
          </p>
        </div>

        {#if form?.error}
          <div class="bg-red-50 text-red-500 p-4 rounded-xl font-bold text-sm border border-red-100 flex items-center gap-2">
            <span>⚠️</span> {form.error}
          </div>
        {/if}

        <button
          type="submit"
          class="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-2xl font-black text-xl shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-3 group"
        >
          Crea il mio Ristorante
          <ArrowRight size={24} class="group-hover:translate-x-1 transition-transform" />
        </button>
      </form>
    </div>
  </div>
</div>
