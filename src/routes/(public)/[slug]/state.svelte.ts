import type { Dish } from "$lib/db/schema";

export const glutenSafety = $state({
    mode: false,
    toggle() {
        this.mode = !this.mode;
    }
});

export const uiState = $state({
    scrollContainer: undefined as HTMLElement | undefined,
    peekedDish: null as Dish | null,

    setPeekedDish(dish: Dish | null) {
        this.peekedDish = dish;
    },

    scrollToTop() {
        if (this.scrollContainer) {
            this.scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
});
