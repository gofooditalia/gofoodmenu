import { useCallback, useEffect } from 'react';
import { useCategories } from '@/hooks/useMenu';
import { StepCategories } from './StepCategories';
import { StepDishes } from './StepDishes';

interface StepMenuProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    tenantId?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate: (updates: any) => void;
    onValidationChange: (isValid: boolean) => void;
}

/**
 * Passaggio "Menu" dell'onboarding: importazione (o categorie a mano) e piatti nella stessa pagina.
 * Si prosegue con almeno un piatto; la validità la decide l'elenco dei piatti.
 */
export function StepMenu({ data, tenantId, onUpdate, onValidationChange }: StepMenuProps) {
    const { data: categories = [] } = useCategories(tenantId);
    const ignoreValidation = useCallback(() => {}, []);

    useEffect(() => {
        if (categories.length === 0) onValidationChange(false);
    }, [categories.length, onValidationChange]);

    return (
        <div className="space-y-10">
            <StepCategories data={data} tenantId={tenantId} onUpdate={onUpdate} onValidationChange={ignoreValidation} />
            {categories.length > 0 && (
                <StepDishes data={data} tenantId={tenantId} onUpdate={onUpdate} onValidationChange={onValidationChange} embedded />
            )}
        </div>
    );
}
