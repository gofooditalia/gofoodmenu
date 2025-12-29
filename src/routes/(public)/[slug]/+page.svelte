<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { cubicOut, backOut } from 'svelte/easing';
  import { Utensils, Info, Search, MapPin, Clock, ChevronRight, LayoutGrid, Leaf, Camera } from 'lucide-svelte';
  import type { PageData } from './$types';
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
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

  // Haptic & Peek State
  let hapticTimer: any;
  let peekedDish = $state<any>(null);

  function startHaptic(dish: any) {
    if (typeof navigator !== 'undefined') {
      hapticTimer = setTimeout(() => {
         // 1. Trigger Vibration
         if (navigator.vibrate) navigator.vibrate([40, 30, 30]);
         
         // 2. Show Peek Preview
         peekedDish = dish;
      }, 150); // Faster, more tactile response
    }
  }

  function stopHaptic() {
    clearTimeout(hapticTimer);
    peekedDish = null;
  }

  function openDish(dish: any) {
    // No longer opens a sheet, but could trigger haptic again or nothing
    stopHaptic();
  }
</script>

<PreviewWrapper>
   <!-- TOP FIXED NAVBAR (Platform/Restaurant context) -->
   <div class="absolute top-0 inset-x-0 z-[60] bg-[#141417]/80 backdrop-blur-xl border-b border-white/5 flex flex-col pt-4 px-6 gap-5 select-none">
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



   </div>

   <!-- SCROLLABLE CONTENT AREA -->
   <div 
     bind:this={scrollContainer}
     ontouchstart={handleTouchStart}
     ontouchmove={handleTouchMove}
     ontouchend={handleTouchEnd}
     class="h-full overflow-y-auto no-scrollbar relative w-full pt-[115px] select-none"
     style="-webkit-touch-callout: none;"
   >
      {#if currentPage === 'menu'}
         <!-- Menu Content -->
         <main class="px-6 relative z-20 pb-32 pt-8 min-h-screen bg-[#16161a]">
            <!-- Noise texture layer for content -->
            <div class="absolute inset-0 pointer-events-none opacity-[0.12] mix-blend-overlay z-0" style="background-image: url(&quot;data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/feTurbulence%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E&quot;);"></div>
            
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
                              class="group relative cursor-pointer p-7 rounded-[2.5rem] bg-white/[0.03] border-[1.5px] border-amber-500/50 shadow-lg shadow-black/20 
                               transition-all duration-300 ease-out
                               active:scale-[0.97] active:bg-white/[0.08] active:border-amber-400 active:shadow-[0_0_25px_rgba(245,158,11,0.2)]
                               hover:bg-white/[0.06] overflow-hidden"
                              onclick={() => openDish(dish)}
                              onpointerdown={() => startHaptic(dish)}
                              onpointerup={stopHaptic}
                              onpointerleave={stopHaptic}
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
                                    {#if dish.image_url}
                                       <div class="mt-1 opacity-40 group-hover:opacity-70 transition-opacity">
                                          <Camera class="w-4 h-4 text-amber-500" />
                                       </div>
                                    {/if}
                                 </div>
                              </div>

                              {#if dish.description}
                                 <p class="text-[0.95rem] text-zinc-300 leading-relaxed font-medium pr-2 mt-3 mb-6 line-clamp-3 group-hover:text-white transition-colors relative z-10">
                                 {dish.description}
                                 </p>
                              {/if}
                              
                              <div class="flex items-center justify-between mt-auto relative z-10">
                                  <div class="flex gap-2">
                                     {#each dish.allergens || [] as allergenId}
                                        {@const allergen = (data.allergens as any[]).find((a: any) => a.id === allergenId)}
                                        {#if allergen}
                                           <div 
                                              class="relative"
                                              onmouseenter={() => hoveredTag = `${dish.id}-${allergen.id}`}
                                              onmouseleave={() => hoveredTag = null}
                                              role="note"
                                           >
                                              <div class="p-2 bg-white/5 border border-white/10 rounded-full cursor-help shadow-lg shadow-black/20 group-hover:bg-white/10 transition-colors">
                                                 <span class="text-base leading-none block">{allergen.icon}</span>
                                              </div>
                                              {#if hoveredTag === `${dish.id}-${allergen.id}`}
                                                 <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-zinc-950 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg whitespace-nowrap z-[100] shadow-2xl border border-white/5" in:fade={{ duration: 200 }}>
                                                    {allergen.name}
                                                    <div class="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-950"></div>
                                                 </div>
                                              {/if}
                                           </div>
                                        {/if}
                                     {/each}
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
                     <div class="mt-12 p-6 bg-white/[0.02] rounded-3xl border border-white/[0.05]">
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
               <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 group">
                  <div class="aspect-[16/9] bg-white/[0.05] rounded-lg overflow-hidden">
                     <div class="w-full h-full bg-gradient-to-br from-amber-900/40 to-[#141417] flex items-center justify-center">
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

<!-- TACTILE PEEK OVERLAY (Image Preview on Long Press) -->
{#if peekedDish}
  <div 
     class="fixed inset-0 z-[100] flex items-center justify-center p-8 pointer-events-none"
     transition:fade={{ duration: 200 }}
  >
     <!-- Backdrop Blur -->
     <div class="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
     
     <!-- The Peek Card -->
     <div 
        class="relative w-full max-w-[320px] aspect-square rounded-[2rem] overflow-hidden border-[2px] border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.3)] bg-[#1a1a1e]"
        in:scale={{ duration: 400, start: 0.8, easing: backOut }}
        out:scale={{ duration: 200, start: 0.9, easing: cubicOut }}
     >
        {#if peekedDish.image_url}
           <img src={peekedDish.image_url} alt={peekedDish.name} class="w-full h-full object-cover" />
           
           <!-- Information Overlay (Only for Images) -->
           <div class="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent space-y-3">
              <div class="flex items-center justify-between gap-4">
                 <h4 class="text-white font-black text-2xl tracking-tight leading-none">{peekedDish.name}</h4>
                 <span class="text-3xl font-black text-orange-500 drop-shadow-lg">{peekedDish.price}</span>
              </div>
              {#if peekedDish.description}
                 <p class="text-zinc-300 text-sm leading-relaxed line-clamp-4 font-medium">{peekedDish.description}</p>
              {/if}
           </div>
        {:else}
           <!-- Special Design for No-Image Dishes -->
           <div class="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#1a1a1e] to-[#0d0d0f] relative overflow-hidden">
              <!-- Background Decorative Icon -->
              <Utensils class="absolute -top-4 -right-4 h-32 w-32 text-amber-500/5 rotate-12" />
              <Utensils class="absolute -bottom-8 -left-8 h-40 w-40 text-amber-500/5 -rotate-12" />
              
              <div class="relative z-10 space-y-6">
                 <div class="space-y-2">
                    <p class="text-[10px] uppercase tracking-[0.3em] text-amber-500/60 font-black">L'Autentico Sapore</p>
                     <h4 class="text-white font-black text-3xl tracking-tight leading-tight uppercase mb-2">{peekedDish.name}</h4>
                     
                     {#if peekedDish.allergens?.length > 0}
                        <div class="flex gap-2 mb-4">
                           {#each peekedDish.allergens as allergenId}
                              {@const allergen = (data.allergens as any[]).find((a: any) => a.id === allergenId)}
                              {#if allergen}
                                 <div class="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                                    <span class="text-lg">{allergen.icon}</span>
                                    <span class="text-[10px] font-black uppercase tracking-wider text-white/50">{allergen.name}</span>
                                 </div>
                              {/if}
                           {/each}
                        </div>
                     {/if}
                  </div>
                 
                 {#if peekedDish.description}
                    <p class="text-zinc-400 text-sm leading-relaxed font-medium px-2">{peekedDish.description}</p>
                 {/if}
                 
                 <div class="pt-4">
                    <span class="text-5xl font-black text-orange-500">{peekedDish.price}</span>
                 </div>
              </div>
           </div>
        {/if}
     </div>
  </div>
{/if}




<style>
  :global(body) {
    background-color: #0d0d0f;
    overflow: hidden; /* Hide outer scroll on desktop */
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
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
