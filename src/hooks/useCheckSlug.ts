import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { slugProblem, SLUG_MIN_LENGTH } from '@/lib/reserved-slugs';

export function useCheckSlug(slug: string | null, currentSlug?: string | null) {
    return useQuery({
        queryKey: ['checkSlug', slug],
        queryFn: async () => {
            if (!slug) return { available: false, error: 'Slug empty' };

            // Formato, lunghezza minima e slug riservati (rotte del sito): non serve chiedere al database
            const problem = slugProblem(slug);
            if (problem) return { available: false, error: problem };

            // Lo slug attuale del locale (modifiche) resta suo
            if (currentSlug && slug === currentSlug) return { available: true };

            // Funzione del database (migrazione 043): risponde solo libero/occupato, senza leggere gli altri locali
            const supabase = createClient();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any).rpc('is_slug_taken', { p_slug: slug });
            if (error) throw error;

            return { available: data !== true };
        },
        enabled: !!slug && slug.length >= SLUG_MIN_LENGTH,
        staleTime: 1000 * 60, // 1 minute cache
        retry: false
    });
}
