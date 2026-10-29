import { useEffect } from 'react';
import PhotoManager from '@/components/media/PhotoManager';

interface StepPhotosProps {
    data: any;
    tenantId?: string;
    onUpdate: (updates: any) => void;
    onValidationChange: (isValid: boolean) => void;
}

export function StepPhotos({ tenantId, onValidationChange }: StepPhotosProps) {

    // Always valid, as photos are optional but recommended
    useEffect(() => {
        onValidationChange(true);
    }, [onValidationChange]);

    if (!tenantId) {
        return <div className="text-center p-10">Salva prima il ristorante per caricare le foto.</div>;
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="text-center md:text-left">
                <h2 className="text-2xl font-black text-gray-900">Foto Piatti 📸</h2>
                <p className="text-gray-600 mt-1">
                    Carica e assegna le foto ai tuoi piatti. Puoi anche farlo dopo: le foto non assegnate restano
                    nella tua galleria.
                </p>
            </div>

            <PhotoManager
                tenantId={tenantId}
                onValidationChange={onValidationChange}
            />
        </div>
    );
}
