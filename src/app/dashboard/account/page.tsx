'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { deleteAccount, resetMenu } from '@/app/actions/account';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FooterData, FooterLocation, FooterSocial } from '@/types/menu';
import { useTenant, useUpdateTenant } from '@/hooks/useTenant';
import { cancellationEnd, formatBillingDate, useSubscriptionDetails } from '@/hooks/useSubscriptionDetails';
import { useQueryClient } from '@tanstack/react-query';

export default function AccountPage() {
    const { data: tenant, isLoading } = useTenant();
    const updateTenantMutation = useUpdateTenant();
    const queryClient = useQueryClient();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Reset Menu State
    const [showResetMenuModal, setShowResetMenuModal] = useState(false);
    const [resetMenuConfirmation, setResetMenuConfirmation] = useState('');
    const [isResettingMenu, setIsResettingMenu] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        restaurantName: '',
        slug: '',
        contactEmail: '',
        coverCharge: 0,
        footerData: {
            locations: [] as FooterLocation[],
            socials: [] as FooterSocial[],
            show_brand_column: true,
            brand_description: { it: '', en: '' }
        } as FooterData,
    });

    // Password Change State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    useEffect(() => {
        if (tenant) {
            setFormData({
                restaurantName: tenant.restaurant_name || '',
                slug: tenant.slug || '',
                contactEmail: tenant.contact_email || '',
                coverCharge: tenant.cover_charge || 0,
                footerData: {
                    locations: tenant.footer_data?.locations || [],
                    socials: tenant.footer_data?.socials || [],
                    show_brand_column: tenant.footer_data?.show_brand_column ?? true,
                    brand_description: tenant.footer_data?.brand_description || { it: '', en: '' }
                },
            });
        }
    }, [tenant]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!tenant) return;

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.contactEmail && !emailRegex.test(formData.contactEmail)) {
            toast.error('Inserisci un indirizzo email valido');
            return;
        }

        try {
            await updateTenantMutation.mutateAsync({
                id: tenant.id,
                updates: {
                    restaurant_name: formData.restaurantName,
                    slug: formData.slug,
                    contact_email: formData.contactEmail,
                    cover_charge: formData.coverCharge,
                    footer_data: formData.footerData
                }
            });
            // Success toast handled by mutation
        } catch (err: any) {
            // Error toast handled by mutation
        }
    }

    async function handleDeleteAccount() {
        if (deleteConfirmation.trim().toUpperCase() !== 'ELIMINA') {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteAccount();
            window.location.href = '/';
        } catch (error) {
            console.error('Error deleting account:', error);
            toast.error('Errore durante l\'eliminazione dell\'account');
            setIsDeleting(false);
        }
    }

    async function handleResetMenu() {
        if (resetMenuConfirmation.trim().toUpperCase() !== 'RESET') {
            return;
        }

        setIsResettingMenu(true);
        try {
            await resetMenu();
            // Invalidate queries to refresh UI in other tabs/pages immediately
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['dishes'] });

            toast.success('Menu resettato con successo');
            setShowResetMenuModal(false);
            setResetMenuConfirmation('');
        } catch (error) {
            console.error('Error resetting menu:', error);
            toast.error('Errore durante il reset del menu');
        } finally {
            setIsResettingMenu(false);
        }
    }

    async function handlePasswordChange() {
        if (!newPassword || !confirmPassword) {
            toast.error('Compila entrambi i campi password');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Le password non coincidono');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('La password deve essere lunga almeno 6 caratteri');
            return;
        }

        setIsUpdatingPassword(true);
        const supabase = createClient();

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });

            if (error) {
                throw error;
            }

            toast.success('Password aggiornata con successo!');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Error updating password:', error);
            toast.error(`Errore: ${error.message}`);
        } finally {
            setIsUpdatingPassword(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">
                    Il tuo Account 👤
                </h1>
                <p className="text-gray-600">
                    Gestisci le impostazioni del ristorante e del tuo account
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Informazioni Base Ristorante */}
                <Card className="shadow-sm border-gray-200">
                    <CardHeader>
                        <CardTitle>Informazioni Ristorante</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="restaurantName" className="font-bold">Nome Ristorante *</Label>
                            <Input
                                id="restaurantName"
                                type="text"
                                required
                                value={formData.restaurantName}
                                onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                                placeholder="Il Mio Ristorante"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="contactEmail" className="font-bold">Email Contatto</Label>
                                <Input
                                    id="contactEmail"
                                    type="email"
                                    value={formData.contactEmail}
                                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                    placeholder="info@ristorante.it"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="coverCharge" className="font-bold">Costo Coperto (€)</Label>
                                <Input
                                    id="coverCharge"
                                    type="number"
                                    step="0.10"
                                    min="0"
                                    value={formData.coverCharge}
                                    onChange={(e) => setFormData({ ...formData, coverCharge: parseFloat(e.target.value) })}
                                    placeholder="2.50"
                                    className="font-mono"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Questo importo verrà mostrato nella pagina allergeni/legale.
                                </p>
                            </div>
                        </div>


                        {/* Locations & Socials - Moved from Footer Customization */}
                        <div className="pt-4 border-t border-gray-100 space-y-8">
                            {/* Locations */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-bold">Sedi</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setFormData({
                                            ...formData,
                                            footerData: {
                                                ...formData.footerData,
                                                locations: [...formData.footerData.locations, { city: '', address: '', phone: '', opening_hours: '' }]
                                            }
                                        })}
                                        className="gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Aggiungi Sede
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {formData.footerData.locations.map((loc, index) => (
                                        <Card key={index} className="bg-muted/30">
                                            <CardContent className="p-4 flex gap-3 items-start">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                                                    <Input
                                                        placeholder="Città"
                                                        value={loc.city}
                                                        onChange={(e) => {
                                                            const newLocs = [...formData.footerData.locations];
                                                            newLocs[index].city = e.target.value;
                                                            setFormData({ ...formData, footerData: { ...formData.footerData, locations: newLocs } });
                                                        }}
                                                    />
                                                    <Input
                                                        placeholder="Indirizzo"
                                                        value={loc.address}
                                                        onChange={(e) => {
                                                            const newLocs = [...formData.footerData.locations];
                                                            newLocs[index].address = e.target.value;
                                                            setFormData({ ...formData, footerData: { ...formData.footerData, locations: newLocs } });
                                                        }}
                                                    />
                                                    <Input
                                                        placeholder="Telefono (opzionale)"
                                                        value={loc.phone || ''}
                                                        onChange={(e) => {
                                                            const newLocs = [...formData.footerData.locations];
                                                            newLocs[index].phone = e.target.value;
                                                            setFormData({ ...formData, footerData: { ...formData.footerData, locations: newLocs } });
                                                        }}
                                                    />
                                                    <Input
                                                        placeholder="Orari (es. Lun-Dom: 12-23)"
                                                        value={loc.opening_hours || ''}
                                                        onChange={(e) => {
                                                            const newLocs = [...formData.footerData.locations];
                                                            newLocs[index].opening_hours = e.target.value;
                                                            setFormData({ ...formData, footerData: { ...formData.footerData, locations: newLocs } });
                                                        }}
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        const newLocs = formData.footerData.locations.filter((_, i) => i !== index);
                                                        setFormData({ ...formData, footerData: { ...formData.footerData, locations: newLocs } });
                                                    }}
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {formData.footerData.locations.length === 0 && (
                                        <p className="text-sm text-muted-foreground italic text-center py-4 border border-dashed rounded-lg">
                                            Nessuna sede aggiunta.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Socials */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-bold">Social Network</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setFormData({
                                            ...formData,
                                            footerData: {
                                                ...formData.footerData,
                                                socials: [...formData.footerData.socials, { platform: 'other', url: '' }]
                                            }
                                        })}
                                        className="gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Aggiungi Social
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {formData.footerData.socials.map((social, index) => (
                                        <div key={index} className="flex gap-3 items-start">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                                                <Select
                                                    value={social.platform}
                                                    onValueChange={(value) => {
                                                        const newSocials = [...formData.footerData.socials];
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        newSocials[index].platform = value as any;
                                                        setFormData({ ...formData, footerData: { ...formData.footerData, socials: newSocials } });
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Social" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="facebook">Facebook</SelectItem>
                                                        <SelectItem value="instagram">Instagram</SelectItem>
                                                        <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
                                                        <SelectItem value="website">Sito Web</SelectItem>
                                                        <SelectItem value="other">Altro</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <Input
                                                    className="md:col-span-2"
                                                    placeholder="URL Profilo"
                                                    value={social.url}
                                                    onChange={(e) => {
                                                        const newSocials = [...formData.footerData.socials];
                                                        newSocials[index].url = e.target.value;
                                                        setFormData({ ...formData, footerData: { ...formData.footerData, socials: newSocials } });
                                                    }}
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    const newSocials = formData.footerData.socials.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, footerData: { ...formData.footerData, socials: newSocials } });
                                                }}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {formData.footerData.socials.length === 0 && (
                                        <p className="text-sm text-muted-foreground italic text-center py-4 border border-dashed rounded-lg">
                                            Nessun social aggiunto.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={updateTenantMutation.isPending}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-6 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl text-lg hover:scale-[1.02]"
                    >
                        {updateTenantMutation.isPending ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                <span>Salvataggio...</span>
                            </>
                        ) : (
                            <span>Salva Modifiche</span>
                        )}
                    </Button>
                </div>
            </form>

            {/* Gestione Abbonamento */}
            <Card className="border-purple-100 shadow-sm bg-gradient-to-br from-white to-purple-50">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                            <span className="text-xl">💳</span>
                        </div>
                        <div>
                            <CardTitle>Abbonamento</CardTitle>
                            <CardDescription>Gestisci il tuo piano e i pagamenti.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {tenant?.subscription_tier === 'premium' ? (
                        <PremiumSubscription status={tenant?.subscription_status} />
                    ) : (
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-purple-100">
                            <div>
                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                    Stato:
                                    <span className="uppercase text-xs px-2 py-1 rounded-full font-bold tracking-wider bg-orange-100 text-orange-700">
                                        Free (Piano Gratuito)
                                    </span>
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    Passa a Premium per sbloccare il menu pubblico.
                                </p>
                            </div>
                            <Button
                                onClick={() => window.location.href = '/dashboard?activate=true'} // Or logic to open modal
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                            >
                                Attiva Premium
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Sicurezza e Password */}
            <Card>
                <CardHeader>
                    <CardTitle>Sicurezza</CardTitle>
                    <CardDescription>Aggiorna la password del tuo account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Nuova Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Conferma Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button
                            type="button" // Important: type button prevents form submit of the main form
                            onClick={handlePasswordChange}
                            disabled={isUpdatingPassword || !newPassword || !confirmPassword}
                            variant="secondary"
                            className="bg-gray-100 hover:bg-gray-200 text-gray-900"
                        >
                            {isUpdatingPassword ? 'Aggiornamento...' : 'Aggiorna Password'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Gestione Account */}
            <Card className="shadow-sm border-red-200 overflow-hidden">
                <div className="relative z-10 p-6">
                    <h2 className="text-xl font-bold text-red-600 mb-2">
                        ZONA PERICOLOSA ⚠️
                    </h2>
                    <p className="text-gray-600 mb-6">
                        In questa sezione puoi gestire le azioni sensibili relative al tuo account.
                    </p>

                    {tenant?.subscription_tier === 'premium' && tenant?.subscription_status === 'active' && (
                        <CancelSubscriptionSection />
                    )}

                    <div className="bg-red-50 rounded-xl p-4 border border-red-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-red-800 mb-1">Reset Menu Completo</h3>
                            <p className="text-sm text-red-600">
                                Cancella TUTTI i piatti e le categorie. Le immagini verranno rimosse. Le impostazioni del ristorante rimangono.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            type="button"
                            onClick={() => setShowResetMenuModal(true)}
                            className="bg-white border text-red-600 hover:bg-red-50 border-red-200"
                        >
                            Reset Menu
                        </Button>
                    </div>

                    <div className="mt-6 bg-red-50 rounded-xl p-4 border border-red-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-red-800 mb-1">Elimina Account</h3>
                            <p className="text-sm text-red-600">
                                L&apos;eliminazione dell&apos;account è irreversibile. Tutti i tuoi dati, menu e impostazioni verranno cancellati permanentemente.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="bg-white border text-red-600 hover:bg-red-50 border-red-200"
                        >
                            Elimina Account
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Reset Menu Confirmation Modal */}
            {
                showResetMenuModal && (
                    <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
                        <Card className="max-w-md w-full animate-in fade-in zoom-in duration-200 shadow-2xl">
                            <CardHeader className="text-center pb-2">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">🍽️</span>
                                </div>
                                <CardTitle className="text-xl">Resettare il Menu?</CardTitle>
                                <CardDescription>
                                    Verranno eliminati <span className="font-bold text-red-600">tutti i piatti e le categorie</span>. Questa azione è irreversibile. Scrivi <span className="font-bold font-mono bg-gray-100 px-1 rounded">RESET</span> per confermare.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-4">
                                <Input
                                    type="text"
                                    value={resetMenuConfirmation}
                                    onChange={(e) => setResetMenuConfirmation(e.target.value)}
                                    placeholder="RESET"
                                    className="text-center font-bold tracking-widest uppercase border-2 focus-visible:ring-red-500"
                                />
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowResetMenuModal(false);
                                            setResetMenuConfirmation('');
                                        }}
                                        disabled={isResettingMenu}
                                        className="flex-1"
                                    >
                                        Annulla
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={handleResetMenu}
                                        disabled={resetMenuConfirmation.trim().toUpperCase() !== 'RESET' || isResettingMenu}
                                        className="flex-1"
                                    >
                                        {isResettingMenu ? 'Resettando...' : 'Conferma Reset'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            {
                showDeleteModal && (
                    <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
                        <Card className="max-w-md w-full animate-in fade-in zoom-in duration-200 shadow-2xl">
                            <CardHeader className="text-center pb-2">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">⚠️</span>
                                </div>
                                <CardTitle className="text-xl">Sei assolutamente sicuro?</CardTitle>
                                <CardDescription>
                                    Questa azione non può essere annullata. Scrivi <span className="font-bold font-mono bg-gray-100 px-1 rounded">ELIMINA</span> qui sotto per confermare.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-4">
                                <Input
                                    type="text"
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    placeholder="ELIMINA"
                                    className="text-center font-bold tracking-widest uppercase border-2 focus-visible:ring-red-500"
                                />
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setDeleteConfirmation('');
                                        }}
                                        disabled={isDeleting}
                                        className="flex-1"
                                    >
                                        Annulla
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={handleDeleteAccount}
                                        disabled={deleteConfirmation.trim().toUpperCase() !== 'ELIMINA' || isDeleting}
                                        className="flex-1"
                                    >
                                        {isDeleting ? 'Eliminazione...' : 'Elimina tutto'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )
            }
        </div >
    );
}

