import { useState } from 'react';
import { WizardStepper } from './WizardStepper';
import { WizardControls } from './WizardControls';
import { StepSettings } from './steps/StepSettings';
import { StepMenu } from './steps/StepMenu';
import { ONBOARDING_STEPS } from '@/lib/onboarding';
import { StepCharacteristics } from './steps/StepCharacteristics';
import { StepPhotos } from './steps/StepPhotos';
import { StepBranding } from './steps/StepBranding';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";


interface OnboardingWizardProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialData: any;
    tenantId?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate: (data: any, nextStep?: number) => Promise<boolean>;
    onExit: () => void;
    currentStepProp?: number;
}

export function OnboardingWizard({ initialData, tenantId, onUpdate, onExit, currentStepProp = 1 }: OnboardingWizardProps) {
    const [step, setStep] = useState(currentStepProp);
    const [formData, setFormData] = useState(initialData);
    const [isSaving, setIsSaving] = useState(false);
    const [canGoNext, setCanGoNext] = useState(false);

    // Uscita dal passaggio 1 (chiude la sessione): sempre con conferma
    const [showExitDialog, setShowExitDialog] = useState(false);

    const TOTAL_STEPS = ONBOARDING_STEPS;


    const performNextStep = async () => {
        setIsSaving(true);
        try {
            const success = await onUpdate(formData, step + 1);
            if (success && step < TOTAL_STEPS) {
                setStep(s => s + 1);
                setCanGoNext(false);
            }
        } catch (error) {
            console.error("Wizard error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // Le foto non assegnate restano nella libreria del ristoratore (/dashboard/media): mai cancellarle qui
    const handleNext = async () => {
        await performNextStep();
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(s => s - 1);
            setCanGoNext(true); // Usually backing up implies we can go next again
        } else {
            setShowExitDialog(true);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFormData = (updates: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setFormData((prev: any) => ({ ...prev, ...updates }));
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <StepSettings
                    data={formData}
                    onUpdate={updateFormData}
                    onValidationChange={setCanGoNext}
                />;
            case 2:
                return <StepMenu
                    data={formData}
                    tenantId={tenantId}
                    onUpdate={updateFormData}
                    onValidationChange={setCanGoNext}
                />;
            case 3:
                return <StepCharacteristics
                    data={formData}
                    tenantId={tenantId}
                    onUpdate={updateFormData}
                    onValidationChange={setCanGoNext}
                />;
            case 4:
                return <StepPhotos
                    data={formData}
                    tenantId={tenantId}
                    onUpdate={updateFormData}
                    onValidationChange={setCanGoNext}
                />;
            case 5:
                return <StepBranding
                    data={formData}
                    tenantId={tenantId}
                    onUpdate={updateFormData}
                    onValidationChange={setCanGoNext}
                />;
            default: return <div>Step sconosciuto</div>;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">

            {/* Header / Stepper Area */}
            <div className="bg-white border-b border-gray-200 pt-6 pb-4 px-4 sticky top-0 z-40 bg-white/90 backdrop-blur-md">
                <div className="container mx-auto max-w-5xl">
                    <WizardStepper
                        currentStep={step}
                        totalSteps={TOTAL_STEPS}

                    />
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 container mx-auto max-w-5xl p-4 pb-32">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {renderStep()}
                </div>
            </main>

            {/* Controls */}
            <WizardControls
                currentStep={step}
                totalSteps={TOTAL_STEPS}
                onBack={handleBack}
                onNext={handleNext}
                canGoNext={canGoNext}
                isSaving={isSaving}

            />

            <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Vuoi uscire?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esci dal tuo account. Quello che hai già salvato con &quot;Continua&quot; resta: quando rientri
                            riprendi da qui.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Resta</AlertDialogCancel>
                        <AlertDialogAction onClick={onExit}>Esci</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
