```html
<script lang="ts">
  import { Home, Grid, QrCode, LogOut } from 'lucide-svelte';
  import { page } from '$app/state';
  import { enhance } from '$app/forms';

  let { restaurantName = 'Il Tuo Locale' } = $props();

  const menuItems = [
    { name: 'Dashboard', icon: Home, href: '/dashboard' },
    { name: 'Gestione Menu', icon: Grid, href: '/menu-management' },
    { name: 'QR Code', icon: QrCode, href: '/qr-generator' },
  ];

  const isActive = (path: string) => page.url.pathname.includes(path);
</script>

<aside class="w-64 bg-slate-900 text-white hidden md:flex flex-col h-screen fixed">
  <div class="p-6">
    <div class="text-2xl font-black tracking-tight text-orange-500 flex items-center gap-2">
      <span class="bg-orange-500 text-white p-1 rounded-lg">go!</span>
      <span>foodmenu</span>
    </div>
  </div>

  <nav class="flex-1 px-4 space-y-1 mt-4">
    {#each menuItems as item}
      <a
        href={item.href}
        class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group {isActive(item.href) ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}"
      >
        <item.icon size={20} class={isActive(item.href) ? 'text-white' : 'text-slate-500 group-hover:text-orange-500 transition-colors'} />
        <span class="font-medium">{item.name}</span>
      </a>
    {/each}
  </nav>

  <div class="p-4 border-t border-slate-800">
    <form 
    method="POST" 
    action="/logout" 
    class="mt-auto pt-8"
    use:enhance
  >
    <button 
      type="submit"
      class="flex items-center gap-4 px-4 py-4 w-full text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold group"
    >
      <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 group-hover:bg-red-100 transition-colors">
        <LogOut size={20} />
      </div>
      <span>Esci</span>
    </button>
  </form>
</div>
</aside>
