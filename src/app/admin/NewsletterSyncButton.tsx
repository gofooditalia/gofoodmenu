'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { syncNewsletterContacts } from './actions';

export function NewsletterSyncButton() {
    const [isPending, startTransition] = useTransition();

    return (
        <Button
            variant="outline"
            disabled={isPending}
            onClick={() =>
                startTransition(async () => {
                    const result = await syncNewsletterContacts();
                    if (result.ok) toast.success(result.message);
                    else toast.error(result.message);
                })
            }
        >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Sincronizza lista newsletter
        </Button>
    );
}
