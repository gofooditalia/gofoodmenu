<script lang="ts">
  import { onMount } from 'svelte';
  import QRCode from 'qrcode';
  import { Download, Share2, ExternalLink, QrCode } from 'lucide-svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  let profile = $derived(data.profile);

  let qrDataUrl = $state('');
  let menuUrl = $state('');

  onMount(async () => {
    if (profile) {
      // In a real production environment, this would be your actual domain
      const baseUrl = window.location.origin;
      menuUrl = `${baseUrl}/${profile.slug}`;
      
      try {
        qrDataUrl = await QRCode.toDataURL(menuUrl, {
          width: 1024,
          margin: 2,
          color: {
            dark: '#0f172a', // slate-900
            light: '#ffffff'
          }
        });
      } catch (err) {
        console.error('Errore generazione QR:', err);
      }
    }
  });

  function downloadQR() {
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `qrcode-${profile?.slug}.png`;
    link.click();
  }
</script>

<div class="max-w-4xl mx-auto space-y-12">
  <div class="flex justify-between items-end">
    <div>
      <h1 class="text-4xl font-black text-slate-900 tracking-tight">QR Code del Menu</h1>
      <p class="text-slate-500 mt-2 font-medium">Scarica il codice e stampalo per i tuoi tavoli.</p>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
    <!-- QR Preview Card -->
    <div class="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center space-y-8 relative overflow-hidden group">
      <div class="absolute top-0 left-0 w-full h-2 bg-orange-500"></div>
      
      <div class="bg-slate-50 p-8 rounded-[2rem] border-2 border-dashed border-slate-200 group-hover:border-orange-200 transition-colors duration-500">
        {#if qrDataUrl}
          <img src={qrDataUrl} alt="QR Code" class="w-64 h-64 rounded-xl shadow-sm" />
        {:else}
          <div class="w-64 h-64 flex items-center justify-center text-slate-300">
            <QrCode size={80} class="animate-pulse" />
          </div>
        {/if}
      </div>

      <div class="text-center">
        <h3 class="font-black text-2xl text-slate-900 tracking-tight">{profile?.restaurant_name}</h3>
        <p class="text-slate-400 font-bold text-sm mt-1">Eseguire la scansione per aprire il menù</p>
      </div>

      <div class="flex gap-4 w-full pt-4">
        <button 
          onclick={downloadQR}
          class="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-900/10"
        >
          <Download size={20} />
          Scarica PNG
        </button>
      </div>
    </div>

    <!-- Instructions & Link -->
    <div class="space-y-8">
      <div class="bg-orange-500 p-10 rounded-[2.5rem] text-white shadow-xl shadow-orange-500/20 relative overflow-hidden group">
        <div class="relative z-10 space-y-6">
          <h2 class="text-3xl font-black tracking-tight leading-tight">Il tuo link è pronto.</h2>
          <div class="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <div class="flex items-center justify-between gap-4">
              <span class="font-bold truncate text-orange-50 overflow-hidden">{menuUrl}</span>
              <a href={menuUrl} target="_blank" class="p-3 bg-white text-orange-500 rounded-xl hover:bg-orange-50 transition-colors">
                <ExternalLink size={20} />
              </a>
            </div>
          </div>
          <p class="text-orange-100 font-medium leading-relaxed">
            I tuoi clienti potranno accedere istantaneamente al tuo menu inquadrando il codice con la fotocamera.
          </p>
        </div>
        <div class="absolute -bottom-10 -right-10 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-700">
          <QrCode size={200} />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white p-6 rounded-3xl border border-slate-100 space-y-2">
          <div class="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
            <Share2 size={20} />
          </div>
          <h4 class="font-black text-slate-900 text-sm">Alta Qualità</h4>
          <p class="text-xs text-slate-500 font-medium">QR generato a 1024px per una stampa perfetta.</p>
        </div>
        <div class="bg-white p-6 rounded-3xl border border-slate-100 space-y-2">
          <div class="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
            <QrCode size={20} />
          </div>
          <h4 class="font-black text-slate-900 text-sm">Sempre Attivo</h4>
          <p class="text-xs text-slate-500 font-medium">Il link non scade mai e si aggiorna con il menu.</p>
        </div>
      </div>
    </div>
  </div>
</div>
