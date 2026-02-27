// ============================================================
// Enterprise Announcement Template Library
// Auto-seeded on first run. All templates use MJML partials
// which are automatically wrapped with base.mjml branding.
// ===================================
// NOTE: Name stripping: Use clean text names without emojis.
// ===================================

export interface TemplateDefinition {
  name: string;
  topic: string;
  subject: string;
  contentMjml: string;
}

export const ENTERPRISE_TEMPLATES: TemplateDefinition[] = [

  // ─── PRODUCT ────────────────────────────────────────────────
  {
    name: 'Ürün Yol Haritası Güncellemesi',
    topic: 'Product',
    subject: 'Aluplan 2026 Ürün Yol Haritası Yayınlandı',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#0EA5E9">Ürün Yol Haritamızı Güncelledik</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Sizin geri bildirimlerinizle şekillendirilen 2026 yol haritamızı paylaşmaktan heyecan duyuyoruz. Bu çeyrek boyunca odaklanacağımız üç ana alan:</mj-text>
    <mj-text color="#475569"><ul><li><b>Q1:</b> Gelişmiş CRM entegrasyonu ve raporlama</li><li><b>Q2:</b> AI destekli analitik dashboard</li><li><b>Q3:</b> Mobil uygulama yenileme</li></ul></mj-text>
    <mj-button background-color="#0EA5E9" color="white" border-radius="8px" href="{{brand.help_center_url}}">Yol Haritasını İncele</mj-button>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'Yaklaşan Özellik Ön İzlemesi',
    topic: 'Product',
    subject: 'Yakında Geliyor: [Özellik Adı] – İlk Bakış',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#6366F1">Yakında Geliyor!</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Çok yakında kullanıma sunulacak olan yeni özelliğimize ilk gözatışı yapın. Bu özellik, [süreç adı] sürecinizi kökten değiştirecek.</mj-text>
    <mj-section background-color="#f5f3ff" border-radius="8px" padding="15px">
      <mj-column><mj-text color="#4c1d95" font-weight="bold">Tahmini Yayın: [Tarih]</mj-text></mj-column>
    </mj-section>
    <mj-button background-color="#6366F1" color="white" border-radius="8px" href="#">Bekleme Listesine Katıl</mj-button>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'Beta Program Daveti',
    topic: 'Product',
    subject: 'Özel Davet: [Özellik] Beta Programına Katılın',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#8B5CF6">Beta Programına Davetlisiniz</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Seçili müşterilerimize sunduğumuz özel beta programımıza katılmak ister misiniz? Yeni [özellik adı]'nı piyasaya çıkmadan önce test edip geri bildiriminizi paylaşın.</mj-text>
    <mj-text color="#475569"><ul><li>✅ Erken erişim</li><li>✅ Doğrudan ürün ekibiyle iletişim</li><li>✅ Beta katılımcısı rozeti</li></ul></mj-text>
    <mj-button background-color="#8B5CF6" color="white" border-radius="8px" href="#">Beta'ya Katıl</mj-button>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'Yeni Modül Lansmanı',
    topic: 'Product',
    subject: 'Tanıtım: Yeni [Modül Adı] Modülü Yayında',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#0EA5E9">Yeni Modül: [Modül Adı]</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Kullanıcılarımızın en çok talep ettiği modülü bugün itibarıyla tüm abonelerimize açıyoruz.</mj-text>
    <mj-text color="#475569"><ul><li>Merkezi yönetim paneli</li><li>Otomatik raporlama</li><li>Mevcut iş akışınızla entegrasyon</li></ul></mj-text>
    <mj-button background-color="#0EA5E9" color="white" border-radius="8px" href="{{brand.help_center_url}}">Modülü Keşfet</mj-button>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'API Versiyon Değişikliği',
    topic: 'Product',
    subject: 'Önemli: API v[X] Değişiklik Bildirimi',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#D97706">API Versiyon Değişikliği Bildirimi</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">API entegrasyonunuzu etkileyebilecek bir değişiklik hakkında sizi bilgilendirmek istiyoruz.</mj-text>
    <mj-section background-color="#fffbeb" border="1px solid #fcd34d" border-radius="8px" padding="16px">
      <mj-column>
        <mj-text color="#92400e"><b>Etkilenen Endpoint:</b> /api/v1/[endpoint]</mj-text>
        <mj-text color="#92400e"><b>Değişiklik Tarihi:</b> [Tarih]</mj-text>
        <mj-text color="#92400e"><b>Aksiyon Süresi:</b> X gün</mj-text>
      </mj-column>
    </mj-section>
    <mj-button background-color="#D97706" color="white" border-radius="8px" href="{{brand.help_center_url}}">Migration Rehberi</mj-button>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'Yeni Entegrasyon Duyurusu',
    topic: 'Product',
    subject: 'Yeni Entegrasyon: [Platform Adı] Artık Bağlanabilir',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#10B981">Yeni Entegrasyon Aktif!</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Platformunuzu [Platform Adı] ile entegre etmek artık tek tıkla mümkün. Ekosisteminizi genişletin ve manuel işlemleri ortadan kaldırın.</mj-text>
    <mj-button background-color="#10B981" color="white" border-radius="8px" href="{{brand.help_center_url}}">Entegrasyonu Kur</mj-button>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'Deprecated Feature Duyurusu',
    topic: 'Product',
    subject: 'Bilgilendirme: [Özellik] Kullanımdan Kaldırılıyor',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#64748b">Önemli: Özellik Sonlandırılıyor</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6"><b>[Özellik Adı]</b> özelliği, <b>[Tarih]</b> itibarıyla kullanımdan kaldırılacaktır. Yerine önerilen alternatif: <b>[Alternatif]</b>.</mj-text>
    <mj-text color="#475569">Lütfen bu tarihten önce geçişinizi tamamlayın. Yardım için destek ekibimizle iletişime geçin.</mj-text>
    <mj-button background-color="#64748b" color="white" border-radius="8px" href="{{brand.help_center_url}}">Migration Rehberi</mj-button>
  </mj-column>
</mj-section>`,
  },

  // ─── SECURITY ────────────────────────────────────────────────
  {
    name: 'Güvenlik Denetimi Sonuç Özeti',
    topic: 'Security',
    subject: 'Güvenlik Denetimi Tamamlandı – Özet Rapor',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#6366F1">Güvenlik Denetimi Tamamlandı</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Bağımsız güvenlik firması tarafından yürütülen yıllık güvenlik denetimimiz başarıyla tamamlandı.</mj-text>
    <mj-section background-color="#f0fdf4" border="1px solid #86efac" border-radius="8px" padding="15px">
      <mj-column>
        <mj-text color="#166534"><b>Sonuç:</b> Kritik Açık Tespit Edilmedi ✅</mj-text>
        <mj-text color="#166534"><b>Denetleyen Firma:</b> [Firma Adı]</mj-text>
        <mj-text color="#166534"><b>Denetim Kapsamı:</b> Altyapı, API ve Uygulama Katmanı</mj-text>
      </mj-column>
    </mj-section>
    <mj-button background-color="#6366F1" color="white" border-radius="8px" href="{{brand.help_center_url}}">Özet Raporu İndir</mj-button>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'ISO/SOC 2 Sertifikasyon Güncellemesi',
    topic: 'Security',
    subject: 'Haberdar Olun: ISO 27001 / SOC 2 Sertifikasyonumuz Yenilendi',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#4F46E5">Sertifikasyonumuz Yenilendi</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Uluslararası güvenlik standartlarına olan bağlılığımızı sürdürüyor ve <b>ISO 27001 / SOC 2 Type II</b> sertifikamızı başarıyla yeniledik.</mj-text>
    <mj-text color="#475569">Verileriniz, en yüksek güvenlik standartları çerçevesinde korunmaya devam etmektedir.</mj-text>
    <mj-button background-color="#4F46E5" color="white" border-radius="8px" href="{{brand.help_center_url}}">Sertifikayı Görüntüle</mj-button>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'KVKK/GDPR Uyumluluk Güncellemesi',
    topic: 'Compliance',
    subject: 'Veri Gizliliği Politikamız Güncellendi (KVKK/GDPR)',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#0284C7">Gizlilik Politikası Güncellemesi</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">KVKK ve GDPR gerekliliklerine tam uyum kapsamında gizlilik politikamızı güncelliyoruz. Değişiklikler <b>[Tarih]</b> itibarıyla yürürlüğe girecektir.</mj-text>
    <mj-text color="#475569"><ul><li>Veri saklama süreleri güncellendi</li><li>Üçüncü taraf paylaşım şartları netleştirildi</li><li>Veri silme talep süreci iyileştirildi</li></ul></mj-text>
    <mj-button background-color="#0284C7" color="white" border-radius="8px" href="{{brand.help_center_url}}">Güncel Politikayı İncele</mj-button>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'Yeni Güvenlik Özelliği: IP Kısıtlama',
    topic: 'Security',
    subject: 'Yeni: IP Whitelist Güvenlik Özelliği Yayında',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#DC2626">Yeni Güvenlik Özelliği Aktif</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Hesabınıza yalnızca belirlediğiniz IP adreslerinden erişilmesini sağlayan <b>IP Whitelist</b> özelliği artık tüm Enterprise planlarda mevcut.</mj-text>
    <mj-text color="#475569"><ul><li>Coğrafi kısıtlama desteği</li><li>Dinamik IP listesi yönetimi</li><li>Anlık uyarı sistemi</li></ul></mj-text>
    <mj-button background-color="#DC2626" color="white" border-radius="8px" href="{{brand.help_center_url}}">Aktif Et</mj-button>
  </mj-column>
</mj-section>`,
  },

  // ─── OPERATIONS ─────────────────────────────────────────────
  {
    name: 'Aylık Sistem Performans Raporu',
    topic: 'Operations',
    subject: '[Ay] Ayı Sistem Performans Raporu',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#0EA5E9">[Ay] Performans Özeti</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Geçen ayki sistem performansımızı şeffaf bir şekilde paylaşıyoruz.</mj-text>
    <mj-section background-color="#f8fafc" border="1px solid #e2e8f0" border-radius="8px" padding="15px">
      <mj-column>
        <mj-text color="#0f172a" font-size="14px"><b>🟢 Uptime:</b> %99,97</mj-text>
        <mj-text color="#0f172a" font-size="14px"><b>⚡ Ortalama Yanıt Süresi:</b> 187ms</mj-text>
        <mj-text color="#0f172a" font-size="14px"><b>🚨 Kritik Olaylar:</b> 0</mj-text>
        <mj-text color="#0f172a" font-size="14px"><b>📊 İşlenen İstek:</b> 2.4M</mj-text>
      </mj-column>
    </mj-section>
    <mj-button background-color="#0EA5E9" color="white" border-radius="8px" href="{{brand.help_center_url}}">Tam Raporu Görüntüle</mj-button>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'Uptime & SLA Performans Özeti',
    topic: 'Operations',
    subject: 'SLA Performans Özeti – [Dönem]',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#10B981">SLA Taahhütlerimizi Karşıladık</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Bu dönemde tüm SLA metriklerimiz hedeflerin üzerinde gerçekleşti.</mj-text>
    <mj-section background-color="#f0fdf4" border-radius="8px" padding="15px">
      <mj-column>
        <mj-text color="#166534" font-size="24px" font-weight="bold" align="center">%99.98</mj-text>
        <mj-text color="#166534" align="center" font-size="14px">Aylık Uptime</mj-text>
      </mj-column>
    </mj-section>
    <mj-button background-color="#10B981" color="white" border-radius="8px" href="{{brand.help_center_url}}">SLA Detayları</mj-button>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'Altyapı İyileştirmesi Tamamlandı',
    topic: 'Infrastructure',
    subject: 'Altyapı Yükseltme Tamamlandı – Sistem Daha Hızlı',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#0EA5E9">Altyapı Yükseltme Tamamlandı</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Sistemlerimizde gerçekleştirdiğimiz altyapı yükseltmesi başarıyla tamamlandı. Bu güncellemeyle birlikte fark edecekleriniz:</mj-text>
    <mj-text color="#475569"><ul><li>%35 daha hızlı sayfa yüklenme</li><li>Daha güçlü veritabanı kapasitesi</li><li>Geliştirilmiş CDN yapısı</li></ul></mj-text>
    <mj-button background-color="#0EA5E9" color="white" border-radius="8px" href="{{brand.help_center_url}}">Teknik Detaylar</mj-button>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'Yeni Sunucu Lokasyonu Aktif',
    topic: 'Infrastructure',
    subject: 'Yeni Sunucu Bölgesi: [Bölge] Artık Aktif',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#0284C7">Yeni Bölge Aktif: [Bölge Adı]</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Verilerinizin daha hızlı ve güvenli işlenmesi için [Bölge Adı] sunucu merkezimizi devreye aldık. Bu bölgedeki kullanıcılar için gecikme süresi önemli ölçüde azalacak.</mj-text>
    <mj-text color="#475569"><ul><li>GDPR uyumlu veri saklama</li><li>%45 daha düşük gecikme</li><li>Otomatik failover desteği</li></ul></mj-text>
  </mj-column>
</mj-section>`,
  },

  // ─── AI & TECHNOLOGY ─────────────────────────────────────────
  {
    name: 'AI Motoru Güncellendi',
    topic: 'AI & Technology',
    subject: 'AI Motorumuz Güncellendi – Daha Akıllı, Daha Hızlı',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#7C3AED">AI Motorumuz v[X] Yayında</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Destek platformumuzun kalbindeki AI motorunu güncelledik. Yeni sürümde:</mj-text>
    <mj-text color="#475569"><ul><li>Model doğruluğu <b>%12 arttı</b></li><li>Yanıt süresi <b>%28 azaldı</b></li><li>Türkçe dil desteği geliştirildi</li></ul></mj-text>
    <mj-button background-color="#7C3AED" color="white" border-radius="8px" href="{{brand.help_center_url}}">AI Özelliklerini Keşfet</mj-button>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'AI Accuracy Raporu',
    topic: 'AI & Technology',
    subject: 'AI Model Performans Raporu – [Dönem]',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#7C3AED">AI Model Performans Özeti</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">AI modellerimizin bu dönemdeki performans metrikleri:</mj-text>
    <mj-section background-color="#faf5ff" border="1px solid #d8b4fe" border-radius="8px" padding="15px">
      <mj-column>
        <mj-text color="#6b21a8" font-size="14px"><b>🎯 Doğruluk Oranı:</b> %94.7</mj-text>
        <mj-text color="#6b21a8" font-size="14px"><b>⚡ Ortalama Yanıt:</b> 320ms</mj-text>
        <mj-text color="#6b21a8" font-size="14px"><b>📈 İyileşme:</b> Geçen aya göre +%8.3</mj-text>
      </mj-column>
    </mj-section>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'AI Feature Beta Testi',
    topic: 'AI & Technology',
    subject: 'AI Beta: Yeni [AI Özelliği] Özelliğini Test Edin',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#7C3AED">AI Beta Programı: [Özellik Adı]</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Seçili kullanıcılarımıza yeni AI özelliğimizi test etme fırsatı sunuyoruz. Bu özellik, [görev adı] sürecinizi tamamen otomatize edecek.</mj-text>
    <mj-button background-color="#7C3AED" color="white" border-radius="8px" href="#">Beta'ya Başvur</mj-button>
  </mj-column>
</mj-section>`,
  },

  // ─── CHANGE MANAGEMENT ───────────────────────────────────────
  {
    name: 'Breaking Change Duyurusu',
    topic: 'Change Management',
    subject: 'KRİTİK: Breaking Change – Lütfen Okuyun',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#B91C1C">Breaking Change Bildirimi</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Mevcut entegrasyonunuzu etkileyecek önemli bir API değişikliği yayınlıyoruz. Bu değişiklik geri dönüşümsüzdür.</mj-text>
    <mj-section background-color="#fff1f2" border="2px solid #fca5a5" border-radius="8px" padding="15px">
      <mj-column>
        <mj-text color="#991b1b" font-size="14px"><b>Değişen:</b> [Endpoint/Method]</mj-text>
        <mj-text color="#991b1b" font-size="14px"><b>Yürürlük:</b> [Tarih]</mj-text>
        <mj-text color="#991b1b" font-size="14px"><b>Uyum Süresi:</b> [X] Gün</mj-text>
      </mj-column>
    </mj-section>
    <mj-button background-color="#B91C1C" color="white" border-radius="8px" href="{{brand.help_center_url}}">Migration Kılavuzu</mj-button>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'API Deprecation Takvimi',
    topic: 'Change Management',
    subject: 'API Deprecation Takvimi – Gerekli Aksiyonlar',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#D97706">API Sonlandırma Takvimi</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Aşağıdaki API endpointleri planlanmış tarihler itibarıyla kullanımdan kaldırılacaktır:</mj-text>
    <mj-section background-color="#fffbeb" border-radius="8px" padding="15px">
      <mj-column>
        <mj-text color="#92400e" font-size="14px"><b>/api/v1/[endpoint-1]</b> → [Tarih]</mj-text>
        <mj-text color="#92400e" font-size="14px"><b>/api/v1/[endpoint-2]</b> → [Tarih]</mj-text>
      </mj-column>
    </mj-section>
    <mj-button background-color="#D97706" color="white" border-radius="8px" href="{{brand.help_center_url}}">Detaylı Rehber</mj-button>
  </mj-column>
</mj-section>`,
  },

  // ─── EDUCATION ───────────────────────────────────────────────
  {
    name: 'Yeni Eğitim İçeriği Yayında',
    topic: 'Education',
    subject: 'Yeni: [Konu] Eğitim Serisi Yayında',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#0369A1">Yeni Eğitim Serisi Başladı</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Platformumuzdan maksimum verim almanızı sağlamak için yeni bir eğitim serisi hazırladık. <b>[Konu Adı]</b> hakkında bilmeniz gereken her şey artık tek yerde.</mj-text>
    <mj-text color="#475569"><ul><li>📹 Video dersler</li><li>📄 Adım adım kılavuzlar</li><li>🎯 Pratik alıştırmalar</li></ul></mj-text>
    <mj-button background-color="#0369A1" color="white" border-radius="8px" href="{{brand.help_center_url}}">Eğitime Başla</mj-button>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'Webinar Daveti',
    topic: 'Education',
    subject: 'Webinar Daveti: [Konu] – [Tarih]',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#0369A1">Sizi Webinarımıza Davet Ediyoruz</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Uzmanlarımızın rehberliğinde, <b>[konu]</b> hakkında derinlemesine bilgi edinme fırsatı!</mj-text>
    <mj-section background-color="#eff6ff" border-radius="8px" padding="15px">
      <mj-column>
        <mj-text color="#1e40af" font-size="14px"><b>📅 Tarih:</b> [Tarih]</mj-text>
        <mj-text color="#1e40af" font-size="14px"><b>🕐 Saat:</b> [Saat] (TSİ)</mj-text>
        <mj-text color="#1e40af" font-size="14px"><b>🎤 Konuşmacı:</b> [Ad Soyad]</mj-text>
      </mj-column>
    </mj-section>
    <mj-button background-color="#0369A1" color="white" border-radius="8px" href="#">Kayıt Ol</mj-button>
  </mj-column>
</mj-section>`,
  },

  // ─── PERFORMANCE REPORTS ─────────────────────────────────────
  {
    name: 'Yıl Sonu Performans Özeti',
    topic: 'Performance Reports',
    subject: '2025 Yılı Performans Özeti – Birlikte Başardıklarımız',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#0EA5E9">2025 Yılı Geride Kaldı</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Bu yıl sizinle birlikte çok şey başardık. İşte 2025 performansımızın öne çıkan rakamları:</mj-text>
    <mj-section background-color="#f0f9ff" border-radius="8px" padding="15px">
      <mj-column>
        <mj-text color="#0369a1" font-size="14px"><b>🎫 İşlenen Destek Talepleri:</b> 48,920</mj-text>
        <mj-text color="#0369a1" font-size="14px"><b>⚡ Ort. Çözüm Süresi:</b> 4.2 saat</mj-text>
        <mj-text color="#0369a1" font-size="14px"><b>😊 Müşteri Memnuniyeti:</b> %97.3</mj-text>
        <mj-text color="#0369a1" font-size="14px"><b>🟢 Sistem Uptime:</b> %99.95</mj-text>
      </mj-column>
    </mj-section>
    <mj-button background-color="#0EA5E9" color="white" border-radius="8px" href="{{brand.help_center_url}}">Tam Raporu İncele</mj-button>
  </mj-column>
</mj-section>`,
  },

  // ─── STRATEGIC UPDATES ───────────────────────────────────────
  {
    name: '2026 Ürün Vizyonu',
    topic: 'Strategic Updates',
    subject: '2026 Yılı Ürün Vizyonumuzu Paylaşıyoruz',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#0EA5E9">2026: Daha Akıllı, Daha Hızlı</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">2026 yılında odaklanacağımız üç temel stratejik alan ve bunların sizi nasıl etkileyeceği:</mj-text>
    <mj-text color="#475569"><ul><li><b>🤖 AI First:</b> Her modülde yerleşik yapay zeka</li><li><b>🌍 Global Scale:</b> 15 yeni ülkede hizmet</li><li><b>🔒 Zero Trust:</b> Güvenlik mimarisi yenileme</li></ul></mj-text>
    <mj-button background-color="#0EA5E9" color="white" border-radius="8px" href="{{brand.help_center_url}}">Vizyonumuzu Okuyun</mj-button>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'Yeni Referans Müşteri',
    topic: 'Strategic Updates',
    subject: '[Şirket Adı] Ailemize Katıldı',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#D97706">Hoş Geldiniz, [Şirket Adı]!</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">[Sektörün] lider kurumlarından biri olan <b>[Şirket Adı]</b>, Aluplan ailesine katıldı. Bu iş birliğinden heyecan duyuyoruz!</mj-text>
    <mj-text color="#475569">[Şirket Adı], destek süreçlerini dijitalleştirmek ve müşteri memnuniyetini artırmak için Aluplan platformunu tercih etti.</mj-text>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'Uluslararası Genişleme',
    topic: 'Strategic Updates',
    subject: 'Aluplan [Ülke Adı]\'nda! Yeni Bölge Açılışı',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#10B981">Yeni Bölge: [Ülke/Bölge Adı]</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Uluslararası genişleme stratejimiz kapsamında [Ülke/Bölge Adı]'nda resmi olarak hizmet vermeye başlıyoruz. Bu bölgedeki müşterilerimiz artık yerel dil ve para birimi desteğinden yararlanabilecek.</mj-text>
    <mj-button background-color="#10B981" color="white" border-radius="8px" href="{{brand.help_center_url}}">Daha Fazla Bilgi</mj-button>
  </mj-column>
</mj-section>`,
  },

  // ─── CRISIS MANAGEMENT ──────────────────────────────────────
  {
    name: 'Veri İhlali İnceleme Başlatıldı',
    topic: 'Security',
    subject: 'ÖNEMLİ: Güvenlik Olayı Hakkında Bilgilendirme',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#B91C1C">Güvenlik Olayı Bildirimi</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Sistemlerimizde şüpheli bir aktivite tespit edilmiş olup güvenlik ekibimiz tarafından kapsamlı bir inceleme başlatılmıştır.</mj-text>
    <mj-section background-color="#fff1f2" border="1px solid #fca5a5" border-radius="8px" padding="15px">
      <mj-column>
        <mj-text color="#991b1b" font-size="14px">Şu anda verilerinizin etkilendiğine dair bir bulguya ulaşılmamıştır. İnceleme tamamlandığında sizi bilgilendireceğiz.</mj-text>
      </mj-column>
    </mj-section>
    <mj-text color="#475569" font-size="14px">Önlem olarak şifrenizi güncellemenizi öneririz.</mj-text>
    <mj-button background-color="#B91C1C" color="white" border-radius="8px" href="#">Şifremi Güncelle</mj-button>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'Olay Çözüldü – Teknik Rapor',
    topic: 'Security',
    subject: 'Güncelleme: Güvenlik Olayı Çözüldü',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#10B981">Olay Çözüldü</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Daha önce bildirdiğimiz güvenlik olayı tamamen çözüme kavuşturulmuştur. Detaylı teknik raporu paylaşıyoruz:</mj-text>
    <mj-section background-color="#f0fdf4" border-radius="8px" padding="15px">
      <mj-column>
        <mj-text color="#166534" font-size="14px"><b>Kök Neden:</b> [Açıklama]</mj-text>
        <mj-text color="#166534" font-size="14px"><b>Etkilenen Sistem:</b> [Sistem Adı]</mj-text>
        <mj-text color="#166534" font-size="14px"><b>Çözüm Süresi:</b> [X] saat</mj-text>
        <mj-text color="#166534" font-size="14px"><b>Etkilenen Kullanıcı:</b> Yok</mj-text>
      </mj-column>
    </mj-section>
    <mj-button background-color="#10B981" color="white" border-radius="8px" href="{{brand.help_center_url}}">Tam Raporu Oku</mj-button>
  </mj-column>
</mj-section>`,
  },

  // ─── COMMUNITY ───────────────────────────────────────────────
  {
    name: 'Community Güncellemesi',
    topic: 'Community',
    subject: 'Aluplan Topluluğu – Bu Ay Ne Oldu?',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#0EA5E9">Topluluk Haberleri</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Aluplan topluluğunda bu ay gerçekleşenleri ve öne çıkan içerikleri paylaşıyoruz.</mj-text>
    <mj-text color="#475569"><ul><li>🏆 En Aktif Üye: [Ad]</li><li>💬 Yanıtlanan Soru: 342</li><li>📝 Yeni Makale: 18</li></ul></mj-text>
    <mj-button background-color="#0EA5E9" color="white" border-radius="8px" href="#">Topluluğa Katıl</mj-button>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'Geliştirici Programı Duyurusu',
    topic: 'Community',
    subject: 'Aluplan Developer Program – Erken Erişim',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#7C3AED">Geliştirici Programı Başlıyor</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Aluplan ekosistemi üzerine uygulama geliştirmek isteyen yazılımcılar için <b>Developer Program</b> başlıyor.</mj-text>
    <mj-text color="#475569"><ul><li>🔑 Özel API erişimi</li><li>📚 Tam dokümantasyon</li><li>💰 Marketplace gelir paylaşımı</li><li>🎁 Geliştirici hibeleri</li></ul></mj-text>
    <mj-button background-color="#7C3AED" color="white" border-radius="8px" href="#">Başvur</mj-button>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'Partner Portal Güncellemesi',
    topic: 'Community',
    subject: 'Partner Portal: Yeni Araçlar ve Kaynaklar Eklendi',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#0369A1">Partner Portal Güncellendi</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Partner portalımıza yeni kaynaklar ve araçlar ekledik. İş birliğinizi daha verimli yönetmenize yardımcı olacak özellikler sizi bekliyor.</mj-text>
    <mj-text color="#475569"><ul><li>📊 Yeni partner analitik dashboard</li><li>📝 Güncel satış materyalleri</li><li>🎓 Partner sertifikasyon programı</li></ul></mj-text>
    <mj-button background-color="#0369A1" color="white" border-radius="8px" href="#">Portala Git</mj-button>
  </mj-column>
</mj-section>`,
  },

  // ─── CUSTOMER SEGMENT ────────────────────────────────────────
  {
    name: 'VIP Müşteri Özel Bilgilendirme',
    topic: 'Strategic Updates',
    subject: '[İsim], Sizin İçin Özel Bir Güncelleme',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#D97706">Değerli Müşterimiz,</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Kurumsal müşterilerimize sunduğumuz öncelikli bilgilendirme kapsamında, yaklaşan değişiklikler hakkında sizi önceden bilgilendirmek istedik.</mj-text>
    <mj-text color="#475569">Hesap yöneticiniz [Ad Soyad] bu konuda size destek vermek için hazır.</mj-text>
    <mj-button background-color="#D97706" color="white" border-radius="8px" href="#">Yöneticimle Görüş</mj-button>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'Yükseltme Önerisi',
    topic: 'Strategic Updates',
    subject: 'Kullanımınızı Analiz Ettik – Daha İyisini Hak Ediyorsunuz',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#0EA5E9">Plan Yükseltme Önerisi</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Kullanım analiz verilerinize baktık. Mevcut planınızın sınırlarına yaklaştığınızı görüyoruz. Bir üst plana geçerek:</mj-text>
    <mj-text color="#475569"><ul><li>Sınırsız kullanıcı ekleme</li><li>Öncelikli destek hattı</li><li>Gelişmiş raporlama araçları</li></ul></mj-text>
    <mj-button background-color="#0EA5E9" color="white" border-radius="8px" href="#">Planları Karşılaştır</mj-button>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'Şifre Politikası Güncellemesi',
    topic: 'Security',
    subject: 'Güvenlik Uyarısı: Şifre Politikamız Değişti',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#6366F1">Daha Güçlü Şifreler, Daha Güvenli Hesaplar</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Veri güvenliğinizi korumak amacıyla şifre politikamızı güncelledik. Yeni kurallar:</mj-text>
    <mj-text color="#475569"><ul><li>Minimum 12 karakter</li><li>En az bir özel karakter</li><li>90 günde bir zorunlu değişim</li></ul></mj-text>
    <mj-button background-color="#6366F1" color="white" border-radius="8px" href="#">Şifremi Şimdi Güncelle</mj-button>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'Veri Merkezi Lokasyon Güncellemesi',
    topic: 'Compliance',
    subject: 'Bilgilendirme: Verileriniz Artık [Bölge]\'de Depolanıyor',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#0284C7">Veri Yerelliği Güncellemesi</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Regülasyon uyumu kapsamında verilerinizin fiziksel depolama konumunu [Bölge] veri merkezimize taşıdık.</mj-text>
    <mj-text color="#475569">Bu işlem veri güvenliğini artırırken, yerel yasalara tam uyum sağlar.</mj-text>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'Veri Migrasyonu Bildirimi',
    topic: 'Operations',
    subject: 'Planlı Veri Migrasyonu Hakkında Önemli Bilgi',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#64748b">Veri Taşıma İşlemi</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Veritabanı performansını optimize etmek amacıyla <b>[Tarih]</b> tarihinde bir veri migrasyonu gerçekleştireceğiz.</mj-text>
    <mj-section background-color="#f8fafc" border="1px solid #e2e8f0" border-radius="8px" padding="15px">
      <mj-column>
        <mj-text color="#64748b" font-size="14px"><b>Başlangıç:</b> [Saat]</mj-text>
        <mj-text color="#64748b" font-size="14px"><b>Süre:</b> [X] dakika</mj-text>
        <mj-text color="#64748b" font-size="14px"><b>Etki:</b> Salt-okunur mod (Read-only)</mj-text>
      </mj-column>
    </mj-section>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'Sistem Mimarisi Güncellendi',
    topic: 'Infrastructure',
    subject: 'Altyapı Notu: Mikroservis Mimarisine Geçiş Tamamlandı',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#10B981">Daha Esnek, Daha Dayanıklı</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Sistem mimarimizi monolitik yapıdan mikroservis mimarisine başarıyla taşıdık. Bu değişim size:</mj-text>
    <mj-text color="#475569"><ul><li>Hata izolasyonu (Kısmi kesintiler sistemi etkilemez)</li><li>Daha hızlı yeni özellik yayını</li><li>Yüksek yük altında stabilite</li></ul></mj-text>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'AI Kullanım Analizi',
    topic: 'AI & Technology',
    subject: 'Rapor: Kurumunuzun AI Kullanım İstatistikleri',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#7C3AED">AI Verimlilik Raporunuz</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Kurumunuzun son 30 gündeki yapay zeka kullanım verilerini analiz ettik.</mj-text>
    <mj-section background-color="#faf5ff" border-radius="8px" padding="10px">
      <mj-column>
        <mj-text color="#6b21a8" font-size="14px"><b>Otomatik Çözülen:</b> %42</mj-text>
        <mj-text color="#6b21a8" font-size="14px"><b>Tasarruf Edilen Zaman:</b> [X] Saat</mj-text>
      </mj-column>
    </mj-section>
    <mj-button background-color="#7C3AED" color="white" border-radius="8px" href="#">Detaylı Analizi Gör</mj-button>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'Legacy Modül Kaldırılıyor',
    topic: 'Change Management',
    subject: 'Hoşçakal [Eski Modül]: Yeni Yapıya Geçiyoruz',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#B91C1C">Eski Modül Sonlandırma</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">Yenilenen [Yeni Modül Adı] ile birlikte, eski <b>[Legacy Modül Adı]</b> modülünü <b>[Tarih]</b> tarihinde emekliye ayırıyoruz.</mj-text>
    <mj-text color="#475569">Tüm verileriniz otomatik olarak yeni yapıya aktarılmıştır.</mj-text>
    <mj-button background-color="#B91C1C" color="white" border-radius="8px" href="#">Yeni Modülü Dene</mj-button>
  </mj-column>
</mj-section>`,
  },
  {
    name: 'Yeni Partner Entegrasyonu',
    topic: 'Strategic Updates',
    subject: 'Güçlerimizi Birleştirdik: [Partner Adı] Entegrasyonu Yayında',
    contentMjml: `<mj-section>
  <mj-column>
    <mj-text font-size="22px" font-weight="bold" color="#D97706">Stratejik İş Ortaklığı</mj-text>
    <mj-text font-size="15px" color="#334155" line-height="1.6">[Partner Adı] ile gerçekleştirdiğimiz derin entegrasyon sayesinde artık verilerinizi iki platform arasında pürüzsüzce taşıyabilirsiniz.</mj-text>
    <mj-button background-color="#D97706" color="white" border-radius="8px" href="#">Entegrasyon Rehberi</mj-button>
  </mj-column>
</mj-section>`,
  },
];
