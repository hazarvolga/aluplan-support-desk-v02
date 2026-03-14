import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

const faqs = [
    {
        question: "Allplan Kurulumu Nasıl Yapılır?",
        answer: "Allplan kurulumu için kurulum dosyasını çalıştırın ve ekrandaki yönergeleri takip edin. Lisans anahtarınızı girmeyi unutmayın.",
        keywords: ["kurulum", "setup", "yükleme"],
    },
    {
        question: "Donanımsal Gereksinimler Nelerdir?",
        answer: "Minimum 16GB RAM, 4GB VRAM'li ekran kartı ve SSD depolama önerilir.",
        keywords: ["donanım", "sistem gereksinimleri", "ekran kartı", "ram"],
    },
    {
        question: "Lisans Etkinleştirme Hatası Alıyorum",
        answer: "Lisans kutusundaki 'C' ile başlayan müşteri numaranızı kontrol edin ve internet bağlantınızın olduğundan emin olun.",
        keywords: ["lisans", "etkinleştirme", "aktivasyon", "hata"],
    },
    {
        question: "BIM Modeli Nasıl Oluşturulur?",
        answer: "BIM modelleri için Allplan'ın dahili mimari elemanlarını kullanmanız veri bütünlüğü için kritiktir.",
        keywords: ["bim", "model", "mimari"],
    },
    {
        question: "Pafta Düzeni Nasıl Ayarlanır?",
        answer: "Layout editörü üzerinden kağıt düzlemi ve ölçek ayarlarını yapabilirsiniz.",
        keywords: ["pafta", "layout", "ölçek"],
    },
    {
        question: "Nitelik (Attribute) Tanımlama Nasıl Yapılır?",
        answer: "Eleman seçiliyken özellikler paletinden veya nitelik yöneticisinden özel nitelikler ekleyebilirsiniz.",
        keywords: ["nitelik", "attribute", "özellik"],
    },
    {
        question: "IFC Dışa Aktarım Ayarları Nelerdir?",
        answer: "IFC 4.0 standardı önerilir. Nesne eşleştirmelerini (Mapping) kontrol etmeyi unutmayın.",
        keywords: ["ifc", "export", "aktarım", "bim"],
    },
    {
        question: "Kalıp Planı Nasıl Hazırlanır?",
        answer: "Allplan içerisindeki Associative Views ve Sections araçlarını kullanarak kalıp planlarını dinamik olarak oluşturabilirsiniz.",
        keywords: ["kalıp", "plan", "kesit", "görünüş"],
    },
    {
        question: "Donatı Detaylandırma Kuralları",
        answer: "TS 500 ve Türkiye Bina Deprem Yönetmeliği standartlarına uygun donatı çapı ve aralıklarını otomatik kontrol ettirebilirsiniz.",
        keywords: ["donatı", "betonarme", "rebar", "detay"],
    },
    {
        question: "PythonParts Nedir?",
        answer: "Allplan içerisinde Python diliyle yazılmış, parametrik olarak kontrol edilebilen akıllı nesnelerdir.",
        keywords: ["python", "part", "parametrik", "akıllı nesne"],
    },
    {
        question: "Müşteri Numarası Nerede Yazar?",
        answer: "Aluplan tarafından size gönderilen lisans sertifikasında veya Allplan 'Help > About' menüsünde yazar.",
        keywords: ["müşteri no", "lisans", "destek"],
    },
    {
        question: "Allplan ile AutoCAD Arasındaki Fark Nedir?",
        answer: "Allplan bir BIM yazılımıdır, AutoCAD ise genel amaçlı bir CAD yazılımıdır. Allplan nesne tabanlıdır ve 3 boyutlu veri üretir.",
        keywords: ["autocad", "bim", "cad", "fark"],
    },
    {
        question: "Otomatik Kesit Nasıl Alınır?",
        answer: "Seçilen düzlem üzerinden 'Section' komutuyla dinamik kesitler oluşturulabilir. Model değiştikçe kesit güncellenir.",
        keywords: ["kesit", "otomotik", "section"],
    },
    {
        question: "Metraj Listeleri Nasıl Alınır?",
        answer: "Reports menüsü altından istediğiniz kategorideki (beton, kalıp, donatı vb.) metrajları Excel veya PDF olarak alabilirsiniz.",
        keywords: ["metraj", "liste", "rapor", "excel"],
    },
    {
        question: "Proje Yedeği (Backup) Nasıl Alınır?",
        answer: "Allmenu üzerinden 'Service > Backup' yolunu izleyerek projelerinizi sıkıştırılmış formatta yedekleyebilirsiniz.",
        keywords: ["yedek", "backup", "allmenu"],
    },
    {
        question: "NDO Dosyası Nedir?",
        answer: "Allplan native veri formatıdır, projeler arası veri transferinde kullanılır.",
        keywords: ["ndo", "format", "dosya"],
    },
    {
        question: "Ekran Kartı Sürücüsü Güncelleme",
        answer: "NVIDIA veya AMD'nin resmi sitesinden 'Studio' tipi sürücüleri indirmeniz önerilir.",
        keywords: ["sürücü", "driver", "grafik", "update"],
    },
    {
        question: "Kısayol Tuşları Nasıl Değiştirilir?",
        answer: "Customize (Özelleştir) menüsünden istediğiniz komuta özel kısayol atayabilirsiniz.",
        keywords: ["kısayol", "shortcut", "tuş"],
    },
    {
        question: "Layer (Katman) Yönetimi",
        answer: "Allplan'da layerlar hiyerarşiktir. Standart layer yapısını bozmadan çalışmanız önerilir.",
        keywords: ["layer", "katman", "hiyerarşi"],
    },
    {
        question: "Çizgi Kalınlıkları ve Renkleri",
        answer: "Pen (Kalem) ayarlarından ölçek bazlı çizgi kalınlıklarını ve renk paletlerini yönetebilirsiniz.",
        keywords: ["kalem", "pen", "renk", "çizgi"],
    },
    {
        question: "Sembol Kütüphanesi Kullanımı",
        answer: "Library paletinden hazır sembolleri sürükle bırak yönetimiyle projeye ekleyebilirsiniz.",
        keywords: ["sembol", "kütüphane", "library"],
    },
    {
        question: "Allplan Share Nedir?",
        answer: "Projelerin bulut tabanlı eşzamanlı olarak birden fazla kullanıcı tarafından çalışılmasını sağlayan hizmettir.",
        keywords: ["share", "bulut", "cloud", "ortak çalışma"],
    },
    {
        question: "Bimplus Entegrasyonu",
        answer: "Modellerinizi Bimplus platformuna yükleyerek çakışma analizi ve revizyon takibi yapabilirsiniz.",
        keywords: ["bimplus", "revizyon", "çakışma"],
    },
    {
        question: "Point Cloud (Nokta Bulutu) İçe Aktarma",
        answer: "Lazer tarama verilerini Allplan içerisine import ederek mevcut durum modellemesi yapabilirsiniz.",
        keywords: ["nokta bulutu", "point cloud", "import"],
    },
    {
        question: "Terrain (Arazi) Modelleme",
        answer: "Digital Terrain Model aracı ile eş yükselti eğrilerinden veya nokta verilerinden arazi oluşturabilirsiniz.",
        keywords: ["arazi", "topografya", "terren"],
    },
    {
        question: "SmartPart vs PythonPart",
        answer: "SmartParts GDL tabanlıdır, PythonParts ise Python tabanlıdır. PythonPartlar daha esnektir ve BIM verisi için uygundur.",
        keywords: ["smartpart", "pythonpart", "fark"],
    },
    {
        question: "Çizim Dosyası (Drawing File) Sayısı",
        answer: "Bir projede 1-9999 arası drawing file kullanılabilir. Dosyaları kategorize etmeniz performansı artırır.",
        keywords: ["dosya", "performans", "drawing file"],
    },
    {
        question: "Allmenu Dil Ayarları",
        answer: "Allmenu Configuration altından arayüz ve raporlama dillerini değiştirebilirsiniz.",
        keywords: ["dil", "language", "allmenu"],
    },
    {
        question: "Pdf Export Ayarları",
        answer: "Pafta çıktıları için 'Export PDF' komutuyla vektörel ve layer bilgilerini koruyarak çıktı alabilirsiniz.",
        keywords: ["pdf", "çıktı", "vektör"],
    },
    {
        question: "Kütüphane Yolu Değiştirme",
        answer: "STD (Standart), USR (Kullanıcı) ve PRJ (Proje) yolları Allmenu üzerinden tanımlanabilir.",
        keywords: ["yol", "path", "kütüphane"],
    },
    {
        question: "Dgn ve Dwg Import Sorunları",
        answer: "Font ve line-style eşleşmeleri için import sırasında konfigürasyon dosyasını (config) doğru seçmelisiniz.",
        keywords: ["dwg", "dgn", "import", "sorun"],
    },
    {
        question: "Görselleştirme (Rendering) Motoru",
        answer: "Allplan, Maxon Cinema 4D motorunu kullanır. RT Render ile gerçek zamanlı önizleme alabilirsiniz.",
        keywords: ["render", "görselleştirme", "cinema 4d"],
    },
    {
        question: "Animasyon Penceresi Ayarları",
        answer: "F4 tuşu ile hızlıca animasyon penceresine geçiş yapabilir, doku ve ışık ayarlarını kontrol edebilirsiniz.",
        keywords: ["animasyon", "3d", "f4"],
    },
    {
        question: "Objelerin 2D/3D Temsili",
        answer: "Akıllı nesneler bakış açısına göre otomatik olarak 2D planda veya 3D görünüşte doğru gösterilir.",
        keywords: ["2d", "3d", "nesne"],
    },
    {
        question: "Çizim Dosyası Durumları",
        answer: "Kırmızı (Aktif), Sarı (Pasif), Gri (Sadece Okunur) dosya durumlarını temsil eder.",
        keywords: ["renk", "durum", "dosya"],
    },
    {
        question: "Wizard (Sihirbaz) Dosyaları",
        answer: "Sık kullanılan kalem, renk ve nesneleri Wizard dosyası olarak kaydedip projelerde hızlıca kullanabilirsiniz.",
        keywords: ["wizard", "sihirbaz", "hız"],
    },
    {
        question: "Object Palette (Nesne Paleti)",
        answer: "Tüm elemanları katman, malzeme veya eleman tipine göre filtreleyip yönetmenizi sağlar.",
        keywords: ["nesne", "filtre", "yönetim"],
    },
    {
        question: "Update (Güncelleme) Yükleme",
        answer: "Allmenu üzerinden 'Check for Updates' komutuyla son servis paketlerini yükleyebilirsiniz.",
        keywords: ["update", "servis paketi", "güncelleme"],
    },
    {
        question: "Hatalı Çizim Kurtarma",
        answer: "Allmenu > Service > Cleanup komutları veritabanı hatalarını gidermede yardımcı olabilir.",
        keywords: ["kurtarma", "hata", "cleanup"],
    },
    {
        question: "Lisans Taşıma (License Transfer)",
        answer: "Lisans yöneticisinden lisansı 'Return' yaparak başka bir bilgisayarda aktif hale getirebilirsiniz.",
        keywords: ["lisans", "taşıma", "bilgisayar"],
    },
    {
        question: "Plan Set (Plane Set) Nedir?",
        answer: "Kat yüksekliklerini ve eleman kotlarını merkezi olarak yönetmenizi sağlayan sistemdir.",
        keywords: ["kot", "yükseklik", "plane set"],
    },
    {
        question: "Güneş Analizi",
        answer: "Lokasyon verisi girilerek yılın belirli gün ve saatlerine göre gölge ve gün ışığı analizi yapılabilir.",
        keywords: ["güneş", "gölge", "analiz"],
    },
    {
        question: "Visual Scripting",
        answer: "Kod yazmadan düğüm tabanlı (node-based) akışlarla parametrik nesne üretme yöntemidir.",
        keywords: ["scripting", "visual", "parametrik"],
    },
    {
        question: "Referans Dosya (XRef) Kullanımı",
        answer: "Büyük projelerde pafta performansını artırmak için drawing file'ları birbirine referans verebilirsiniz.",
        keywords: ["xref", "referans", "performans"],
    },
    {
        question: "Pafta İsimlendirme Standartları",
        answer: "BIM uygulama planına (BEP) uygun kodlama yapmanız koordinasyon için önemlidir.",
        keywords: ["isim", "standart", "bep"],
    },
    {
        question: "Allplan Connection Nedir?",
        answer: "İnşaat mühendisliği için çelik birleşim detaylarını parametrik tasarlayan araçtır.",
        keywords: ["çelik", "birleşim", "bağlantı"],
    },
    {
        question: "Aluplan Destek Hattı",
        answer: "Sorularınız için destek@aluplan.com.tr adresinden veya telefon hattımızdan bize ulaşabilirsiniz.",
        keywords: ["destek", "iletişim", "yardım"],
    }
];

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const prisma = app.get(PrismaService);

    console.log('Restoring 47 FAQ items...');

    try {
        for (const faq of faqs) {
            await prisma.faqEntry.create({
                data: {
                    question: faq.question,
                    answer: faq.answer,
                    tags: faq.keywords,
                    status: 'PUBLISHED' as any,
                    confidenceScore: 0.9,
                    trustScore: 0.8,
                }
            });
        }

        console.log(`Successfully restored ${faqs.length} FAQ items.`);
    } catch (error) {
        console.error('Restoration failed:', error);
    } finally {
        await app.close();
    }
}

bootstrap();
