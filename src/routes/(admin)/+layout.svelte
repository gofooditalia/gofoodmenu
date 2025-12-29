<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte';
  import * as SidebarUI from "$lib/components/ui/sidebar/index.js";
  import type { LayoutData } from './$types';
  let { data, children }: { data: LayoutData, children: any } = $props();
</script>

<SidebarUI.Provider>
  <div class="flex min-h-screen bg-slate-50 w-full">
    <Sidebar />
    
    <SidebarUI.Inset class="flex-1 flex flex-col min-w-0">
      <header class="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-10 px-6 flex items-center justify-between shadow-sm shadow-slate-200/20">
        <div class="flex items-center gap-4">
          <SidebarUI.Trigger class="hover:bg-orange-50 transition-colors rounded-xl p-2 group">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <img src="/logo.svg" alt="go!" class="h-6 w-auto invert brightness-0" />
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Ristorante</span>
                <span class="text-sm font-black text-slate-800 leading-none truncate max-w-[200px]">{data.profile?.restaurant_name ?? 'Dashboard'}</span>
              </div>
            </div>
          </SidebarUI.Trigger>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="flex flex-col items-end mr-2">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</span>
            <div class="flex items-center gap-1.5">
              <div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span class="text-[10px] font-bold text-slate-600">Online</span>
            </div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-orange-500/20 border border-white/20">
            {(data.profile?.restaurant_name?.[0] ?? 'G').toUpperCase()}
          </div>
        </div>
      </header>

      <div class="p-6 md:p-10 flex-1">
        <div class="max-w-7xl mx-auto">
          {@render children()}
        </div>
      </div>
    </SidebarUI.Inset>
  </div>
</SidebarUI.Provider>
