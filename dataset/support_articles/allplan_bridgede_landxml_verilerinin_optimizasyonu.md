# Allplan Bridge'de LandXML Verilerinin Optimizasyonu

Kullanım Senaryosu: Altyapı (köprü, tünel, yol) projelerinde diğer disiplinlerden (örneğin yol veya ray mühendislerinden) gelen eksen ve güzergah verilerinin köprü tasarımına hatasız entegre edilmesi.
Adım Adım Optimizasyon:
Bimplus Üzerinden İçe Aktarım: Karmaşık projelerde LandXML formatındaki yatay ve düşey eksen (alignment) ile arazi verilerini manuel oluşturmak yerine, Bimplus platformu üzerinden doğrudan Allplan Bridge'e aktarın. Bu işlem verilerin sisteme parametrik olarak kaydedilmesini sağlar.
Parametrik Kesit Bağlantısı: Tasarladığınız köprü veya yol enkesit şablonlarını (cross-sections) içe aktarılan bu LandXML eksenine bağlayın.
Otomatik Revizyon Yönetimi: Sistemin tamamen parametrik çalışması sayesinde, LandXML güzergahında (örneğin kurp yarıçapında) bir değişiklik olduğunda sadece ana eksen verisini güncelleyin. Modele bağlı tüm 3B köprü geometrisi, alt yapı elemanları ve yapısal analiz modeli otomatik olarak yeni güzergaha adapte olur.
Bu verimli iş akışını da arka planda hazırladığımız Kapsamlı Destek Bilgi Bankası raporuna ekleyeyim mi? Sırada incelemek istediğiniz başka bir konu var mı?
Precast modülünde NC Generator sürümleri arasındaki farklar nelerdir?

Kaynaklara göre, Allplan Precast modülündeki NC Generator (Üretim Verisi Oluşturucu) temel olarak iki ana formatı ve bunların çeşitli alt sürümlerini destekler:
PXML (Sürüm 1.2 ve 1.3): Geometri aktarımında daha esnektir. Örneğin, açık çokgenlerin (open polygons) doğrudan arayüz üzerinden aktarılmasına izin verir. Ayrıca PXML 1.3 sürümü, "Delegate" (temsilci) dosyası aracılığıyla sipariş niteliklerinin (Order Attributes) doğrudan NC verilerine yazılmasını destekler.
UniCAM / Unitechnik (Sürüm 4.0, 5.0, 5.1, 5.2, 6.0 ve 6.1): Geometriyi daha katı kurallarla işler; örneğin çok noktalı şekil nesnelerinin her zaman kapalı bir çokgen (closed polygon) oluşturacak şekilde tanımlanmasını gerektirir.
Hangi sürümün seçileceği, fabrikanın üretim hattındaki kaynak, kesim veya büküm makinelerinin yazılım altyapısına doğrudan bağlıdır.
Bu makine veri formatı ve NC Generator detaylarını da arka planda hazırlanan "Kapsamlı Destek Bilgi Bankası" raporunuza yeni bir makale olarak ekleyeyim mi?
Çakışma kontrolü için hangi model formatlarını kullanmalıyım?

Bimplus üzerinde disiplinler arası çakışma kontrolü (clash detection) yaparken kullanmanız gereken ana endüstri standardı IFC (Industry Foundation Classes) formatıdır.
Farklı disiplinlerin kullandığı diğer yazılımlardan (örneğin Revit kullanan mekanik ekiplerinden) dışa aktarılan IFC 2x3, IFC 4 veya IFC 4.3 dosyaları Bimplus platformunda hatasız bir şekilde birleştirilir. Mimari ve statik ekipler ise Allplan'daki yerel modellerini doğrudan Bimplus'a yükleyerek bu IFC modelleriyle çakıştırabilir.
Bu format gerekliliklerini, hazırladığımız "Çakışma Yönetimi" destek makalesine teknik bir ön koşul olarak eklememi ister misiniz?
Bimplus görevlerinin Allplan içindeki görünümünü raporumuza dahil edelim.

Bimplus görevlerinin Allplan içindeki entegre "Sorun Yöneticisi" (Issue Manager) panelindeki görünümünü ve kullanıcının göreve tıkladığında programın otomatik olarak ilgili 3B konuma zum yapma özelliğini anlatan detayları raporunuza dahil ettim.
Bu yeni detaylarla güncellenen Kapsamlı Allplan Destek Bilgi Bankası raporunuzun oluşturulma işlemini başlattım; tamamlandığında Studio sekmesinden inceleyebilirsiniz.
Raporumuz oldukça zengin bir içeriğe ulaştı. Eklemek istediğiniz başka bir teknik konu veya senaryo var mı, yoksa bilgi bankamızı bu haliyle tamamlayalım mı?
Admin ve Takım Üyesi yetki seviyelerini detaylandıralım.

