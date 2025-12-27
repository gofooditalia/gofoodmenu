<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { Utensils, Info, Search, MapPin, Clock, ChevronRight, LayoutGrid } from 'lucide-svelte';
  import type { PageData } from './$types';
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { Separator } from "$lib/components/ui/separator";
  import * as Sheet from "$lib/components/ui/sheet";
  import PreviewWrapper from '$lib/components/PreviewWrapper.svelte';

  let { data } = $props<{ data: PageData }>();
  let profile = $derived(data.profile);
  let categories = $derived(data.categories);

  let activeCategory = $state<number | undefined>(undefined);
  
  // Set initial category once data is available
  $effect(() => {
    if (activeCategory === undefined && categories.length > 0) {
      activeCategory = categories[0].id;
    }
  });

  let currentCat = $derived(categories.find((c: any) => c.id === activeCategory));
  let isScrolled = $state(false);
  let selectedDish = $state<any>(null);
  let sheetOpen = $state(false);
  let catSheetOpen = $state(false);

  // Page Navigation State
  type NavPage = 'menu' | 'events';
  let currentPage = $state<NavPage>('menu');

  // Monitor header state only (inside the scrollable container)
  let scrollContainer = $state<HTMLElement | null>(null);

  onMount(() => {
    const handleScroll = () => {
      if (scrollContainer) {
        // We consider it scrolled a bit earlier because of the fixed navbar
        isScrolled = scrollContainer.scrollTop > 10;
      }
    };
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (scrollContainer) scrollContainer.removeEventListener('scroll', handleScroll);
    };
  });

  function selectCategory(id: number) {
    activeCategory = id;
    catSheetOpen = false;
    if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openDish(dish: any) {
    selectedDish = dish;
    sheetOpen = true;
  }
</script>

<PreviewWrapper>
   <!-- TOP FIXED NAVBAR (Platform/Restaurant context) -->
   <div class="absolute top-0 inset-x-0 z-[60] bg-neutral-950 border-b border-white/5 flex flex-col pt-4 px-6 gap-4">
      <div class="flex items-center justify-between">
         <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            <h2 class="text-xs font-bold text-neutral-200 uppercase tracking-[0.2em]">{profile?.restaurant_name || 'Menu'}</h2>
         </div>
         <div class="flex gap-4">
            <Search class="h-4 w-4 text-neutral-500 hover:text-white cursor-pointer transition-colors" />
            <div class="flex items-center gap-1">
               <span class="text-[10px] font-bold text-neutral-400">IT</span>
               <div class="w-3 h-2 bg-red-600 rounded-[1px]"></div>
            </div>
         </div>
      </div>

      <!-- PAGE TABS -->
      <nav class="flex gap-8 border-b border-transparent pb-1">
         <button 
            onclick={() => currentPage = 'menu'}
            class="text-[11px] font-black uppercase tracking-widest pb-3 transition-all relative
            {currentPage === 'menu' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}"
         >
            Menu alla carta
            {#if currentPage === 'menu'}
               <div class="absolute bottom-0 inset-x-0 h-[2px] bg-amber-600" in:fade></div>
            {/if}
         </button>
         <button 
            onclick={() => currentPage = 'events'}
            class="text-[11px] font-black uppercase tracking-widest pb-3 transition-all relative
            {currentPage === 'events' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}"
         >
            Eventi Speciali
            {#if currentPage === 'events'}
               <div class="absolute bottom-0 inset-x-0 h-[2px] bg-amber-600" in:fade></div>
            {/if}
         </button>
      </nav>

      <!-- CATEGORY NAVIGATION (Integrated into Navbar for Menu page) -->
      {#if currentPage === 'menu'}
         <div class="flex items-center gap-2 pb-4 -mx-6 px-6 relative" in:fade>
            <!-- Horizontal scroll list with fade effect -->
            <div class="flex-1 overflow-x-auto no-scrollbar relative mask-fade-right">
               <div class="flex gap-2 min-w-max">
                  {#each categories as category}
                  <button 
                     onclick={() => selectCategory(category.id)}
                     class="px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border border-transparent whitespace-nowrap
                     {activeCategory === category.id 
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40' 
                        : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border-white/5'}"
                  >
                     {category.name}
                  </button>
                  {/each}
               </div>
            </div>

            <!-- Grid Toggle Button -->
            <button 
              onclick={() => catSheetOpen = true}
              class="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-neutral-900 border border-white/5 rounded-full text-neutral-400 hover:text-white transition-colors ml-1"
            >
              <LayoutGrid class="h-4 w-4" />
            </button>
         </div>
      {/if}
   </div>

   <!-- SCROLLABLE CONTENT AREA -->
   <div 
     bind:this={scrollContainer}
     class="h-full overflow-y-auto no-scrollbar relative w-full pt-[140px]"
   >
      {#if currentPage === 'menu'}
         <!-- Menu Content -->
         <main class="px-6 relative z-20 pb-32 pt-4 min-h-[60vh]">
            {#key activeCategory}
               <div 
               in:fly={{ y: 20, duration: 400, delay: 100, easing: cubicOut }}
               class="space-y-6"
               >
               {#if currentCat}
                     <div class="grid gap-8">
                        {#each currentCat.dishes as dish, i}
                           <div 
                              in:fly={{ y: 40, duration: 700, delay: i * 80, easing: cubicOut }}
                              class="group relative cursor-pointer p-5 -mx-5 rounded-3xl transition-all duration-500 hover:bg-amber-600/5 hover:shadow-xl hover:shadow-black/20 active:scale-[0.97]"
                              onclick={() => openDish(dish)}
                              onkeydown={(e) => e.key === 'Enter' && openDish(dish)}
                              role="button"
                              tabindex="0"
                           >
                              <div class="flex justify-between items-start gap-4 mb-2">
                                 <h3 class="font-serif text-xl text-neutral-200 group-hover:text-amber-500 transition-colors tracking-tight">
                                    {dish.name}
                                 </h3>
                                 <span class="font-bold text-neutral-200 text-lg">€{dish.price}</span>
                              </div>

                              {#if dish.description}
                                 <p class="text-sm text-neutral-500 leading-relaxed font-sans pr-4 line-clamp-2 group-hover:text-neutral-300 transition-colors">
                                 {dish.description}
                                 </p>
                              {/if}
                              
                              <div class="mt-4 flex gap-1 opacity-20 group-hover:opacity-100 transition-all duration-700">
                                 <div class="w-1.5 h-1.5 rounded-full bg-amber-600"></div>
                                 <div class="w-1.5 h-1.5 rounded-full bg-neutral-700"></div>
                                 <div class="w-1.5 h-1.5 rounded-full bg-neutral-700"></div>
                              </div>
                           </div>
                        {/each}
                     </div>
               {/if}
               </div>
            {/key}
         </main>
      {:else}
         <!-- EVENTI SPECIALI PAGE -->
         <div class="px-6 py-12 space-y-12" in:fade>
            <div class="text-center space-y-4">
               <span class="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600">News & Specialities</span>
               <h2 class="text-4xl font-serif italic text-white leading-tight">Cosa bolle in pentola?</h2>
               <p class="text-sm text-neutral-400 max-w-[280px] mx-auto leading-relaxed">Scopri le nostre iniziative speciali, i menu degustazione e le serate dedicate alla tradizione.</p>
            </div>

            <div class="space-y-6">
               <div class="p-6 rounded-2xl bg-neutral-900 border border-white/5 space-y-4 group">
                  <div class="aspect-[16/9] bg-neutral-800 rounded-lg overflow-hidden">
                     <div class="w-full h-full bg-gradient-to-br from-amber-900/40 to-black flex items-center justify-center">
                        <Utensils class="h-8 w-8 text-amber-600 opacity-40 group-hover:scale-110 transition-transform" />
                     </div>
                  </div>
                  <div class="space-y-2">
                     <h3 class="text-lg font-serif italic text-white group-hover:text-amber-500 transition-colors">Menu Capodanno 2026</h3>
                     <p class="text-xs text-neutral-500 leading-relaxed">Una selezione esclusiva dei nostri piatti iconici rivisitati per la notte più magica dell'anno.</p>
                     <div class="pt-2">
                        <Badge class="bg-amber-600/20 text-amber-500 border-amber-900/30 text-[9px] uppercase tracking-widest px-2">Presto Disponibile</Badge>
                     </div>
                  </div>
               </div>

               <div class="p-6 rounded-2xl bg-neutral-900 border border-white/5 space-y-4 group">
                  <div class="aspect-[16/9] bg-neutral-800 rounded-lg overflow-hidden">
                     <div class="w-full h-full bg-gradient-to-br from-purple-900/40 to-black flex items-center justify-center">
                        <Clock class="h-8 w-8 text-purple-600 opacity-40 group-hover:scale-110 transition-transform" />
                     </div>
                  </div>
                  <div class="space-y-2">
                     <h3 class="text-lg font-serif italic text-white group-hover:text-amber-500 transition-colors">Fuori Carta della Settimana</h3>
                     <p class="text-xs text-neutral-500 leading-relaxed">Ogni martedì il nostro Chef propone un piatto speciale basato sugli ingredienti più freschi del mercato.</p>
                  </div>
               </div>
            </div>

            <div class="pt-10 flex justify-center opacity-30">
               <Utensils class="h-6 w-6 text-neutral-500" />
            </div>
         </div>
      {/if}
   </div>
</PreviewWrapper>

<!-- Categories Grid Sheet -->
<Sheet.Root bind:open={catSheetOpen}>
   <Sheet.Content side="bottom" class="h-[70vh] md:max-w-[480px] md:mx-auto rounded-t-[2.5rem] p-0 overflow-hidden flex flex-col bg-neutral-950 border-neutral-900 text-white shadow-2xl shadow-black ring-0 outline-none">
      <div class="p-8 border-b border-white/5 shrink-0">
         <div class="flex items-center justify-between">
            <h2 class="text-xl font-serif italic text-white">Tutte le Categorie</h2>
            <Badge variant="outline" class="border-white/10 text-[10px] text-neutral-500 uppercase tracking-widest px-2">{categories.length} Sezioni</Badge>
         </div>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
         <div class="grid grid-cols-2 gap-3">
            {#each categories as category}
               <button 
                  onclick={() => selectCategory(category.id)}
                  class="flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 text-center gap-3
                  {activeCategory === category.id 
                     ? 'bg-amber-600/10 border-amber-600/50 text-amber-500' 
                     : 'bg-neutral-900 border-white/5 text-neutral-400 hover:border-white/20 hover:text-neutral-200'}"
               >
                  <div class="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors">
                     <Utensils class="h-5 w-5 opacity-40" />
                  </div>
                  <span class="text-[11px] font-bold uppercase tracking-wider leading-tight">{category.name}</span>
               </button>
            {/each}
         </div>
      </div>

      <div class="p-6 border-t border-white/5 bg-neutral-950 shrink-0">
         <Button class="w-full h-12 text-base font-bold rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white border border-white/5" onclick={() => catSheetOpen = false}>
           Chiudi
         </Button>
      </div>
   </Sheet.Content>
</Sheet.Root>

<!-- Dish Sheet (Matches Box Width on Desktop?) -->
<Sheet.Root bind:open={sheetOpen}>
   <Sheet.Content side="bottom" class="h-[85vh] md:max-w-[480px] md:mx-auto rounded-t-[2.5rem] p-0 overflow-hidden flex flex-col bg-neutral-900 border-neutral-800 text-white shadow-2xl shadow-black ring-0 outline-none">
      {#if selectedDish}
         <div class="relative h-72 shrink-0">
            {#if selectedDish.image_url}
               <img src={selectedDish.image_url} alt={selectedDish.name} class="w-full h-full object-cover opacity-90" />
               <div class="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent"></div>
            {:else}
               <div class="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-600">
                  <Utensils class="h-12 w-12 opacity-20" />
               </div>
            {/if}
            
            <Button size="icon" variant="ghost" class="absolute top-6 right-6 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/10" onclick={() => sheetOpen = false}>
               <ChevronRight class="rotate-90" />
            </Button>
         </div>

         <div class="flex-1 overflow-y-auto p-8 space-y-6">
            <div class="space-y-2">
               <h2 class="text-3xl font-serif text-white tracking-tight leading-none">{selectedDish.name}</h2>
               <div class="flex items-center gap-3">
                   <span class="text-2xl font-bold text-amber-500">€{selectedDish.price}</span>
                   {#if !selectedDish.is_available}
                    <Badge variant="destructive" class="bg-red-900/50 text-red-400 border-red-800 px-2 py-0.5 text-[10px]">Esaurito</Badge>
                   {/if}
               </div>
            </div>

            {#if selectedDish.description}
              <div class="space-y-2">
                 <h4 class="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Descrizione</h4>
                 <p class="text-base leading-relaxed text-neutral-300 font-light">{selectedDish.description}</p>
              </div>
            {/if}

            {#if selectedDish.allergens && selectedDish.allergens.length > 0}
               <Separator class="bg-white/10 my-6" />
               <div class="space-y-3">
                  <h4 class="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Allergeni</h4>
                  <div class="flex flex-wrap gap-2">
                     {#each selectedDish.allergens as allergen}
                        <div class="px-2.5 py-1 bg-neutral-800 border border-white/5 rounded-md text-[10px] text-neutral-300 uppercase tracking-widest">
                          {allergen}
                        </div>
                     {/each}
                  </div>
               </div>
            {/if}
         </div>

         <div class="p-6 border-t border-white/5 bg-neutral-900">
            <Button class="w-full h-12 text-base font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white tracking-wide shadow-lg shadow-amber-900/20" onclick={() => sheetOpen = false}>
              Chiudi
            </Button>
         </div>
      {/if}
   </Sheet.Content>
</Sheet.Root>

<style>
  :global(body) {
    background-color: #000;
    overflow: hidden; /* Hide outer scroll on desktop */
  }
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .mask-fade-right {
    mask-image: linear-gradient(to right, black 85%, transparent 100%);
    -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
  }
</style>
