'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Ticket, Bot, BookOpen, User, Settings,
    MessageSquareQuote, Database, Layers, Mail,
    Zap, Clock, ListChecks, HelpCircle, ArrowRight,
    Users
} from 'lucide-react';
import { useAuth } from '@/components/auth/role-guard';

export default function SystemGuidePage() {
    const { user } = useAuth();
    const isStaff = (user?.roles || []).some((r: string) => ['admin', 'agent'].includes(r.toLowerCase())) || ['ADMIN', 'AGENT'].includes((user as any)?.role);

    const [activeTab, setActiveTab] = useState(isStaff ? 'admin' : 'customer');

    useEffect(() => {
        if (isStaff) {
            setActiveTab('admin');
        } else {
            setActiveTab('customer');
        }
    }, [isStaff]);
    return (
        <div className="max-w-6xl mx-auto space-y-8 py-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-3 pb-6 border-b border-white/10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-2">
                    <HelpCircle className="h-4 w-4" />
                    SİSTEM REHBERİ
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Kullanım Kılavuzu & İş Akışları</h1>
                <p className="text-muted-foreground text-lg max-w-3xl">
                    Aluplan Destek platformunun tüm özelliklerini, yapay zeka modüllerini ve günlük operasyonları nasıl yürüteceğinizi adım adım öğrenin.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="bg-white/5 border border-white/10 p-1">
                    <TabsTrigger value="customer" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-bold uppercase tracking-widest px-6">
                        Müşteriler
                    </TabsTrigger>
                    {isStaff && (
                        <TabsTrigger value="admin" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs font-bold uppercase tracking-widest px-6">
                            Destek Ekibi & Yöneticiler
                        </TabsTrigger>
                    )}
                </TabsList>

                {/* =========================================
                    MÜŞTERİ KILAVUZU
                ========================================= */}
                <TabsContent value="customer" className="space-y-8 mt-6">

                    {/* 1. Sisteme Giriş ve Genel Bakış */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm">1</span>
                            Sisteme Giriş ve Genel Bakış
                        </h2>
                        <Card className="bg-gradient-to-br from-slate-900/50 to-transparent border-white/5">
                            <CardContent className="pt-6 space-y-4">
                                <p className="text-slate-300">Sisteme giriş yaptığınızda karşınıza çıkan ilk ekran <strong>Genel Bakış (Dashboard)</strong> ekranıdır. Bu ekranda:</p>
                                <ul className="space-y-2 text-sm text-slate-400">
                                    <li className="flex gap-2 items-start"><ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" /> Devam eden ve cevap bekleyen aktif destek taleplerinizi görebilirsiniz.</li>
                                    <li className="flex gap-2 items-start"><ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" /> Son oluşturulan makalelere hızlıca erişebilirsiniz.</li>
                                    <li className="flex gap-2 items-start"><ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" /> Sizin için paylaşılan sistem duyurularını "Duyurular" panosundan okuyabilirsiniz.</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </section>

                    {/* 2. Yapay Zeka Asistanı Kullanımı */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm">2</span>
                            Yapay Zeka Asistanı Kullanımı
                        </h2>
                        <Card className="bg-gradient-to-br from-emerald-900/20 to-transparent border-white/5">
                            <CardContent className="pt-6 space-y-4">
                                <p className="text-slate-300">Bilet açmadan önce sorununuzu hızlıca çözmek için <strong>Yapay Zeka Asistanı</strong> (/ai) menüsünü kullanmanızı öneririz.</p>
                                <ol className="space-y-4 text-sm text-slate-400 list-decimal pl-5">
                                    <li className="pl-2">Sol menüden <Bot className="inline h-4 w-4 mx-1 text-primary" /> <strong>Yapay Zeka Asistanı</strong> sekmesine tıklayın.</li>
                                    <li className="pl-2">Mesaj kutusuna almak istediğiniz hatayı veya öğrenmek istediğiniz konuyu yazın (Örn: <em>"Duvar çizerken program çöküyor"</em>).</li>
                                    <li className="pl-2">Yapay zeka, tüm bilgi bankasını tarayarak size çözüm adımlarını doğrudan sunacaktır. Çözüm bulunamazsa size bir destek talebi oluşturmanızı önerecektir.</li>
                                </ol>
                                <div className="bg-white/5 p-4 rounded-lg flex gap-3 mt-4 items-start">
                                    <Zap className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                                    <span className="text-sm text-slate-300"><strong>İpucu:</strong> Yapay zeka RAG (Öğrenen Algoritma) kullandığı için, yazılım modüllerinin adını (Örn: AX3000) belirterek soru sorarsanız daha isabetli cevaplar alırsınız.</span>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* 3. Destek Talebi (Bilet) Açma */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm">3</span>
                            Destek Talebi (Bilet) Açma ve Takip
                        </h2>
                        <Card className="bg-gradient-to-br from-blue-900/20 to-transparent border-white/5">
                            <CardContent className="pt-6 space-y-4">
                                <p className="text-slate-300">Konuyu temsilcilere iletmek için <Ticket className="inline h-4 w-4 mx-1 text-blue-400" /> <strong>Destek Taleplerim</strong> sayfasından yeni bir kayıt oluşturabilirsiniz.</p>

                                <div className="space-y-4 border-l-2 border-slate-700 pl-4 ml-2">
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Adım 1: Ürün Seçimi</h4>
                                        <p className="text-sm text-slate-400">Yeni Talep butonuna tıkladıktan sonra, sorunu yaşadığınız ürün ailesini (Örn: ALLPLAN, AX3000) seçin. Bu sayede talebiniz direkt ilgili uzman ekibe yönlendirilir.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Adım 2: Konu ve Detaylar</h4>
                                        <p className="text-sm text-slate-400">Karşılaştığınız sorunu anlatan açık bir başlık ve detayları girin. Zorunluluk derecesini (SLA belirler) seçin.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Adım 3: Dosya Ekleri</h4>
                                        <p className="text-sm text-slate-400">Ekran görüntüsü, PDF veya proje dosyalarını (Maks 10MB) doğrudan sürükleyip bırakarak yükleyebilirsiniz.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </TabsContent>


                {/* =========================================
                    ADMİN & AGENT KILAVUZU
                ========================================= */}
                {isStaff && (
                    <TabsContent value="admin" className="space-y-8 mt-6">

                        {/* 1. Bilet Yönetimi */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/20 text-blue-500 text-sm">1</span>
                                Bilet Kuyruğu (Ticket Management)
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="bg-slate-900/50 border-white/5">
                                    <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><ListChecks className="text-blue-400 h-5 w-5" /> Operasyonel Havuz</CardTitle></CardHeader>
                                    <CardContent className="text-sm text-slate-300 space-y-2">
                                        <p><strong>Bilet Kuyruğu</strong> sayfasında tüm müşterilerden gelen talepler toplanır.</p>
                                        <ul className="list-disc pl-5 space-y-1 text-slate-400">
                                            <li><strong className="text-slate-200">Durum Değiştirme:</strong> Bilet içerisine girip sağ paneldeki dropdown'dan durumu değiştirebilirsiniz (Açık, Cevaplandı, Kapalı).</li>
                                            <li><strong className="text-slate-200">İç Notlar:</strong> Müşterinin göremeyeceği sadece ekip içi notlar almak için <code>İç Not (Internal Only)</code> sekmesini kullanın.</li>
                                            <li><strong className="text-slate-200">Atama:</strong> "Ata" butonunu kullanarak bileti spesifik bir uzman temsilciye devredebilirsiniz.</li>
                                        </ul>
                                    </CardContent>
                                </Card>

                                <Card className="bg-slate-900/50 border-white/5">
                                    <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><Bot className="text-emerald-400 h-5 w-5" /> AI Co-Pilot (Yapay Zeka Destekli Yanıt)</CardTitle></CardHeader>
                                    <CardContent className="text-sm text-slate-300 space-y-2">
                                        <p>Biletin içine girdiğinizde sağ üstte yer alan <strong>"AI Yanıt Taslağı Oluştur"</strong> butonuna basın.</p>
                                        <p className="text-slate-400">
                                            Sistem, müşterinin mesajını ve firmanızın Bilgi Havuzunu tarar. Vektörel veri eşleşmesi yaparak 5-10 saniye içerisinde ilgili dokümanlara atıfta bulunan profesyonel bir taslak hazırlar.
                                            Taslağı onaylayıp kendi tarzınıza göre düzenleyerek müşteriye anında yanıt dönebilirsiniz.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </section>

                        {/* 2. Yapay Zeka / Bilgi Havuzu */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/20 text-blue-500 text-sm">2</span>
                                Bilgi Havuzu & Öğrenme Döngüsü
                            </h2>
                            <Card className="bg-slate-900/50 border-white/5">
                                <CardContent className="pt-6 space-y-6">

                                    <div className="space-y-2">
                                        <h3 className="font-bold flex items-center gap-2 text-white">
                                            <Database className="h-4 w-4 text-emerald-400" />
                                            Bilgi Havuzu (Knowledge Pool) Yönetimi
                                        </h3>
                                        <p className="text-sm text-slate-400">Yapay zekanın cevap verebilmesi için altyapıya sürekli yeni veri sağlamanız gerekir. Bunun 3 yolu vardır:</p>
                                        <ul className="text-sm text-slate-300 space-y-2 pl-4 border-l-2 border-emerald-500/30">
                                            <li><strong>PDF / Dosya Yükleme:</strong> Doğrudan teknik şartnameleri PDF olarak veritabanına ekleyin. Sistem bunları <u>Embedding (Vektör)</u> parçalarına ayırır.</li>
                                            <li><strong>Web Scraper:</strong> Sitenizdeki güncel "Nasıl Yapılır" URL adreslerini sisteme verdiğinizde yapay zeka web sitenizi okuyup hafızasına kaydeder.</li>
                                            <li><strong>Özel Metin (Raw Text):</strong> Sıkça sorulan soruları el ile girerek AI için "Instruction" yaratabilirsiniz.</li>
                                        </ul>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="font-bold flex items-center gap-2 text-white">
                                            <MessageSquareQuote className="h-4 w-4 text-amber-400" />
                                            Öğrenme Döngüsü ve AI Onayları
                                        </h3>
                                        <p className="text-sm text-slate-400">
                                            Müşteriler kapalı biletleri <strong>5 yıldız</strong> ile oyladığında, sistem o çözümün mükemmel olduğunu düşünür. Ancak bu çözümün direkt ana veritabanına yazılmasını önlemek için <strong>AI Onayları</strong> (%/kb-approvals%) sekmesine düşer.
                                            Yönetici olarak bu sekmede çözümün yapay zeka tarafından öğrenilmesini (Onay) veya atlanmasını (Red) seçebilirsiniz.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* 3. CRM & Ürün (Taxonomy) */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/20 text-blue-500 text-sm">3</span>
                                CRM & Ürün (Taksonomi) Yapılandırması
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="bg-slate-900/50 border-white/5 p-4 space-y-2">
                                    <Layers className="h-6 w-6 text-purple-400 mb-2" />
                                    <h3 className="font-bold text-white">Ürünler ve Modüller</h3>
                                    <p className="text-sm text-slate-400">
                                        Müşteri bilet açtığında gördüğü Ürün kartlarını buradan yönetirsiniz. En önemli kısım <strong>Kategoriler ve Anahtar Kelimelerdir.</strong><br /><br />
                                        <em>Taksonomi Kuralı:</em> Kategorilere (Örn: Model Çökmesi) sadece ürün özellikleri (Duvar, Kiriş) değil, müşteri semptomlarını da (kasıyor, siyah ekran, kapanıyor) yazın. AI bu anahtar kelimeleri okuyarak bileti doğru takıma (Triage) yönlendirir.
                                    </p>
                                </Card>
                                <Card className="bg-slate-900/50 border-white/5 p-4 space-y-2">
                                    <Users className="h-6 w-6 text-blue-400 mb-2" />
                                    <h3 className="font-bold text-white">Müşteri ve Ekip Yönetimi</h3>
                                    <p className="text-sm text-slate-400">
                                        Sol panonun <strong>SİSTEM</strong> menüsü altından Müşterileri onaylayabilir ve Destek Ekiplerini (Departmanları) oluşturabilirsiniz.
                                        Biletlerin otomatik atanabilmesi için SLA kurallarını (Kaç saatte yanıt verilecek, mesai saati dışında dursun mu?) Ekip Yönetimi sekmesinden ayarlamayı unutmayın.
                                    </p>
                                </Card>
                            </div>
                        </section>

                    </TabsContent>
                )}

            </Tabs>
        </div>
    );
}
