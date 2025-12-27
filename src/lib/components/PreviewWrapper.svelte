<script lang="ts">
  import { Tablet, Smartphone, LogIn } from 'lucide-svelte';
  import { Button } from "$lib/components/ui/button";

  let { children } = $props();

  type ViewMode = 'smartphone' | 'tablet';
  let viewMode = $state<ViewMode>('smartphone');

  function setMode(mode: ViewMode) {
    viewMode = mode;
  }
</script>

<!-- OUTER BACKGROUND LAYER -->
<div class="fixed inset-0 bg-neutral-900 flex flex-col items-center overflow-hidden font-sans">
  
  <!-- Ambient Background Effects -->
  <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
    <!-- Base Gradient -->
    <div class="absolute inset-0 bg-neutral-950"></div>
    
    <!-- Moving Mesh Orbs (Desktop Only for Performance) -->
    <div class="hidden lg:block absolute inset-0 opacity-60 filter blur-[120px]">
      <div class="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] bg-amber-600/40 rounded-full animate-mesh-1"></div>
      <div class="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] bg-amber-400/20 rounded-full animate-mesh-2"></div>
      <div class="absolute top-[10%] right-[10%] w-[50%] h-[50%] bg-neutral-700/60 rounded-full animate-mesh-3"></div>
      <div class="absolute bottom-[10%] left-[10%] w-[45%] h-[45%] bg-amber-900/40 rounded-full animate-mesh-4"></div>
    </div>

    <!-- Texture Overlay -->
    <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
    
    <!-- Vignette -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]"></div>
  </div>

  <!-- PLATFORM HEADER (GO!FOOD) - Desktop Only -->
  <header class="relative z-50 w-full h-16 border-b border-white/5 bg-neutral-950/50 backdrop-blur-xl hidden lg:flex items-center justify-between px-8 shrink-0">
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center font-black text-white italic tracking-tighter shadow-lg shadow-amber-900/40">
        GO!
      </div>
      <span class="text-white font-bold tracking-tight text-lg">FOOD<span class="text-amber-500">MENU</span></span>
    </div>

    <!-- Toggle Controls -->
    <div class="flex items-center bg-white/5 border border-white/10 rounded-full p-1 gap-1">
      <button 
        onclick={() => setMode('tablet')}
        class="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300
        {viewMode === 'tablet' 
          ? 'text-white bg-white/10 shadow-sm border border-white/10' 
          : 'text-neutral-400 bg-transparent hover:text-neutral-200'}"
      >
        <Tablet class="h-3.5 w-3.5" />
        Tablet
      </button>
      <button 
        onclick={() => setMode('smartphone')}
        class="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300
        {viewMode === 'smartphone' 
          ? 'text-white bg-white/10 shadow-sm border border-white/10' 
          : 'text-neutral-400 bg-transparent hover:text-neutral-200'}"
      >
        <Smartphone class="h-3.5 w-3.5" />
        Smartphone
      </button>
    </div>

    <div class="flex items-center gap-4">
      <Button variant="ghost" size="sm" class="text-neutral-400 hover:text-white hover:bg-white/10 gap-2">
        <LogIn class="h-4 w-4" />
        Accedi
      </Button>
    </div>
  </header>

  <!-- CONTENT WRAPPER -->
  <div class="relative z-10 w-full h-full flex items-center justify-center p-0 lg:p-12 overflow-hidden">
    <!-- "DEVICE" CARD CONTAINER -->
    <div 
      class="relative h-full bg-neutral-950 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
      {viewMode === 'smartphone' 
        ? 'w-full lg:w-auto lg:aspect-[9/19.5] lg:max-h-[85vh] lg:rounded-[3rem] lg:border-[10px]' 
        : 'w-full lg:w-auto lg:aspect-[4/5.5] lg:max-h-[90vh] lg:rounded-[2rem] lg:border-[12px]'} 
      border-neutral-900 shadow-2xl shadow-black lg:outline outline-1 outline-white/10 overflow-hidden flex flex-col"
    >
      
      <!-- Notch/Sensor simulation based on mode -->
      {#if viewMode === 'smartphone'}
        <div class="absolute top-0 inset-x-0 h-7 z-50 pointer-events-none hidden lg:flex items-center justify-center transition-opacity duration-500">
          <div class="w-24 h-5 bg-neutral-900 rounded-b-2xl border-x border-b border-white/5"></div>
        </div>
      {:else}
        <div class="absolute top-0 inset-x-0 h-10 z-50 pointer-events-none hidden lg:flex items-center justify-center opacity-40">
          <div class="w-1.5 h-1.5 bg-neutral-800 rounded-full"></div>
        </div>
      {/if}

      <!-- THE SLOTTED MENU CONTENT -->
      <div class="flex-1 overflow-hidden relative">
        {@render children()}
      </div>

    </div>
  </div>
</div>

<style>
  :global(body) {
    background-color: #000;
    overflow: hidden;
  }

  @keyframes mesh-1 {
    0% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(10%, 15%) scale(1.1); }
    66% { transform: translate(-5%, 10%) scale(0.9); }
    100% { transform: translate(0, 0) scale(1); }
  }

  @keyframes mesh-2 {
    0% { transform: translate(0, 0) scale(1.1); }
    33% { transform: translate(-15%, -10%) scale(0.9); }
    66% { transform: translate(10%, -15%) scale(1); }
    100% { transform: translate(0, 0) scale(1.1); }
  }

  @keyframes mesh-3 {
    0% { transform: translate(0, 0) scale(0.9); }
    50% { transform: translate(-10%, 10%) scale(1.1); }
    100% { transform: translate(0, 0) scale(0.9); }
  }

  @keyframes mesh-4 {
    0% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(15%, -5%) rotate(10deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
  }

  .animate-mesh-1 { animation: mesh-1 15s ease-in-out infinite; }
  .animate-mesh-2 { animation: mesh-2 18s ease-in-out infinite; }
  .animate-mesh-3 { animation: mesh-3 22s ease-in-out infinite; }
  .animate-mesh-4 { animation: mesh-4 28s ease-in-out infinite; }
</style>
