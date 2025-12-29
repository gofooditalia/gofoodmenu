<script lang="ts">
  import { Plus, Trash2, Edit3, Grid, Utensils } from 'lucide-svelte';
  import type { PageData, ActionData } from './$types';
  import { enhance } from '$app/forms';
  import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';

  let { data, form }: { data: PageData, form: ActionData } = $props();
  let supabase = $derived(data.supabase);
  const queryClient = useQueryClient();

  // 1. Categories Query
  const categoriesQuery = createQuery<any[]>(() => ({
    queryKey: ['categories', data.profile?.id],
    queryFn: async () => {
      if (!data.profile?.id) return [];
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', data.profile.id)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return categories;
    },
    staleTime: 1000 * 60 * 5,
  }));

  // 2. Dishes Query
  const dishesQuery = createQuery<any[]>(() => ({
    queryKey: ['dishes', data.profile?.id],
    queryFn: async () => {
      if (!data.profile?.id) return [];
      const { data: dishes, error } = await supabase
        .from('dishes')
        .select('*, categories(name)')
        .eq('restaurant_id', data.profile.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return dishes;
    },
    staleTime: 1000 * 60 * 5,
  }));

  // 3. Allergens Query
  const allergensQuery = createQuery<any[]>(() => ({
    queryKey: ['allergens'],
    queryFn: async () => {
      const { data: allergens, error } = await supabase
        .from('allergens')
        .select('*')
        .order('number', { ascending: true });
      if (error) throw error;
      return allergens;
    },
    staleTime: 1000 * 60 * 60,
  }));

  let showAddCategory = $state(false);
  let showAddDish = $state(false);
  
  let editingCategory: any = $state(null);
  let editingDish: any = $state(null);
  
  let dishName = $state('');
  let dishDescription = $state('');
  let dishPrice = $state('');
  let dishCategory = $state('');
  let selectedAllergenIds = $state<string[]>([]);
  let imagePreview: string | null = $state(null);

  function handleImageChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // 4. Reactive Hydration Sync: Ensure TanStack Query cache matches SvelteKit data
  $effect(() => {
    if (data.categories && data.profile?.id) {
      queryClient.setQueryData(['categories', data.profile.id], data.categories);
    }
  });

  $effect(() => {
    if (data.dishes && data.profile?.id) {
      queryClient.setQueryData(['dishes', data.profile.id], data.dishes);
    }
  });

  $effect(() => {
    if (data.allergens) {
      queryClient.setQueryData(['allergens'], data.allergens);
    }
  });
</script>

<div class="space-y-8">
  <div class="flex justify-between items-end">
    <div>
      <h1 class="text-4xl font-black text-slate-900 tracking-tight">Gestione Menu</h1>
      <p class="text-slate-500 mt-2 font-medium">Organizza le tue categorie e i tuoi piatti.</p>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
    <!-- Categories Sidebar -->
    <div class="lg:col-span-1 space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="font-black text-xl text-slate-900 tracking-tight flex items-center gap-2">
          <Grid size={20} class="text-orange-500" />
          Categorie
        </h2>
        <button 
          onclick={() => showAddCategory = !showAddCategory}
          class="p-2 bg-orange-50 text-orange-500 rounded-xl hover:bg-orange-100 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      {#if showAddCategory}
        <form 
          method="POST" 
          action="?/addCategory" 
          use:enhance={() => {
            return async ({ update }) => {
              showAddCategory = false;
              await update();
              queryClient.invalidateQueries({ queryKey: ['categories', data.profile?.id] });
            }
          }}
          class="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 space-y-3"
        >
          <input 
            type="text" 
            name="name" 
            placeholder="Nome (es. Antipasti)" 
            class="w-full p-3 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-xl outline-none font-bold text-sm"
            required
          />
          <div class="flex gap-2">
            <button type="submit" class="flex-1 bg-orange-500 text-white py-2 rounded-xl font-bold text-sm">Salva</button>
            <button 
              type="button" 
              onclick={() => showAddCategory = false}
              class="flex-1 bg-slate-100 text-slate-500 py-2 rounded-xl font-bold text-sm"
            >
              Annulla
            </button>
          </div>
        </form>
      {/if}

      <div class="space-y-2">
        {#each categoriesQuery.data ?? [] as category}
          <div class="group flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-orange-200 transition-all hover:shadow-md">
            <span class="font-bold text-slate-700">{category.name}</span>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onclick={() => editingCategory = category}
                class="p-2 text-slate-400 hover:text-orange-500 transition-colors"
              >
                <Edit3 size={16} />
              </button>
              <form method="POST" action="?/deleteCategory" use:enhance={() => {
                return async ({ update }) => {
                  await update();
                  queryClient.invalidateQueries({ queryKey: ['categories', data.profile?.id] });
                }
              }}>
                <input type="hidden" name="id" value={category.id} />
                <button type="submit" class="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </form>
            </div>
          </div>
        {/each}

        {#if editingCategory}
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div class="bg-white w-full max-w-sm rounded-3xl shadow-xl p-8 space-y-6">
              <h3 class="text-xl font-black text-slate-900">Modifica Categoria</h3>
              <form 
                method="POST" 
                action="?/editCategory" 
                use:enhance={() => {
                  return async ({ update }) => {
                    editingCategory = null;
                    await update();
                    queryClient.invalidateQueries({ queryKey: ['categories', data.profile?.id] });
                    queryClient.invalidateQueries({ queryKey: ['dishes', data.profile?.id] });
                  }
                }} 
                class="space-y-4"
              >
                <input type="hidden" name="id" value={editingCategory.id} />
                <div class="space-y-2">
                  <label for="edit_cat_name" class="text-xs font-black uppercase text-slate-400">Nome</label>
                  <input id="edit_cat_name" type="text" name="name" value={editingCategory.name} class="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold" required />
                </div>
                <div class="flex gap-2">
                  <button type="submit" class="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold">Aggiorna</button>
                  <button type="button" onclick={() => editingCategory = null} class="flex-1 bg-slate-100 text-slate-500 py-3 rounded-xl font-bold">Annulla</button>
                </div>
              </form>
            </div>
          </div>
        {/if}
        
        {#if data.categories.length === 0}
          <div class="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <p class="text-slate-400 text-sm font-medium">Nessuna categoria</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Dishes Main Area -->
    <div class="lg:col-span-3 space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="font-black text-xl text-slate-900 tracking-tight flex items-center gap-2">
          <Utensils size={20} class="text-orange-500" />
          Piatti
        </h2>
        <button 
          onclick={() => {
            showAddDish = true;
            selectedAllergenIds = [];
            dishName = '';
            dishDescription = '';
            dishPrice = '';
            dishCategory = '';
          }}
          class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Nuovo Piatto
        </button>
      </div>

      {#if showAddDish}
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div class="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 space-y-8 animate-in fade-in zoom-in duration-300">
            <div class="flex justify-between items-center">
              <h3 class="text-3xl font-black text-slate-900 tracking-tight">Nuovo Piatto</h3>
              <button onclick={() => showAddDish = false} class="text-slate-400 hover:text-slate-900 transition-colors">
                <Plus size={32} class="rotate-45" />
              </button>
            </div>

            <form 
              method="POST" 
              action="?/addDish" 
              enctype="multipart/form-data"
              use:enhance={() => {
                return async ({ update }) => {
                  showAddDish = false;
                  dishName = '';
                  dishPrice = '';
                  dishDescription = '';
                  dishCategory = '';
                  selectedAllergenIds = [];
                  imagePreview = null;
                  await update();
                  queryClient.invalidateQueries({ queryKey: ['dishes', data.profile?.id] });
                }
              }} 
              class="space-y-6"
            >
              <div class="grid grid-cols-2 gap-6">
                <div class="col-span-2 space-y-2">
                  <label for="new_dish_name" class="text-xs font-black uppercase tracking-wider text-slate-400">Nome del Piatto</label>
                  <input id="new_dish_name" type="text" name="name" bind:value={dishName} placeholder="es. Carbonara Speciale" class="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold" required />
                </div>
                
                <div class="space-y-2">
                  <label for="new_dish_price" class="text-xs font-black uppercase tracking-wider text-slate-400">Prezzo (€)</label>
                  <input id="new_dish_price" type="number" name="price" step="0.50" bind:value={dishPrice} placeholder="12.00" class="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold" required />
                </div>

                <div class="space-y-2">
                  <label for="new_dish_cat" class="text-xs font-black uppercase tracking-wider text-slate-400">Categoria</label>
                  <select id="new_dish_cat" name="category_id" bind:value={dishCategory} class="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold appearance-none" required>
                    <option value="" disabled>Scegli...</option>
                    {#each categoriesQuery.data ?? [] as category}
                      <option value={category.id}>{category.name}</option>
                    {/each}
                  </select>
                </div>

                <div class="col-span-2 space-y-2">
                  <label for="new_dish_desc" class="text-xs font-black uppercase tracking-wider text-slate-400">Descrizione</label>
                  <textarea id="new_dish_desc" name="description" bind:value={dishDescription} rows="3" placeholder="Ingredienti, allergeni..." class="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold"></textarea>
                </div>

                <div class="col-span-2 space-y-3">
                  <p class="text-xs font-black uppercase tracking-wider text-slate-400">Allergeni Presenti</p>
                  <div class="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {#each allergensQuery.data ?? [] as allergen}
                      <button 
                        type="button"
                        onclick={() => {
                          if (selectedAllergenIds.includes(allergen.id)) {
                            selectedAllergenIds = selectedAllergenIds.filter(id => id !== allergen.id);
                          } else {
                            selectedAllergenIds = [...selectedAllergenIds, allergen.id];
                          }
                        }}
                        class="flex flex-col items-center p-3 rounded-2xl border-2 transition-all group relative {selectedAllergenIds.includes(allergen.id) ? 'border-orange-500 bg-orange-50' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}"
                        title={allergen.name}
                      >
                        <span class="text-2xl">{allergen.icon}</span>
                        <span class="text-[9px] font-black uppercase mt-1 text-center leading-tight text-slate-500 group-hover:text-slate-900 line-clamp-1">{allergen.name}</span>
                        {#if selectedAllergenIds.includes(allergen.id)}
                          <div class="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white">
                            <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
                          </div>
                        {/if}
                      </button>
                    {/each}
                  </div>
                  <input type="hidden" name="allergens" value={selectedAllergenIds.join(', ')} />
                </div>

                <div class="col-span-2 space-y-2">
                  <label for="new_dish_img" class="text-xs font-black uppercase tracking-wider text-slate-400">Immagine del Piatto</label>
                  <div class="flex gap-4 items-center">
                    <div class="w-24 h-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                      {#if imagePreview}
                        <img src={imagePreview} class="w-full h-full object-cover" alt="Preview" />
                      {:else}
                        <Utensils size={24} class="text-slate-300" />
                      {/if}
                      <input id="new_dish_img" type="file" name="image" accept="image/*" onchange={handleImageChange} class="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    <div class="flex-1 text-sm text-slate-500 font-medium">
                      Carica una foto per rendere il piatto più appetitoso. (Max 2MB)
                    </div>
                  </div>
                </div>
              </div>

              <div class="pt-4 flex gap-4">
                <button type="submit" class="flex-1 bg-orange-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all">Salva Piatto</button>
                <button type="button" onclick={() => showAddDish = false} class="flex-1 bg-slate-100 text-slate-500 py-5 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all">Annulla</button>
              </div>
            </form>
          </div>
        </div>
      {/if}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {#each dishesQuery.data ?? [] as dish}
          <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex gap-6 group hover:shadow-xl transition-all duration-300">
            <div class="w-32 h-32 bg-slate-100 rounded-2xl flex-shrink-0 relative overflow-hidden">
              {#if dish.image_url}
                <img src={dish.image_url} alt={dish.name} class="w-full h-full object-cover" />
              {:else}
                <div class="w-full h-full flex items-center justify-center text-slate-300">
                  <Utensils size={40} />
                </div>
              {/if}
            </div>
            <div class="flex-1 space-y-2">
              <div class="flex justify-between items-start">
                <span class="text-xs font-black uppercase tracking-widest text-orange-500">{dish.categories?.name}</span>
                <span class="font-black text-slate-900">€{dish.price}</span>
              </div>
              <h3 class="font-bold text-xl text-slate-900 leading-tight">{dish.name}</h3>
              <p class="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                {dish.description || 'Nessuna descrizione.'}
              </p>
              <div class="pt-4 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onclick={() => {
                    editingDish = dish;
                    imagePreview = dish.image_url;
                    selectedAllergenIds = dish.allergens || [];
                  }}
                  class="text-slate-400 hover:text-orange-500 transition-colors"
                >
                  <Edit3 size={18} />
                </button>
                <form method="POST" action="?/deleteDish" use:enhance={() => {
                  return async ({ update }) => {
                    await update();
                    queryClient.invalidateQueries({ queryKey: ['dishes', data.profile?.id] });
                  }
                }}>
                  <input type="hidden" name="id" value={dish.id} />
                  <button type="submit" class="text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        {/each}

        {#if editingDish}
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div class="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 space-y-8 animate-in fade-in zoom-in duration-300">
              <div class="flex justify-between items-center">
                <h3 class="text-3xl font-black text-slate-900 tracking-tight">Modifica Piatto</h3>
                <button onclick={() => { editingDish = null; imagePreview = null; }} class="text-slate-400 hover:text-slate-900 transition-colors">
                  <Plus size={32} class="rotate-45" />
                </button>
              </div>

              <form 
                method="POST" 
                action="?/editDish" 
                enctype="multipart/form-data"
                use:enhance={() => {
                  return async ({ update }) => {
                    editingDish = null;
                    imagePreview = null;
                    await update();
                    queryClient.invalidateQueries({ queryKey: ['dishes', data.profile?.id] });
                  }
                }} 
                class="space-y-6"
              >
                <input type="hidden" name="id" value={editingDish.id} />
                <div class="grid grid-cols-2 gap-6">
                  <div class="col-span-2 space-y-2">
                    <label for="edit_dish_name" class="text-xs font-black uppercase tracking-wider text-slate-400">Nome del Piatto</label>
                    <input id="edit_dish_name" type="text" name="name" value={editingDish.name} class="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold" required />
                  </div>
                  
                  <div class="space-y-2">
                    <label for="edit_dish_price" class="text-xs font-black uppercase tracking-wider text-slate-400">Prezzo (€)</label>
                    <input id="edit_dish_price" type="number" name="price" step="0.50" value={editingDish.price} class="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold" required />
                  </div>

                  <div class="space-y-2">
                    <label for="edit_dish_cat" class="text-xs font-black uppercase tracking-wider text-slate-400">Categoria</label>
                    <select id="edit_dish_cat" name="category_id" value={editingDish.category_id} class="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold appearance-none" required>
                      {#each categoriesQuery.data ?? [] as category}
                        <option value={category.id}>{category.name}</option>
                      {/each}
                    </select>
                  </div>

                  <div class="col-span-2 space-y-2">
                    <label for="edit_dish_desc" class="text-xs font-black uppercase tracking-wider text-slate-400">Descrizione</label>
                    <textarea id="edit_dish_desc" name="description" rows="3" class="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold">{editingDish.description || ''}</textarea>
                  </div>

                  <div class="col-span-2 space-y-3">
                    <p class="text-xs font-black uppercase tracking-wider text-slate-400">Allergeni Presenti</p>
                    <div class="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {#each allergensQuery.data ?? [] as allergen}
                        <button 
                          type="button"
                          onclick={() => {
                            if (selectedAllergenIds.includes(allergen.id)) {
                              selectedAllergenIds = selectedAllergenIds.filter(id => id !== allergen.id);
                            } else {
                              selectedAllergenIds = [...selectedAllergenIds, allergen.id];
                            }
                          }}
                          class="flex flex-col items-center p-3 rounded-2xl border-2 transition-all group relative {selectedAllergenIds.includes(allergen.id) ? 'border-orange-500 bg-orange-50' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}"
                          title={allergen.name}
                        >
                          <span class="text-2xl">{allergen.icon}</span>
                          <span class="text-[9px] font-black uppercase mt-1 text-center leading-tight text-slate-500 group-hover:text-slate-900 line-clamp-1">{allergen.name}</span>
                          {#if selectedAllergenIds.includes(allergen.id)}
                            <div class="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white">
                              <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
                            </div>
                          {/if}
                        </button>
                      {/each}
                    </div>
                    <input type="hidden" name="allergens" value={selectedAllergenIds.join(', ')} />
                  </div>

                  <div class="col-span-2 space-y-2">
                    <label for="edit_dish_img" class="text-xs font-black uppercase tracking-wider text-slate-400">Immagine del Piatto</label>
                    <div class="flex gap-4 items-center">
                      <div class="w-24 h-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                        {#if imagePreview}
                          <img src={imagePreview} class="w-full h-full object-cover" alt="Preview" />
                        {:else}
                          <Utensils size={24} class="text-slate-300" />
                        {/if}
                        <input id="edit_dish_img" type="file" name="image" accept="image/*" onchange={handleImageChange} class="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                      <div class="flex-1 text-sm text-slate-500 font-medium">
                        Carica una nuova foto se vuoi sostituire quella attuale.
                      </div>
                    </div>
                  </div>
                </div>

                <div class="pt-4 flex gap-4">
                  <button type="submit" class="flex-1 bg-orange-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all">Aggiorna Piatto</button>
                  <button type="button" onclick={() => { editingDish = null; imagePreview = null; }} class="flex-1 bg-slate-100 text-slate-500 py-5 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all">Annulla</button>
                </div>
              </form>
            </div>
          </div>
        {/if}

        {#if data.dishes.length === 0}
          <div class="md:col-span-2 p-16 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
            <div class="max-w-xs mx-auto space-y-4">
              <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                <Utensils size={32} />
              </div>
              <h3 class="font-bold text-slate-900 text-lg">Inizia ad aggiungere piatti</h3>
              <p class="text-slate-500 text-sm">Crea una categoria e aggiungi il tuo primo piatto per vederlo apparire qui.</p>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