// Stati di tenants.subscription_status (il piano free è mostrato a parte)
const SUBSCRIPTION_STATUS_LABELS: Record<string, { label: string; className: string }> = {
    active: { label: 'Attivo', className: 'bg-green-100 text-green-700' },
    trialing: { label: 'In prova', className: 'bg-blue-100 text-blue-700' },
    past_due: { label: 'Pagamento non riuscito', className: 'bg-red-100 text-red-700' },
    incomplete: { label: 'Da completare', className: 'bg-red-100 text-red-700' },
    cancelled: { label: 'Terminato', className: 'bg-red-100 text-red-700' },
    suspended: { label: 'Sospeso', className: 'bg-red-100 text-red-700' },
};

function PremiumSubscription({ status }: { status?: string | null }) {
    const { data: details, isLoading } = useSubscriptionDetails(true);
    const endsAt = cancellationEnd(details);
    const renewsAt = !endsAt && details?.current_period_end ? details.current_period_end : null;
    const badge = endsAt
        ? { label: 'Disdetto', className: 'bg-amber-100 text-amber-800' }
        : SUBSCRIPTION_STATUS_LABELS[status ?? ''] ?? { label: 'Premium', className: 'bg-green-100 text-green-700' };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-purple-100">
                <div>
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        Stato:
                        <span className={`uppercase text-xs px-2 py-1 rounded-full font-bold tracking-wider ${badge.className}`}>
                            {badge.label}
                        </span>
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">Hai accesso completo a tutte le funzionalità.</p>
                    {isLoading && <p className="text-xs text-gray-400 mt-2">Caricamento dettagli...</p>}
                    {renewsAt && (
                        <p className="text-xs text-gray-500 mt-2">
                            Prossimo rinnovo: <span className="font-bold">{formatBillingDate(renewsAt)}</span>
                        </p>
                    )}
                    {endsAt && (
                        <p className="text-xs text-gray-500 mt-2">
                            Termina il: <span className="font-bold">{formatBillingDate(endsAt)}</span>
                        </p>
                    )}
                </div>
                <PortalButton label={endsAt ? 'Riattiva abbonamento' : 'Gestisci Abbonamento'} />
            </div>

            {endsAt ? (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="font-bold">Abbonamento disdetto</p>
                    <p className="mt-1">
                        Il menu resta visibile ai clienti fino al {formatBillingDate(endsAt)}. Dopo quella data i clienti
                        vedranno una pagina che li invita a chiedere piatti, prezzi e allergeni al personale; i tuoi dati
                        restano salvati.
                    </p>
                    <p className="mt-1">
                        Hai cambiato idea? Con &quot;Riattiva abbonamento&quot; puoi annullare la disdetta prima di quella data.
                    </p>
                </div>
            ) : null}
        </div>
    );
}

