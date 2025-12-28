<script lang="ts">
  import './layout.css';
  import { invalidate, onNavigate } from '$app/navigation';
  import { onMount } from 'svelte';
  import type { LayoutData } from './$types';

  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';

  let { data, children }: { data: LayoutData, children: any } = $props();
  let session = $derived(data.session);
  let supabase = $derived(data.supabase);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: true,
        staleTime: 1000 * 60 * 5, // 5 minutes default
      },
    },
  });

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });

  onMount(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
      if (_session?.expires_at !== session?.expires_at) {
        invalidate('supabase:auth');
      }
    });

    return () => subscription.unsubscribe();
  });
</script>

<QueryClientProvider client={queryClient}>
  {@render children()}
</QueryClientProvider>
