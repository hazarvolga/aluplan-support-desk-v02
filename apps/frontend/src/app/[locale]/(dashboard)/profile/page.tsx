'use client';

export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HotinfoGrid } from "@/components/ui/hotinfo-grid";
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, KeyRound, Monitor, UploadCloud, AlertCircle, AlertTriangle, ShieldCheck, History, Clock, FileText, Activity, LayoutDashboard, QrCode, Smartphone, SmartphoneNfc, CheckCircle2, UserCircle, Save, Loader2, Trash2, Mail, BellRing, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslations, useLocale } from 'next-intl';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function ProfilePage() {
    const t = useTranslations('profile');
    const tc = useTranslations('common');
    const locale = useLocale();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // User Data
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [industry, setIndustry] = useState('');
    const [customerNo, setCustomerNo] = useState('');
    const [contractStatus, setContractStatus] = useState('');
    const [accountStatus, setAccountStatus] = useState('');
    const [crmVerified, setCrmVerified] = useState(false);
    const [roles, setRoles] = useState<string[]>([]);
    const [hotinfoData, setHotinfoData] = useState<any>(null);
    const [hotinfoUpdatedAt, setHotinfoUpdatedAt] = useState<string | null>(null);
    const [uploadingHotinfo, setUploadingHotinfo] = useState(false);

    // Auth password fields
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // MFA State
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [mfaLoading, setMfaLoading] = useState(false);
    const [mfaSecret, setMfaSecret] = useState<{ secret: string; qrCodeDataUrl: string } | null>(null);
    const [mfaToken, setMfaToken] = useState('');
    const [mfaDialogOpen, setMfaDialogOpen] = useState(false);

    // Email Preferences State
    const [emailPrefs, setEmailPrefs] = useState<{ emailType: string; enabled: boolean }[]>([]);
    const [prefsLoading, setPrefsLoading] = useState(false);

    useEffect(() => {
        loadProfile();
        loadEmailPreferences();
    }, []);

    const loadEmailPreferences = async () => {
        setPrefsLoading(true);
        try {
            const data = await api.preferences.getEmail();
            setEmailPrefs(data);
        } catch (error) {
            console.error('Failed to load email preferences', error);
        } finally {
            setPrefsLoading(false);
        }
    };

    const handleToggleEmailPref = async (type: string, current: boolean) => {
        try {
            await api.preferences.updateEmail(type, !current);
            setEmailPrefs(prev => prev.map(p => p.emailType === type ? { ...p, enabled: !current } : p));
            toast.success(t('toasts.pref_updated'));
        } catch (error) {
            toast.error(t('toasts.pref_failed'));
        }
    };

    const loadProfile = async () => {
        setLoading(true);
        try {
            // we use the auth me endpoint which returns core details
            const user = await api.auth.me();
            setFullName(user.fullName || '');
            setEmail(user.email || '');
            setRoles(user.role ? [user.role] : []);
            setAccountStatus(user.status || 'ACTIVE');
            // @ts-ignore
            setMfaEnabled(user.mfaEnabled || false);

            if (user.customerProfile) {
                setHotinfoData(user.customerProfile.hotinfoData);
                setHotinfoUpdatedAt(user.customerProfile.hotinfoUpdatedAt || null);
            }

            // Get full details including customerProfile
            try {
                const fullDetails = await api.users.get(user.id);
                if (fullDetails?.customerProfile) {
                    const cp = fullDetails.customerProfile;
                    setPhone(cp.phoneNumber || '');
                    setCompanyName(cp.companyName || '');
                    setJobTitle(cp.jobTitle || '');
                    setIndustry(cp.industry || '');
                    setCustomerNo(cp.customerNo || '');
                    setContractStatus(cp.contractStatus || '-');
                    setCrmVerified(cp.crmVerified || false);
                } else if (fullDetails?.phone) {
                    setPhone(fullDetails.phone);
                }
            } catch (e) { /* ignore secondary load failure */ }

        } catch (error) {
            console.error('Failed to load profile', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password && password !== confirmPassword) {
            toast.error(t('toasts.password_mismatch'));
            return;
        }

        setSaving(true);
        try {
            const body: any = {
                fullName,
                phone,
                companyName,
                jobTitle,
                industry
            };

            if (password) body.password = password;

            await api.users.updateProfile(body);
            toast.success(t('toasts.profile_updated'));
            setPassword('');
            setConfirmPassword('');
            loadProfile(); // Refresh to see any auto-generated customerNo
        } catch (error: any) {
            console.error(error);
            toast.error(t('toasts.update_failed') + ': ' + (error.message || t('toasts.unknown_error')));
        } finally {
            setSaving(false);
        }
    };

    const handleHotinfoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.hxl')) {
            toast.error(t('toasts.hxl_invalid'));
            return;
        }

        setUploadingHotinfo(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/customers/me/hotinfo', formData);

            setHotinfoData(response.hotinfo);
            setHotinfoUpdatedAt(new Date().toISOString());
            toast.success(t('toasts.hotinfo_updated'));
        } catch (error: any) {
            toast.error(t('toasts.hotinfo_failed'));
            console.error(error);
        } finally {
            setUploadingHotinfo(false);
        }
    };

    const handleGenerateMfa = async () => {
        setMfaLoading(true);
        try {
            const data = await api.auth.mfa.generate();
            setMfaSecret(data);
        } catch (error: any) {
            toast.error(t('toasts.mfa_gen_failed'));
        } finally {
            setMfaLoading(false);
        }
    };

    const handleEnableMfa = async () => {
        if (!mfaSecret) return;
        setMfaLoading(true);
        try {
            await api.auth.mfa.setup(mfaToken, mfaSecret.secret);
            setMfaEnabled(true);
            setMfaDialogOpen(false);
            setMfaSecret(null);
            setMfaToken('');
            toast.success(t('toasts.mfa_enabled'));
        } catch (error: any) {
            toast.error(t('toasts.mfa_verify_failed') + ': ' + error.message);
        } finally {
            setMfaLoading(false);
        }
    };

    const handleDisableMfa = async () => {
        if (!confirm(t('mfa.confirm_disable'))) return;
        setMfaLoading(true);
        try {
            await api.auth.mfa.disable();
            setMfaEnabled(false);
            toast.success(t('toasts.mfa_disabled'));
        } catch (error: any) {
            toast.error(t('toasts.mfa_disable_failed'));
        } finally {
            setMfaLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto mt-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground">
                    {t('subtitle')}
                </p>
            </div>

            {hotinfoData?.isAllplanUser && !hotinfoUpdatedAt && (
                <div className="bg-red-500/10 border-l-4 border-red-500 p-4 mb-6 rounded-r-md animate-in slide-in-from-top-2 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 animate-pulse" />
                        <div>
                            <h3 className="text-red-500 font-bold text-[13px] tracking-widest uppercase mb-1">{t('hotfix_warning_title')}</h3>
                            <p className="text-[13px] text-red-400/90 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: t('hotfix_warning_desc') }} />
                        </div>
                    </div>
                </div>
            )}

            <Card className="relative overflow-hidden">
                {crmVerified && (
                    <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {t('crm_verified')}
                    </div>
                )}
                <CardHeader>
                    <CardTitle>{t('personal_info')}</CardTitle>
                    <CardDescription>
                        {t('roles_info', {
                            roles: roles.map(r => {
                                const roleKey = r.toLowerCase();
                                return t.has(`roles.${roleKey}`) ? t(`roles.${roleKey}`) : r;
                            }).join(', ')
                        })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">{t('labels.email_static')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    disabled
                                    className="bg-muted cursor-not-allowed opacity-70"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fullName">{t('labels.full_name')}</Label>
                                <Input
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">{t('labels.phone')}</Label>
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder={t('placeholders.phone')}
                                    disabled={crmVerified}
                                    className={crmVerified ? 'bg-muted/50 cursor-not-allowed' : ''}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customerNo">{t('labels.customer_no_static')}</Label>
                                <Input
                                    id="customerNo"
                                    value={customerNo || t('placeholders.no_crm')}
                                    disabled
                                    className="bg-muted cursor-not-allowed font-mono text-xs opacity-70"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">{t('labels.company_name')}</Label>
                                <Input
                                    id="companyName"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder={t('placeholders.company_name')}
                                    disabled={crmVerified}
                                    className={crmVerified ? 'bg-muted/50 cursor-not-allowed' : ''}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="industry">{t('labels.industry')}</Label>
                                <Input
                                    id="industry"
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                    placeholder={t('placeholders.industry')}
                                    disabled={crmVerified}
                                    className={crmVerified ? 'bg-muted/50 cursor-not-allowed' : ''}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="jobTitle">{t('labels.job_title')}</Label>
                                <Input
                                    id="jobTitle"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    placeholder={t('placeholders.job_title')}
                                    disabled={crmVerified}
                                    className={crmVerified ? 'bg-muted/50 cursor-not-allowed' : ''}
                                />
                            </div>
                            <div className="space-y-2 flex flex-col justify-end">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-muted-foreground">{t('labels.subscription')}</Label>
                                        <div className="text-xs font-semibold bg-sky-500/10 text-sky-600 py-1 px-2 rounded border border-sky-500/20 text-center">
                                            {t.has(`contract_status.${contractStatus}`) ? t(`contract_status.${contractStatus}`) : contractStatus}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-muted-foreground">{t('labels.status')}</Label>
                                        <div className="text-xs font-semibold bg-amber-500/10 text-amber-600 py-1 px-2 rounded border border-amber-500/20 text-center">
                                            {t.has(`account_status.${accountStatus}`) ? t(`account_status.${accountStatus}`) : accountStatus}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t mt-6">
                            <h3 className="text-lg font-medium mb-4">{t('password_change.title')}</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {t('password_change.description')}
                            </p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">{t('password_change.new_password')}</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={t('placeholders.new_password')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">{t('password_change.confirm_password')}</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder={t('placeholders.confirm_password')}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                                {saving ? t('saving_button') : t('save_button')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        {t('mfa.title')}
                    </CardTitle>
                    <CardDescription>
                        {t('mfa.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-slate-200 dark:border-slate-800">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">{t('mfa.status_label')}</p>
                            <div className="flex items-center gap-1.5">
                                {mfaEnabled ? (
                                    <>
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">{t('mfa.active')}</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{t('mfa.inactive')}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {mfaEnabled ? (
                                <Button variant="destructive" size="sm" onClick={handleDisableMfa} disabled={mfaLoading}>
                                    {mfaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                    {t('mfa.disable_btn')}
                                </Button>
                            ) : (
                                <Dialog open={mfaDialogOpen} onOpenChange={(open) => {
                                    setMfaDialogOpen(open);
                                    if (open && !mfaSecret) handleGenerateMfa();
                                }}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                                            <QrCode className="w-4 h-4 mr-2" />
                                            {t('mfa.setup_btn')}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>{t('mfa.dialog_title')}</DialogTitle>
                                            <DialogDescription>
                                                {t('mfa.dialog_desc')}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="flex flex-col items-center justify-center p-6 space-y-6">
                                            {mfaLoading && !mfaSecret ? (
                                                <div className="flex flex-col items-center gap-3 py-8">
                                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{t('mfa.key_creating')}</span>
                                                </div>
                                            ) : mfaSecret ? (
                                                <>
                                                    <div className="bg-white p-4 rounded-xl border-4 border-slate-100 shadow-xl">
                                                        <QRCodeSVG value={`otpauth://totp/Aluplan%20Support:${email}?secret=${mfaSecret.secret}&issuer=Aluplan%20Support`} size={200} />
                                                    </div>
                                                    <div className="w-full space-y-4">
                                                        <div className="p-3 bg-muted/50 rounded-lg border border-white/5 text-center">
                                                            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">{t('mfa.manual_key_label')}</p>
                                                            <code className="text-sm font-mono text-primary select-all tracking-wider">{mfaSecret.secret}</code>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="mfaToken">{t('mfa.token_label')}</Label>
                                                            <Input
                                                                id="mfaToken"
                                                                placeholder={t('mfa.token_placeholder')}
                                                                maxLength={6}
                                                                className="text-center text-xl tracking-[0.5em] font-mono"
                                                                value={mfaToken}
                                                                onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, ''))}
                                                            />
                                                            <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest transition-all">
                                                                {t('mfa.token_hint')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : null}
                                        </div>
                                        <DialogFooter className="flex sm:justify-between items-center w-full">
                                            <Button variant="ghost" onClick={() => setMfaDialogOpen(false)}>{t('mfa.cancel')}</Button>
                                            <Button
                                                onClick={handleEnableMfa}
                                                disabled={mfaLoading || mfaToken.length !== 6}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px]"
                                            >
                                                {mfaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('mfa.verify_enable')}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-blue-500" />
                        {t('notifications.title')}
                    </CardTitle>
                    <CardDescription>
                        {t('notifications.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {prefsLoading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : emailPrefs.map((pref) => (
                            <div key={pref.emailType} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-slate-700/30">
                                        {pref.emailType === 'ANNOUNCEMENTS' && <BellRing className="w-4 h-4 text-amber-400" />}
                                        {pref.emailType === 'TICKETS' && <History className="w-4 h-4 text-emerald-400" />}
                                        {pref.emailType === 'SYSTEM' && <ShieldAlert className="w-4 h-4 text-rose-400" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">
                                            {t(`notifications.types.${pref.emailType}`)}
                                        </p>
                                        <p className="text-[11px] text-slate-400">
                                            {t(`notifications.descriptions.${pref.emailType}`)}
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${pref.enabled ? 'bg-primary' : 'bg-slate-700'}`}
                                    onClick={() => handleToggleEmailPref(pref.emailType, pref.enabled)}
                                >
                                    <span
                                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${pref.enabled ? 'translate-x-5' : 'translate-x-1'}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Monitor className="w-5 h-5 text-brand-500" />
                                {t('hotinfo.title')}
                            </CardTitle>
                            <CardDescription>
                                {t('hotinfo.description')}
                            </CardDescription>
                        </div>
                        {hotinfoData && (
                            <div className="flex flex-col items-end">
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{t('hotinfo.last_update')}</div>
                                <div className="text-xs text-slate-400">{hotinfoUpdatedAt ? new Date(hotinfoUpdatedAt).toLocaleDateString(locale) : '-'}</div>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {hotinfoData ? (
                        <div className="space-y-4">
                            <HotinfoGrid data={hotinfoData} />

                            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs">
                                <CheckCircle2 className="w-4 h-4" />
                                {t('hotinfo.status_up_to_date')}
                            </div>

                            <div className="pt-2">
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".hxl"
                                        onChange={handleHotinfoUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        disabled={uploadingHotinfo}
                                    />
                                    <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800" disabled={uploadingHotinfo}>
                                        {uploadingHotinfo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Monitor className="w-4 h-4 mr-2" />}
                                        {t('hotinfo.update_btn')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl bg-orange-500/5 border border-orange-500/20 space-y-4 text-center">
                            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-orange-500" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-slate-200">{t('hotinfo.missing_title')}</h3>
                                <p className="text-xs text-slate-400 max-w-[280px]">
                                    {t('hotinfo.missing_desc')}
                                </p>
                            </div>
                            <div className="relative w-full max-w-[200px]">
                                <input
                                    type="file"
                                    accept=".hxl"
                                    onChange={handleHotinfoUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    disabled={uploadingHotinfo}
                                />
                                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={uploadingHotinfo}>
                                    {uploadingHotinfo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Monitor className="w-4 h-4 mr-2" />}
                                    {t('hotinfo.upload_btn')}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
