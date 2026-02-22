import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, CheckCircle2, Database, Zap, BookOpen, ChevronRight, MessageCircle, Clock, Layers, Sparkles } from 'lucide-react';

export default function SystemGuidePage() {
    return (
        <div className="max-w-5xl mx-auto space-y-8 py-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight">Sistem Rehberi & AI Altyapısı</h1>
                <p className="text-muted-foreground text-lg">
                    Platformun akıllı yönlendirme, yapay zeka analizleri ve bilgi bankası sistemlerinin nasıl birbirine entegre çalıştığını öğrenin.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-brand-900/40 to-transparent border-white/5">
                    <CardHeader>
                        <Bot className="h-8 w-8 text-brand-400 mb-2" />
                        <CardTitle>Akıllı Triage (Yönlendirme)</CardTitle>
                        <CardDescription>Biletler nasıl otomatik kategorize ediliyor?</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                        Müşteriler bir bilet oluşturduğunda, önce sistemde tanımlı <strong>Ürün veya Modülü</strong> seçer. Seçim yapıldıktan sonra sistem arka planda Ollama LLM altyapısını kullanarak biletin içeriğini analiz eder ve ilgili ürünün alt <strong>kategorilerindeki anahtar kelimelere</strong> göre talebi otomatik etiketler.
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-900/40 to-transparent border-white/5">
                    <CardHeader>
                        <Database className="h-8 w-8 text-blue-400 mb-2" />
                        <CardTitle>Vektör Veritabanı & RAG</CardTitle>
                        <CardDescription>Geçmiş biletlerden nasıl öğreniyor?</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                        Sistem, çözülmüş ve müşteri tarafından <strong>4 veya 5 yıldız (yüksek memnuniyet)</strong> ile puanlanmış biletleri otomatik olarak vektörize eder (Embedding). Yeni bir bilet geldiğinde yapay zeka, standart kategorilerin yanı sıra bu <strong>başarılı geçmiş biletlerle benzerlik (Similarity Search)</strong> kurarak etiketleme doğruluğunu artırır.
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-900/40 to-transparent border-white/5">
                    <CardHeader>
                        <Zap className="h-8 w-8 text-green-400 mb-2" />
                        <CardTitle>Otomatik Çözüm Önerileri</CardTitle>
                        <CardDescription>Müşteriye beklemeden direkt cevap sunma</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                        Bilet açıldığında sistem "Bilgi Havuzu" (URL'ler, PDF'ler vb.) içerisindeki dokümanları analiz eder. Gelen sorun eğer standart bir SSS veya dokümantasyon üzerinden çözülebiliyorsa, biletin içerisine otomatik olarak <strong>bir yapay zeka yanıt taslağı veya çözüm önerisi</strong> bırakır.
                    </CardContent>
                </Card>
            </div>

            <div className="mt-12 space-y-6 pt-8 border-t border-white/10">
                <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4">
                    <Zap className="h-6 w-6 text-brand-400" />
                    Gelişmiş Operasyonel Özellikler
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-br from-emerald-900/40 to-transparent border-white/5">
                        <CardHeader>
                            <MessageCircle className="h-8 w-8 text-emerald-400 mb-2" />
                            <CardTitle className="text-lg">WhatsApp Omni-channel Köprüsü</CardTitle>
                            <CardDescription>Meta Business API üzerinden doğrudan iletişim</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            Müşterileriniz WhatsApp üzerinden yazdığında, sistem otomatik olarak telefon numarası üzerinden lead eşleşmesi yapar ve bilet oluşturur. Temsilci panel içinden cevap verdiğinde, bu yanıt otomatik olarak müşterinin WhatsApp hattına iletilir.
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-900/40 to-transparent border-white/5">
                        <CardHeader>
                            <Clock className="h-8 w-8 text-amber-400 mb-2" />
                            <CardTitle className="text-lg">Gelişmiş SLA & Mesai Kontrolü</CardTitle>
                            <CardDescription>Gerçek çalışma saatlerine dayalı zamanlama</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            SLA süreleri artık sadece mesai saatleri (09:00 - 18:00) içerisinde işlemektedir. Hafta sonları ve tanımlı resmi tatiller süre hesabına katılmaz, böylece destek ekibinizin gerçek performans analizi korunur.
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-900/40 to-transparent border-white/5">
                        <CardHeader>
                            <Layers className="h-8 w-8 text-blue-400 mb-2" />
                            <CardTitle className="text-lg">Acente Verimliliği & Toplu İşlemler</CardTitle>
                            <CardDescription>Yüzlerce bileti saniyeler içinde yönetin</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            Bilet listesinde çoklu seçim yaparak durum güncelleme (RESOLVED, CLOSED), öncelik değiştirme veya toplu atama yapabilirsiniz. Alt kısımda beliren "Yüzen Komut Çubuğu" ile operasyonel hızınızı artırın.
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-900/40 to-transparent border-white/5">
                        <CardHeader>
                            <Sparkles className="h-8 w-8 text-purple-400 mb-2" />
                            <CardTitle className="text-lg">AI Co-pilot (Yanıt Taslakları)</CardTitle>
                            <CardDescription>Bilgi havuzu sentezi ile saniyeler içinde yanıt</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            Karmaşık teknik sorularda, yapay zeka bilgi bankasındaki dökümanları ve bilet geçmişini tarayarak size profesyonel bir yanıt taslağı sunar. Taslağı tek tuşla mesaj alanına aktarıp üzerinde düzenleme yapabilirsiniz.
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="mt-12 space-y-6 pt-8 border-t border-white/10">
                <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4">
                    <BookOpen className="h-6 w-6 text-brand-400" />
                    Sıkça Sorulan Sorular & İş Akışları
                </h2>

                <div className="grid grid-cols-1 gap-4">
                    <Card className="bg-slate-900/40 border-white/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-brand-400 flex items-center gap-2">
                                <ChevronRight className="h-4 w-4" />
                                1. Müşteriler bilet oluştururken neden yeni ürün kartlarını görmüyor?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-4">
                            <p>
                                Eğer <strong>Ürünler & Modüller</strong> (Products) sayfasında hiçbir ürün tanımlamadıysanız, sistem müşteri deneyimini sekteye uğratmamak adına doğrudan klasik bilet formuyla açılır ve ürün seçim adımını gizler.
                            </p>
                            <div className="bg-brand-500/5 border border-brand-500/10 p-3 rounded-md flex items-start gap-3 text-slate-200">
                                <CheckCircle2 className="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
                                <p className="text-xs"><strong>Çözüm:</strong> Sol taraftaki "Ürünler & Modüller" menüsüne gidip sisteminizdeki platformları ekleyin. Ardından müşteriler bilet açarken bu ürünleri kart formatında seçecektir.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/40 border-white/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-brand-400 flex items-center gap-2">
                                <ChevronRight className="h-4 w-4" />
                                2. Yapay Zekanın Akıllı Etiketleme Kalitesini Nasıl Artırabilirim? (Taksonomi Rehberi)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-4">
                            <p>
                                Sistemimiz, biletleri sınıflandırırken yalnızca ürün özelliklerine ("duvar", "kolon", "ifc") değil, <strong>Sorun/Niyet odaklı (Symptom-driven) gelişmiş bir hibrit taksonomi (Option C V3)</strong> kullanır.
                            </p>
                            <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-md space-y-3">
                                <h4 className="text-blue-400 font-medium">Bunun anlamı nedir?</h4>
                                <p className="text-slate-300">
                                    AEC/BIM sektöründeki global destek tecrübelerine (Autodesk, Graphisoft modelleri) göre kullanıcılar "Render ayarlarım bozuldu" demek yerine genellikle "Program çöküyor", "Kasıyor" veya "Siyah ekran veriyor" şeklinde kriz kelimeleri kullanırlar.
                                </p>
                                <p className="text-slate-300">
                                    Sistem yapay zekası (RAG), kullanıcıların bu panik/kriz kelimelerini anlar. Bu yüzden ürünlerinize (<span className="text-brand-400">Ürünler & Modüller</span> sekmesinde) anahtar kelime girerken şu kuralları izleyin:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-300 italic">
                                    <li><strong>Sorun Belirten Kelimeler Ekleyin:</strong> Teknik isimlerin yanına mutlaka "bozuk dosya", "çökme", "yavaşlama", "açılmıyor" gibi niyet kelimeleri ekleyin.</li>
                                    <li><strong>Eğitim (How-to) Niyetleri:</strong> "Nasıl yapılır", "ayarlar", "kütüphane ekleme" gibi eğitim amaçlı sorguları yakalayacak kelimeler girin.</li>
                                    <li><strong>Benzerlik (Similarity):</strong> Kapatılan biletlerde müşteri memnuniyet puanı yüksek çıkarsa o sorun otomatik olarak Vektör Veritabanına alınır. Ne kadar çok bilet başarılı çözülürse, yapay zeka jenerik kelimeleri o kadar iyi eşleştirir.</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/40 border-white/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-brand-400 flex items-center gap-2">
                                <ChevronRight className="h-4 w-4" />
                                3. Bilgi Bankası (Knowledge Base) ile Bilgi Havuzu (Pool) Farkı Nedir?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-3">
                            <div>
                                <Badge variant="outline" className="bg-brand-500/10 text-brand-400 border-brand-500/20 mb-1">Bilgi Havuzu</Badge>
                                <p className="text-xs">Yapay Zekanın okuyup analiz ettiği, müşteriye doğrudan gösterilmeyen devasa dokümantasyon merkezidir. Sadece otomatik cevap üretirken kaynak olarak kullanılır.</p>
                            </div>
                            <div>
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 mb-1">Bilgi Bankası</Badge>
                                <p className="text-xs">Müşterilerinizin tarayıcılarında görebileceği, sizin tasarladığınız SSS veya Yardım Makaleleridir.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/40 border-white/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-brand-400 flex items-center gap-2">
                                <ChevronRight className="h-4 w-4" />
                                4. WhatsApp İletişim Süreci Nasıl İşliyor? Temsilci Numarası Gerekli mi?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-3">
                            <p>
                                <strong>Hayır, temsilcilerin bireysel numara girmesine gerek yoktur.</strong> Sistem kurumsal bir WhatsApp Business hattı üzerinden (Meta API) çalışır:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-xs">
                                <li><strong>Merkezi Hat:</strong> Tüm mesajlar tek bir kurumsal hat üzerinden gönderilir ve alınır.</li>
                                <li><strong>Otomatik Eşleşme:</strong> Gelen mesajın telefon numarası CRM'deki müşteri profili ile eşleşirse, bilet otomatik olarak o müşteri adına açılır.</li>
                                <li><strong>Doğrudan Yanıt:</strong> Temsilci panelden cevap yazdığında, sistem bu yanıtı müşterinin WhatsApp'ına kurumsal kimliğinizle iletir.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