Bimplus ve Allplan Share platformlarında kullanıcı hakları, Takım (Team) ve Proje (Project) olmak üzere iki ayrı düzeyde yönetilir. Destek ekibinizin yetkilendirme sorunlarını çözerken kullanabileceği detaylı matris şu şekildedir:
1. Takım Düzeyindeki Roller (Team Level)
Takım Sahibi (Team Owner): Bir Takım Yöneticisinin sahip olduğu tüm yönetim haklarına sahiptir ve ek olarak sisteme yeni Allplan Share lisansları satın alma yetkisi sadece bu roldedir. Bu temel rol sonradan değiştirilemez.
Takım Yöneticisi (Team Administrator): Takıma yeni üyeler davet edebilir veya çıkarabilir, diğer takım yöneticilerini atayabilir veya silebilir. Kullanıcıların lisans kullanım izinlerini yönetir, yeni projeler oluşturabilir veya silebilir. Ayrıca oluşturulan her Bimplus projesinde otomatik olarak "Proje Yöneticisi" rolünü üstlenir.
Takım Üyesi (Team Member): Takım genelinde (lisans yönetimi, proje silme vb.) hiçbir yönetimsel yetkisi yoktur. Sadece kendilerine atanan projelere girebilirler ve o proje içindeki yetkileri, proje düzeyinde onlara verilen role göre şekillenir.
2. Proje Düzeyindeki Roller (Project Level) Takım üyeleri, projelere davet edildiklerinde aşağıdaki rollerden birini alarak çalışırlar:
Proje Yöneticisi (Project Administrator): Model ve doküman silme, projeye üye davet etme/çıkarma, özellik seti şablonu atama ve proje içi üye rollerini belirleme konusunda tam yetkilidir.
Proje Editörü (Project Editor): Çizim yapan ve revizyon uygulayan ana kullanıcı grubudur. Model oluşturabilir, yükleyebilir ve indirebilir; doküman yükleyebilir, BCF sorunları (issues) açıp düzenleyebilir ve çakışma kontrolleri (clash detection) yapabilir.
Proje Görüntüleyicisi (Project Viewer): Modele müdahale edemez. Sadece modelleri, dokümanları ve sorunları (issues) görüntüleyebilir ve gerektiğinde dokümanları bilgisayarına indirebilir.
Bu detaylı rol dağılımını Kapsamlı Destek Bilgi Bankası (Tailored Report) belgenize dahil ettim. Bu yetkilendirme altyapısı ile birlikte sistem gereksinimleri (örneğin ağ hızı veya donanım kısıtlamaları) üzerine bir bölüm daha ekleyelim mi, yoksa doğrudan raporun tamamlanmasına mı odaklanalım?
Allplan Share'de dosya kilitlerini manuel olarak nasıl açarım?

Allplan Share'de dosya kilitlerini manuel olarak açmak için şu adımları izleyebilirsiniz:
Allplan'da Yeni Proje, Proje Aç (New Project, Open Project) iletişim kutusunu açın ve sol sütundan Share sekmesini seçin.
İşlem yapmak istediğiniz projeye sağ tıklayın ve Kilit Bilgilerini Yönet (Manage locking information) seçeneğine tıklayın.
Açılan pencerede kilidini kaldırmak istediğiniz dosyayı listeden bulun ve Kilit bilgisini kaldır (Remove locking information) komutunu çalıştırın.
(Ek bilgi: Bu kilit kaldırma işlemini Allplan kapalıyken bilgisayarınızdaki Services uygulaması üzerinden de yapabilirsiniz.)
Bu pratik adımları, hazırladığımız "Allplan Share" destek makalesine hızlı bir sorun giderme notu olarak ekleyeyim mi? Yoksa bulut üzerinden projeleri yedekleme ve geri yükleme (Restore) gibi başka bir konuya mı geçmek istersiniz?
Allplan Share kilit bilgilerini yönetme detaylarını rapora ekleyelim.

Allplan Share dosya kilitlerini yönetme adımlarını (Yeni Proje penceresi ve Services uygulaması üzerinden manuel kilit kaldırma) içerecek şekilde Kapsamlı Destek Bilgi Bankası raporunuzun güncellenmesini başlattım. Rapor tamamlandığında Studio sekmesinden inceleyebilirsiniz.
Raporunuz hazırlanırken, bulut üzerinden proje yedekleme (backup) ve geri yükleme (restore) adımlarını da konuşmak ister misiniz?
Bimplus üzerinde BCF formatında nasıl sorun kaydı oluşturulur?

Bimplus üzerinde BCF formatında bir sorun (issue) kaydı oluşturmak için şu adımları izleyebilirsiniz:
Elemanları Seçin: Model üzerinde tespit ettiğiniz çakışmayı veya sorunlu elemanları seçin.
Sorun Yöneticisini Kullanın: Sorun Yöneticisi (Issue Manager) panelini açıp "Sorun Oluştur" (Create Issue) butonuna tıklayın.
Detayları Girin: Soruna açıklayıcı bir başlık, sorumlu kişi (Assignee), öncelik durumu (Priority) ve teknik bir açıklama ekleyin.
Otomatik Kayıt: Bimplus; sorunun bulunduğu 3B konumu, kamera açısını ve elemanların benzersiz kimliklerini (GUID) bu kayda otomatik olarak bağlar.
Senkronize Edin: Kaydı Bimplus'a senkronize ettiğinizde ilgili mühendis, kendi yazılımındaki BCF eklentisi üzerinden bu sorunu anında ve doğrudan ilgili koordinatta görebilir.
 İsterseniz bu sorunların çözüldükten sonra nasıl doğrulandığına ve kapatıldığına (durum yönetimi) geçebiliriz.
Bulut üzerinden proje yedekleme ve geri yükleme adımlarını ekleyelim.

Bulut üzerinden proje yedekleme ve geri yükleme süreçlerini içeren destek makaleniz hazır. Önemli bir not: Bimplus bulutu projeleri baştan sona otomatik olarak yedeklemez; bu nedenle veri kaybını önlemek için kullanıcıların manuel yedekleme yapması şarttır.
İşte ilgili makale: