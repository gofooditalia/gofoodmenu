'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { Languages, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { translateMenuForTenant } from './actions';

export function TranslateMenuButton({ tenantId, restaurantName }: { tenantId: string; restaurantName: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            title={`Traduci il menu di ${restaurantName} in inglese, francese, tedesco e spagnolo`}
            onClick={() =>
                startTransition(async () => {
                    const result = await translateMenuForTenant(tenantId);
                    if (result.ok) toast.success(`${restaurantName}: ${result.message}`);
                    else toast.error(`${restaurantName}: ${result.message}`);
                })
            }
        >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
            {isPending ? 'Traduzione…' : 'Traduci menu'}
        </Button>
    );
}
