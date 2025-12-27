<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { Utensils, Info, Search, MapPin, Clock, ChevronRight, LayoutGrid, Leaf } from 'lucide-svelte';
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
  
  // Swipe State
  let touchStart = $state(0);
  let touchEnd = $state(0);
  
  // Category Refs for centering
  let categoryRefs = $state<Record<number, HTMLElement>>({});
  
  // Set initial category once data is available
  $effect(() => {
    if (activeCategory === undefined && categories.length > 0) {
      activeCategory = categories[0].id;
    }
  });

  // Auto-center the active category pill
  $effect(() => {
    if (activeCategory !== undefined && categoryRefs[activeCategory]) {
      categoryRefs[activeCategory].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
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

  let hoveredTag = $state<string | null>(null);
  let scrollContainer = $state<HTMLElement>();

  onMount(() => {
    const handleScroll = () => {
      if (scrollContainer) {
        // Higher threshold for sticky header feel
        isScrolled = scrollContainer.scrollTop > 60;
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

  function handleTouchStart(e: TouchEvent) {
    touchStart = e.touches[0].clientX;
  }

  function handleTouchMove(e: TouchEvent) {
    touchEnd = e.touches[0].clientX;
  }

  function handleTouchEnd() {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    const currentIndex = categories.findIndex((c: any) => c.id === activeCategory);
    
    if (isLeftSwipe && currentIndex < categories.length - 1) {
      selectCategory(categories[currentIndex + 1].id);
    }
    
    if (isRightSwipe && currentIndex > 0) {
      selectCategory(categories[currentIndex - 1].id);
    }
    
    touchStart = 0;
    touchEnd = 0;
  }

  function openDish(dish: any) {
    selectedDish = dish;
    sheetOpen = true;
  }
</script>

<PreviewWrapper>
   <!-- TOP FIXED NAVBAR (Platform/Restaurant context) -->
   <div class="absolute top-0 inset-x-0 z-[60] bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 flex flex-col pt-4 px-6 gap-5">
      <div class="flex items-center gap-4">
         <!-- Restaurant Icon -->
         <div class="flex-shrink-0 bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-500/10">
            <Utensils class="w-4 h-4 text-white" />
         </div>

         <!-- Categories Pills -->
         <div class="flex-1 overflow-x-auto no-scrollbar mask-fade-right">
            <div class="flex gap-2.5 pb-1">
               {#each categories as category}
                  <button 
                     bind:this={categoryRefs[category.id]}
                     onclick={() => selectCategory(category.id)}
                     class="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-500 whitespace-nowrap
                     {activeCategory === category.id 
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-105' 
                        : 'bg-white/5 text-zinc-500 hover:text-zinc-300'}"
                  >
                     {category.name}
                  </button>
               {/each}
            </div>
         </div>

         <!-- Grid Toggle -->
         <button 
            onclick={() => catSheetOpen = true}
            class="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-white/5 border border-white/5 rounded-xl text-zinc-500 hover:text-white transition-all duration-300"
         >
            <LayoutGrid class="h-3.5 w-3.5" />
         </button>
      </div>

      <!-- PAGE TABS -->
      <nav class="flex gap-10 border-b border-transparent pb-1">
         <button 
            onclick={() => currentPage = 'menu'}
            class="text-[10px] font-black uppercase tracking-[0.25em] pb-3 transition-all relative
            {currentPage === 'menu' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}"
         >
            MENU ALLA CARTA
            {#if currentPage === 'menu'}
               <div class="absolute bottom-0 inset-x-0 h-[1.5px] bg-orange-500" in:fade></div>
            {/if}
         </button>
         <button 
            onclick={() => currentPage = 'events'}
            class="text-[10px] font-black uppercase tracking-[0.25em] pb-3 transition-all relative
            {currentPage === 'events' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}"
         >
            EVENTI SPECIALI
            {#if currentPage === 'events'}
               <div class="absolute bottom-0 inset-x-0 h-[1.5px] bg-orange-500" in:fade></div>
            {/if}
         </button>
      </nav>

      <!-- Sticky Category Indicator -->
      {#if isScrolled && currentPage === 'menu'}
        <div class="bg-zinc-900 border-t border-zinc-800 py-3 -mx-6 px-6 animate-fadeIn transition-all duration-300">
           <div class="flex items-center justify-center">
              <span class="text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                 {currentCat?.name}
              </span>
           </div>
        </div>
      {/if}

      <!-- PAGINATION DOTS (Always visible in menu page) -->
      {#if currentPage === 'menu'}
         <div class="flex justify-center gap-1.5 pb-4">
            {#each categories as category, i}
               <div 
                  class="h-1.5 rounded-full transition-all duration-500 {activeCategory === category.id ? 'w-6 bg-orange-500' : 'w-1.5 bg-zinc-800'}"
               ></div>
            {/each}
         </div>
      {/if}
   </div>

   <!-- SCROLLABLE CONTENT AREA -->
   <div 
     bind:this={scrollContainer}
     ontouchstart={handleTouchStart}
     ontouchmove={handleTouchMove}
     ontouchend={handleTouchEnd}
     class="h-full overflow-y-auto no-scrollbar relative w-full pt-[115px]"
   >
      {#if currentPage === 'menu'}
         <!-- Menu Content -->
         <main class="px-6 relative z-20 pb-32 pt-8 min-h-[60vh]">
            {#key activeCategory}
               <div 
               in:fly={{ y: 20, duration: 400, delay: 100, easing: cubicOut }}
               class="space-y-4 animate-initial-bounce"
               >
               {#if currentCat}
                     <div class="grid gap-4">
                        {#each currentCat.dishes as dish, i}
                           <div 
                              in:fly={{ y: 30, duration: 600, delay: i * 50, easing: cubicOut }}
                              class="group relative cursor-pointer p-7 rounded-[2.5rem] bg-zinc-900/40 border border-white/[0.03] transition-all duration-700 hover:bg-zinc-800/40 active:scale-[0.98] overflow-hidden"
                              onclick={() => openDish(dish)}
                              onkeydown={(e) => e.key === 'Enter' && openDish(dish)}
                              role="button"
                              tabindex="0"
                           >
                              <!-- Subtle Card Inner Gradient -->
                              <div class="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                              <div class="flex justify-between items-start gap-6 relative z-10">
                                 <h3 class="font-black text-[1.35rem] leading-tight text-white group-hover:text-amber-400 transition-colors tracking-tight max-w-[75%]">
                                    {dish.name}
                                 </h3>
                                 <div class="flex flex-col items-end">
                                    <span class="font-black text-orange-500 text-3xl tracking-tighter">
                                       {dish.price}
                                    </span>
                                 </div>
                              </div>

                              {#if dish.description}
                                 <p class="text-[0.95rem] text-zinc-300 leading-relaxed font-medium pr-2 mt-3 mb-6 line-clamp-3 group-hover:text-white transition-colors relative z-10">
                                 {dish.description}
                                 </p>
                              {/if}
                              
                              <div class="flex items-center justify-between mt-auto relative z-10">
                                 <div class="flex gap-2">
                                    {#if dish.allergens?.includes('Vegetariano')}
                                       <div 
                                          class="relative"
                                          onmouseenter={() => hoveredTag = `${dish.id}-veg`}
                                          onmouseleave={() => hoveredTag = null}
                                          role="note"
                                       >
                                          <div class="p-2 bg-green-500/10 border border-green-500/20 rounded-full cursor-help shadow-lg shadow-green-900/20">
                                             <Leaf size={18} class="text-green-400" />
                                          </div>
                                          {#if hoveredTag === `${dish.id}-veg`}
                                             <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-zinc-950 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg whitespace-nowrap z-[100] shadow-2xl border border-white/5" in:fade={{ duration: 200 }}>
                                                Vegetariano
                                                <div class="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-950"></div>
                                             </div>
                                          {/if}
                                       </div>
                                    {/if}
                                 </div>
                                 <div class="flex gap-1.5 opacity-30">
                                    <div class="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                    <div class="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
                                 </div>
                              </div>
                           </div>
                        {/each}
                     </div>

                     <!-- Info Footer -->
                     <div class="mt-12 p-6 bg-zinc-900/30 rounded-3xl border border-zinc-800/50">
                        <p class="text-[10px] text-zinc-500 leading-relaxed font-medium">
                           * Gli ingredienti contrassegnati con asterisco potrebbero contenere ingredienti surgelati. 
                           Per informazioni dettagliate sugli allergeni, chiedi al nostro personale.
                        </p>
                     </div>

                     <!-- Swipe Hint -->
                     <div class="mt-8 text-center pb-12">
                        <p class="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em]">
                           ← Scorri per esplorare le categorie →
                        </p>
                     </div>
               {/if}
               </div>
            {/key}
         </main>
      {:else}
         <!-- EVENTI SPECIALI PAGE -->
         <div class="px-6 py-12 space-y-12" in:fade>
            <div class="text-center space-y-4">
               <span class="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">News & Specialities</span>
               <h2 class="text-4xl font-black text-white leading-tight tracking-tight">Cosa bolle in pentola?</h2>
               <p class="text-sm text-zinc-400 max-w-[280px] mx-auto leading-relaxed font-medium">Scopri le nostre iniziative speciali, i menu degustazione e le serate dedicate alla tradizione.</p>
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
            <h2 class="text-xl font-bold text-white uppercase tracking-tight">Tutte le Categorie</h2>
            <Badge variant="outline" class="border-white/10 text-[10px] text-zinc-500 uppercase tracking-widest px-2">{categories.length} Sezioni</Badge>
         </div>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
         <div class="grid grid-cols-2 gap-3">
            {#each categories as category}
               <button 
                  onclick={() => selectCategory(category.id)}
                  class="flex flex-col items-center justify-center p-6 rounded-3xl border transition-all duration-300 text-center gap-3
                  {activeCategory === category.id 
                     ? 'bg-orange-500/10 border-orange-500/50 text-orange-500' 
                     : 'bg-zinc-900 border-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200'}"
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
         <Button class="w-full h-12 text-base font-bold rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white border border-white/5" onclick={() => catSheetOpen = false}>
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
               <h2 class="text-3xl font-black text-white tracking-tight leading-none">{selectedDish.name}</h2>
               <div class="flex items-center gap-3">
                   <span class="text-4xl font-black text-orange-500">{selectedDish.price}</span>
                   {#if !selectedDish.is_available}
                    <Badge variant="destructive" class="bg-red-900/50 text-red-400 border-red-800 px-2 py-0.5 text-[10px]">Esaurito</Badge>
                   {/if}
               </div>
            </div>

            {#if selectedDish.description}
               <div class="space-y-2">
                  <h4 class="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Descrizione</h4>
                  <p class="text-base leading-relaxed text-zinc-300 font-medium">{selectedDish.description}</p>
               </div>
            {/if}

            {#if selectedDish.allergens && selectedDish.allergens.length > 0}
               <Separator class="bg-white/10 my-6" />
               <div class="space-y-3">
                  <h4 class="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Allergeni</h4>
                  <div class="flex flex-wrap gap-2">
                     {#each selectedDish.allergens as allergen}
                        <div class="px-2.5 py-1 bg-zinc-800 border border-white/5 rounded-lg text-[10px] text-zinc-300 uppercase tracking-widest font-bold">
                          {allergen}
                        </div>
                     {/each}
                  </div>
               </div>
            {/if}
         </div>

         <div class="p-6 border-t border-white/5 bg-zinc-900">
            <Button class="w-full h-14 text-base font-black rounded-2xl bg-orange-500 hover:bg-orange-600 text-white tracking-wide shadow-lg shadow-orange-900/20" onclick={() => sheetOpen = false}>
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

  @keyframes initial-bounce {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-15px); }
    40% { transform: translateX(10px); }
    60% { transform: translateX(-5px); }
    80% { transform: translateX(2px); }
  }

  .animate-initial-bounce {
    animation: initial-bounce 1.2s cubic-bezier(0.45, 0, 0.55, 1);
    animation-delay: 0.8s; /* Wait for initial fly-in to finish */
  }
</style>
