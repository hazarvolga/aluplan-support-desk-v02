'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState({
        username: '',
        firstName: '',
        lastName: '',
        customerNo: '',
        company: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Şifreler eşleşmiyor.');
            return;
        }

        if (form.customerNo.length < 5 || !form.customerNo.startsWith('C')) {
            setError('Müşteri No formatı geçersiz. Örnek: C300 XX XX XX');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${api.getBaseUrl()}/customers/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: form.username,
                    firstName: form.firstName,
                    lastName: form.lastName,
                    customerNo: form.customerNo,
                    company: form.company,
                    phone: form.phone,
                    email: form.email,
                    password: form.password,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Kayıt sırasında bir hata oluştu.');
            }

            setSuccess(true);
            setTimeout(() => router.push('/login'), 2000);
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="max-w-md w-full mx-4 p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Kayıt Başarılı!</h2>
                    <p className="text-slate-400">Giriş sayfasına yönlendiriliyorsunuz...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
            <div className="max-w-lg w-full mx-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Aluplan Destek</h1>
                    <p className="text-slate-400 mt-2">Müşteri Kayıt Formu</p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 space-y-5"
                >
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Kullanıcı Adı */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Kullanıcı Adı <span className="text-red-400">*</span>
                        </label>
                        <Input
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="Kullanıcı adınızı girin"
                            required
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                        />
                    </div>

                    {/* Ad & Soyad */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Ad <span className="text-red-400">*</span>
                            </label>
                            <Input
                                name="firstName"
                                value={form.firstName}
                                onChange={handleChange}
                                placeholder="Adınız"
                                required
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Soyad <span className="text-red-400">*</span>
                            </label>
                            <Input
                                name="lastName"
                                value={form.lastName}
                                onChange={handleChange}
                                placeholder="Soyadınız"
                                required
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                            />
                        </div>
                    </div>

                    {/* Müşteri No */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Müşteri No <span className="text-red-400">*</span>
                        </label>
                        <Input
                            name="customerNo"
                            value={form.customerNo}
                            onChange={handleChange}
                            placeholder="Örnek: C300 XX XX XX"
                            required
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Masaüstü {'>'} Allmenü 202x {'>'} Bilgi Kullanıcı Numarası
                        </p>
                    </div>

                    {/* Firma */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Firma <span className="text-red-400">*</span>
                        </label>
                        <Input
                            name="company"
                            value={form.company}
                            onChange={handleChange}
                            placeholder="Firma adınız"
                            required
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                        />
                    </div>

                    {/* Cep No */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Cep No
                        </label>
                        <Input
                            name="phone"
                            type="tel"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="05XX XXX XX XX"
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            E-posta <span className="text-red-400">*</span>
                        </label>
                        <Input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="ornek@firma.com"
                            required
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                        />
                    </div>

                    {/* Şifre & Onay */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Şifre <span className="text-red-400">*</span>
                            </label>
                            <Input
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="En az 6 karakter"
                                required
                                minLength={6}
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Şifre Onayı <span className="text-red-400">*</span>
                            </label>
                            <Input
                                name="confirmPassword"
                                type="password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder="Şifrenizi tekrar girin"
                                required
                                minLength={6}
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-sky-600 hover:bg-sky-500 text-white font-medium py-2.5"
                    >
                        {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                    </Button>

                    <p className="text-center text-sm text-slate-400">
                        Zaten hesabınız var mı?{' '}
                        <a href="/login" className="text-sky-400 hover:text-sky-300">
                            Giriş Yapın
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}
