/**
 * Next.js Middleware
 *
 * Questo middleware gestisce:
 * - Refresh automatico delle sessioni Supabase
 * - Protezione delle route /dashboard/* e /onboarding
 * - Redirect automatici in base allo stato di autenticazione
 * - Menu pubblico nella lingua del telefono (/{slug} → /{slug}/{lingua} per i locali tradotti)
 */

import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { menuLanguageRedirect } from '@/lib/menu-language-redirect';

export async function middleware(request: NextRequest) {
  const languageRedirect = await menuLanguageRedirect(request);
  if (languageRedirect) return languageRedirect;
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - API routes (if needed)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
