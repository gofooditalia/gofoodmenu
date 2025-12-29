<script lang="ts">
  import { 
    Store, MapPin, Phone, Globe, Instagram, Facebook, 
    MessageCircle, Clock, Save, Camera, Plus, Trash2 
  } from 'lucide-svelte';
  import { enhance } from '$app/forms';
  import { fade, slide } from 'svelte/transition';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData, form: ActionData } = $props();
  
  let profile = $state(data.profile || {});
  let isSaving = $state(false);
  let isUploading = $state(false);
  let fileInput: HTMLInputElement;

  async function uploadLogo(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    try {
      isUploading = true;
      const fileExt = file.name.split('.').pop();
      const fileName = `${data.session?.user.id}/logo-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data: uploadData, error: uploadError } = await data.supabase.storage
        .from('menu-images')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = data.supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath);

      profile.logo_url = publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Errore durante il caricamento del logo');
    } finally {
      isUploading = false;
    }
  }

  // Initialize opening hours if empty
  const daysOfWeek = [
    'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'
  ];

  let openingHours = $state(
    profile.opening_hours || daysOfWeek.map(day => ({
      day,
      isOpen: false,
      periods: [{ open: '09:00', close: '18:00' }]
    }))
  );

  function addPeriod(dayIndex: number) {
    openingHours[dayIndex].periods.push({ open: '19:00', close: '23:00' });
  }

  function removePeriod(dayIndex: number, periodIndex: number) {
    openingHours[dayIndex].periods = openingHours[dayIndex].periods.filter((_, i) => i !== periodIndex);
  }

  function toggleDay(dayIndex: number) {
    openingHours[dayIndex].isOpen = !openingHours[dayIndex].isOpen;
  }
</script>

<div class="max-w-4xl mx-auto space-y-12 pb-24">
  <!-- Header -->
  <header class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
    <div>
      <h1 class="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
        <Store size={36} class="text-orange-500" />
        Profilo Ristorante
      </h1>
      <p class="text-slate-500 mt-2 font-medium">Gestisci le informazioni del tuo locale visibili ai clienti.</p>
    </div>
    
    <div class="flex gap-3">
        <button 
            type="submit" 
            form="profile-form"
            disabled={isSaving}
            class="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2 group"
        >
            {#if isSaving}
                <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            {:else}
                <Save size={20} />
            {/if}
            Salva Modifiche
        </button>
    </div>
  </header>

  {#if form?.success}
    <div 
        transition:fade 
        class="bg-emerald-50 border border-emerald-100 text-emerald-700 px-6 py-4 rounded-2xl font-bold flex items-center gap-3"
    >
        <div class="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center">
            <Save size={18} />
        </div>
        Profilo aggiornato con successo!
    </div>
  {/if}

  {#if form?.error}
  <div 
      transition:fade 
      class="bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-2xl font-bold flex items-center gap-3"
  >
      <div class="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center text-sm">
          !
      </div>
      {form.error}
  </div>
{/if}

  <form 
    id="profile-form"
    method="POST" 
    action="?/updateProfile"
    use:enhance={() => {
        isSaving = true;
        return async ({ update }) => {
            isSaving = false;
            await update();
        };
    }}
    class="space-y-12"
  >
    <!-- Hidden input for JSON opening hours -->
    <input type="hidden" name="opening_hours" value={JSON.stringify(openingHours)} />

    <!-- Section: Basic Info -->
    <section class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="space-y-2">
            <h3 class="text-xl font-black text-slate-900">Informazioni Base</h3>
            <p class="text-slate-500 text-sm font-medium">Il nome e il volto del tuo ristorante sul web.</p>
        </div>
        
        <div class="lg:col-span-2 space-y-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div class="flex flex-col md:flex-row gap-8 items-start">
                <div class="relative group">
                    <div class="w-32 h-32 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 overflow-hidden relative">
                        {#if isUploading}
                            <div class="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
                        {:else if profile.logo_url}
                            <img src={profile.logo_url} alt="Logo" class="w-full h-full object-cover" />
                        {:else}
                            <Camera size={28} />
                            <span class="text-[10px] uppercase font-bold mt-2">Logo</span>
                        {/if}
                    </div>
                    <button 
                        type="button" 
                        onclick={() => fileInput.click()}
                        class="absolute -bottom-2 -right-2 bg-orange-500 text-white p-2 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform"
                    >
                        <Plus size={16} />
                    </button>
                    <input 
                        type="file" 
                        bind:this={fileInput} 
                        onchange={uploadLogo} 
                        accept="image/*" 
                        class="hidden" 
                    />
                    <input type="hidden" name="logo_url" value={profile.logo_url || ''} />
                </div>

                <div class="flex-1 space-y-6 w-full">
                    <div class="space-y-2">
                        <label for="restaurant_name" class="text-xs font-black uppercase tracking-widest text-slate-400">Nome Ristorante</label>
                        <input 
                            type="text" 
                            id="restaurant_name" 
                            name="restaurant_name"
                            bind:value={profile.restaurant_name}
                            class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-slate-900" 
                            placeholder="Esempio: Osteria da Giorgio"
                        />
                    </div>
                    
                    <div class="space-y-2">
                        <label for="description" class="text-xs font-black uppercase tracking-widest text-slate-400">Breve Descrizione</label>
                        <textarea 
                            id="description" 
                            name="description"
                            bind:value={profile.description}
                            rows="3"
                            class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium text-slate-700 resize-none" 
                            placeholder="Racconta brevemente chi sei..."
                        ></textarea>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Section: Contact & Location -->
    <section class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="space-y-2">
            <h3 class="text-xl font-black text-slate-900">Contatti e Località</h3>
            <p class="text-slate-500 text-sm font-medium">Aiuta i tuoi clienti a trovarti e a prenotare.</p>
        </div>
        
        <div class="lg:col-span-2 space-y-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                    <label for="address" class="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <MapPin size={14} /> Indirizzo
                    </label>
                    <input 
                        type="text" 
                        id="address" 
                        name="address"
                        bind:value={profile.address}
                        class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-slate-900" 
                        placeholder="Via Roma 1, Milano"
                    />
                </div>
                
                <div class="space-y-2">
                    <label for="phone" class="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Phone size={14} /> Numero di Telefono
                    </label>
                    <input 
                        type="text" 
                        id="phone" 
                        name="phone"
                        bind:value={profile.phone}
                        class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-slate-900" 
                        placeholder="+39 012 3456789"
                    />
                </div>

                <div class="space-y-2 md:col-span-2">
                    <label for="website_url" class="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Globe size={14} /> Sito Web
                    </label>
                    <input 
                        type="url" 
                        id="website_url" 
                        name="website_url"
                        bind:value={profile.website_url}
                        class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-slate-900" 
                        placeholder="https://www.tuoristorante.it"
                    />
                </div>
            </div>
        </div>
    </section>

    <!-- Section: Opening Hours -->
    <section class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="space-y-2">
            <h3 class="text-xl font-black text-slate-900">Orari di Apertura</h3>
            <p class="text-slate-500 text-sm font-medium">Configura i giorni e gli orari in cui sei operativo.</p>
        </div>
        
        <div class="lg:col-span-2 space-y-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            {#each openingHours as day, i}
                <div class="p-4 rounded-2xl transition-all duration-300 {day.isOpen ? 'bg-slate-50' : 'bg-transparent border border-slate-50'}">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <button 
                                type="button"
                                onclick={() => toggleDay(i)}
                                class="w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none {day.isOpen ? 'bg-orange-500' : 'bg-slate-200'}"
                            >
                                <div class="w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200 {day.isOpen ? 'right-1' : 'left-1'}"></div>
                            </button>
                            <span class="font-black text-slate-900 uppercase tracking-wider text-sm">{day.day}</span>
                        </div>
                        
                        {#if !day.isOpen}
                            <span class="text-slate-400 font-bold text-xs uppercase italic">Chiuso</span>
                        {/if}
                    </div>

                    {#if day.isOpen}
                        <div transition:slide class="mt-4 space-y-3">
                            {#each day.periods as period, pi}
                                <div class="flex items-center gap-3">
                                    <input 
                                        type="time" 
                                        bind:value={period.open}
                                        class="px-4 py-2 bg-white border border-slate-100 rounded-xl font-bold text-sm focus:ring-2 focus:ring-orange-500/20 outline-none"
                                    />
                                    <span class="font-black text-slate-300">-</span>
                                    <input 
                                        type="time" 
                                        bind:value={period.close}
                                        class="px-4 py-2 bg-white border border-slate-100 rounded-xl font-bold text-sm focus:ring-2 focus:ring-orange-500/20 outline-none"
                                    />
                                    {#if day.periods.length > 1}
                                        <button 
                                            type="button" 
                                            onclick={() => removePeriod(i, pi)}
                                            class="p-2 text-slate-400 hover:text-red-500"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    {/if}
                                    {#if pi === day.periods.length - 1}
                                        <button 
                                            type="button" 
                                            onclick={() => addPeriod(i)}
                                            class="flex items-center gap-1.5 px-3 py-2 text-orange-500 hover:bg-orange-50 rounded-xl font-bold text-xs transition-colors"
                                        >
                                            <Plus size={14} /> Aggiungi Fascia
                                        </button>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    </section>

    <!-- Section: Social Media -->
    <section class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="space-y-2">
            <h3 class="text-xl font-black text-slate-900">Social Media</h3>
            <p class="text-slate-500 text-sm font-medium">Collega i tuoi profili social per farti seguire.</p>
        </div>
        
        <div class="lg:col-span-2 space-y-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm leading-relaxed">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                    <label for="instagram" class="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Instagram size={14} class="text-pink-500" /> Instagram URL
                    </label>
                    <input 
                        type="url" 
                        id="instagram" 
                        name="instagram_url"
                        bind:value={profile.instagram_url}
                        class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-slate-900" 
                        placeholder="https://instagram.com/tuo-profilo"
                    />
                </div>
                
                <div class="space-y-2">
                    <label for="facebook" class="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Facebook size={14} class="text-blue-600" /> Facebook URL
                    </label>
                    <input 
                        type="url" 
                        id="facebook" 
                        name="facebook_url"
                        bind:value={profile.facebook_url}
                        class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-slate-900" 
                        placeholder="https://facebook.com/tua-pagina"
                    />
                </div>

                <div class="space-y-2 md:col-span-2">
                    <label for="whatsapp" class="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <MessageCircle size={14} class="text-emerald-500" /> WhatsApp (Numero)
                    </label>
                    <div class="relative">
                        <span class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+39</span>
                        <input 
                            type="text" 
                            id="whatsapp" 
                            name="whatsapp_number"
                            bind:value={profile.whatsapp_number}
                            class="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-slate-900" 
                            placeholder="333 1234567"
                        />
                    </div>
                </div>
            </div>
        </div>
    </section>
  </form>
</div>
