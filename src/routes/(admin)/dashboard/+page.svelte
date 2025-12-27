<script lang="ts">
  import { TrendingUp, Users, UtensilsCrossed, Plus } from 'lucide-svelte';
  import type { PageData } from './$types';
  
  let { data }: { data: PageData } = $props();
</script>

<div class="space-y-8">
  <div class="flex justify-between items-end">
    <div>
      <h1 class="text-4xl font-black text-slate-900 tracking-tight">Dashboard</h1>
      <p class="text-slate-500 mt-2 font-medium">Ecco cosa succede nel tuo ristorante oggi.</p>
    </div>
    
    <button class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2 group">
      <Plus size={20} class="group-hover:rotate-90 transition-transform" />
      Nuovo Piatto
    </button>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    <div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4 group hover:shadow-xl transition-all duration-500 relative overflow-hidden">
      <div class="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
      <div class="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center relative z-10">
        <Users size={28} />
      </div>
      <div>
        <h3 class="text-slate-400 font-bold text-sm uppercase tracking-widest">Visite Menu oggi</h3>
        <p class="text-4xl font-black text-slate-900 mt-1">{data.stats.visitsToday}</p>
      </div>
    </div>

    <div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4 group hover:shadow-xl transition-all duration-500 relative overflow-hidden">
      <div class="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
      <div class="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center relative z-10">
        <TrendingUp size={28} />
      </div>
      <div>
        <h3 class="text-slate-400 font-bold text-sm uppercase tracking-widest">Piatto Top</h3>
        <p class="text-2xl font-black text-slate-900 mt-1 truncate">{data.stats.topDish || 'Nessun dato'}</p>
      </div>
    </div>

    <div class="bg-orange-500 p-8 rounded-[2rem] shadow-lg shadow-orange-500/20 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 text-white">
      <div class="relative z-10">
        <div class="text-orange-200 mb-2 font-bold uppercase tracking-wider text-xs">Prossimo Obiettivo</div>
        <div class="text-3xl font-black mb-4">Ottimizza il tuo Menu</div>
        <p class="text-orange-100 text-sm leading-relaxed mb-6">
          Aggiungi le foto ai tuoi piatti per aumentare le vendite del 30%.
        </p>
        <button class="bg-white text-orange-500 px-6 py-2 rounded-xl font-bold text-sm">
          Inizia Ora
        </button>
      </div>
      <div class="absolute -bottom-4 -right-4 text-white/10 rotate-12">
        <UtensilsCrossed size={120} />
      </div>
    </div>
  </div>

  <div class="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
    <div class="p-8 border-b border-slate-50 flex justify-between items-center">
      <h2 class="font-black text-2xl text-slate-900 tracking-tight">Ultimi Aggiornamenti</h2>
      <a href="/menu-management" class="text-orange-500 font-bold text-sm hover:underline">Vedi tutto</a>
    </div>
    <div class="p-16 text-center">
      <div class="max-w-xs mx-auto space-y-4">
        <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
          <UtensilsCrossed size={32} />
        </div>
        <h3 class="font-bold text-slate-900 text-lg">Ancora nessun piatto</h3>
        <p class="text-slate-500 text-sm">Il tuo menu è vuoto. Inizia aggiungendo il tuo primo piatto delizioso!</p>
      </div>
    </div>
  </div>
</div>