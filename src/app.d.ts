import type { SupabaseClient, Session } from '@supabase/supabase-js';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient;
			getSession(): Promise<Session | null>;
			getUser(): Promise<any | null>;
		}
		interface PageData {
			session?: Session | null;
			supabase?: SupabaseClient;
			profile?: any;
			stats?: any;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
