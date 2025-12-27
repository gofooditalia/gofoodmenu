<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte';
  import type { LayoutData } from './$types';
  let { data, children }: { data: LayoutData, children: any } = $props();
</script>

<div class="flex min-h-screen bg-slate-50">
  <Sidebar />
  
  <main class="flex-1 md:ml-64 transition-all duration-300">
    <header class="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-slate-500">Benvenuto, {data.profile?.restaurant_name ?? 'Ristoratore'}</span>
      </div>
      
      <div class="flex items-center gap-4">
        <div class="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold border border-orange-200">
          {(data.profile?.restaurant_name?.[0] ?? 'G').toUpperCase()}
        </div>
      </div>
    </header>

    <div class="p-8">
      {@render children()}
    </div>
  </main>
</div>
