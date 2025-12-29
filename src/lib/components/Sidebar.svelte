<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Home, Grid, QrCode, LogOut, Store } from 'lucide-svelte';
  import { page } from '$app/state';
  import { enhance } from '$app/forms';

  let { restaurantName = 'Il Tuo Locale' } = $props();

  const menuItems = [
    { name: 'Dashboard', icon: Home, href: '/dashboard' },
    { name: 'Profilo Ristorante', icon: Store, href: '/restaurant-profile' },
    { name: 'Gestione Menu', icon: Grid, href: '/menu-management' },
    { name: 'QR Code', icon: QrCode, href: '/qr-generator' },
  ];

  const isActive = (path: string) => page.url.pathname.includes(path);
</script>

<Sidebar.Root collapsible="icon">
  <Sidebar.Header class="p-4 flex items-center justify-between">
    <div class="flex items-center gap-2 overflow-hidden">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500">
        <img src="/logo.svg" alt="go!" class="h-6 w-auto invert brightness-0" />
      </div>
      <div class="flex flex-col gap-0.5 leading-none transition-all group-data-[collapsible=icon]:hidden">
        <span class="font-black text-orange-500 tracking-tighter text-lg underline decoration-orange-500/30 decoration-4 underline-offset-2">GO!FOOD</span>
        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-80">Menù Manager</span>
      </div>
    </div>
  </Sidebar.Header>

  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.GroupLabel class="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400/70 mb-2">Principale</Sidebar.GroupLabel>
      <Sidebar.Menu>
        {#each menuItems as item}
          <Sidebar.MenuItem>
            <Sidebar.MenuButton 
              isActive={isActive(item.href)}
              tooltip={item.name}
              class="h-12 px-4 rounded-xl transition-all duration-300 group hover:bg-orange-50/50"
            >
              {#snippet child({ props })}
                <a {...props} href={item.href} class="flex items-center gap-3 w-full">
                  <item.icon size={20} class={isActive(item.href) ? 'text-orange-500' : 'text-slate-400 group-hover:text-orange-400 transition-colors'} />
                  <span class="font-bold text-sm {isActive(item.href) ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}">{item.name}</span>
                </a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        {/each}
      </Sidebar.Menu>
    </Sidebar.Group>
  </Sidebar.Content>

  <Sidebar.Footer class="p-4 border-t border-slate-100/50">
    <form 
      method="POST" 
      action="/logout" 
      use:enhance
      class="w-full"
    >
      <button 
        type="submit"
        class="flex items-center gap-3 px-3 py-3 w-full text-slate-500 hover:text-red-500 hover:bg-red-50/50 rounded-xl transition-all font-bold group"
      >
        <div class="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 group-hover:bg-red-100 transition-colors">
          <LogOut size={16} />
        </div>
        <span class="text-sm group-data-[collapsible=icon]:hidden">Esci</span>
      </button>
    </form>
  </Sidebar.Footer>
  <Sidebar.Rail />
</Sidebar.Root>
