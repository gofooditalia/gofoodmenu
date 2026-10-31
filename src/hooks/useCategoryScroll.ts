'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Barra delle categorie con scroll-spy: la categoria attiva è l'ultima sezione il cui titolo è passato sotto
 * le barre fisse in alto (`offset` px). Durante lo scroll avviato da un tocco sulla barra lo spy resta fermo.
 * Stessa logica di MenuPageClient, usata dalle impaginazioni su misura (src/lib/menu-layouts.ts).
 */
export function useCategoryScroll(categoryIds: string[], offset: number) {
  const [activeCategory, setActiveCategory] = useState<string | null>(categoryIds[0] ?? null);
  const isManualScroll = useRef(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const scrollToElement = useCallback(
    (id: string, behavior: ScrollBehavior = 'smooth', categoryId?: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      isManualScroll.current = true;
      if (categoryId) setActiveCategory(categoryId);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior });
      scrollTimeout.current = setTimeout(() => {
        isManualScroll.current = false;
      }, 1000);
    },
    [offset],
  );

  const scrollToCategory = useCallback(
    (id: string, behavior: ScrollBehavior = 'smooth') => scrollToElement(id, behavior, id),
    [scrollToElement],
  );

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (isManualScroll.current || categoryIds.length === 0) return;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let current = categoryIds[0];
      if (atBottom) {
        current = categoryIds[categoryIds.length - 1];
      } else {
        for (const id of categoryIds) {
          const el = document.getElementById(id);
          if (!el) continue;
          if (el.getBoundingClientRect().top - offset - 24 <= 0) current = id;
          else break;
        }
      }
      setActiveCategory((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [categoryIds, offset]);

  // Link diretto a una categoria (es. /ristorante#id-categoria)
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id && categoryIds.includes(id)) requestAnimationFrame(() => scrollToCategory(id, 'auto'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { activeCategory, scrollToCategory, scrollToElement };
}