// Nella Zona pericolosa: solo con abbonamento attivo e non già disdetto (dopo la disdetta resta "Riattiva" in alto)
function CancelSubscriptionSection() {
    const { data: details } = useSubscriptionDetails(true);
    if (details?.status !== 'active' || cancellationEnd(details) || !details.current_period_end) return null;

    return (
        <div className="mb-6 bg-red-50 rounded-xl p-4 border border-red-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h3 className="font-bold text-red-800 mb-1">Disdici Abbonamento</h3>
                <p className="text-sm text-red-600">
                    L&apos;abbonamento resta attivo fino al {formatBillingDate(details.current_period_end)} (fine del periodo
                    già pagato) e non verrà rinnovato; da quel giorno il menu non sarà più visibile ai clienti. I tuoi dati
                    restano salvati e puoi riattivarlo in qualsiasi momento.
                </p>
            </div>
            <PortalButton
                action="cancel"
                label="Disdici abbonamento"
                className="bg-white border text-red-600 hover:bg-red-50 border-red-200"
            />
        </div>
    );
}

// Portale clienti di Stripe: carta, fatture, riattivazione; con action 'cancel' si apre sulla disdetta.
function PortalButton({ label, action, className }: { label: string; action?: 'cancel'; className?: string }) {
    const [loading, setLoading] = useState(false);

    const handlePortal = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/stripe/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ returnUrl: window.location.href, action })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error('Impossibile aprire il portale');
                setLoading(false);
            }
        } catch (e) {
            toast.error('Errore di connessione');
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handlePortal}
            variant="outline"
            disabled={loading}
            className={className ?? 'border-purple-200 text-purple-700 hover:bg-purple-50'}
        >
            {loading ? 'Attendere...' : label}
        </Button>
    );
}
