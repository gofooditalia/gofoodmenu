4. Database Schema (Supabase)
Table: profiles (Restaurants)
id: uuid (Primary Key, refs auth.users)

slug: text (Unique, used for URL e.g. /menu/bistrot107)

restaurant_name: text

theme_color: text (default: 'orange')

created_at: timestamptz

Table: categories (Menu Sections)
id: bigint (Primary Key)

restaurant_id: uuid (Foreign Key -> profiles.id)

name: text (e.g., "Primi", "Vini")

sort_order: integer

Table: dishes (Items)
id: bigint (Primary Key)

category_id: bigint (Foreign Key -> categories.id)

restaurant_id: uuid (Foreign Key -> profiles.id) -- Denormalized for RLS speed

name: text

description: text

price: numeric

image_url: text

is_available: boolean (default: true)

allergens: text[]

5. Functional Requirements
A. Public Menu (Client Side)
Performance First: Must load instantly on 4G. Use SSR (Server Side Rendering).

View: Fetch restaurant data based on [slug] from URL.

Interaction: Filter by category (scroll spy or sticky tabs).

No Auth: Publicly accessible.

B. Admin Dashboard (Restaurant Side)
Authentication: Supabase Auth (Email/Password or Magic Link).

Onboarding: If user has no profile, prompt to create "Restaurant Name" and "Slug".

Dish Management:

Form to add/edit dishes using standard HTML forms + SvelteKit Form Actions (actions).

Image Upload via Supabase Storage bucket menu-images.

QR Code: Auto-generate QR code pointing to https://gofoodmenu.it/menu/{slug}.

6. UI/UX Guidelines
Primary Color: Orange-500 (#f97316).

Fonts: Sans-serif (Inter or similar system font).

Admin Style: Clean, dense data display, sidebar navigation.

Public Style: Big touch targets, high contrast, appetizing visuals.

7. Instructions for AI Developer
Always use SvelteKit Form Actions for data mutation (POST/PUT/DELETE). Do not use client-side fetch for form submissions unless necessary for optimistic UI.

Type Safety: Generate TypeScript interfaces for all Supabase tables.

Supabase: Use the helper @supabase/ssr for cookie handling in SvelteKit.

Tailwind: Use utility classes. Do not write custom CSS unless strictly necessary.
