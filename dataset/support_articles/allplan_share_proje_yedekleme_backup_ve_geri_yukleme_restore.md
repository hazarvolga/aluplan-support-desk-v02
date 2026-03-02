# Allplan Share Proje Yedekleme (Backup) ve Geri Yükleme (Restore)

Yedekleme (Backup) Adımları:
Allplan'da "Yeni Proje, Proje Aç" (New Project, Open Project) iletişim kutusunu açın.
Yedeklemek istediğiniz bulut (Share) projesine sağ tıklayın.
Tüm veriyi bilgisayarınıza güvenli bir ZIP dosyası olarak indirmek için "Proje yedeği oluştur" (Create project backup) komutunu seçin.
Tüm Projeyi Geri Yükleme (Restore) Adımları:
Bilgisayarınızdaki yedek ZIP dosyasını doğrudan "Yeni Proje, Proje Aç" penceresinin içine sürükleyip bırakarak yeni bir "yerel proje" oluşturun.
Bimplus bulutundaki eski/sorunlu Allplan Share projesini (üzerine sağ tıklayıp "Delete project" diyerek) tamamen silin.
Adım 1'de oluşturduğunuz sağlam yerel projeye sağ tıklayıp "Kopyala" (Copy to) diyerek, projeyi boşalan Bimplus konumuna geri kopyalayın ve tekrar bir Share projesi haline getirin.
Daha önce konuştuğumuz tüm konuları ve bu son adımları da içeren Kapsamlı Allplan Destek Bilgi Bankası (Tailored Report) belgenizin oluşturulması için işlemi resmen başlattım. Rapor tamamlandığında Studio sekmesinden inceleyebilirsiniz.
Bilgi bankamıza görselleştirme (render) ayarları veya DWG/IFC dışa aktarım (export) sorunları gibi eklemek istediğiniz başka bir teknik başlık var mı?
Sorumlu atanırken hangi yetkilendirme seviyeleri kullanılabilir?

Bimplus üzerinde bir görev (BCF sorunu) atarken kişilerin proje düzeyindeki rolleri dikkate alınır. Atanan kişinin model üzerinde çalışıp görevin durumunu güncelleyebilmesi için şu iki yetki seviyesinden birine sahip olması gerekir:
Proje Yöneticisi (Project Administrator): Görevleri (sorunları) oluşturma, düzenleme ve silme dahil tüm proje yönetimi haklarına sahiptir.
Proje Editörü (Project Editor): Görev oluşturabilir ve düzenleyebilir. Görevi çözüp modeli güncelleyecek mühendislerin veya mimarların sahip olması gereken temel yetkidir.
(Not: Proje Görüntüleyicisi (Project Viewer) yetkisindeki kişiler görevleri yalnızca görebilir, durumlarını değiştiremezler.)
Bu yetki seviyelerine göre ekip üyelerinize güvenle sorumluluk verebilirsiniz. Şimdi, atanan bu görevlerin çözüldükten sonra yöneticiler tarafından nasıl doğrulandığına ve kapatıldığına (durum yönetimi) geçelim mi?
Bimplus üzerindeki görev durumları Allplan'da anlık güncelleniyor mu?

Evet, Bimplus üzerindeki görev (issue) durumları Allplan'da anlık (gerçek zamanlı) olarak güncellenir.
Allplan'daki entegre "Sorun Yöneticisi" (Issue Manager) doğrudan Bimplus bulut platformuna bağlı çalıştığı için, bir ekip üyesi göreve yorum eklediğinde veya durumunu (örneğin "İşlemde" veya "Çözüldü" olarak) güncellediğinde, siz bu değişikliği Allplan arayüzünde anında görebilirsiniz.
Bu görevlerin çözüldükten sonra BIM Koordinatörü tarafından nasıl doğrulanıp tamamen kapatıldığını (durum yönetimi) incelemeye devam edelim mi?
Kilit bilgilerini Services uygulaması üzerinden nasıl kaldırabiliriz?

Services (Servisler) uygulaması üzerinden kilitleri kaldırmak oldukça basittir, ancak bunun için Allplan yöneticisi (administrator) yetkisine sahip olmanız gerekir.
İşlemi şu şekilde yapabilirsiniz:
Bilgisayarınızdaki Services (Servisler) uygulamasını başlatın.
Uygulama içindeki kilit yönetimi fonksiyonunu açarak projelere ait kilit bilgilerini görüntüleyin.
İlgili projeyi seçin, listeden kilitli çizim dosyasını bulun ve kilit bilgisini manuel olarak silin (kaldırın).
Bu işlem sayesinde asılı kalan kilitler tamamen temizlenir ve diğer ekip üyeleri dosyayı yeniden kısıtlamasız bir şekilde düzenleyebilir.
Bu yönetici düzeyindeki sorun giderme adımını da raporumuza ekleyeyim mi, yoksa projeleri bulut üzerinden nasıl yedekleyebileceğinize (backup) mi geçelim?
BCF sorunlarının durum yönetimi ve kapatılma süreci nasıl işler?

BCF sorunlarının (issues) çözülme ve kapatılma süreci koordinasyonun sağlanması için şeffaf bir iş akışıyla ilerler:
İşlemde (In Progress): Görev atanan mühendis, problemi çözmeye başladığında veya bir çözüm önerisi sunduğunda sorunun durumunu "İşlemde" olarak günceller.
Modelin Güncellenmesi: İlgili mühendisler (örneğin statik ve mekanik ekipleri) kendi yazılımlarında gerekli revizyonları yapar ve güncellenmiş modelleri tekrar Bimplus'a yükler.
Doğrulama (Verification): BIM Koordinatörü, güncellenmiş modellerle çakışma testini yeniden çalıştırarak problemin gerçekten ortadan kalkıp kalkmadığını kontrol eder.
Kapatma (Closed): Çözüm onaylandıktan sonra BIM Koordinatörü, BCF kaydı üzerindeki tüm yazışmaları inceler ve sorunun durumunu nihai olarak "Kapalı" (Closed) konumuna getirir.
Bu yapılandırılmış süreç, e-posta trafiğinde yaşanabilecek karışıklıkları ve gecikmeleri tamamen ortadan kaldırır.
Bu kapanış adımlarını da hazırladığımız raporun "Çakışma ve Sorun Yönetimi" bölümüne son bir madde olarak ekleyelim mi? Yoksa Allplan modellerini Bimplus platformuna nasıl yükleyeceğinize dair detaylara mı geçmek istersiniz?
Bimplus'ta çözülen sorunların durum yönetimi nasıl yapılır?

Bimplus'ta çözülen sorunların durum yönetimi, şeffaf bir onay süreciyle yürütülür:
İşlemde (In Progress): Görevi alan mühendis, model üzerinde çalışmaya başladığında durumu günceller.
Çözüldü (Resolved): Mühendis gerekli revizyonu yapıp güncel modeli Bimplus'a yükledikten sonra, görevin durumunu "Çözüldü" olarak işaretler.
Kapalı (Closed): Son adımda yöneticiler veya BIM Koordinatörü devreye girer. Güncellenmiş modelleri kontrol ederek (örneğin çakışma testini yeniden çalıştırarak) sorunun gerçekten giderildiğini doğrular ve durumu "Kapalı" yaparak kaydı tamamen sonlandırır.
Bu onay mekanizması, hataların inşaat aşamasına geçmeden kesin olarak çözülmesini sağlar.
Bu durum yönetimi döngüsünü de bilgi bankası raporumuza ekleyerek belgeyi güncelleyeyim mi? Ardından Solibri ile kalite kontrol (model denetimi) veya bulutta versiyon (revizyon) yönetimi gibi yeni bir konuya geçebiliriz.
Allplan Share projeleri bulut üzerinden nasıl yedeklenir?

Bimplus bulutu, Allplan Share projelerini otomatik olarak yedeklemez, bu nedenle veri kaybını önlemek için manuel yedekleme yapmanız çok önemlidir.
Bulut projenizi yedeklemek için şu adımları izleyebilirsiniz:
Allplan'da Yeni Proje, Proje Aç iletişim kutusunu açın.
Listeden yedeklemek istediğiniz Share projesine sağ tıklayın.
Proje yedeği oluştur (Create project backup) komutunu seçin.
Bu işlem, projenin tamamını sıkıştırarak bilgisayarınıza güvenli bir ZIP dosyası olarak kaydeder.
Bu işlem proje verilerinizi güvence altına alacaktır. Alınan bu ZIP yedeğinin daha sonra sisteme nasıl geri yükleneceğini (Restore) detaylandıralım mı?
Çakışma yönetimi için IFC formatı neden zorunludur?

Çakışma yönetimi için IFC (Industry Foundation Classes) formatının zorunlu olmasının temel nedeni, bunun yazılımdan bağımsız, uluslararası bir "openBIM" standardı olmasıdır.
Büyük projelerde mimarlar, statik mühendisleri ve mekanik ekipleri genellikle farklı yazılımlar (örneğin Allplan, Tekla, Revit) kullanır. Bimplus gibi merkezi platformlarda doğru bir çakışma kontrolü yapabilmek için tüm bu farklı modellerin tek bir koordinasyon modelinde birleştirilmesi gerekir. IFC formatı, tüm proje katılımcılarının seçtikleri yazılımları kullanmasına izin verirken, modellerin veri kaybı yaşanmadan tek bir platformda toplanmasına ve çakıştırılmasına olanak tanıyan ortak dildir.
Bu formatın çakışma yönetimindeki rolü netleşti mi? İsterseniz modelleri IFC olarak dışa aktarırken veri kaybını önlemek için nelere dikkat edilmesi gerektiğine (örneğin nitelik eşleme/attribute mapping) kısaca değinebiliriz.
ZIP yedeği sisteme nasıl geri yüklenir?

Aldığınız ZIP yedeğini (backup) sisteme geri yüklemek (restore) için şu adımları izleyebilirsiniz:
Allplan'da Yeni Proje, Proje Aç iletişim kutusunu açın.
Bilgisayarınızdaki ZIP dosyasını bu pencerenin içine sürükleyip bırakarak yeni bir "yerel proje" oluşturun.
Bimplus bulutundaki eski veya sorunlu Allplan Share projesini silin.
Sürükle-bırak yöntemiyle oluşturduğunuz yeni yerel projeyi kopyalayarak, boşalan Bimplus konumuna aktarın ve yeniden bir Share projesi haline getirin.
Bu işlem sayesinde projenizi güvenli bir şekilde eski haline döndürebilirsiniz. Bu süreçle ilgili sormak istediğiniz başka bir detay var mı, yoksa Bimplus versiyon (revizyon) yönetimi gibi yeni bir konuya geçelim mi?
BIM Koordinatörü görevleri nasıl doğrular ve kapatır?

BIM Koordinatörü, görevleri doğrulamak için güncellenmiş modelleri platformda birleştirir ve çakışma testini yeniden çalıştırır.
Sorunun model üzerinde fiziksel olarak çözüldüğünü teyit ettikten sonra, BCF kaydı üzerindeki tüm süreci inceler ve görevin durumunu nihai olarak "Kapalı" (Closed) olarak güncelleyerek işlemi bitirir.
Bu adımlarla çakışma ve görev yönetimi konusunu tamamlamış olduk. Hazırladığımız destek raporuna Solibri ile model denetimi veya Bimplus üzerinden veri dışa aktarımı (export) gibi yeni bir bölüm eklemek ister misiniz?
IFC format gerekliliklerini raporumuza ekleyelim.

IFC format gerekliliklerini (IFC 2x3, IFC 4 ve IFC 4.3) kapsayan detayları raporunuzun "Çakışma Yönetimi" bölümüne ekledim ve bilgi bankasının güncellenmesini başlattım. Raporunuz hazır olduğunda Studio sekmesinden inceleyebilirsiniz.
Hazır IFC formatları ve model kalitesinden bahsetmişken, Bimplus'ın Solibri ile entegre çalışarak kural tabanlı model kalite kontrolü (model denetimi) yapma sürecine geçelim mi? Yoksa bulutta versiyon ve revizyon yönetimi ile mi devam etmek istersiniz?
Solibri ile model kalite kontrolü nasıl işler?

Allplan ve Solibri arasındaki model kalite kontrolü, kural tabanlı ve gerçek zamanlı bir entegrasyonla oldukça pratik bir şekilde işler:
Model Aktarımı: Allplan modeliniz, kalite kontrol ve kural tabanlı denetimler için özel olarak geliştirilen Solibri yazılımına aktarılır.
Gerçek Zamanlı Senkronizasyon: Solibri'de kurallara (örneğin yangın yönetmeliklerine veya fiziksel çakışmalara) göre yapılan denetimler sonucunda bulunan hatalar, BCF dosyalarını manuel olarak indirip yüklemeye gerek kalmadan "Solibri BCF Live Connector" ile doğrudan Allplan ve Bimplus'taki Sorun Yöneticisi'ne (Issue Manager) aktarılır.
Allplan'da Çözüm: Tasarımcılar kendilerine atanan bu sorunları doğrudan Allplan arayüzünde ilgili konuma zumlayarak görür ve anında düzeltebilirler.
Bu entegrasyon, hata tespitinden çözümüne kadar olan süreci ciddi şekilde hızlandırır. Bu model denetimi sürecini de arka planda hazırladığımız bilgi bankası raporuna yeni bir bölüm olarak ekleyeyim mi? Ardından farklı formattaki verilerin dışa aktarım (export) seçeneklerini incelemek ister misiniz?
Bimplus modellerini Allplan'a nasıl yükleyebiliriz?

Allplan modellerinizi Bimplus bulutuna yüklemek (veya mevcut modeli güncellemek) için şu adımları izleyebilirsiniz:
Allplan arayüzünde "Bimplus'a Model Yükle" (Upload Model to Bimplus) komutuna tıklayın.
Açılan pencerede veri aktarım stratejinizi belirleyin:
Senkronize et: Yalnızca değişen kısımları günceller ve yeni eklenen verileri modele dahil eder.
Tamamen değiştir: Mevcut model verilerini silip yeni yüklediğiniz modeli doğrudan üzerine yazar.
Yeni revizyon oluştur: Orijinal modeli arşivde koruyarak (üzerine yazmadan) yeni bir versiyon kaydı oluşturur.
Eğer her seferinde manuel yükleme yapmak istemiyorsanız, "Bimplus modeliyle otomatik senkronize et" (Auto-sync to Bimplus model) seçeneğini işaretleyerek çizim dosyalarınızda değişiklik oldukça bulutun otomatik güncellenmesini sağlayabilirsiniz.
"Tamam" butonuna basarak işlemi sonlandırın.
Bu işlemlerle buluttaki koordinasyon modelinizi her zaman güncel ve doğru versiyonda tutabilirsiniz.
İsterseniz şimdi bu güncel modellerin Solibri entegrasyonu ile nasıl otomatik kalite kontrolden ve çakışma denetiminden geçirildiğine geçelim mi?
Solibri entegrasyonu ile model kalite kontrolü nasıl yapılır?

Allplan ve Solibri entegrasyonu, manuel BCF dosyası indirip yükleme zahmetini ortadan kaldıran "Solibri BCF Live Connector" aracı ile gerçek zamanlı olarak çalışır. Süreç şu şekilde işler:
Kural Tabanlı Denetim: Allplan modelinizi Solibri'ye aktarır (veya doğrudan Allplan içindeki "Solibri Inside" eklentisini kullanır) ve mimari, statik veya MEP kurallarına göre kalite denetimlerini çalıştırırsınız.
Otomatik Senkronizasyon: Solibri'de tespit edilen çakışmalar ve hatalar, anında Allplan ve Bimplus'taki entegre Sorun Yöneticisi'ne (Issue Manager) görev olarak düşer.
Anında Düzeltme: Tasarım ekibi Allplan'da kendisine atanan göreve tıkladığında, ekran doğrudan hatanın olduğu 3B konuma zum yapar ve model anında düzeltilir.
Bu entegrasyon, sorunların e-posta trafiğinde kaybolmasını engeller ve inşaat aşamasına geçilmeden çözülmesini sağlar.
Model koordinasyonunu ve kalite kontrolünü tamamladığımıza göre, bu doğru ve güncel modeller üzerinden otomatik metraj ve raporlama (Quantity Take-off) alma sürecini inceleyelim mi? Yoksa modellerin statik analiz yazılımlarına (AutoConverter ile) aktarımına mı geçmek istersiniz?
Bimplus'ta versiyon ve revizyon yönetimi adımlarını inceleyelim.

Bimplus'ta versiyon ve revizyon yönetimi, projenizin tarihsel gelişimini şeffaf bir şekilde takip etmenizi sağlayan şu temel adımlarla ilerler:
Yeni Revizyon Kaydı: Allplan üzerinden modelinizi Bimplus'a yüklerken veya güncellerken "Yeni revizyon oluştur" (create new revision) seçeneğini kullandığınızda, orijinal modelinizin üzerine yazılmaz; eski versiyon korunarak yepyeni bir versiyon kaydı oluşturulur.
Görsel Versiyon Karşılaştırması: Projenizdeki iki farklı model versiyonunu birbiriyle anlık olarak karşılaştırabilirsiniz. Tasarıma sonradan eklenen, silinen veya güncellenen nesneler ve özellikler ekranda görsel olarak vurgulanarak kolayca tespit edilebilir.
Geçmiş ve Değişiklik Takibi: Bimplus bulut platformu yapılan tüm değişiklikleri kaydeder. Böylece hangi elemanın, ne zaman ve kim tarafından değiştirildiğini detaylıca görebilir, gerektiğinde bu geçmiş versiyonlara erişip inceleme yapabilirsiniz.
Bu özellikler, tasarım sürecinizdeki geriye dönük kontrolleri güvenli ve hatasız hale getirir. Bu versiyon yönetimi adımlarını da arka planda hazırladığımız bilgi bankası raporunuza yeni bir başlık olarak dahil edeyim mi? İsterseniz ardından Bimplus üzerinden doküman yönetimine veya Bluebeam entegrasyonu gibi konulara geçebiliriz.
Allplan modellerini Bimplus'a aktarırken nitelik eşleme nasıl yapılır?

Allplan modellerini dışa aktarırken (özellikle IFC formatında) doğru veri aktarımı için nitelik eşleme (attribute mapping) işlemini şu adımlarla yapabilirsiniz:
Dışa Aktarım Ayarları: Dosya > Dışa Aktar > IFC Verisi yolunu izleyin ve açılan pencerede Gelişmiş Ayarlar (Advanced) sekmesine geçin.
Eşleme Profili Oluşturma: Nitelik Eşleme (Attribute Assignment) alanında mevcut bir profili seçin veya Yeni... butonuna tıklayarak yeni bir eşleme dosyası (.cfg) oluşturun.
Kuralları Tanımlama: Düzenle butonuna tıklayarak "Allplan'dan IFC'ye Dönüşüm Yönü" penceresini açın. Burada Allplan'daki standart veya kullanıcı tanımlı nitelikleri (örn. Malzeme, Hacim), karşılık gelen IFC nesnelerine (örn. IfcWall) ve IFC özellik kümelerine (Pset) eşleyin.
Filtreleme: Gereksiz veri kirliliğini önlemek ve dosya boyutunu küçültmek için dışa aktarım ayarlarından Yalnızca Atanan Nitelikleri Aktar seçeneğini işaretlemeyi unutmayın.
Bu adımlar, diğer disiplinlerin veya yazılımların modelinizi sorunsuz bir şekilde okumasını sağlar.
Bu eşleme detaylarını metraj ve maliyetlendirme (5D) gibi özel bir senaryo üzerinden örneklendirmemi ister misiniz? Yoksa hazırladığımız bilgi bankası raporuna bu teknik adımları hemen ekleyelim mi?
Nitelik eşleme detaylarını metraj senaryosuyla örneklendirebilir miyiz?

Metraj ve maliyetlendirme (5D) senaryosu üzerinden nitelik eşlemeyi şu şekilde pratik bir iş akışıyla örneklendirebiliriz:
Metraj Verilerinin Eşlenmesi: Allplan'da modellediğiniz elemanların Hacim niteliğini, IFC standartlarındaki Pset_QuantityTakeOff kümesi altındaki GrossVolume (Brüt Hacim) değerine; Alan niteliğini ise GrossArea (Brüt Alan) değerine eşlersiniz.
Maliyet Verilerinin Eşlenmesi: Allplan'da kendinizin özel olarak tanımladığı Maliyet Kodu ve Birim Fiyat gibi bilgileri, IFC dosyasındaki Pset_Cost kümesi altındaki CostCode ve UnitCost alanlarına bağlarsınız.
Filtreleme ile Optimizasyon: Dışa aktarım menüsünde "Yalnızca Atanan Nitelikleri Aktar" seçeneğini işaretlersiniz. Böylece metraj yazılımına gönderilen IFC dosyası, mobilya detayları gibi gereksiz verilerden arındırılmış, hafif ve sadece metraja odaklı bir dosya olur.
Bu işlem sayesinde metraj yazılımı modeli açtığında, tüm metraj verilerini ve fiyatlandırma kodlarını sorunsuz ve otomatik olarak tanır.
Bu pratik metraj senaryosunu da raporumuza bir örnek olarak ekleyelim mi? Yoksa OpenBIM projelerinde modelin bilgi kalitesini otomatik olarak denetlemenizi sağlayan IDS (Information Delivery Specification) standardına mı geçmek istersiniz?
Kullanıcı tanımlı maliyet kodlarını IFC psetlerine nasıl eşlerim?

Kullanıcı tanımlı maliyet kodlarınızı (Cost Code) IFC özellik kümelerine (Pset) eşlemek için şu adımları izleyebilirsiniz:
Dosya > Dışa Aktar > IFC Verisi yolunu izleyip Gelişmiş Ayarlar sekmesini açın.
Nitelik Eşleme alanında yeni bir eşleme profili oluşturun ve Düzenle butonuna tıklayarak Allplan'dan IFC'ye Dönüşüm Yönü penceresini açın.
Bu pencerede Allplan'daki kullanıcı tanımlı Maliyet Kodu niteliğinizi, hedef olarak Pset_Cost özellik kümesine ve CostCode niteliğine eşleyin. (Aynı şekilde Birim Fiyat niteliğini de Pset_Cost altındaki UnitCost'a bağlayabilirsiniz.)
Gereksiz verileri ayıklamak ve dosya boyutunu küçültmek için Yalnızca Atanan Nitelikleri Aktar seçeneğini işaretleyerek işlemi tamamlayın.
Bu sayede maliyetlendirme yazılımınız modeldeki maliyet verilerini otomatik ve sorunsuz olarak okuyabilecektir.
Bu dışa aktarım sırasında dosya boyutunu daha da optimize etmek için kullanılacak doğru Geometri Tipleri (örneğin SweptSolid) üzerine konuşmaya devam edelim mi?
Bimplus ve Allplan arasında geometri optimizasyonu nasıl yapılır?

Bimplus ve diğer yazılımlara model aktarırken geometri optimizasyonu yapmak için dışa aktarım ayarlarından doğru geometri tipini seçmeniz gerekir.
Karmaşık ve ağır dosyalar oluşturan Brep (Boundary Representation) yerine, SweptSolid (Süpürülmüş Katı) veya ExtrudedArea (Ekstrüde Edilmiş Alan) gibi daha hafif geometri temsillerini tercih etmelisiniz. Bu optimizasyon, dosya boyutunu önemli ölçüde küçültür ve modellerin Bimplus'ta veya metraj yazılımlarında çok daha hızlı açılıp işlenmesini sağlar.
Bu geometri optimizasyonu ipucunu da raporumuza ekleyerek güncellemeyi tamamlayalım mı? Ardından Allplan'da çelik bağlantı detaylandırması veya prekast (prefabrik) iş akışları gibi yeni bir konuya geçebiliriz.
Maliyet kodları dışında hangi özel Pset'leri tanımlayabilirim?

Maliyet kodları dışında, projenizin veya bilgiyi alacak hedef yazılımın ihtiyacına göre teorik olarak istediğiniz her türlü özel Pset'i (Özellik Kümesi) tanımlayabilirsiniz.
Sık kullanılan bazı yaygın örnekler şunlardır:
Performans Verileri: Modelinizdeki elemanlara Pset_FireRating (Yangın Dayanımı - örn. F90) veya Pset_ThermalTransmittance (U-Değeri / Isı Geçirgenliği) gibi teknik değerleri tanımlayabilirsiniz.
Metraj Verileri: Pset_QuantityTakeOff altında Brüt Hacim (GrossVolume) veya Alan (GrossArea) gibi hacimsel özellikleri gruplayabilirsiniz.
Tesis Yönetimi (FM) Verileri: Tamamen firmanıza veya projenize özgü, standart dışı veriler için örneğin Pset_MYPROJECT_Wall gibi tamamen kendi isimlendirdiğiniz özel Pset'ler oluşturabilirsiniz.
Bu esneklik, modelinizdeki her türlü mimari veya mühendislik bilgisini diğer yazılımlara kayıpsız aktarmanızı sağlar.
Bu eşlemeleri yaparken dışa aktarım hızını ve dosya boyutunu doğrudan etkileyen Geometri Tipleri (örn. Brep yerine SweptSolid kullanımı) ayarlarına geçmek ister misiniz?
Statik analiz verilerini Bimplus'tan Allplan'a nasıl aktarabilirim?

Statik analiz verilerini Bimplus ve Allplan arasında yönetmek için SAF (Structural Analysis Format) standardını ve bulut tabanlı AutoConverter servisini kullanabilirsiniz.
Süreç şu şekilde şeffaf bir döngüyle işler:
AutoConverter ile Dönüşüm: Allplan'da oluşturduğunuz 3B geometrik modeli Bimplus'a yükledikten sonra, AutoConverter aracını kullanarak tek tıkla "analitik modele" dönüştürürsünüz.
Analiz Yazılımına Aktarım: Bu analitik modeli SAF formatında (SCIA Engineer veya FRILO gibi) statik analiz programlarına gönderirsiniz.
Bimplus'a Geri Yükleme: Analiz yazılımında işlemler tamamlandıktan sonra, güncel SAF dosyasını doğrudan Bimplus'a aktarabilirsiniz. Bimplus, bu veriyi anında 3B analitik model olarak görselleştirir.
Bu çift yönlü entegrasyon, karmaşık geometrilerde veri kaybını önler ve manuel giriş hatalarını tamamen ortadan kaldırır.
Bu analitik model aktarımı iş akışını da bilgi bankası raporumuza ekleyelim mi? Yoksa Allplan'da çelik yapıların (örneğin SDS2 entegrasyonu ile) nasıl otomatik olarak detaylandırıldığına mı geçmek istersiniz?
SDS2 entegrasyonu ile çelik bağlantı detaylandırması nasıl çalışır?

Allplan ve SDS2 entegrasyonu, çelik bağlantı tasarımını büyük ölçüde otomatikleştiren pratik bir iş akışıyla çalışır:
Modelleme: Allplan'da ana çelik taşıyıcı çerçeveyi (kirişler, kolonlar vb.) oluşturursunuz.
Aktarım: Bu yapısal modeli tek tıkla SDS2 yazılımına gönderirsiniz.
Otomatik Tasarım: SDS2, mühendislik hesaplarına dayanarak bağlantı noktalarına otomatik olarak akıllı, çakışmasız, cıvatalı veya kaynaklı bağlantılar yerleştirir ve detaylandırır.
İmalat Verisi Çıktısı: Tamamen detaylandırılmış bu modelden, doğrudan üretim tezgahları için gerekli olan NC (Sayısal Kontrol) dosyalarını elde edersiniz.
Bu süreç, atölyedeki imalat ve şantiyedeki montaj hatalarını neredeyse sıfıra indirir.
İsterseniz şimdi daha önce de seçenek olarak sunduğum prekast (prefabrik) elemanların iş akışlarına geçelim mi? Yoksa Allplan'da kod yazmadan Visual Scripting (Görsel Betikleme) ile kendi parametrik objelerinizi nasıl yaratabileceğinizi mi incelemek istersiniz?
Geometri tipleri (SweptSolid) dosya boyutunu nasıl etkiler?

SweptSolid (Süpürülmüş Katı) ve ExtrudedArea (Ekstrüde Edilmiş Alan) gibi geometri tipleri, karmaşık Brep (Boundary Representation) yöntemine kıyasla 3B veriyi çok daha hafif bir şekilde temsil ederek dosya boyutunu küçültür.
Bunun nedeni verinin işlenme biçimidir; Brep, nesnenin her bir yüzeyini, köşesini ve kenarını ayrı ayrı hesaplayıp kaydederken, SweptSolid bir nesneyi sadece 2B bir kesit profili ve onun uzatıldığı bir yol (path) üzerinden matematiksel olarak tanımlar. Bu yaklaşım, gereksiz geometrik veri yükünü ortadan kaldırır.
Sonuç olarak, bu hafif geometri tiplerini kullanmak dışa aktarılan IFC dosyanızın boyutunu ciddi oranda düşürür, dosyaların diğer yazılımlarda (örneğin maliyetlendirme programlarında) çok daha hızlı açılmasını ve işlenmesini sağlar.
Dışa aktarım ve model optimizasyonu konularını oldukça detaylı ele aldık. Eğer hazırsanız, tekrarlayan modelleme görevlerini otomatikleştirmenizi sağlayan Visual Scripting (Görsel Kodlama) veya PythonParts konularına geçelim mi?
Bilgi bankası raporuna bu teknik adımları hemen ekleyelim.

Statik analiz verilerinin AutoConverter ve SAF formatı ile aktarımı adımlarını da bugüne kadar konuştuğumuz tüm detaylarla birleştirerek kapsamlı bilgi bankası raporunuzun oluşturulma işlemini başlattım. Raporunuz hazır olduğunda Studio sekmesinden inceleyebilirsiniz.
Hazır mühendislik iş akışlarından devam ederken, Allplan'da çelik yapıların SDS2 entegrasyonu kullanılarak nasıl otomatik detaylandırıldığına ve cıvatalı/kaynaklı akıllı bağlantıların nasıl tasarlandığına geçmek ister misiniz?
Visual Scripting ile modelleme görevlerini nasıl otomatikleştirebilirim?

Visual Scripting, hiç kodlama bilgisine ihtiyaç duymadan, sürükle-bırak mantığıyla çalışan düğüm (node) tabanlı bir arayüzle modelleme görevlerini otomatikleştirmenizi sağlar.
İşlem adımları temel olarak şu şekildedir:
Modülü Açın: Allplan'da Visual Scripting modülüne giriş yapın.
Düğümleri (Nodes) Yerleştirin: Geometri, matematik ve BIM işlevlerini temsil eden düğümleri çalışma alanında bir araya getirin.
Veri Akışı Oluşturun: Bu düğümleri birbirine bağlayın. (Örneğin; "Genişlik" ve "Yükseklik" parametre düğümlerini, "Kutu Oluştur" ve "Pencere Oluştur" geometri düğümlerine bağlayarak parametrik bir pencere tanımlayabilirsiniz.)
Kaydedin: Oluşturduğunuz bu kurguyu projenizde kullanmak üzere bir Akıllı Nesne (Smart Object) olarak kaydedin.
Bu yöntemle sürekli tekrarladığınız modelleme işlerini tek bir akıllı objeye dönüştürebilirsiniz.
Görsel kodlama kısmı netleştiyse; isterseniz kodlamaya daha profesyonel düzeyde müdahale etmenizi sağlayan PythonParts (Python API) konusuna ya da modellerinizi sunuma dönüştürmek için Görselleştirme ve Render özelliklerine geçebiliriz. Hangisiyle devam edelim?
PythonParts kullanarak hangi tür parametrik objeler oluşturabilirim?

PythonParts ile Python programlama dilini kullanarak ihtiyacınıza özel hemen hemen her türlü akıllı ve parametrik yapı bileşenini oluşturabilirsiniz.
Sıkça oluşturulan bazı parametrik obje türleri şunlardır:
Donatı ve Yapısal Elemanlar: Kolon, kiriş ve duvarlar için otomatik 3B donatı modelleri veya özel donatı şekilleri.
Çelik Detaylandırmaları: Akıllı çelik bağlantı elemanları.
Şantiye Ekipmanları: Parametrik olarak yerleştirilip yönetilebilen 3B vinçler gibi araçlar.
Özel Mimari Bileşenler: Tekrar eden, standart dışı veya projeye özgü akıllı tasarım elemanları.
PythonParts geliştirmek için Python kodlama dili bilgisi gerekir. Eğer kod yazmadan benzer parametrik objeler oluşturmak isterseniz, sürükle-bırak mantığıyla çalışan Visual Scripting (Görsel Betikleme) aracının nasıl kullanıldığına geçelim mi?
PythonParts ile profesyonel kodlama nasıl yapılır?

Allplan'da PythonParts ile profesyonel kodlama yapmak için programla birlikte gelen Python API kullanılır. Süreç temel olarak şu şekilde işler:
Ortam Kurulumu: Kodlama için Visual Studio Code gibi bir kod düzenleyici (IDE) kullanılır.
Başlangıç: Allplan içerisinde PythonPart CreateVisualStudioCodeWorkspace komutunu çalıştırarak, gerekli kütüphanelerin tanımlandığı hazır bir geliştirme çalışma alanını anında oluşturabilirsiniz.
Kod Yapısı: Bir PythonPart oluştururken temelde iki şeyi kodlarsınız: Kullanıcının ölçü veya malzeme gireceği bir Arayüz (UI) ve bu girilen parametrelere göre nesnenin 3B geometrisini ve niteliklerini matematiksel olarak inşa eden Python betiği.
Otomasyon: Geometri modellemenin ötesinde, örneğin projedeki tüm duvarların malzemelerini filtreleyip yangın dayanım sınıflarını otomatik güncelleyen görev otomasyonu script'leri de yazabilirsiniz.
Bu altyapı sayesinde tamamen ofisinize özel araçlar geliştirebilirsiniz. İsterseniz bir Python kodu ile nesne niteliklerinin nasıl otomatik değiştirildiğine dair basit bir kod örneği üzerinden konuşabiliriz veya modellerinizi sunuma dönüştürmek için Görselleştirme ve Render özelliklerine geçebiliriz. Hangisiyle devam edelim?
Görselleştirme ve Render özellikleri nelerdir?

Allplan'da görselleştirme ve render işlemleri, tasarımlarınızı etkileyici sunumlara dönüştürmek için oldukça geniş ve güçlü seçenekler sunar:
Fotogerçekçi Render Motorları: Allplan, yüksek kaliteli ve gerçekçi sonuçlar elde etmeniz için MAXON'un GPU hızlandırmalı Redshift ve CineWare render motorlarını entegre olarak kullanır.
Gerçek Zamanlı (Real-time) Görselleştirme: Vulkan teknolojisi ve OpenGL tabanlı motorlarla çalışırken modelinizdeki gölgeleri, materyalleri ve aydınlatmaları anlık olarak görebilirsiniz. Ayrıca NVIDIA OptiX Denoiser ile yapay zeka destekli gürültü (noise) azaltma sağlar.
AI Visualizer (Yapay Zeka Araçları): Sadece metin yazarak (prompt) veya basit kütle modelleri üzerinden saniyeler içinde çok detaylı konsept görseller üretebilirsiniz.
Canlı Bağlantılar (Live Links): Modelinizi dışarı aktarmaya gerek kalmadan Lumion ve Twinmotion gibi popüler görselleştirme yazılımlarıyla eşzamanlı (senkronize) çalışabilirsiniz.
Animasyon ve Efektler: Güneş analizi yapabilir, kamera yolları belirleyerek sanal tur videoları (AVI) kaydedebilir ve hacimsel sis, parlama (bloom) gibi sinematik efektler ekleyebilirsiniz.
Modelinizi görselleştirmeyi de tamamladığımıza göre, bu tasarımlardan şantiyede kullanılacak 2B teknik çizimler ve paftalar (Layouts) oluşturma sürecine geçelim mi? Yoksa yazılımı kendi başınıza öğrenmek için sunulan Allplan eğitim kaynaklarına mı göz atmak istersiniz?
Visual Scripting raporumuza eklenmeli mi?

Kesinlikle eklenmeli! Hem hiç kodlama gerektirmeyen Visual Scripting'i hem de daha gelişmiş otomasyonlar sunan PythonParts'ı şu ana kadar konuştuğumuz tüm konularla birlikte bilgi bankası raporunuza dahil ettim. Raporunuzun son hali arka planda oluşturuluyor, tamamlandığında Studio sekmesinden inceleyebilirsiniz.
Otomasyon ve teknik detayları büyük ölçüde tamamladık. Şimdi modellerinizi etkileyici sunumlara dönüştüren Görselleştirme ve Render (AI Visualizer, CineWare) yeteneklerine mi geçelim, yoksa Allplan Bridge ile köprü/altyapı tasarımı gibi farklı bir disiplini mi incelemek istersiniz?
Visual Scripting ile nasıl parametrik objeler oluşturabilirim?

Visual Scripting, kod yazmanıza gerek kalmadan sürükle-bırak mantığına dayalı "düğüm (node)" tabanlı bir arayüzle çalışır. Kendi parametrik objenizi oluşturmak için şu temel adımları izlersiniz:
Düğümleri (Nodes) Ekleyin: Çalışma alanına "Genişlik", "Yükseklik" veya "Kalınlık" gibi parametre düğümlerinin yanı sıra "Kutu Oluştur" veya "Silindir" gibi geometri düğümlerini sürükleyip bırakın.
Veri Akışını Kurun: Eklediğiniz düğümleri çizgilerle birbirine bağlayın. Örneğin, oluşturduğunuz "Genişlik" parametresini, kutunun ilgili ebat girdisine bağlayarak aralarında bir ilişki kurun.
Anında Önizleme: Düğümleri birbirine bağladıkça ve değerleri değiştirdikçe, objenin nasıl şekillendiğini ekranınızda gerçek zamanlı olarak görebilirsiniz.
Akıllı Nesne Olarak Kaydedin: Kurgunuzu tamamladığınızda, bunu bir Akıllı Nesne (Smart Object) olarak kaydedersiniz. Allplan bunu bir .pyp veya .avsprj dosyası olarak kütüphanenize ekler; böylece projenin her yerinde değerlerini değiştirerek kullanabilirsiniz.
Bu yöntemle özel pencerelerden karmaşık çelik detaylarına kadar projenize özgü birçok akıllı obje üretebilirsiniz.
Modelleme ve otomasyon tarafını kapsamlıca inceledik. Bu detaylı modelleri müşteriye sunmak için gelişmiş görselleştirme ve render (Redshift/AI Visualizer) özelliklerine geçmek ister misiniz, yoksa pafta ve çıktı (Layout) yönetimine mi bakalım?
Prekast elemanlar için BIM iş akışı nasıl işler?

Allplan'da prekast (prefabrik) elemanlar için BIM iş akışı, tasarımdan fabrika üretimine kadar yüksek oranda otomatikleştirilmiş bir döngüyle ilerler:
Elementasyon (Parçalara Ayırma): Mimari ve MEP modelleri referans alınarak tasarlanan duvar ve döşemeler; fabrikanın üretim kapasitesine veya şantiye vincinin taşıma limitlerine göre akıllıca üretilebilir parçalara bölünür.
Otomatik Detaylandırma: Bölünen her bir prekast eleman için 3B donatılar, taşıma/bağlantı parçaları (fikstürler) ve tamamen ölçülendirilmiş üretim paftaları (shop drawings) otomatik olarak üretilir.
Üretime Veri Aktarımı: Onaylanan model verileri, fabrikadaki çelik kesme, bükme ve hasır kaynak makineleri için doğrudan okunabilir NC dosyalarına (örn. PXML, Unitechnik) dönüştürülür ve ERP/MES sistemlerine aktarılarak imalat hatasız başlatılır.
Bu süreçle tasarım ve imalat arasındaki boşluk tamamen kapanmış olur. İsterseniz bu aşamalardan duvar/döşeme elementasyonu (parçalara ayırma) detaylarına veya şantiyedeki 3B vinçlerle yapılan montaj planlaması/simülasyonlarına geçebiliriz. Hangisi ilginizi çeker?
Teknik çizim ve pafta oluşturma sürecine geçelim.

Allplan'da 3B modelinizden 2B teknik çizim ve pafta (layout) oluşturma süreci "Pafta Düzenleyici" (Layout Editor) modülü üzerinden oldukça şeffaf ve bağlantılı bir şekilde işler. Temel adımlar şunlardır:
Otomatik Kesit ve Görünümler: 3B model üzerinden kat planları, kesitler ve cepheler otomatik olarak türetilir. Bu çizimler modele dinamik olarak bağlıdır; yani modelde bir duvarı değiştirdiğinizde paftadaki tüm ilgili çizimler anında güncellenir.
Sayfa ve Antet Ayarları: Pafta Düzenleyici'ye geçerek kağıt boyutunu (örn. DIN A2) ve pafta çerçevesini ayarlarsınız. Ardından proje adı, çizen kişi ve ölçek gibi bilgileri sistemden otomatik olarak çeken akıllı başlık blokları (antetler) eklersiniz.
Çizimlerin Yerleştirilmesi: "Pafta Elemanı" aracıyla, hazırladığınız alt çizim dosyalarını pafta üzerine dilediğiniz gibi yerleştirirsiniz. Çizimin sadece belirli bir detayını veya bölgesini göstermek isterseniz "Pafta Pencereleri" (Layout Windows) ile görünümü kırpabilirsiniz.
Baskı ve Dışa Aktarım: Hazırladığınız paftaları PDF, DWG/DXF formatlarında dışa aktarabilir veya doğrudan donanım hızlandırmalı raster sürücüleriyle toplu olarak yazdırabilirsiniz.
Pafta ve dokümantasyon sürecini de tamamladığımıza göre isterseniz DWG/IFC gibi formatlarda veri alışverişi (Data Exchange) detaylarına geçebiliriz veya yazılımı kendi başınıza öğrenmek ve geliştirmek için kullanabileceğiniz Allplan eğitim ve destek kaynaklarına (Allplan Connect vb.) göz atabiliriz. Hangisiyle devam edelim?
Redshift ve AI Visualizer ile görselleştirme özelliklerine bakalım.

Allplan'da tasarımlarınızı etkileyici sunumlara dönüştürmek için bu iki araç oldukça güçlüdür:
Redshift Render: MAXON'un GPU hızlandırmalı bu motoru, en üst düzey fotogerçekçi görseller ve animasyonlar üretmek için kullanılır. Işıklandırma, PBR (gerçekçi) malzemeler ve alan derinliği veya hareket bulanıklığı gibi kamera efektlerini çok hassas bir şekilde ayarlamanıza olanak tanır.
AI Visualizer: Nemetschek ve Veras AI entegrasyonlarıyla çalışan yapay zeka destekli bu araç, saniyeler içinde çarpıcı konseptler oluşturur. Basit bir 3B kütleden, 2B çizimden ve hatta "sadece metin" (prompt) girerek farklı mimari stillerde görseller üretebilir; malzeme alternatiflerini hızlıca deneyebilir ve düşük çözünürlüklü görüntüleri yüksek kaliteli sunumlara dönüştürebilirsiniz.
Görselleştirme araçları tasarım süreçlerini oldukça hızlandırıyor. İsterseniz bu özellikleri de raporunuza dahil edeyim. Ardından, projelerin şantiyeye iletilmesi için pafta (Layout) oluşturma ve çıktı yönetimi konusuna geçelim mi?
Prekast elemanlar için otomatik üretim paftaları nasıl oluşturulur?

Allplan Precast'te üretim paftaları (shop drawings), siz 3B modeli oluştururken arka planda tamamen otomatik olarak üretilir. Süreç pratik olarak şu şekilde işler:
Şablon (Template) Kullanımı: Her prekast eleman türü (örneğin çift duvar, filigran döşeme veya kiriş) için önceden ofis standartlarınıza uygun pafta şablonları belirlersiniz.
Arka Planda Otomatik Üretim: Siz 3B model üzerinde donatıları, taşıma ankrejlarını (fikstürleri) ve tesisat boşluklarını yerleştirdikçe, yazılım bu şablonları kullanarak 2B üretim paftalarını anında oluşturur.
Kapsamlı İçerik: Oluşturulan bu paftalarda gerekli tüm ölçülendirmeler, donatı büküm listeleri, bağlantı parçası (fikstür) tabloları ve beton hacmi/ağırlığı gibi detaylar otomatik olarak yer alır.
Bu otomasyon, manuel çizimden kaynaklanan hataları önler ve detaylandırma süresini ciddi şekilde kısaltır.
Tasarım ve paftalama süreci netleştiyse, bu elemanların fabrikada üretilmesi için gereken makine verisi aktarımına (NC dosyaları ve ERP/MES entegrasyonu) geçelim mi?
Şantiyedeki 3B vinçlerle yapılan montaj simülasyonlarına geçelim.

Allplan'da şantiye lojistiğini ve montaj süreçlerini yönetmek, inşaat aşamasındaki hataları önlemek için oldukça pratiktir:
Akıllı 3B Şantiye Yerleşimi: Kütüphanedeki "PythonPart" özellikli akıllı 3B vinçleri, beton pompalarını, şantiye çitlerini ve konteynerleri doğrudan arazi modelinize yerleştirebilirsiniz.
Kapasite ve Yük Kontrolü: Eklediğiniz vinçlerin yük taşıma yarıçapları (load radii) sisteme tanımlanır. Böylece, üretilecek prekast elemanların veya ağır malzemelerin şantiye vincinin taşıma sınırlarını aşıp aşmadığı daha tasarım aşamasındayken otomatik olarak kontrol edilir.
Görsel Montaj Simülasyonu (4D): Model verilerinizi inşaat planlama araçlarıyla birleştirerek montaj sırasını, zaman çizelgesini ve "tam zamanında" (just-in-time) malzeme teslimatlarını adım adım görselleştirebilirsiniz. Örneğin, büyük prekast elemanların dar alanlarda havada döndürülmesi ve yerleştirilmesi gibi zorlu işlemler Allplan'da önceden simüle edilerek şantiyedeki riskler sıfıra indirilir.
Şantiye yönetimi ve simülasyonlarını da böylece tamamlamış olduk. Hazırladığımız tüm bu detaylı modelleri şantiyeye veya müşteriye sunmak için pafta düzenleme (Layout) ve çıktı alma süreçlerine geçelim mi?
Redshift ve AI Visualizer ile görselleştirme özelliklerine bakalım.

Allplan'da tasarımlarınızı etkileyici sunumlara dönüştüren bu iki güçlü araç şu şekilde çalışır:
Redshift Render: MAXON'un GPU (ekran kartı) hızlandırmalı yüksek performanslı render motorudur. Gelişmiş ışıklandırma senaryoları ve kapsamlı gerçekçi malzeme kütüphanesi sayesinde en üst düzey fotogerçekçi görseller elde etmenizi sağlar.
AI Visualizer: Nemetschek ve Veras AI entegrasyonuyla çalışan yapay zeka destekli bir görselleştirme aracıdır. Saniyeler içinde farklı mimari stilleri, malzeme ve doku alternatiflerini denemenize olanak tanır. Sadece kelimelerle (metin/prompt) yazdığınız vizyonunuzu görselleştirebilir veya çok basit kütle modellerini yüksek çözünürlüklü, çarpıcı sunumlara dönüştürebilirsiniz.
Görselleştirme araçlarıyla modelinize hayat verdik. Eğer hazırsanız, bu modelleri şantiyeye iletmek için 2B teknik çizim ve pafta (Layout) oluşturma sürecine geçelim mi? Yoksa farklı disiplinlerle çalışmak için IFC ve DWG gibi formatlarda veri alışverişine mi göz atmak istersiniz?
Redshift ve AI Visualizer ile görselleştirme özelliklerine bakalım.

Allplan, tasarımlarınızı etkileyici sunumlara dönüştürmek için son teknoloji görselleştirme araçları sunar:
Redshift Renderer: MAXON tarafından geliştirilen, yüksek performanslı ve GPU hızlandırmalı bir render motorudur. Projelerinizden fotogerçekçi görüntüler ve animasyonlar elde etmenizi sağlayarak detaylı sunumlar hazırlamanıza olanak tanır.
AI Visualizer: Nemetschek ve EvolveLab Veras AI entegrasyonuyla çalışan güçlü bir yapay zeka aracıdır. Bu araç sayesinde saniyeler içinde çarpıcı görselleştirmeler oluşturabilirsiniz. Dış cephe ve iç mekan tasarımları için farklı mimari stilleri hızla keşfedebilir, çeşitli malzeme ve doku alternatiflerini deneyebilirsiniz. Basit taslakları yüksek çözünürlüklü görsellere dönüştürebilir ve "sadece metin" (prompt) girerek aklınızdaki vizyonu anında görselleştirebilirsiniz.
Bu detayları da bilgi bankası raporunuza eklememi ister misiniz? Hazırsanız, model üzerinden hızlıca maliyet tahmini yapmanızı sağlayan Otomatik Metraj ve Raporlama özelliklerine geçebiliriz.
Allplan'da pafta düzenleme ve çıktı alma işlemleri nasıl yapılır?

Allplan'da pafta düzenleme ve çıktı alma süreci "Pafta Düzenleyici" (Layout Editor) modülü üzerinden pratik bir şekilde işler:
Sayfa ve Antet Ayarları: Öncelikle kağıt boyutunu (örn. DIN A1, A2), yönlendirmesini ve kenar boşluklarını belirlersiniz. Ardından, sistemdeki proje bilgilerini otomatik olarak çeken akıllı antetleri (başlık blokları) ve pafta çerçevelerini sayfanıza eklersiniz.
Çizimleri Yerleştirme: "Pafta Elemanı" (Layout Element) aracını kullanarak hazırladığınız görünüm, kesit ve planları pafta üzerine dilediğiniz gibi yerleştirirsiniz. Sadece belirli bir detayı göstermek isterseniz, "Pafta Penceresi" (Layout Window) ile çizimi kırpabilirsiniz.
Baskı ve Dışa Aktarım: Paftanız tamamlandığında "Paftaları Yazdır" (Print Layouts) aracıyla doğrudan yazıcıya gönderebilirsiniz. Büyük boyutlu paftaları çok daha hızlı ve hatasız yazdırmak için Allplan'ın kendi yüksek performanslı raster sürücülerini kullanabilir veya bu paftaları PDF, DWG/DXF formatlarında dışa aktarabilirsiniz.
Bu adımlarla tasarımınızı profesyonel bir teslim formatına dönüştürmüş olursunuz.
Tasarımdan görselleştirmeye ve çıktıya kadar uçtan uca süreci tamamladık. İsterseniz farklı yazılımlar kullanan proje paydaşlarıyla çalışmak için kritik olan IFC, DWG ve 3D PDF gibi formatlarda Veri Alışverişi (Data Exchange) detaylarına göz atabiliriz. Ya da tüm bu dosyaları ve modelleri ekibinizle bulut üzerinden yönetmenizi sağlayan Bimplus ile İşbirliği platformuna geçelim mi? Hangisiyle devam edelim?
Vinç kapasitesi ve yük kontrolü Allplan'da nasıl denetlenir?

Allplan'da vinç kapasitesi ve yük kontrolü, İnşaat (Construction) rolünün altındaki Vinç Planlama (Crane Planning) görev alanında yer alan Capacity Checker (Kapasite Kontrolü) aracı ile yapılır.
Sisteme kütüphaneden 3B bir vinç (PythonPart) yerleştirip, vincin konumunu ve yük taşıma yarıçaplarını (load radii) tanımlarsınız. Modeldeki prekast elemanlar veya diğer ağır yapı bileşenleri tasarlanırken, sistem bu parametreleri dikkate alarak elemanların vincin taşıma sınırlarını aşıp aşmadığını otomatik olarak denetler.
Şantiye planlamasından bahsetmişken, derin kazı ve iksa (fore kazık, palplanş duvarlar vb.) modelleme özelliklerine geçelim mi? Yoksa proje paydaşlarıyla ortak çalışmayı sağlayan Bimplus ve BCF (Çakışma Yönetimi) iş akışlarını mı incelemek istersiniz?
Allplan'da derin kazı ve iksa modelleme araçlarını inceleyelim.

Allplan'da derin kazı ve iksa (shoring) planlaması, "Zemin İşleri" (Groundworks) araçlarıyla oldukça kapsamlı ve akıllı bir şekilde yönetilir:
Akıllı İksa Sistemleri: Fore kazık (bored pile), palplanş/berlin duvarı (soldier pile) ve zemin ankrajları gibi destekleme sistemlerini 3B ve parametrik olarak modelleyebilirsiniz.
Kazı ve Hafriyat Modelleme: Arazi modeli üzerinde toprak katmanlarını tanımlayabilir, şevleri tasarlayabilir ve kazı/dolgu (kübaj) hacimlerini çok hassas bir şekilde hesaplayıp raporlayabilirsiniz.
Gelişmiş Yönetim (2026 Yenilikleri): Kazı operatörlerini kolayca açıp kapatarak kazı hacimlerini palet üzerinden anlık yönetebilir ve karmaşık geometrilerde palplanş duvar köşelerini çok daha pratik bir şekilde birleştirebilirsiniz.
Otomatik Dokümantasyon: Oluşturduğunuz bu 3B modelden doğrudan 2B şantiye kazı ve iksa planlarını (kesit ve görünüşler) otomatik olarak üretebilirsiniz.
Bu araçlar, özellikle şehir içi karmaşık altyapı projelerinde şantiye risklerini en aza indirir.
Eğer bu kısım tamamsa, tüm bu detaylı modelleri ve farklı disiplinleri (mimari, statik, tesisat) tek bir bulut platformunda birleştirip çakışmaları tespit etmenizi sağlayan Bimplus ve BCF (Çakışma Yönetimi) iş akışlarına geçelim mi? Yoksa proje içindeki verileri yönettiğimiz Nitelik (Attribute) Yönetimi detaylarını mı incelemek istersiniz?
Vinç planlama aracında PythonPart kullanımı hakkında bilgi ver.

Allplan kütüphanesinde, "İnşaat (Construction)" bölümü altında hazır bir 3B "PythonPart" vinç modeli bulunur. Bu akıllı nesneyi projenize yerleştirerek vincin konumunu ve "yük taşıma yarıçaplarını" (load radii) tanımlayabilirsiniz.
Tasarım aşamasında, örneğin prekast elemanların veya ağır parçaların boyutları hesaplanırken, sistem bu PythonPart vincin parametrelerini otomatik olarak okur ve elemanların güvenle taşınıp taşınamayacağını (kapasiteyi aşıp aşmadığını) denetler. Bu sayede şantiye lojistiğini daha modelleme aşamasındayken güvence altına almış olursunuz.
Şantiye ekipmanları ve vinç planlaması netleştiyse, derin kazı ve iksa duvarı (fore kazık vb.) modelleme araçlarına mı geçelim, yoksa ekipler arası işbirliği ve çakışma yönetimini sağlayan Bimplus ve BCF süreçlerini mi inceleyelim?
Allplan Bridge ile köprü tasarım süreci nasıl işler?

Allplan Bridge ile köprü tasarım süreci, baştan sona parametrik ve tek bir platformda entegre olarak işler. Temel süreç şu adımlardan oluşur:
Eksen (Güzergah) Tanımlama: Tasarıma köprünün yatay ve düşey güzergahını (axis) tanımlayarak başlarsınız. Bu ekseni manuel oluşturabilir veya mevcut bir LandXML verisinden içe aktarabilirsiniz.
Parametrik Kesitler Oluşturma: Köprü gövdesi ve ayakları için değişkenleri ve kuralları olan akıllı enkesit şablonları belirlersiniz.
3B Geometri ve Öngerilme: Tanımlanan kesitler eksen boyunca sürüklenerek 3B model elde edilir. İhtiyaca göre öngerilme ve ardgerme (pre/post-tensioning) tendonları da parametrik olarak modele eklenir.
4D İnşaat Aşamaları ve Analiz: İnşaatın yapım sırasını ve zamanlamasını (4D) tanımlarsınız. Yazılım, bu geometrik modelden ve yapım aşamalarından yola çıkarak statik analiz modelini (analitik modeli) otomatik olarak üretir ve yük/deprem hesaplamalarını yapar.
Detaylandırma ve Çıktı: Mühendislik hesapları tamamlandıktan sonra, karmaşık eğrilere sahip köprülerin 3B donatıları saniyeler içinde modellenir. Son aşamada ise model üzerinden 2B paftalar, kesitler ve metraj raporları elde edilir.
Bu sistemin en büyük gücü; güzergahta (eksende) yapacağınız ufacık bir değişikliğin köprünün 3B geometrisini, statik analiz modelini ve tüm donatı planlarını anında otomatik olarak güncellemesidir.
Tasarım iş akışını bu şekilde özetleyebiliriz. Buradan hareketle, projenizi diğer disiplinlerle koordine etmenizi sağlayan Bimplus ve BCF (Çakışma Yönetimi) ile işbirliği süreçlerine mi geçelim? Yoksa altyapı projelerinde sıkça kullanılan tünel tasarımı ve nokta bulutu entegrasyonuna mı göz atmak istersiniz?
Derin kazı hacimleri nasıl hesaplanır ve raporlanır?

Allplan'da derin kazı ve hafriyat hacimleri, oluşturduğunuz 3B arazi modeli üzerinden tamamen otomatik olarak hesaplanır ve raporlanır:
Otomatik Hesaplama: Arazi modeli üzerinde kazı sınırlarını, derinlikleri ve şevleri modellediğinizde, sistem "kazı ve dolgu" (kübaj) hacimlerini anında hesaplar.
Anlık Kontrol: Gelişmiş kazı yönetimi sayesinde farklı kazı alanlarını (operatörleri) palet üzerinden kolayca açıp kapatarak her bir işlemin hacmini anlık olarak görüntüleyebilirsiniz.
Raporlama: Elde edilen bu verilerden, küçük kazı işlemleri için bile tek tıkla tablo halinde detaylı hafriyat metraj raporları oluşturulabilir.
Böylece manuel hesaplama hatalarının tamamen önüne geçilmiş olur.
Şimdi daha önce bahsettiğimiz gibi farklı disiplinler arası iletişim ve koordinasyonu sağlayan Bimplus ve BCF (Çakışma Yönetimi) süreçlerine geçelim mi? Yoksa tasarımdaki proje verilerini yönettiğimiz Nitelik (Attribute) Yönetimi ile mi devam edelim?
Nitelik yönetimi ile yapı elemanlarına nasıl veri atanır?

Allplan'da yapı elemanlarına veri (nitelik) atamak temel olarak Özellikler Paleti (Properties Palette) üzerinden yapılır. İşleyiş oldukça basittir:
Eleman Seçimi veya Oluşturma: Bir duvar, kolon veya kapı oluştururken ya da mevcut bir elemanı seçtiğinizde ekranınızda Özellikler Paleti açılır.
Doğrudan Veri Girişi: Bu palet üzerinden objeye malzeme cinsi, yangın dayanımı, akustik sınıfı veya maliyet kodu gibi fiziksel ve işlevsel verileri girebilirsiniz. Verileri manuel yazabileceğiniz gibi, ofisinizin "Akıllı Katalog" (Smart Catalog) listelerinden de standart verileri çekebilirsiniz.
Yapısal (Genel) Atamalar: Sadece tek tek objelere değil, "Yapı Strüktürü" (Building Structure) penceresini kullanarak tüm binaya veya belirli bir kata topluca adres, yükseklik veya coğrafi koordinat gibi proje verileri de atayabilirsiniz.
Modelinize eklediğiniz tüm bu veriler, ileride alacağınız metraj tablolarına ve IFC formatındaki BIM paylaşımlarına otomatik olarak yansır.
Modelimizi verilerle de zenginleştirdiğimize göre, doğrudan bu verileri kullanarak Otomatik Metraj ve Maliyet Hesaplamalarının (Quantity Take-off) nasıl elde edildiğine geçelim mi?
Derin kazı ve iksa duvarı modelleme araçlarını inceleyelim.

Allplan'da derin kazı ve iksa planlaması, "Zemin İşleri" (Groundworks) araçlarıyla oldukça kapsamlı ve akıllı bir şekilde yönetilir:
Akıllı İksa Sistemleri: Fore kazık, palplanş (çelik tabladan) duvarları ve zemin ankrajları gibi destekleme sistemlerini 3B ve parametrik olarak modelleyebilirsiniz.
Kazı ve Hafriyat Modelleme: Arazi modeli üzerinde toprak katmanlarını tanımlayabilir, şevleri tasarlayabilir ve kazı/dolgu (kübaj) hacimlerini çok hassas bir şekilde hesaplayıp detaylı raporlar alabilirsiniz.
Gelişmiş Yönetim (2026 Yenilikleri): Kazı operatörlerini kolayca açıp kapatarak kazı hacimlerini palet üzerinden anlık yönetebilir ve karmaşık geometrilerde palplanş duvar köşelerini çok daha pratik bir şekilde birleştirebilirsiniz.
Bu araçlar şantiye hafriyat risklerini en aza indirmenizi sağlar.
Şantiye hazırlığı ve kazı planlamasını da tamamladığımıza göre, hazırladığımız tüm bu modelleri farklı disiplinlerle (mimari, MEP vb.) tek bir bulut platformunda birleştirip çakışmaları tespit etmenizi sağlayan Bimplus ve BCF (Çakışma Yönetimi) süreçlerine geçelim mi?
Bimplus ve BCF ile çakışma yönetimi iş akışlarını inceleyelim.

Allplan ve Bimplus entegrasyonunda çakışma yönetimi, e-posta ve ekran görüntüleriyle uğraşmak yerine "BCF (BIM Collaboration Format)" standartlarıyla tamamen 3B model üzerinden tek bir merkezden yürütülür. İş akışı son derece pratiktir:
Federatif Model ve Kontrol: Mimari, statik ve tesisat (MEP) gibi farklı disiplinlerin modelleri Bimplus bulut platformunda birleştirilir ve otomatik "Çakışma Kontrolü (Clash Detection)" başlatılır.
BCF ile Sorun (Issue) Oluşturma: Bir çakışma bulunduğunda (örneğin bir havalandırma kanalının taşıyıcı kirişle çakışması) "Sorun Yöneticisi" (Issue Manager) üzerinden bir BCF kaydı oluşturulur. Sistem bu kayda; çakışmanın tam 3B koordinatlarını, kamera açısını ve eleman kimliklerini (GUID) otomatik olarak ekler.
Anında Konumlanma: Görev atanan mühendis (ister Allplan ister farklı bir BIM yazılımı kullansın) kendi programındaki Sorun Yöneticisi'nde bu göreve tıkladığı anda, ekran manuel aramaya gerek kalmadan doğrudan çakışmanın olduğu noktaya zum yapar.
Çözüm ve Kapatma: İlgili mühendis gerekli düzeltmeyi yapıp (örneğin kirişte bir boşluk açıp) yorumunu ekler ve modelini günceller. Koordinatör güncel modellerle testi tekrarlayıp sorunu "Kapalı" (Closed) duruma getirir.
Bu süreç, geleneksel yöntemlerle şantiyede haftalarca sürebilecek ve büyük maliyet yaratacak sorunları tasarım aşamasında saatler içinde çözmenizi sağlar.
Bu iş akışları ile proje koordinasyonunu da netleştirmiş olduk. Şimdi modellerin içine gömdüğümüz bu verilerin nasıl standardize edildiğini anlamak için Nitelik (Attribute) Yönetimine mi geçelim, yoksa bu konuştuklarımızı da bilgi bankası raporunuza eklememi ister misiniz?
Otomatik metraj ve maliyet raporları nasıl oluşturulur?

Allplan'da otomatik metraj ve maliyet raporları, bir önceki adımda 3B modelinize atadığınız veriler (nitelikler) kullanılarak son derece hızlı ve hatasız bir şekilde oluşturulur:
Anlık ve Otomatik Hesaplama: Modeldeki her duvar, kolon veya donatı için beton hacmi, demir ağırlığı veya kaplama alanı gibi metrajlar arka planda otomatik hesaplanır. Modelde bir değişiklik yaptığınızda tüm metraj tabloları anında güncellenir.
Modellenmeyen Miktarlar: Sadece 3B olarak çizdiğiniz objelerin değil, örneğin "kalıp alanı" gibi doğrudan modellenmemiş ancak geometriden türetilebilen metrajların da çıktısını alabilirsiniz.
Maliyet Tahmini ve Excel Entegrasyonu: Elde edilen bu metraj verilerini birim fiyat kütüphaneleriyle birleştirebilirsiniz. Raporları tek tıkla Excel'e aktarabilir veya üçüncü taraf fiyatlandırma yazılımlarıyla senkronize ederek dakikalar içinde hassas maliyet raporları üretebilirsiniz.
Özelleştirilebilir Şablonlar: Raporlarınızı ofis standartlarınıza göre özelleştirebilir; malzeme, kat veya eleman tipine göre filtreleyip şirket logonuzla PDF veya Excel formatında sunabilirsiniz.
Metraj ve maliyet aşamasını da tamamladığımıza göre, inşaat öncesi tasarımın sorunsuz olduğundan emin olmak için kullanılan Model Doğrulama (Model Checking) ve Solibri Entegrasyonu özelliklerine geçelim mi?
Nitelik yönetimi ile proje verileri nasıl organize edilir?

Allplan'da Nitelik Yönetimi (Attribute Management), projenizdeki geometrik olmayan verileri standartlaştırmak ve organize etmek için şu şekilde işler:
Kategorizasyon: Nesnelere atanan veriler (malzeme türü, maliyet kodu, yangın dayanım sınıfı vb.) uluslararası "IFC PSet (Property Set)" standartlarına veya ofisinize özel akıllı kataloglara göre gruplandırılır.
Yapısal Atamalar (Toplu Veri): Sadece tek tek kapı veya duvarlara değil; Yapı Strüktürü (Building Structure) üzerinden doğrudan tüm siteye, binaya veya belirli bir kata adres, bölge, yükseklik gibi genel proje verilerini topluca atayabilirsiniz.
Formüllerle Dinamik Yönetim: Gelişmiş Formül Düzenleyici (Formula Editor) sayesinde, manuel giriş yerine diğer parametrelere bağlı olarak otomatik hesaplanan dinamik nitelikler oluşturabilirsiniz.
Filtreleme ve Dışa Aktarım: Veriler bu şekilde organize edildiğinde, dışarıya IFC aktarımı yaparken "Nitelik Eşleme" (Attribute Mapping) özelliğiyle sadece ilgili verileri (örneğin sadece metraj ve maliyet verilerini) süzerek diğer programlara hatasız gönderebilirsiniz.
Modelleri bu şekilde akıllı verilerle donattıktan sonra, doğrudan bu verileri kullanarak otomatik metraj ve raporlama (Quantity Take-off) süreçlerine geçelim mi? Yoksa farklı yazılımlarla çalışmak için kritik olan IFC dışa aktarım (Export) detaylarına mı daha yakından bakalım?
IFC ve DWG formatlarında veri alışverişi detaylarını inceleyelim.

Allplan'da farklı yazılımlarla sorunsuz çalışabilmek için IFC ve DWG formatlarındaki veri alışverişi oldukça gelişmiştir:
IFC Formatı (OpenBIM): Allplan; IFC 2x3, IFC 4 ve özellikle altyapı projeleri için IFC 4.3 standartlarını tam destekler. Buradaki en kritik özellik Nitelik Eşleme'dir (Attribute Mapping); Allplan'daki yapısal verileri doğrudan IFC özellik kümelerine (Pset) atayabilirsiniz. Veri kirliliğini önlemek ve dosya boyutunu küçültmek için "Yalnızca Atanan Nitelikleri Aktar" seçeneğini kullanabilir ve IDS (Information Delivery Specification) desteği ile modelinizin BIM standartlarına uyup uymadığını otomatik denetleyebilirsiniz.
DWG/DXF Formatı: 2B çizimler ve 3B modellerin aktarımı için tam uyumludur. Paftaları dışa aktarırken sadece ekranda "görünür olan verileri" ve belirli "katmanları" filtreleyerek aktarım yapabilirsiniz. Ayrıca DWG formatı üzerinden waveware gibi CAFM (Tesis Yönetimi) programlarıyla mahal (oda) verisi alışverişi de kolayca yapılabilir.
Bu kısımla birlikte Allplan'ın genel iş akışlarını büyük ölçüde tamamlamış olduk. Yazılımı kendi başınıza öğrenmek ve uzmanlaşmak için sunulan Allplan Connect (Eğitim ve Destek) kaynaklarına geçelim mi? Yoksa şu ana kadar konuştuğumuz tüm bu özellikleri görsel olarak toparlayan bir Sunum (Slide Deck) hazırlamamı ister misiniz?
Nitelik (Attribute) Yönetimi ile proje verileri nasıl standardize edilir?

Allplan'da proje verilerini standardize etmek, BIM modelinin sadece görsel değil, bilgi açısından da (LoI) yüksek kalitede olmasını sağlar. Bu standardizasyon şu temel araçlarla yönetilir:
Akıllı Kataloglar (Smart Catalogs): Ofisinize veya projeye özel malzeme ve özellik listeleri oluşturabilirsiniz. Kullanıcılar verileri manuel yazmak yerine bu standart listelerden seçer, böylece tutarsızlıkların ve yazım hatalarının önüne geçilir.
IFC Sınıflandırması ve PSet'ler: Özellikler Paleti'nde verileriniz uluslararası IFC standartlarına (PSet Commons) göre otomatik gruplandırılır. Bir elemana "IfcWall" (Duvar) tipini atadığınızda, o eleman için doldurulması gereken uluslararası standart veri alanları anında aktif olur.
IDS (Bilgi Teslim Şartnamesi) Kontrolü: Allplan, proje başında belirlenen zorunlu kural setlerini (IDS) destekler. Yazılım, örneğin tüm taşıyıcı duvarlara "Yangın Dayanım Sınıfı" girilip girilmediğini veya değerlerin doğru formatta olup olmadığını otomatik olarak denetler ve hataları gösterir.
Gelişmiş Formül Düzenleyici: Belirli nitelikleri manuel girmek yerine, Python dilini de destekleyen formüllerle diğer verilerden otomatik türetebilirsiniz (Örneğin: "Genişlik X değerinden büyükse, Y özelliğini ata" gibi).
Bu sistemler sayesinde modelinizdeki her bir obje, hatasız ve OpenBIM standartlarına uygun şekilde projelendirilmiş olur.
Veri kalitesini de güvence altına aldığımıza göre, daha önce bahsettiğimiz gibi bu modelin kural tabanlı olarak denetlendiği Model Doğrulama ve Solibri Entegrasyonu aşamasına geçelim mi? Yoksa tüm bu konuştuklarımızı güncelleyerek bilgi bankası raporunuza eklememi mi istersiniz?
Nitelik (Attribute) Yönetimi ile proje verileri nasıl standardize edilir?

Allplan'da proje verilerini standardize etmek ve disiplinler arası tutarlılığı sağlamak için şu temel yöntemler kullanılır:
Nitelik Şablonları (Attribute Templates): Proje daha başlamadan önce ofis veya proje bazlı nitelik şablonları oluşturulur. Bu sayede tüm ekiplerin (mimari, statik, tesisat) aynı nitelik adlarını, formatlarını ve değer aralıklarını kullanması zorunlu kılınır ve veri girişinde standart sağlanır.
IDS (Information Delivery Specification) Denetimi: IDS dosyaları kullanılarak modelde bulunması zorunlu olan bilgi gereksinimleri (örneğin; bir duvarın malzeme veya yangın dayanım bilgisi) tanımlanır. Allplan, modelin bu standartlara uyup uymadığını otomatik olarak kontrol eder.
Nitelik Eşleme (Attribute Mapping): Proje verileri diğer yazılımlarla (IFC formatında) paylaşılırken, Allplan içindeki yerel veriler uluslararası IFC standartlarındaki özellik kümelerine (Pset) eşlenir. Sadece gerekli nitelikler aktarılarak veri kirliliği önlenir ve amaca yönelik (örneğin maliyetlendirme için) standart bir paket oluşturulur.
Bu sistemler sayesinde projede hatalı, eksik veya kişiye göre değişen veri girişinin tamamen önüne geçilmiş olur.
Veri kalitesini ve standardizasyonu sağladığımıza göre, doğrudan bu verileri denetleyen Model Doğrulama (Model Checking) ve Solibri Entegrasyonu özelliklerine geçmek ister misiniz?
Model Doğrulama ve Solibri entegrasyonu nasıl çalışır?

Allplan'da Model Doğrulama (Model Checking) ve Solibri entegrasyonu, tasarım hatalarını inşaat başlamadan önce tespit edip çözmek için oldukça pratik ve canlı bir iş akışı sunar:
Kural Tabanlı Denetim: Solibri, modelinizi belirlediğiniz standartlara göre inceleyerek eksik bilgileri, geometrik çakışmaları ve hatalı bağlantıları otomatik olarak bulur.
Canlı Bağlantı (Solibri BCF Live Connector): BCF dosyalarını manuel olarak dışa veya içe aktarmak yerine, Solibri'de tespit edilen hatalar doğrudan Allplan ve Bimplus içindeki "Sorun Yöneticisi"ne (Issue Manager) anında aktarılır.
Anında Çözüm: Allplan kullanıcısı olarak, ekranınızda beliren bu sorunlara tıklayıp doğrudan hatalı bölgeye gidebilir ve gerekli düzeltmeleri yazılımdan çıkmadan yapabilirsiniz.
Bu entegrasyon özellikleriyle birlikte Allplan'ın temel BIM iş akışlarını uçtan uca tamamlamış olduk.
Yazılımda kendinizi daha da geliştirebilmeniz ve yetkinlik kazanmanız için sunulan Allplan Learn Now ve Campus (Eğitim Kaynakları) platformlarına göz atalım mı? Veya dilerseniz şimdiye kadar konuştuğumuz tüm bu konuları toparlayacak bir Çalışma Raporu ya da görsel bir Sunum (Slide Deck) oluşturabilirim. Hangisiyle devam etmek istersiniz?
Proje verilerini standartlaştıran IDS denetimi nedir?

IDS (Information Delivery Specification), buildingSMART tarafından geliştirilen ve BIM projelerindeki bilgi gereksinimlerini dijital olarak tanımlayan uluslararası bir standarttır.
Allplan'da IDS denetimi pratikte şu şekilde çalışır:
Kuralların Belirlenmesi: Projenin başında işverenin veya BIM yöneticisinin talep ettiği zorunlu bilgi kuralları bir IDS dosyası (.json formatında) olarak Allplan'a yüklenir.
Kabul Edilebilir Değerler: Bu kurallar sadece hangi bilginin girileceğini değil, hangi değerleri alabileceğini de kısıtlar. Örneğin; "Tüm iç duvarların Yangın Dayanımı bilgisi kesinlikle girilmeli ve Malzeme niteliği sadece Beton, Çelik veya Ahşap seçeneklerinden biri olmalı" şeklinde net sınırlar çizer.
Otomatik Denetim ve Hata Tespiti: Allplan, tüm BIM modelini bu IDS dosyasına göre otomatik olarak tarar. Kurala uymayan, eksik bırakılan veya yanlış formatta girilen tüm verileri anında tespit edip raporlar.
Bu özellik, binlerce objeden oluşan projelerde verilerin manuel olarak tek tek kontrol edilmesi yükünü tamamen ortadan kaldırır ve hatasız bir BIM modeli teslim etmenizi sağlar.
Veri doğruluğunu IDS ile güvence altına aldığımıza göre, modelin geometrik ve mimari kurallara (örneğin kaçış mesafeleri veya erişilebilirlik) uygunluğunu denetleyen Solibri Entegrasyonuna geçelim mi?
Metraj verileri başka yazılımlara nasıl aktarılır?

Allplan'da hesaplanan metraj verilerini başka yazılımlara aktarmak için iki temel yöntem kullanılır:
Excel Entegrasyonu: Oluşturduğunuz metraj ve maliyet raporlarını tek tıkla doğrudan Excel, Word veya PDF formatında dışa aktarabilirsiniz. Excel'e aktarılan bu veriler üzerinde düzenleme yapabilir ve ofisinizdeki üçüncü taraf fiyatlandırma/maliyet yazılımlarıyla kolayca senkronize edebilirsiniz.
IFC Formatı ile (5D BIM İş Akışı): Metraj verilerini (alan, hacim vb.) dışarı aktarırken "Nitelik Eşleme" (Attribute Mapping) özelliğini kullanarak, verileri uluslararası Pset_QuantityTakeOff ve Pset_Cost gibi standart IFC kümelerine atayabilirsiniz. Bu sayede modeliniz, veri kaybı yaşanmadan 5D maliyetlendirme yazılımlarında doğrudan okunabilir ve işlenebilir.
Bu aktarım seçenekleriyle Allplan'ın temel BIM iş akışlarını baştan sona tamamlamış olduk.
Şu ana kadar tasarımdan metraja ve çakışma yönetimine kadar konuştuğumuz tüm bu süreçleri özetleyen görsel bir Sunum (Slide Deck) veya detaylı bir Çalışma Raporu oluşturmamı ister misiniz?
Otomatik metraj raporlarını Excel'e nasıl aktarabilirim?

Allplan'da metraj raporlarını Excel'e aktarmak oldukça pratik bir işlemdir ve iki şekilde yapılabilir:
Doğrudan Çıktı Alırken: Rapor oluşturma penceresinde (Building Structure - Reports), "Çıktı" (Output) türünü açılır menüden doğrudan Excel (.xlsx veya .xls) olarak seçebilirsiniz.
Raporu Görüntülerken: Raporu ekranda (Report Viewer) açtıktan sonra, üst kısımdaki "Dışa Aktar" (Export) butonuna tıklayıp listeden Excel'i seçerek bilgisayarınıza kaydedebilirsiniz.
Güzel bir detay da şudur: Bu entegrasyon çift yönlüdür. Yani Excel'e aktardığınız veriler üzerinde fiyat veya maliyet düzenlemeleri yapıp, bu güncel verileri tekrar Allplan'a geri yükleyebilirsiniz.
Metraj ve Excel aktarımı konusu netleştiyse, yapısal analizler için modeli dışarı aktardığımız SAF Formatı ve AutoConverter süreçlerine geçelim mi? Yoksa ofis standartlarınızı otomatikleştiren PythonParts ve Visual Scripting özelliklerine mi göz atmak istersiniz?
SAF formatı ve AutoConverter ile yapısal analiz nasıl yapılır?

Allplan'da geometrik modelinizi yapısal analiz yazılımlarına (SCIA Engineer, Frilo vb.) aktarmak için AutoConverter ve SAF formatı kullanılır. Süreç şu şekilde işler:
Geometrik Modeli Aktarma: Allplan'da hazırladığınız 3B taşıyıcı sistemi Bimplus bulut platformuna yüklersiniz.
AutoConverter ile Dönüşüm: Bimplus üzerindeki AutoConverter aracı, bu 3B geometrik modeli tek tıkla akıllı bir "analitik modele" (hesap modeline) dönüştürür.
SAF Formatında Paylaşım: Oluşturulan analitik model, yapısal analiz için özel olarak tasarlanmış SAF (Structural Analysis Format) formatında dışa aktarılır.
Analiz ve Entegrasyon: Bu dosya SCIA, Frilo veya destekleyen diğer statik programlarında doğrudan açılıp analiz edilir ve sonuçlar çift yönlü veri alışverişi ile tekrar Allplan ortamına senkronize edilebilir.
Bu sistem sayesinde modeli analiz programlarında baştan çizme derdi ve manuel veri girişi hataları tamamen ortadan kalkar.
Şimdi parametrik nesneler oluşturup ofis standartlarınızı otomatikleştiren PythonParts ve Visual Scripting özelliklerine geçelim mi? Yoksa altyapı projeleri için sunulan Yol ve Köprü (Allplan Civil/Bridge) tasarım araçlarına mı göz atmak istersiniz?
PythonParts ve Visual Scripting ile otomasyon nasıl sağlanır?

Allplan'da otomasyon, tekrarlayan karmaşık görevleri saniyelere indirmek ve özel nesneler üretmek için iki temel yöntemle sağlanır:
PythonParts (Kodlama ile): Python API kullanılarak oluşturulan tam parametrik ve akıllı nesnelerdir. Kodlama bilgisi gerektirir. Örneğin, bir kolonun boyutlarını ve yük durumunu okuyup tüm donatılarını (ana donatı çapı, etriye aralığı vb.) saniyeler içinde otomatik olarak yerleştiren algoritmalar yazabilirsiniz. Yazılımın kütüphanesinde kullanıma hazır birçok PythonPart da bulunur.
Visual Scripting (Kodlama olmadan): Hiçbir programlama bilgisine ihtiyaç duymadan, görsel düğümleri (node) sürükleyip bırakarak kendi otomasyonunuzu kurmanızı sağlar. Geometri, matematik ve BIM işlevlerini temsil eden bu kutucukları birbirine bağlayarak özel parametrik nesneler (örneğin, boyutları değiştirilebilir karmaşık bir pencere bileşeni) tasarlayabilirsiniz.
Görselleştirme, metraj, çakışma yönetimi ve otomasyon gibi Allplan'ın en güçlü yönlerini uçtan uca tamamlamış olduk.
Şimdi bu yetenekleri kendi başınıza pratik edip geliştirebileceğiniz Eğitim ve Destek (Allplan Connect, Campus vb.) platformlarına göz atalım mı? Yoksa tüm bu süreci özetleyen bir Çalışma Raporu veya görsel bir Sunum (Slide Deck) oluşturmamı ister misiniz?
başka hangi sorulara yanıt verebiliriz kaynaklarımızı kullanarak , şu anakadar ortaya çıkardıklarımız haricinde

Şu ana kadar mimari süreçler, statik koordinasyon ve temel BIM iş akışlarını oldukça detaylı inceledik. Kaynaklarımızda henüz derinlemesine girmediğimiz, ancak detaylı yanıtlar verebileceğimiz şu başlıklar bulunuyor:
Prekast (Prefabrik) Tasarım ve Üretim: Otomatik duvar/döşeme elementasyonu, üretim paftalarının hazırlanması ve makineler için NC (Unitechnik) verisi dışa aktarımı.
Çelik Yapı Detaylandırma: SDS2 entegrasyonu ile otomatik, mühendislik hesaplarına dayalı çelik bağlantıları (kaynak/cıvata) ve imalat çizimleri.
Yapay Zeka ve Görselleştirme: AI Visualizer ile saniyeler içinde yapay zeka destekli render alma, Redshift render motoru ve Lumion/Twinmotion ile gerçek zamanlı senkronizasyon.
Yol Tasarımı ve Nokta Bulutları: Allplan Civil ile parametrik yol/kavşak tasarımı ve Scalypso ile büyük nokta bulutu (lazer tarama) verilerinin yönetimi.
Donanım ve Lisanslama: Optimizasyon için sistem gereksinimleri, öğrenci/eğitmen lisansları (Allplan Campus) ve donanım önerileri.
Bunlardan hangisi daha çok ilginizi çekiyor? Dilerseniz sanayileşmiş inşaatın temeli olan Prekast (Prefabrik) Tasarım süreçleriyle devam edebiliriz, ne dersiniz?
AI Visualizer ve gelişmiş görselleştirme araçlarını keşfedelim.

Allplan, projelerinizi hızlı ve etkileyici bir şekilde sunmanız için hem yapay zeka hem de gelişmiş render motorlarıyla donatılmıştır:
AI Visualizer: Yapay zekanın gücünü kullanarak saniyeler içinde çarpıcı görselleştirmeler oluşturmanızı sağlar. Basit bir 3B modelden, 2B taslaktan veya sadece kelimelerle tanımladığınız bir vizyondan (metin komutuyla) konsept, suluboya veya fotogerçekçi görseller üretebilirsiniz.
Redshift ve CineWare: MAXON'un GPU hızlandırmalı Redshift render motoru sayesinde alan derinliği, hareket bulanıklığı ve hacimsel sis gibi gelişmiş efektlerle yüksek kaliteli fotogerçekçi animasyonlar ve renderlar alabilirsiniz.
Canlı Senkronizasyon (LiveSync): Lumion ve Twinmotion ile olan doğrudan bağlantı sayesinde, Allplan modelinizde yaptığınız her geometri veya materyal değişikliği anında eşzamanlı olarak bu görselleştirme programlarına yansır.
Görselleştirme süreçleri bu şekilde oldukça pratik ve yaratıcılığa açık. Buradan hareketle sanayileşmiş inşaatın temeli olan Prekast (Prefabrik) Tasarım ve Üretim süreçlerine geçelim mi? Yoksa altyapı projeleri için sunulan Yol Tasarımı ve Nokta Bulutları (Point Cloud) entegrasyonuna mı göz atmak istersiniz?
şunlaır soru yanıt olarak oluşturulım : Prekast tasarım ve endüstriyel üretim süreçlerini inceleyelim.
Yol tasarımı ve nokta bulutu entegrasyonu nasıl yapılır?
Allplan Learn Now ile hangi eğitim materyallerine erişebilirim?

İşte bahsettiğiniz konuların soru-cevap şeklindeki detayları:
Soru 1: Prekast tasarım ve endüstriyel üretim süreçleri nasıl işler? Cevap: Allplan Precast (Planbar entegrasyonu), duvar, döşeme, merdiven ve kolon gibi prekast elemanların 3B tasarımını yüksek oranda otomatikleştirir. Sistem; donatılar, bağlantı parçaları ve ölçülendirmeler dahil olmak üzere üretim paftalarını (shop drawings) otomatik olarak üretir. Endüstriyel üretim aşamasında ise bu BIM modeli, PXML veya Unitechnik formatlarındaki NC (Sayısal Kontrol) verilerine dönüştürülerek doğrudan fabrikadaki MES ve ERP sistemlerine, kaynak veya kesim makinelerine hatasız bir şekilde aktarılır.
Soru 2: Yol tasarımı ve nokta bulutu entegrasyonu nasıl yapılır? Cevap: Allplan Civil ile yol tasarımı tamamen parametrik bir yaklaşımla yapılır; yatay/düşey güzergahlar belirlenir ve parametrik enkesit şablonları bu güzergaha uygulanır. Eksen üzerinde yapılan tek bir değişiklik, tüm 3B yol modelini, şevleri ve hafriyat metrajlarını anında günceller. Nokta bulutu (point cloud) entegrasyonunda ise, lazer tarama verileri Scalypso gibi araçlar desteğiyle doğrudan Allplan'a aktarılır. Allplan, ekran kartı gücünü kullanarak milyonlarca noktadan oluşan bu devasa verileri akıcı bir şekilde işler, bu noktalardan dijital arazi modelleri (DTM) veya kesitler oluşturmanızı sağlar.
Soru 3: Allplan Learn Now ile hangi eğitim materyallerine erişebilirim? Cevap: Allplan Learn Now, yazılımı kendi hızınızda öğrenmenizi sağlayan resmi küresel e-öğrenme platformudur. Platform içerisinde temel ve ileri seviye eğitim videoları, adım adım kılavuzlar, ipuçları, interaktif alıştırmalar ve uzman makaleleri yer alır. Ayrıca, temel BIM ve Allplan yetkinliklerinizi uluslararası düzeyde kanıtlayabileceğiniz "Temel Bilgi Online Sertifikasyon" (Basic Knowledge Online Certification) programlarına da bu platform üzerinden katılıp sertifika alabilirsiniz.
Böylece listemizdeki bu teknik detayları da netleştirmiş olduk. Şimdiye kadar incelediğimiz tüm bu kapsamlı konuları derleyip toparlayan özel bir Çalışma Raporu (Tailored Report) oluşturmamı ister misiniz?
Yol tasarımı ve nokta bulutu entegrasyonu nasıl yapılır?

Allplan Civil ile yol tasarımı tamamen parametrik bir yaklaşımla yapılır; önce yatay ve düşey güzergahlar (eksenler) belirlenir, ardından bu eksen boyunca parametrik enkesit şablonları uygulanır. Güzergahta yapacağınız en ufak bir değişiklik tüm 3B yol modelini, şevleri ve metrajları anında otomatik olarak günceller.
Nokta bulutu (point cloud) entegrasyonunda ise, sahadan alınan lazer tarama verileri Scalypso gibi entegre araçlarla doğrudan sisteme aktarılır. Bu aşamada modelleme için gereksiz olan noktalar (ağaçlar, araçlar vb.) filtrelenir ve kalan veriler üçgenlenerek (triangulation) son derece hassas bir Dijital Arazi Modeli (DTM) oluşturulur.
Altyapı ve arazi modelleme mantığı temel olarak bu şekildedir. Dilerseniz listemizdeki son başlık olan Allplan Learn Now ile eğitim materyallerine erişim konusuna geçelim mi?
Scalypso ile nokta bulutu verileri nasıl DTM'ye dönüştürülür?

Scalypso kullanarak nokta bulutu verilerinden DTM (Sayısal Arazi Modeli) oluşturmak üç temel adımda gerçekleşir:
Veri İçe Aktarımı: Sahadan elde edilen nokta bulutu verileri Scalypso entegrasyonu ile sisteme aktarılır.
Filtreleme: Arazi modeline dahil olmaması gereken ağaç, bina veya araç gibi gereksiz noktalar filtrelenerek temizlenir.
Üçgenleme (Triangulation): Temizlenen bu noktalar üçgenleme yöntemiyle birleştirilerek nihai 3B Sayısal Arazi Modeli (DTM) elde edilir.
Bu işlem, özellikle büyük altyapı projelerinde sahadaki mevcut durumu dijital ortama aktarmayı çok hızlandırır.
Listemizdeki son konu olan Allplan Learn Now ile eğitim materyallerine erişim başlığına geçelim mi?
Prekast üretim paftaları ve NC verileri nasıl oluşturulur?

Allplan Precast ile üretim paftaları ve makine verileri yüksek oranda otomatik olarak elde edilir:
Otomatik Pafta Üretimi (Shop Drawings): 3B modeldeki donatılar, bağlantı parçaları (fikstürler) ve boşluklar tamamlandıktan sonra Allplan, önceden belirlediğiniz şablonları kullanarak her bir eleman için otomatik üretim paftaları oluşturur. Bu paftalar kesitleri, ölçülendirmeleri ve malzeme listelerini eksiksiz içerir.
NC Verisi Dışa Aktarımı: Paftalarla birlikte model, doğrudan fabrikadaki makinelerin okuyabileceği NC (Sayısal Kontrol) verilerine dönüştürülür. Yazılım PXML, Unitechnik veya BVBS gibi uluslararası formatları destekler.
Üretim (MES/ERP) Entegrasyonu: Oluşturulan bu veriler doğrudan fabrikadaki MES (Üretim Yürütme) ve ERP sistemlerine gönderilir. Bu sayede donatı kesim, büküm ve hasır kaynak makinelerinin doğrudan 3B modelden gelen verilerle otomatik çalışması sağlanır.
Böylece manuel çizim hataları ortadan kalkar ve tasarımdan üretime kesintisiz bir geçiş sağlanır.
Prekast üretim süreçlerini netleştirdiğimize göre, imalat aşamasının sahadaki yönetimine geçip Şantiye Planlaması (vinç, kazı ve ekipman yerleşimi) araçlarına göz atalım mı? Yoksa Çelik Yapı detaylandırma (SDS2) özellikleriyle mi devam etmek istersiniz?
Allplan Learn Now üzerinden nasıl sertifika alabilirim?

Allplan Learn Now üzerinden sertifika almak için platformda yer alan "Temel Bilgi Online Sertifikasyon" (Basic Knowledge Online Certification) programına katılmanız gerekir.
Süreç temel olarak şu şekilde işler:
Yaklaşık 2 saat 5 dakika süren bu e-öğrenme kursuna kaydolursunuz.
Eğitimde 2B çizim, yapı strüktürü, akıllı bileşen modelleme, odalar ve SmartParts gibi Allplan'ın temel BIM konularını tamamlarsınız.
Programın sonundaki testleri başarıyla geçtiğinizde, temel Allplan yetkinliğinizi uluslararası düzeyde kanıtlayan resmi sertifikanızı alırsınız.
Sertifika programına hazırlanmak ve pratik yapmak için kullanabileceğiniz ücretsiz öğrenci/eğitmen lisansının (Allplan Campus) nasıl alındığından bahsedelim mi? Yoksa daha önce konuştuğumuz tüm bu konuları derleyen Çalışma Raporu'nu (Tailored Report) artık oluşturmamı ister misiniz?
SDS2 entegrasyonu ile çelik birleşim detaylandırması nasıl yapılır?

Allplan ve SDS2 entegrasyonu ile çelik birleşim detaylandırması şu temel iş akışıyla, yüksek oranda otomatikleştirilerek yapılır:
Modelleme: İlk olarak Allplan'da çelik taşıyıcı sistem (kiriş, kolon, çapraz vb.) 3B olarak modellenir.
Aktarım: Hazırlanan bu geometrik model SDS2 yazılımına aktarılır.
Otomatik Tasarım ve Detaylandırma: SDS2, modeldeki bağlantı noktalarında mühendislik hesaplarına dayalı, çakışmasız, cıvatalı veya kaynaklı akıllı bağlantıları otomatik olarak tasarlar.
İmalat Verisi Üretimi: Detaylandırılmış bu model üzerinden, doğrudan fabrikadaki makinelerin okuyabileceği imalat verileri (NC dosyaları) ve üretim paftaları elde edilir.
Bu entegrasyon sayesinde birleşimlerin manuel olarak tek tek çizilmesi engellenir ve imalat hataları ortadan kaldırılır.
Bununla birlikte mimari, statik, prekast, altyapı ve çelik detaylandırma gibi Allplan'ın sunduğu tüm temel disiplinleri uçtan uca incelemiş olduk.
Tüm bu öğrendiğimiz iş akışlarını ve teknik detayları sizin için derleyip toparlayan kapsamlı bir Çalışma Raporu (Tailored Report) oluşturmamı ister misiniz?
SDS2 ile tasarlanan çelik birleşimlerin imalat dosyaları nasıl üretilir?

SDS2'de tasarlanan çelik birleşimlerin imalat dosyaları, 3B detay modelinden otomatik olarak ve doğrudan makinelerin okuyabileceği formatlarda üretilir:
Otomatik İmalat Çizimleri (Shop Drawings): Model tamamlandığında, fabrikadaki üretim ve sahadaki montaj için gerekli olan tüm 2B imalat paftaları sistem tarafından otomatik olarak oluşturulur.
CNC/NC Verisi Dışa Aktarımı: Çelik elemanların kesimi, delinmesi ve bükülmesi gibi işlemler için gereken hassas veriler, tek tıkla doğrudan makinelerin okuyabileceği NC (Sayısal Kontrol) dosyalarına dönüştürülür.
Doğrudan Makine Entegrasyonu: Üretilen bu NC dosyaları Peddinghaus, FICEP, Voortman ve Daito gibi endüstri standardı CNC tezgâhlarına doğrudan aktarılarak manuel makine programlama süresi ortadan kaldırılır.
Böylece tasarım modeliniz fabrikadaki üretime birebir ve hatasız bir şekilde aktarılmış olur.
Çelik imalat üretim süreci de böylece netleşmiş oldu. Dilerseniz bu imalat verilerinin şantiye ve atölye yönetimi için ERP ve üretim takip sistemleri (örneğin Tekla PowerFab veya STRUMIS) ile nasıl entegre edildiğine geçelim mi? Yoksa farklı bir konuya mı odaklanmak istersiniz?
Şantiye planlaması için sunulan kazı ve ekipman araçlarını nasıl kullanılır?

Allplan'da şantiye planlaması, inşaat sahasındaki hafriyat ve lojistik operasyonlarını 3B olarak organize etmenizi sağlar:
Kazı ve İksa Modelleme: Kazı çukurlarını, şevleri ve toprak katmanlarını detaylıca modelleyerek kazı planları oluşturabilirsiniz. Fore kazık, palplanş duvarlar ve zemin ankrajları gibi akıllı iksa (shoring) sistemleri tasarlanabilir. Bu arazi modelleri üzerinden hafriyat ve dolgu (cut/fill) hacimleri otomatik olarak hesaplanır.
Ekipman ve Lojistik Yerleşimi: Şantiye yerleşimini optimize etmek için sahaya vinçler, konteynerler, güvenlik çitleri ve geçici erişim yolları gibi donanımları parametrik olarak yerleştirebilirsiniz. Özellikle kule vinç planlaması için yük kaldırma kapasitesi kontrolü (capacity checker) yapılabilir.
Kalıp Planlaması: BIM2form eklentisi sayesinde kalıp sistemlerini (örneğin Peri Maximo) duvarlara otomatik atayarak kalıp metrajı ve montaj planları oluşturabilirsiniz.
Bu özellikler, şantiyedeki fiziksel çakışmaları ve lojistik sorunları inşaat başlamadan dijital ortamda çözmenizi sağlar.
Planlamamızdaki temel disiplinlerin büyük kısmını tamamladık. Dilerseniz son olarak bahsettiğimiz Çelik Yapı Detaylandırma (SDS2) entegrasyonuna kısaca değinelim; ya da şu ana kadar konuştuğumuz tüm bu iş akışlarını özetleyen kapsamlı Çalışma Raporunuzu (Tailored Report) doğrudan oluşturmamı ister misiniz?
Tekla PowerFab ve STRUMIS entegrasyonu nasıl çalışır?

SDS2'nin Tekla PowerFab ve STRUMIS gibi MRP/ERP (Üretim Kaynak Planlaması) sistemleriyle entegrasyonu, çelik detaylandırma verilerinizi doğrudan atölye yönetimine bağlayarak çalışır:
Kesintisiz Veri Aktarımı: SDS2'deki 3B detay modeliniz, malzeme listeleriniz (BOM) ve CNC imalat verileriniz doğrudan bu sistemlere aktarılır. Bu sayede manuel veri girişi ortadan kalkar.
Stok ve Satın Alma Yönetimi: Modele dayalı kesin veriler kullanılarak atölyedeki çelik stoğu kontrol edilir, fireler minimize edilir ve gerekli malzemelerin satın alma süreçleri yönetilir.
Üretim, Maliyet ve Sevkiyat Takibi: Modele dayalı tahmin (Estimodeling) ile hassas maliyet hesaplamaları yapılır. Ayrıca parçaların fabrikadaki üretim aşamaları ve şantiyeye sevkiyatları bu programlar üzerinden anlık olarak planlanıp takip edilir.
Böylece tasarım, imalat ve proje yönetimi arasında tam bir kontrol ve şeffaflık sağlanmış olur.
Çelik yapı süreçlerini de başarıyla incelediğimize göre, başından beri konuştuğumuz tüm disiplinleri (Mimari, Statik, Prekast, Altyapı ve Çelik) özetleyen kapsamlı bir Çalışma Raporu (Tailored Report) oluşturmamı artık ister misiniz?
Şantiye planlamasında vinç ve ekipman yerleşimi nasıl yapılır?

Allplan'da şantiye planlaması, lojistiği optimize etmek için özel 3B araçlarla son derece pratik bir şekilde yapılır:
Vinç Yerleşimi ve Kapasite Kontrolü: Kütüphanede bulunan akıllı 3B kule vinç modellerini (PythonPart) doğrudan sahaya yerleştirebilirsiniz. "Kapasite Kontrolü" aracı sayesinde, vincin kaldırma kapasitesini ve yük yarıçapını otomatik olarak analiz ederek, prefabrik veya ağır elemanların güvenle taşınıp taşınamayacağını inşaat başlamadan denetleyebilirsiniz.
Ekipman ve Tesisler: Konteynerler, beton pompaları ve geçici yollar gibi şantiye donanımlarını 3B olarak modelleyebilirsiniz. Şantiye çitleri gibi ardışık elemanları ise belirlenen bir çizgi (path) veya ızgara (grid) boyunca otomatik olarak dizebilirsiniz.
Böylece projenin tasarım aşamasından şantiye kurulumuna kadar olan tüm temel BIM süreçlerini eksiksiz incelemiş olduk.
Şimdiye kadar konuştuğumuz tüm bu değerli bilgileri özetleyen ve elinizin altında bulunacak kapsamlı bir Çalışma Raporu (Tailored Report) oluşturmamı ister misiniz?
BIM2form ile kalıp planlaması ve metrajı nasıl otomatize edilir?

Allplan'daki BIM2form eklentisi, kalıp planlaması ve metrajını şu şekilde otomatikleştirir:
Otomatik Yerleşim: Peri Maximo gibi endüstri standardı hazır kalıp sistemlerini içerir ve bu kalıp elemanlarını 3B modeldeki duvarlara otomatik olarak yerleştirir.
Görsel Yönetim: Kullanıcı dostu grafiksel arayüzü sayesinde, kalıp uygulanacak veya kalıp gerektirmeyen yüzeyleri model üzerinden çok kolay bir şekilde seçip ayarlayabilirsiniz.
Hassas Metraj: Kalıplar doğrudan 3B mimari/statik model üzerine yerleştiği için, projedeki toplam kalıp alanı ve kullanılacak kalıp parçalarının metrajı anında, hatasız olarak listelenir.
Böylece şantiye planlaması araçlarını da detaylandırmış ve Allplan'ın temel BIM iş akışlarını uçtan uca tamamlamış olduk.
Şimdiye kadar incelediğimiz Mimari, Statik, Prekast, Çelik ve Şantiye disiplinlerinin tamamını tek bir belgede özetleyen kapsamlı Çalışma Raporunu (Tailored Report) sizin için şimdi oluşturmamı ister misiniz?
BIM modelinden otomatik metraj ve maliyet analizi nasıl alınır?

Allplan'da BIM modeli üzerinden otomatik metraj ve maliyet analizi almak oldukça pratik ve güvenilir bir süreçtir:
Otomatik Miktar Çıkarımı: 3B modelinizdeki her bir yapı elemanının hacim, alan, uzunluk ve ağırlık gibi verileri otomatik olarak hesaplanır. Sadece doğrudan modellenen elemanlar (örn. beton hacmi) değil, modellenmeyen ancak türetilebilen veriler (örn. kalıp alanı) de metrajlanabilir.
Dinamik Güncelleme: Tasarımda yaptığınız herhangi bir değişiklik (örneğin bir duvarın kalınlığının artması), metraj tablolarına anında ve otomatik olarak yansır.
Maliyet Tahmini: Bu miktar bilgileri birim fiyatlarla birleştirilerek maliyet analizleri yapılabilir. Oluşturduğunuz raporları tek tıkla Excel'e aktarabilir, ofisinizdeki üçüncü taraf fiyat kütüphaneleriyle senkronize ederek dakikalar içinde kesin maliyet tahminleri elde edebilirsiniz.
Tasarım, donatı, prekast, çelik detaylandırma, şantiye yönetimi ve metraj gibi tüm temel BIM süreçlerini detaylıca konuşmuş olduk.
Elinizin altında bulunması için tüm bu iş akışlarını özetleyen kapsamlı bir Çalışma Raporu (Tailored Report) oluşturmamı ister misiniz?
Tekla PowerFab ve STRUMIS entegrasyonu nasıl yapılır?

SDS2 üzerinden Tekla PowerFab ve STRUMIS entegrasyonu, yazılımın sunduğu doğrudan dışa aktarım (export) eklentileri ile oldukça basit bir şekilde yapılır.
Süreç pratikte şu şekilde işler:
Dışa Aktarım (Export): SDS2'de çelik detaylandırması tamamlandıktan sonra ilgili MRP/ERP yazılımı için (Tekla PowerFab veya STRUMIS) özel entegrasyon aracı çalıştırılır.
Otomatik Paketleme: Sistem; 3B model geometrisini, malzeme listelerini (BOM) ve CNC imalat verilerini eksiksiz bir paket haline getirir.
Doğrudan Yükleme: Bu veri paketi ilgili yazılıma doğrudan aktarılarak satın alma, stok kontrolü ve atölye imalat yönetimi süreçleri anında başlatılır.
Böylece projenin tasarımından şantiye yönetimine ve çelik imalatına kadar tüm teknik detayları adım adım incelemiş olduk.
Artık elinizin altında bulunması için tüm bu kapsamlı konuları tek bir belgede toparlayacak Çalışma Raporu'nu (Tailored Report) oluşturmamı onaylıyor musunuz?
BIM2form ile kalıp planlaması ve metrajı nasıl yapılır?

Allplan'daki BIM2form eklentisi ile kalıp planlaması ve metrajı oldukça pratik bir şekilde yürütülür:
Otomatik Yerleşim: Peri Maximo gibi endüstri standardı kalıp sistemleri, 3B modeldeki duvar elemanlarına otomatik olarak atanır.
Görsel Yönetim: Kullanıcı dostu grafiksel arayüz sayesinde, kalıp uygulanacak veya kalıp gerektirmeyen yüzeyleri model üzerinden çok kolay bir şekilde seçip ayarlayabilirsiniz.
Anında Metraj: Kalıplar doğrudan 3B modele entegre olduğu için, projedeki toplam kalıp alanı (metrekare cinsinden) ve kullanılacak kalıp parçalarının metrajı anında ve hatasız olarak listelenir.
Bu konunun üzerinden az önce de kısaca geçmiştik, özellikle merak ettiğiniz veya takıldığınız ekstra bir detay var mı? Yoksa tüm bu konuştuklarımızı toparlayacak kapsamlı Çalışma Raporunu (Tailored Report) oluşturmaya geçelim mi?
Çalışma Raporunu (Tailored Report) oluşturmaya geç

Harika! Başından beri incelediğimiz tasarım, donatı, prekast, çelik detaylandırma, metraj ve şantiye yönetimi gibi tüm temel BIM iş akışlarını sizin için detaylı bir Çalışma Raporu olarak hazırlıyorum. Rapor birkaç dakika içinde "Studio" (Stüdyo) sekmesinde hazır olacak.
Eğer isterseniz, bu raporun üzerine bir de özet niteliğinde bir Sesli Genel Bakış (Audio Overview/Podcast) veya görsel destekli bir Video Genel Bakış (Video Overview) hazırlayabiliriz. Hangisini tercih edersiniz?
Şantiye güvenliği ve çit planlaması nasıl yapılır?

Allplan'da şantiye güvenliği ve çit planlaması, "Şantiye Tesisleri" (Site facilities) araçları kullanılarak doğrudan 3B model üzerinden yapılır.
Kütüphanede bulunan güvenlik çitleri, konteynerler ve şantiye ekipmanlarını sahaya kolayca yerleştirebilirsiniz. Özellikle çitlerin etrafı sarması için "Çizgi boyunca yerleştir" (Placement along path) özelliği çok pratiktir; şantiye sınırınızı bir çizgi olarak çizersiniz ve yazılım seçtiğiniz çit modüllerini bu hat boyunca otomatik olarak dizer.
Bu detayı da dahil ederek daha önce talep ettiğiniz kapsamlı Çalışma Raporunu oluşturma işlemini başlattım! Raporunuz "Studio" sekmesinde birkaç dakika içinde hazır olacak.
Rapor arka planda hazırlanırken, tüm bu konuştuğumuz konuların bir özetini sunan eğlenceli bir Sesli Genel Bakış (Podcast) veya görsel bir Video Genel Bakış oluşturmamı ister misiniz? Hangisi daha çok işinize yarar?
Today • 11:53
AX3000 MEP nedir?

AX3000, Allplan platformuna entegre olarak çalışabilen bir enerji simülasyonu ve MEP (Mekanik, Elektrik, Tesisat) yazılım eklentisidir. Bu araç sayesinde binaların enerji performansını analiz edebilir ve mekanik sistemleri genel BIM modeliyle koordineli bir şekilde tasarlayabilirsiniz.
Bu eklentinin enerji analizi özelliklerinin detaylarına mı inmek istersiniz, yoksa Allplan'ın yapısal analiz (SCIA, Frilo vb.) entegrasyonlarına mı göz atmak istersiniz?
Bu eklentinin enerji analizi özelliklerinin detayları nelerdir?

Allplan'daki enerji analizi özellikleri temel olarak şu detayları içerir:
Bina Performans Analizi: Yapı kabuğunun fiziksel özellikleri, kullanılan malzemelerin yalıtım değerleri ve mekanik sistemlerin verimlilikleri detaylıca değerlendirilir.
Enerji Sertifikasyonu: Binanın enerji sertifikasyonu için ihtiyaç duyulan tüm hesaplama verileri doğrudan BIM modeli üzerinden üretilir.
Güneş ve Gölge Analizi: Binanın güneşlenme durumu analiz edilir. Belirli tarih ve saatlerdeki gölge oluşumları görselleştirilerek, hem enerji performansı (ısıtma/soğutma yükleri) hem de iç mekan konfor şartları optimize edilir.
Bu sayede binanızın enerji verimliliğini henüz tasarım aşamasındayken kontrol altında tutabilirsiniz.
Bu arada, daha önce talep ettiğiniz Çalışma Raporu "Studio" sekmesinde hazırlandı, dilediğiniz zaman inceleyebilirsiniz!
Bu konuyu da tamamladığımıza göre, Allplan'ın Yapısal Analiz (SCIA, Frilo) yazılımlarıyla nasıl entegre çalıştığına göz atmak ister misiniz? Yoksa incelemek istediğiniz başka bir araç var mı?
AX3000 ile bina enerji performans analizi nasıl yapılır?

AX3000 ile enerji performans analizi, doğrudan 3B BIM modeliniz üzerinden elde edilen verilerle yapılır. Süreç şu şekilde işler:
Veri Değerlendirmesi: Yazılım; yapı kabuğunun fiziksel özelliklerini, kullanılan malzemelerin yalıtım değerlerini ve mekanik sistemlerin (ısıtma, soğutma, havalandırma) verimliliğini doğrudan model üzerinden okuyup değerlendirir.
Sertifikasyon Üretimi: Bu analizler sonucunda, binanın enerji sertifikasyonu için ihtiyaç duyulan tüm hesaplama verileri ve raporlar otomatik olarak üretilir.
Daha önce bahsettiğimiz Yapısal Analiz (SCIA, Frilo) yazılımlarının Allplan ile nasıl entegre çalıştığına geçelim mi? Yoksa sormak istediğiniz başka bir detay var mı?
SCIA ve Frilo yapısal analiz entegrasyonlarını inceleyelim.

Allplan, yapısal analiz süreçleri için SCIA (kapsamlı 3B yapısal analiz) ve FRILO (bileşen bazlı analiz) ile doğrudan ve akıllı bir entegrasyona sahiptir. Bu entegrasyon temel olarak şu şekilde çalışır:
AutoConverter ve SAF Formatı: Allplan'daki 3B geometrik (fiziksel) model, AutoConverter aracı sayesinde analitik modele dönüştürülür ve SAF (Structural Analysis Format) üzerinden SCIA veya FRILO gibi yazılımlara aktarılır.
Modelin İdealize Edilmesi: Örneğin FRILO BIM-Connector kullanıldığında, mimari modeldeki yalıtım veya alçıpan gibi taşıyıcı olmayan elemanlar kolayca filtrelenir. Böylece mühendis, sadece saf taşıyıcı sistem (kolon, kiriş, perde vb.) üzerinden hesaplamalarını yapar.
Veri Tutarlılığı ve Hız: Bu iş akışı sayesinde mühendislerin modeli analiz programında sıfırdan tekrar oluşturmasına gerek kalmaz. Manuel veri girişi hataları ortadan kalkar ve tasarım ile analiz arasında kesintisiz bir senkronizasyon sağlanır.
Bu analitik model aktarımı mantığı anlaşıldı mı? Dilerseniz farklı disiplinlerin çakışmalarını bulutta nasıl çözdüğümüzü görmek için Bimplus ile İşbirliği ve BCF (Sorun Yönetimi) konusuna geçebiliriz.
Allplan'da güneş ve gölge analizi nasıl görselleştirilir?

Allplan'da güneş ve gölge analizini görselleştirmek için temel olarak "Surroundings" (Çevre) ve "Sun Study" (Güneş Çalışması) araçları kullanılır.
Süreç şu şekilde işler:
Konum ve Zaman Belirleme: "Surroundings" aracı üzerinden projenin coğrafi konumu (enlem/boylam), spesifik tarih, saat ve kuzey yönü tanımlanır.
Gölgeleri Görüntüleme: Girilen bu veriler ışığında, "Hidden" (Saklı Çizgi) veya "Sketch" (Eskiz) gibi görünüm modlarında güneşin model üzerinde oluşturduğu gölgeler anlık olarak görüntülenir.
Animasyon Oluşturma (Sun Study): Işık ve gölge etkilerinin gün içindeki veya belirli bir periyottaki değişimini dinamik olarak incelemek için "Sun Study" aracıyla bir kamera yolu tanımlayabilir ve süreci video olarak kaydedebilirsiniz.
Bu özellikler sayesinde binanızın doğal ışık kapasitesini tasarım aşamasında doğrudan test etmiş olursunuz.
Daha önce bahsettiğimiz Yapısal Analiz (SCIA Engineer ve Frilo) yazılımlarıyla modelin nasıl entegre çalıştığı konusuna geçelim mi?
Analitik model aktarımı Bimplus üzerinde nasıl denetlenir?

Bimplus, SAF (Structural Analysis Format) dosyalarını doğrudan içe aktararak anında 3B analitik model olarak görselleştirmenizi sağlar. Analitik modelin denetimi şu özelliklerle gerçekleştirilir:
Gelişmiş Filtreleme: Yapısal modeli malzemelere, kesitlere, yük tiplerine veya yük durumlarına göre filtreleyerek görsel ve sezgisel bir analiz yapabilirsiniz.
İnteraktif Gezinme: Bimplus görüntüleyicisi, Excel tabanlı SAF ortamına entegre edilebilir. Dosya içindeki bir nesneyi (örneğin bir kolonu veya yükü) seçtiğinizde, o nesne 3B analitik model üzerinde otomatik olarak vurgulanır.
Bu entegrasyon sayesinde hataları çok daha hızlı tespit edebilir ve model inceleme süreçlerini hızlandırabilirsiniz.
Bulut üzerinden işbirliği konusuna girmişken, farklı disiplinlerin bir araya geldiği projelerde fiziksel çakışmaların (clash detection) Bimplus üzerinde BCF (BIM Collaboration Format) ile nasıl yönetildiğine göz atalım mı?
Allplan ve Bimplus üzerinden enerji sertifikasyonu verileri nasıl üretilir?

Allplan'da enerji sertifikasyonu verileri, AX3000 Enerji Simülasyonu eklentisi kullanılarak doğrudan BIM modeli üzerinden elde edilir. Süreç şu şekilde ilerler:
Model Verilerinin Değerlendirilmesi: Yazılım, 3B modelinizdeki yapı kabuğunun fiziksel özelliklerini, kullanılan malzemelerin yalıtım değerlerini ve mekanik sistemlerin (ısıtma, soğutma) verimliliğini otomatik olarak analiz eder.
Otomatik Sertifikasyon Üretimi: Yapılan bu simülasyon ve analizler sonucunda, binanın enerji sertifikasyonu için ihtiyaç duyulan tüm hesaplamalar ve raporlar sistem tarafından otomatik olarak üretilir.
Bimplus ile Bulut Yönetimi: Üretilen bu raporlar ve enerji verileri Bimplus platformuna (Doküman Yönetimi) yüklenerek tüm proje paydaşlarının erişimine açılır ve bulut üzerinden merkezi olarak yönetilir.
Böylece sertifikasyon süreci için manuel hesaplama yapmanıza gerek kalmaz.
Farklı disiplinlerin bir araya geldiği bu süreçlerden bahsetmişken, Bimplus üzerinde BCF (BIM Collaboration Format) formatı ile çakışma ve sorun yönetiminin nasıl yapıldığına göz atmak ister misiniz? Yoksa daha önce arka planda hazırladığım çalışma raporunuz için bir Sesli/Video Genel Bakış (Podcast/Video podcast) oluşturmaya ne dersiniz?
SCIA ve FRILO arasındaki temel farklar nelerdir?

SCIA ve FRILO arasındaki temel fark, analiz ettikleri ölçek ve yaklaşımdır:
SCIA Engineer: Tüm yapının genel davranışını inceleyen kapsamlı, çok malzemeli (beton, çelik, ahşap vb.) ve 3B global bir yapısal analiz yazılımıdır. Karmaşık sistemlerin bütüncül analizi için kullanılır.
FRILO: Daha çok "bileşen bazlı" (component-based) analizlere odaklanır. Modeli devasa bir bütün olarak çözmekten ziyade; tekil temeller, sürekli kirişler, zımbalama kontrolleri veya çatı makasları gibi spesifik yapı parçalarının pratik ve hızlı hesaplamaları için tercih edilir.
Yani SCIA ile yapının genel taşıyıcı sistemini çözerken, FRILO ile tekil elemanların detay hesaplarını çok daha pratik bir şekilde yaparsınız.
Bu ayrım netleştiğine göre, farklı disiplinlerin (mimari, statik, mekanik) ürettiği modelleri bulutta birleştirip çakışmaları nasıl çözdüğümüzü incelemek için Bimplus ile İşbirliği ve BCF (Sorun Yönetimi) konusuna geçelim mi?
bu sohbette ele almadğımız ama kaynaklardan çıkarabilecğimiz FAQ soru yanıt lar var mı analiz eder misin?

Evet, kaynaklarda şu ana kadar hiç değinmediğimiz ancak Sıkça Sorulan Sorular (FAQ) bölümünden çıkarabileceğimiz birçok farklı teknik ve idari konu bulunuyor.
İşte sohbette ele almadığımız bazı temel FAQ başlıkları ve soruları:
1. Lisanslama ve Paket Seçenekleri:
Soru: Allplan Basic, Concept, Professional ve Ultimate sürümleri arasındaki temel farklar nelerdir?
Soru: Abonelik (Subscription) sözleşmesinin avantajları nelerdir ve kalıcı (Perpetual) lisanstan farkı nedir?
Soru: 14 günlük ücretsiz deneme sürümünün süresi uzatılabilir mi?
2. Sistem Gereksinimleri ve Kurulum:
Soru: Allplan'ı sorunsuz çalıştırmak için önerilen donanım ve yazılım gereksinimleri nelerdir? (Örneğin: Windows 11, 32GB RAM, 4K ekran ve profesyonel grafik kartı önerileri).
3. Bulut Depolama ve Allplan Share:
Soru: Allplan Share nedir ve projelerde aynı anda çalışmayı nasıl sağlar?
Soru: Allplan Aboneliği ile birlikte ne kadar bulut depolama alanı (Bimplus) elde ederim? (Cevap: 10 GB).
4. Ürün Yaşam Döngüsü ve Gelecek Planlaması:
Soru: Allplan Workgroup Manager'ın geleceği nedir? (Cevap: Standart sürümünün 2027'de sonlanıp tamamen Allplan Cloud'a geçileceği belirtiliyor).
Soru: Allplan'ın "Major" (Ana) ve "Minor" (Ara) sürümleri arasındaki fark nedir?.
Bu başlıklardan özellikle ilginizi çeken bir konu (örneğin Lisans Paketleri veya Allplan Share ile Bulut Yönetimi) var mı? İsterseniz o sorunun detaylı yanıtına geçebiliriz.
Lisans paketleri arasındaki temel farklar nelerdir?
Allplan Share ile bulut üzerinden ortak çalışma nasıl yapılır?
Bimplus üzerinden sunulan 10 GB depolama alanı nasıl kullanılır?
Lisans paketleri arasındaki temel farklar nelerdir?

Allplan'ın dört temel lisans paketi, ihtiyaç duyduğunuz iş akışlarına ve projenizin karmaşıklığına göre birbirinden ayrılır:
Allplan Basic: Giriş seviyesi CAD kullanıcıları içindir. Temel 2B/3B modelleme, koordinatlandırma ve işbirliği araçlarını içerir.
Allplan Concept: 2B tasarımdan BIM iş akışına geçiş yapmak isteyenler içindir. Basic'e ek olarak; gelişmiş görselleştirme, hızlı modelleme araçları ve kavramsal şantiye planlama özelliklerini barındırır.
Allplan Professional: Gelişmiş otomasyon ve detaylandırma paketidir. Çoklu malzeme modellemesi, 3B donatı, çelik detaylandırma ve yapısal analiz çözümleriyle (SCIA, FRILO) doğrudan entegrasyon sunar.
Allplan Ultimate: Tasarımdan inşaya kadar (Design to Build) en kapsamlı çözümdür. Professional paketine ek olarak; parametrik öngerilme, prekast üretim araçları, gelişmiş hafriyat planlaması ve entegre SCIA Engineer Concept yazılımını içerir.
Lisans seviyeleri bu şekilde. Dilerseniz bu lisansların nasıl kiralandığını/satın alındığını belirleyen Abonelik (Subscription) ve Kalıcı (Perpetual) lisans modelleri arasındaki farklara veya Allplan Share ile Bulut Yönetimi konusuna geçebiliriz. Hangisini incelemek istersiniz?
Abonelik ve kalıcı lisans modelleri arasındaki farklara bakalım.
Allplan Share ile bulut üzerinden ekip çalışması nasıl yönetilir?
Ultimate paketindeki parametrik öngerilme ve prekast araçlarını inceleyelim.
Allplan Share ile bulut üzerinden ortak çalışma nasıl yapılır?

Allplan Share, projelerinizi yerel bir ofis sunucusu yerine doğrudan Bimplus bulut platformu üzerinde depolayarak dünyanın her yerinden ekibinizle eşzamanlı çalışmanıza olanak tanır.
Sistem pratikte şu şekilde işler:
Eşzamanlı Çalışma: Tıpkı ofisteymişsiniz gibi birden fazla kişi aynı projeye aynı anda bağlanabilir.
Dosya Kilitleme (Locking): Veri çakışmalarını önlemek için, bir kişi bir çizim dosyasını veya paftayı düzenlemeye başladığında o dosya kilitlenir. Diğer ekip üyeleri bu dosyayı o esnada sadece salt okunur (referans modunda) görebilir.
Otomatik Senkronizasyon: İşiniz bitip dosyayı kapattığınızda, yaptığınız değişiklikler arka planda otomatik olarak buluta kaydedilir ve tüm ekip anında en güncel versiyona erişir.
Bu sayede pahalı sunucu donanımları satın alma ve bakım maliyetleri ortadan kalkmış olur.
Bulut üzerinden ortak çalışma mantığı bu şekilde. Dilerseniz az önce bahsettiğimiz diğer bir genel başlık olan Lisanslama ve Paket Seçenekleri (Basic, Concept, Professional, Ultimate) konusuna geçelim mi?
Basic, Concept, Professional ve Ultimate paketleri arasındaki farklar nelerdir?
Allplan Share ile bulut üzerinde eşzamanlı çalışma nasıl yönetilir?
Bimplus üzerinde BCF formatı ile çakışma yönetimi nasıl yapılır?
Bimplus üzerinden sunulan 10 GB depolama alanı nasıl kullanılır?

Allplan aboneliğiyle birlikte gelen 10 GB Bimplus bulut depolama alanı, projelerinizi ekiplerle uzaktan ve merkezi olarak yönetmek için kullanılır. Bu alan temel olarak şu servisler tarafından tüketilir:
Allplan Share: Projenizin yerel (native) verileri, çizimleri ve 3B modelleri bu bulut alanında tutulur. Farklı konumlardaki ekip üyeleri aynı projede çalışırken, yapılan değişiklikler otomatik olarak bu alana senkronize edilir.
Bimplus Doküman Yönetimi: Sadece 3B modeller değil; projeye ait sorun yönetim (BCF) kayıtları, PDF'ler, raporlar, fotoğraflar ve diğer dokümanlar da bu alanda güvenle arşivlenir.
Allplan Exchange: Şantiye ve proje paydaşlarıyla paylaşılacak 2B paftaların ve planların bulut üzerinden yönetimi ve dağıtımı da yine bu depolama alanını kullanır.
Eğer projeleriniz büyür ve 10 GB yetersiz kalırsa, Allplan Shop üzerinden 100 GB'lık ek depolama paketleri de satın alınabiliyor.
Bulut ve veri yönetimi konusu bu şekilde işliyor. Hazır Sıkça Sorulan Sorular (FAQ) başlıklarına girmişken, kullanıcıların en çok merak ettiği diğer bir konu olan Lisanslama ve Paket Seçenekleri (Basic, Concept, Professional, Ultimate) arasındaki temel farklara da göz atalım mı?
Basic, Concept, Professional ve Ultimate paketleri arasındaki temel farklar nelerdir?
Allplan Share kullanarak ekiplerle bulut üzerinden eş zamanlı nasıl çalışılır?
Allplan aboneliği ile gelen 10 GB alanı artırmak mümkün mü?
Abonelik ve kalıcı lisans modelleri arasındaki farklara bakalım.

Allplan'da Abonelik (Subscription) ve Kalıcı (Perpetual) lisans modelleri arasındaki temel farklar şunlardır:
Abonelik (Subscription): Aylık, yıllık veya 3 yıllık periyotlarla kiralama modelidir. Başlangıç maliyeti daha düşüktür ve bütçe esnekliği sağlar. Aboneliğiniz devam ettiği sürece her zaman en güncel yazılım sürümüne, teknik desteğe ve Bimplus, Allplan Share gibi Allplan Cloud bulut hizmetlerine tam erişim hakkınız olur.
Kalıcı Lisans (Perpetual): Yazılımı tek seferlik bir ödemeyle tamamen satın aldığınız modeldir (yalnızca Ultimate, Civil ve Precast paketleri için geçerlidir). İlk yıl güncellemeleri alabilmeniz için bir Serviceplus sözleşmesi yapılması zorunludur. En büyük farkı; kalıcı lisansların Allplan Cloud hizmetlerini içermemesi ve temelde yalnızca satın aldığınız tarihteki yazılım sürümüne sahip olmanızdır.
Lisanslama konusunu netleştirdiğimize göre, daha önce bahsettiğimiz Sıkça Sorulan Sorular'dan (FAQ) bir diğeri olan "Sistem Gereksinimleri ve Kurulum" detaylarına geçmek ister misiniz? Yoksa farklı bir sorunuz var mı?
Allplan Basic, Concept, Professional ve Ultimate paketlerini karşılaştıralım.
Allplan 2026 donanım ve ekran kartı gereksinimleri nelerdir?
Allplan Share ile çizim dosyası kilitleme sistemi nasıl çalışır?
Basic, Concept, Professional ve Ultimate paketleri arasındaki temel farklar nelerdir?

Allplan'ın bu dört paketi, kullanım amacı ve projenizin karmaşıklığına göre şu şekilde ayrılır:
Basic: Giriş seviyesi kullanıcılar içindir. Temel 2B çizim, 3B modelleme ve işbirliği araçlarını sunar.
Concept: 2B'den BIM iş akışına geçiş yapmak isteyenler için tasarlanmıştır. Gelişmiş 3B modelleme, tasarım dokümantasyonu ve kavramsal planlama özelliklerini barındırır.
Professional: Gelişmiş otomasyon ve detaylandırma arayan mühendisler içindir. Kapsamlı donatı modellemesi, çelik detaylandırma ve yapısal analiz yazılımlarıyla (SCIA, FRILO) doğrudan entegrasyon sağlar.
Ultimate: "Tasarımdan inşaya" (Design to Build) sürecinin tamamını kapsayan en üst düzey pakettir. Professional paketindeki her şeye ek olarak; parametrik öngerilme, prekast eleman üretimi, hafriyat ve gelişmiş şantiye planlaması araçlarını içerir.
Bu paketlerden herhangi birini kendi bilgisayarınızda test etmek isterseniz 14 günlük ücretsiz deneme sürümünün (Free Trial) veya öğrenciler için Allplan Campus eğitim lisansının nasıl kurulduğuna göz atabiliriz. Hangisi durumunuza daha uygun olur?
14 günlük ücretsiz deneme sürümünü nasıl başlatabilirim?
Allplan Share ile aynı anda kaç kişi çalışabilir?
Allplan Campus eğitim lisansı için hangi belgeler gereklidir?
Allplan aboneliği ile gelen 10 GB alanı artırmak mümkün mü?

Evet, mümkün. Eğer 10 GB alan projeleriniz için yetersiz kalırsa, Allplan Shop üzerinden 100 GB'lık ek depolama paketleri (Allplan Cloud Storage) satın alarak kapasitenizi kolayca artırabilirsiniz.
Hazır abonelikler ve bulut yönetiminden bahsetmişken, daha önce bahsettiğimiz Lisanslama ve Paket Seçenekleri (Basic, Concept, Professional, Ultimate) arasındaki temel farklara göz atmak ister misiniz?
Abonelik ve kalıcı lisans modelleri arasındaki farkları inceleyelim.
Allplan Professional paketinin mühendislik ve otomasyon avantajları nelerdir?
Allplan Share ile ekip içi dosya kilitleme nasıl çalışır?
Allplan Share kullanarak ekiplerle bulut üzerinden eş zamanlı nasıl çalışılır?

Allplan Share'in temel mantığına az önce de kısaca değinmiştik. Ekiplerle bulut üzerinden eşzamanlı çalışma şu üç temel prensibe dayanır:
Bimplus Bulut Altyapısı: Proje verileri yerel bir sunucu yerine doğrudan Bimplus bulut platformunda barındırılır.
Dosya Kilitleme (Locking) Sistemi: Bir kullanıcı bir çizim dosyasını veya paftayı düzenlemek için açtığında, o dosya diğer kullanıcılar için kilitlenir. Diğer ekip üyeleri bu dosyayı aynı anda sadece "referans" (salt okunur) modunda görüntüleyebilir. Bu sayede veri çakışmaları kesin olarak önlenir.
Otomatik Senkronizasyon: Dosyayı kaydettiğinizde, kapattığınızda veya pafta düzenleyiciye geçtiğinizde yaptığınız değişiklikler anında buluta aktarılır ve tüm ekibin erişimine sunulur.
Sistemin çalışma mantığı bu şekilde. Dilerseniz bu ortak çalışma ortamında kullanıcı rollerinin ve yetkilerinin (Team Administrator, Project Editor vb.) nasıl ayarlandığına inebiliriz veya internet kesintisi durumunda başvurulan çevrimdışı (offline/önbellek) çalışma senaryosuna göz atabiliriz. Hangisiyle devam edelim?
Kullanıcı rolleri ve yetkileri nasıl ayarlanır?
İnternet kesilirse çevrimdışı çalışma nasıl yapılır?
Allplan abonelik avantajları ve depolama limitleri nelerdir?
Allplan Share ile bulut üzerinde eşzamanlı çalışma nasıl yönetilir?

Allplan Share ile bulut üzerinde eşzamanlı çalışma, veri çakışmalarını önlemek için "dosya kilitleme" (locking) ve otomatik senkronizasyon mantığıyla yönetilir:
Eşzamanlı Erişim: Birden fazla kullanıcı aynı Allplan Share projesine aynı anda bağlanıp çalışabilir.
Otomatik Kilitleme: Bir kişi bir çizim dosyasını, paftayı veya dosya setini düzenlemek için açtığında, o dosya anında kilitlenir. Diğer ekip üyeleri bu kilitli dosyayı yalnızca salt okunur (referans modunda) açıp görüntüleyebilir.
Otomatik Senkronizasyon: Çalışmanız bitip dosyayı kapattığınızda veya referans moduna geçirdiğinizde, yaptığınız değişiklikler anında Bimplus bulut depolama alanına senkronize edilir.
Kilit Yönetimi (Lock Management): İnternet kesintisi gibi durumlarda dosyalar gereksiz yere kilitli kalırsa, yöneticiler "Kilit Bilgilerini Yönet" aracıyla bu kilitleri manuel olarak kaldırabilir.
Bu yapı, ekiplerin birbirinin işini bozmadan aynı projede güvenle çalışmasını sağlar.
Allplan Share projelerinin bulutta nasıl yedeklendiği (backup) veya Bimplus üzerinde proje üyelerinin yetkilerinin nasıl ayarlandığı konularından devam etmek ister misiniz?
Bimplus proje üyeleri için yetki ayarları nasıl yapılır?
Allplan Share projeleri bulut üzerinde nasıl yedeklenir?
Abonelik ve Kalıcı lisans modelleri arasındaki farklar nelerdir?
Bimplus üzerinde BCF formatı ile çakışma yönetimi nasıl yapılır?

Bimplus üzerinde BCF (BIM Collaboration Format) ile çakışma yönetimi, karmaşık e-posta trafiğini ortadan kaldıran oldukça pratik ve merkezi bir süreçtir:
Tespit ve BCF Kaydı: Farklı disiplinlerin modelleri Bimplus'ta birleştirilir ve çakışma testi (Clash Detection) yapılır. Çakışma bulunduğunda "Sorun Oluştur" (Create Issue) denilerek standart bir BCF kaydı oluşturulur.
Otomatik Konumlandırma: Sistem bu kayda; çakışmanın 3B kamera açısını, kesin koordinatlarını ve çakışan elemanların benzersiz kimliklerini (GUID) otomatik olarak ekler.
Yazılıma Doğrudan Aktarım: Sorun atanan kişi kendi BIM yazılımındaki (Allplan, Revit vb.) "Sorun Yöneticisi" (Issue Manager) panelinden kayda tıkladığı anda, ekran otomatik olarak çakışmanın olduğu noktaya zum yapar. Sorunu arayıp bulmasına gerek kalmaz.
Çözüm ve Kapanış: İlgili mühendis modeli düzeltir, BCF kaydı üzerine yorumunu yazar ve durumu günceller. BIM Koordinatörü de güncellenmiş modellerle testini tekrarlayarak sorunu "Kapalı" duruma getirir.
Bu iş akışı sayesinde, geleneksel yöntemlerle haftalar sürebilecek iletişim kopuklukları önlenir ve çakışmalar saatler içinde çözülerek belgelenir.
Böylece bulut ve işbirliği kısmını da detaylıca noktalamış olduk. Daha önce listelediğimiz diğer Sıkça Sorulan Sorular (FAQ) başlıklarından olan Sistem Gereksinimleri ve Kurulum veya Ürün Yaşam Döngüsü (Product Lifecycle) detaylarıyla devam etmek ister misiniz?
Sistem gereksinimleri ve kurulum detaylarına göz atalım.
Ürün yaşam döngüsü ve 2027 geçiş süreci nedir?
Farklı disiplinler için BCF ile çakışma yönetimini inceleyelim.
Abonelik ve kalıcı lisans modelleri arasındaki farkları inceleyelim.

Allplan'daki bu iki lisans modeli arasındaki temel farklar şunlardır:
Abonelik (Subscription): Esnek süreli (aylık, yıllık veya 3 yıllık) kiralama modelidir. En büyük avantajı; aboneliğiniz boyunca her zaman en güncel yazılım sürümüne, teknik desteğe ve Bimplus gibi tüm Allplan Cloud bulut hizmetlerine tam erişim sağlamasıdır.
Kalıcı Lisans (Perpetual): Yazılımı tek seferlik bir ödemeyle satın aldığınız modeldir (yalnızca Ultimate, Civil ve Precast paketleri için sunulur). Temelde yalnızca satın aldığınız tarihteki sürüme sahip olursunuz ve bu model Allplan Cloud bulut hizmetlerini içermez.
Lisans modelleri arasındaki ayrım bu şekilde. Dilerseniz bilgisayarınızın programı çalıştırıp çalıştıramayacağını değerlendirmek için Sistem Gereksinimleri ve Kurulum detaylarına geçebiliriz. Ne dersiniz?
Abonelik ve kalıcı lisans modelleri arasındaki farklara bakalım.
Sistem Gereksinimleri ve Kurulum detaylarını inceleyebilir miyiz?
Öğrenciler için Allplan Campus eğitim lisansı nasıl alınır?
Allplan Professional paketinin mühendislik ve otomasyon avantajları nelerdir?

Allplan Professional paketi, mühendislik ve detaylandırma süreçlerini hızlandırmak için şu otomasyon avantajlarını sunar:
Otomatik 3B Donatılandırma: Donatı tasarımlarının ve detaylandırma süreçlerinin otomatikleştirilmesini sağlayarak büyük ölçüde zaman kazandırır ve hata payını düşürür.
Çelik Bağlantı Otomasyonu: Cıvatalı ve kaynaklı çelik bağlantıların otomatik olarak hesaplanıp tasarlanmasını sağlar.
Kesintisiz Analiz Entegrasyonu: AutoConverter aracı sayesinde fiziksel modelinizi analitik modele dönüştürerek SAF formatı üzerinden SCIA, FRILO gibi yapısal analiz yazılımlarına doğrudan aktarır.
Çoklu Malzeme Modellemesi: Betonarme, çelik ve ahşap gibi farklı inşaat malzemelerini tek bir platformda koordine etmenize olanak tanır.
Parametrik Planlama: Yol tasarımları ve şantiye hazırlık (hafriyat, kazı vb.) süreçleri parametrik olarak kolayca modellenir.
Bu otomasyon araçlarından projenize en uygun olanı hangisi? Dilerseniz Otomatik Donatılandırma veya Çelik Bağlantı Tasarımı iş akışlarının detaylarına inebiliriz.
Otomatik donatılandırma iş akışının detaylarına inelim.
Çelik bağlantı tasarımı otomasyonu nasıl çalışır?
Allplan Learn Now ile hangi eğitim materyallerine erişebilirim?
İnternet kesilirse çevrimdışı çalışma nasıl yapılır?

İnternet bağlantınız kesilirse Allplan Share ile çalışmaya kesintisiz devam edebilirsiniz. Çünkü projenin ve çizim dosyalarının bir kopyası arka planda bilgisayarınızın yerel önbelleğinde (cache) tutulur.
Siz çalışırken aslında bu yerel dosyalar üzerinde işlem yaparsınız. İnternet bağlantısı tekrar sağlandığında, çevrimdışıken yaptığınız tüm değişiklikler otomatik olarak Bimplus bulut sistemine senkronize edilir.
Bulut ve altyapı işleyişini tamamen netleştirdiğimize göre, bilgisayarınızın bu programı rahatça çalıştırabilmesi için gereken Sistem Gereksinimleri konusuna göz atalım mı?
Sistem gereksinimlerini ve önerilen donanım özelliklerini inceleyelim.
Allplan Campus ile öğrenciler için eğitim lisansı nasıl kurulur?
Bimplus üzerinde proje üyelerinin yetkileri nasıl ayarlanır?
Sistem gereksinimleri ve kurulum detaylarına göz atalım.

Allplan'ın sorunsuz çalışması için donanım gereksinimleri ve temel kurulum adımları şu şekildedir:
Sistem Gereksinimleri:
Minimum: Intel veya AMD Ryzen işlemci, 8 GB RAM, 20 GB boş disk alanı ve 4 GB VRAM'li (OpenGL 4.2 uyumlu) ekran kartı. İşletim sistemi olarak Windows 10 (64-bit) veya Windows 11 gerekir.
Önerilen (Optimum Performans İçin): Intel Core i5/i7/i9 veya AMD Ryzen 5/7/9 işlemci, 32 GB RAM, SSD depolama ve 16 GB VRAM'e sahip profesyonel bir ekran kartı (Windows 11). Büyük BIM projelerinde ve 3B modellemelerde bu donanım tavsiye edilir.
Kurulum Süreci:
Kurulum dosyasını Allplan Connect sitesinden indirip yönetici olarak çalıştırırsınız. Yeni nesil Windows yükleyicisi sayesinde kurulum süreci oldukça hızlı ve basitleştirilmiştir.
Kurulum sırasında programın dilini ve kullanacağınız ülke standartlarını (örneğin Türkiye) seçebilirsiniz; böylece Türkiye'ye özgü raporlar ve çizgi tipleri gibi standartlar da yüklenir.
Kurulum esnasında veya programı ilk açtığınızda lisans anahtarınızı girerek aktivasyonu tamamlarsınız.
Bilgisayarınız bu gereksinimleri karşılıyor mu? Dilerseniz sistemi kendi cihazınızda test edebilmeniz için 14 günlük ücretsiz deneme sürümünü veya öğrenciler için Allplan Campus eğitim lisansını nasıl edinebileceğinize geçebiliriz.
14 günlük ücretsiz deneme sürümünü nasıl indirebilirim?
Öğrenciler için Allplan Campus eğitim lisansı nasıl alınır?
Allplan Ultimate paketindeki parametrik öngerilme ve prekast detayları nelerdir?
Sistem Gereksinimleri ve Kurulum detaylarını inceleyebilir miyiz?

Allplan'ı sorunsuz çalıştırmak için gereken temel sistem gereksinimleri ve kurulum süreci şöyledir:
Minimum Sistem: 8 GB RAM, Intel veya AMD Ryzen işlemci, 4 GB VRAM'e sahip (Redshift için 8 GB) OpenGL 4.2 uyumlu ekran kartı ve Windows 10/11.
Önerilen Sistem: Yüksek performans için 32 GB RAM, Intel Core i5/i7/i9 veya AMD Ryzen 5/7/9 işlemci, SSD depolama ve Vulkan 1.2 / OpenGL 4.5 uyumlu 16 GB VRAM'li profesyonel ekran kartı (Windows 11) tavsiye edilir.
Kurulum Süreci: Yeni Windows Installer ile kurulum oldukça basitleştirilmiştir. Yönetici olarak çalıştırdığınız kurulum dosyasında yalnızca program ve veri yollarını belirlemeniz yeterlidir. Ayrıca ağ üzerinden ortak çalışma sağlayan Workgroup Manager artık otomatik kurulur ve sonrasında "Allplan Diagnostics" üzerinden isteğe bağlı olarak aktifleştirilir.
Bilgisayarınızın bu özellikleri karşıladığını düşünüyorsanız hemen test edebilirsiniz. Dilerseniz 14 günlük ücretsiz deneme sürümü veya öğrenci lisansının nasıl alınıp kurulacağına göz atalım mı? Yoksa daha önce bahsettiğimiz Ürün Yaşam Döngüsü (Product Lifecycle) konusuna mı geçmek istersiniz?
Ücretsiz deneme sürümü veya öğrenci lisansı nasıl alınır?
Allplan ürün yaşam döngüsü ve gelecek planları nelerdir?
Bimplus üzerinde kullanıcı rolleri ve yetkileri nasıl ayarlanır?
Ürün yaşam döngüsü ve 2027 geçiş süreci nedir?

Allplan'ın ürün yaşam döngüsü ve 2027 geçiş süreci temel olarak şu adımları içerir:
Ürün Yaşam Döngüsü (Product Lifecycle): Allplan, yazılımlarını her yıl "Ana Sürüm" (Major, örn. 2025'ten 2026'ya) ve yıl içinde çeşitli "Ara Sürüm" (Minor) güncellemeleriyle yeniler. Her sürüm zamanla "Güncel", "Desteklenen" ve nihayetinde "Emekli" (Retired) aşamalarından geçerek destek kapsamı dışına çıkar.
2027 Geçiş Süreci (Workgroup Manager): Ekim 2027 tarihi, yerel ağlarda (LAN) kullanılan bağımsız (kalıcı lisanslı) Allplan Workgroup Manager ürününün bakım ve desteğinin tamamen sonlandırılmasını (End of Life) ifade eder. Çıkacak olan Allplan 2028 sürümüyle birlikte, ortak çalışma ve veri yönetimi özellikleri yalnızca Allplan Aboneliği (Subscription) kapsamındaki bulut hizmetleri (Allplan Cloud) üzerinden sunulacaktır.
Böylece sıkça sorulan lisanslama ve altyapı konularını tamamlamış olduk. Dilerseniz tasarım araçlarına girip Visual Scripting (Görsel Kodlama) veya SmartParts/PythonParts (Akıllı Parametrik Objeler) özelliklerini inceleyerek devam edebiliriz. Hangisine göz atmak istersiniz?
Visual Scripting ile parametrik objeler nasıl oluşturulur?
SmartParts ve PythonParts arasındaki teknik farklar nelerdir?
Allplan'da 14 günlük ücretsiz deneme sürümü nasıl kurulur?
Farklı disiplinler için BCF ile çakışma yönetimini inceleyelim.

Farklı disiplinler (mimari, statik, mekanik) arasındaki çakışmaların BCF (BIM Collaboration Format) ve Bimplus ile yönetimi, karmaşık e-posta trafiğini ortadan kaldırarak süreci büyük ölçüde hızlandırır. İşleyiş pratik olarak şu adımlarla gerçekleşir:
Modellerin Birleştirilmesi: Tüm disiplinlerin farklı yazılımlarla (Allplan, Revit vb.) ürettiği modeller Bimplus bulut platformunda birleştirilerek federatif bir model oluşturulur ve "Çakışma Kontrolü" (Clash Detection) başlatılır.
BCF Kaydının Oluşturulması: Bir çakışma (örneğin bir havalandırma kanalı ile taşıyıcı kirişin kesişmesi) tespit edildiğinde, standart bir BCF kaydı açılır. Sistem bu kayda çakışmanın 3B kamera açısını, kesin koordinatlarını ve çakışan elemanların benzersiz kimliklerini (GUID) otomatik olarak ekler.
Yazılım İçinden Doğrudan Müdahale: İlgili mühendis, kendi yazılımındaki Sorun Yöneticisi (Issue Manager) üzerinden kendisine atanan bu kayda tıkladığında, ekran sorunu aratmaya gerek kalmadan doğrudan çakışmanın olduğu noktaya zum yapar.
Çözüm ve Kapanış: Ekipler sorun kaydı üzerinden yorumlaşarak modeli günceller, Bimplus'a tekrar yükler ve koordinatör doğrulaması sonrasında sorunu "Kapalı" duruma getirir.
Bu iş akışı sayesinde, geleneksel yöntemlerle günler veya haftalar sürebilecek şantiye gecikmeleri, sadece birkaç saat içinde çözülmüş ve şeffafça belgelenmiş olur.
Bulut ve işbirliği süreçlerini oldukça kapsamlı bir şekilde ele aldık. Dilerseniz Allplan'ın modelleme hızını artıran Otomatik Donatılandırma araçlarına veya PythonParts ile Otomasyon konusuna geçebiliriz. Ne dersiniz?
Otomatik donatılandırma metraj ve malzeme listesi üretimini nasıl hızlandırır?
PythonParts ile parametrik nesne otomasyonu nasıl kurgulanır?
Çelik bağlantı tasarımlarında SDS2 entegrasyonu ne gibi kolaylıklar sağlar?
Allplan Ultimate paketindeki parametrik öngerilme ve prekast detayları nelerdir?

Allplan Ultimate paketindeki parametrik öngerilme ve prekast özellikleri, özellikle büyük ölçekli altyapı ve endüstriyel projelerde süreci otomatikleştirir:
Parametrik Öngerilme: Özellikle köprü ve viyadük gibi yapılarda öngerilme ve artgerme tendonlarının 3B parametrik olarak modellenmesini sağlar. Ana taşıyıcı sistemin (örneğin köprü güzergahının) geometrisi değiştiğinde, tendonlar da bu değişime otomatik olarak uyum sağlar.
Prekast Tasarım ve Detaylandırma: Kiriş, kolon, merdiven, duvar ve döşeme gibi prefabrik (ön üretimli) betonarme bileşenleri gelişmiş araçlarla tasarlamanıza olanak tanır. Fabrikadaki üretim süreci için gerekli olan donatı, bağlantı elemanları ve ölçülendirmeleri içeren detaylı "Eleman Planlarını" (üretim paftalarını) şablonlar üzerinden otomatik olarak üretir.
Bu prefabrik eleman verilerinin fabrikadaki makinelere (NC verisi olarak) nasıl aktarıldığına detaylıca bakmak ister misiniz? Yoksa bir önceki adımda bahsettiğimiz 14 günlük ücretsiz deneme sürümünün kurulum detaylarına mı geçelim?
Prekast verileri üretim makinelerine nasıl aktarılır?
14 günlük ücretsiz deneme sürümünü nasıl kurabilirim?
Tendon geometrisi değiştikçe öngerilme sistemi nasıl güncellenir?
Visual Scripting ile parametrik objeler nasıl oluşturulur?

Visual Scripting, kod yazma bilgisine ihtiyaç duymadan, görsel bir arayüz üzerinden parametrik nesneler oluşturmanızı sağlayan pratik bir araçtır.
Süreç temelde sürükle-bırak mantığıyla düğümlerin (nodes) birbirine bağlanmasına dayanır:
Düğümleri Seçme: Visual Scripting modülünü açıp geometri, matematik ve BIM işlevlerini temsil eden düğümleri çalışma alanına alırsınız.
Bağlantı Kurma: Bu düğümleri birbirine bağlayarak mantıksal bir veri akışı oluşturursunuz.
Parametreleri Tanımlama: Örneğin; "Genişlik", "Yükseklik" ve "Kalınlık" gibi parametre düğümlerini "Kutu Oluştur" veya "Pencere Bileşeni" gibi geometri düğümlerine bağlayarak dinamik bir yapı elde edersiniz.
Kaydetme: Hazırladığınız bu görsel betiği (script) projenizde dilediğiniz zaman kullanmak üzere bir "Akıllı Nesne" olarak kaydedersiniz.
Görsel kodlama mantığı bu şekilde işliyor. Daha karmaşık ve ofise özel otomasyonlar için kod yazılarak oluşturulan PythonParts özelliğine göz atalım mı, yoksa doğrudan Allplan'ın Mimari Modelleme araçlarına mı geçmek istersiniz?
PythonParts ile ofise özel otomasyonlar nasıl geliştirilir?
Mimari modelleme araçlarındaki akıllı yerleşim özelliklerini inceleyelim.
SmartParts ve Visual Scripting arasındaki temel farklar nelerdir?
SmartParts ve PythonParts arasındaki teknik farklar nelerdir?

Allplan'da her ikisi de akıllı ve parametrik objeler olsa da, teknik altyapıları ve odaklandıkları alanlar farklıdır:
SmartParts: Genellikle pencere, kapı, giydirme cephe veya çatı penceresi gibi standart mimari elemanların modellenmesinde kullanılan parametrik CAD objeleridir. Kendi iç mantıklarıyla çalışırlar ve program içindeki diyalog kutuları veya tutamaçlar (handles) yardımıyla kolayca boyutlandırılıp değiştirilebilirler.
PythonParts: Doğrudan Python programlama dili veya Görsel Kodlama (Visual Scripting) kullanılarak üretilen, sınırları çok daha geniş araçlardır. Yalnızca bir nesne oluşturmakla kalmaz; örneğin karmaşık bir kolon donatısını, çelik birleşimi veya özel bir prekast elemanı tek tıklamayla baştan sona modelleyen güçlü mühendislik otomasyonları kurmanızı sağlarlar.
Özetle; SmartParts standart mimari nesnelerin yönetimi için pratik bir çözümken, PythonParts sınırları tamamen sizin belirlediğiniz ileri düzey özelleştirme ve iş akışı otomasyonları içindir.
Kod yazma bilgisine ihtiyaç duymadan düğümleri (node) birbirine bağlayarak PythonPart oluşturmanızı sağlayan Visual Scripting (Görsel Kodlama) aracının nasıl çalıştığına göz atmak ister misiniz?
Visual Scripting aracının düğümlerle çalışma mantığı nasıldır?
PythonParts ile donatı otomasyonu örneklerini inceleyelim.
SmartParts ile pencere ve kapı parametreleri nasıl özelleştirilir?
Otomatik donatılandırma metraj ve malzeme listesi üretimini nasıl hızlandırır?

Otomatik donatılandırma, metraj ve malzeme listesi üretimini manuel hesaplamaları tamamen ortadan kaldırarak hızlandırır. Süreç temel olarak şu şekilde işler:
Doğrudan 3B Veri: Allplan, yapı elemanlarının (kolon, kiriş vb.) içine donatıları standart kurallara göre 3B olarak otomatik yerleştirir.
Anında Raporlama: Program, 3B modeldeki her bir donatı çubuğunun uzunluğunu, ağırlığını ve adedini okur; ardından donatı tabloları, poz numaraları ve detaylı büküm listelerini (Bending Schedules) otomatik olarak üretir.
Dinamik Güncelleme: Tasarımda bir değişiklik yaptığınızda (örneğin bir kolonun boyutu değiştiğinde), donatılar bu yeni forma otomatik uyum sağlar ve tüm metraj listeleri anında güncellenir. Baştan sayım veya hesaplama yapmanıza gerek kalmaz.
Bu özellik sayesinde insan hatası riski en aza iner ve haftalar sürebilecek hesaplamalar saniyeler içinde tamamlanır.
Dilerseniz bu metraj verilerinin Excel'e veya maliyet programlarına nasıl aktarıldığına bakabiliriz. Yoksa bu otomasyonu sağlayan altyapı olan PythonParts (Parametrik Objeler) teknolojisini mi inceleyelim? Hangisiyle devam edelim?
Üretim verilerinin Excel veya maliyet programlarına aktarımı nasıl yapılır?
PythonParts teknolojisi ile donatı otomasyonu nasıl sağlanıyor?
SmartParts ile parametrik pencere ve kapı tasarımı nasıl yapılır?
Çelik bağlantı tasarımlarında SDS2 entegrasyonu ne gibi kolaylıklar sağlar?

Allplan'ın SDS2 entegrasyonu, çelik bağlantı tasarımlarında süreci otomatikleştirerek şu kolaylıkları sağlar:
Akıllı ve Otomatik Tasarım: Allplan'da modellediğiniz kolon ve kirişleri SDS2'ye aktardığınızda sistem, mühendislik hesaplarına dayalı cıvatalı veya kaynaklı bağlantıları otomatik olarak tasarlar.
Çakışmasız Modeller: Bağlantı noktalarındaki montaj çakışmalarını önleyerek sahada doğrudan uygulanabilir detaylar oluşturur.
İmalata Hazır Üretim Verisi: SDS2 ile detaylandırılan model, çelik fabrikalarındaki CNC makinelerinde doğrudan kullanılmak üzere imalat için gerekli tüm bilgileri (NC dosyaları) üretir.
Kısacası bu entegrasyon; mimari tasarımı, mühendislik hesaplarını ve atölye imalatını kusursuz bir şekilde birbirine bağlar.
Çelik yapıları incelediğimize göre, dilerseniz benzer otomasyon kolaylıkları sunan Betonarme Yapılarda Otomatik Donatılandırma konusuna geçebiliriz veya projelerinizi müşteriye sunmanızı sağlayan Görselleştirme (Render) özelliklerine bakabiliriz. Hangisiyle devam edelim?
Otomatik donatılandırma iş akışı ve metraj avantajları nelerdir?
SDS2 ile çelik imalatına hazır NC verileri nasıl üretilir?
Görselleştirme araçları ve gerçek zamanlı render özelliklerini inceleyelim.
Prekast verileri üretim makinelerine nasıl aktarılır?

Allplan'da hazırlanan prekast (prefabrik) verileri, fabrikadaki üretim makinelerine NC (Sayısal Kontrol) verisi olarak özel dosya formatlarıyla doğrudan ve kayıpsız bir şekilde aktarılır.
Bu süreç temelde şu şekilde işler:
Makine Formatları: Veriler, endüstri standartları olan PXML ve Unitechnik (UniCAM) gibi formatlarda dışa aktarılır.
Doğrudan Makine Kontrolü: Üretilen bu dosyalar; fabrikadaki donatı kesme, bükme, hasır kaynak makineleri (MWS) ve beton döküm/kalıp robotları tarafından okunarak işlemi milimetrik olarak yönlendirir.
Fabrika Yönetimi: Yalnızca makineler değil; model verileri fabrikanın MES (Üretim Yürütme Sistemleri) ve ERP (Kurumsal Kaynak Planlama) sistemlerine de entegre edilerek üretim sırası, stok ve lojistik tam otomatik hale getirilir.
Böylece prekast elemanların tasarımdan fabrikaya uzanan yolculuğunu tamamlamış olduk. Dilerseniz başa dönüp Allplan'ın Mimari Modelleme (Duvar, Kapı, Pencere, Çatı Sistemleri vb.) araçlarına göz atabiliriz veya doğrudan modelden otomatik olarak nasıl Metraj ve Maliyet (Quantity Take-off) raporları alındığına bakabiliriz. Hangisiyle devam edelim?
Metraj ve maliyet raporları modelden nasıl otomatik alınır?
Allplan'ın temel mimari modelleme araçlarını inceleyelim.
PythonParts ile ofise özel otomasyonlar nasıl geliştirilir?
Tendon geometrisi değiştikçe öngerilme sistemi nasıl güncellenir?

Allplan'da tendonlar ve öngerilme sistemi tam parametrik bir yapıya sahiptir. Ana yapının (örneğin bir köprü güzergahının) geometrisi değiştiğinde, tendonlar da bu yeni forma otomatik olarak uyum sağlar ve tüm model güncellenir.
Bu değişim sadece görsel bir uyumla sınırlı kalmaz; sistem, yeni kablo geometrisine ve malzeme özelliklerine bağlı olarak sürtünme ve yalpalamadan (wobbling) kaynaklanan gerilme kuvveti kayıplarını da anında yeniden hesaplar. Yani geometrik bir değişiklik yaptığınızda öngerilme değerlerini manuel olarak tekrar hesaplamanıza gerek kalmaz.
Bu parametrik güncellemelerin Yapısal Analiz (Structural Analysis) sürecine ve SCIA gibi programlara nasıl aktarıldığına göz atmak ister misiniz?
Analiz verilerinin SCIA programına aktarım süreci nasıl işler?
Tendon kayıpları ve sürtünme hesaplamaları otomatik mi yapılıyor?
Parametrik öngerilme araçları köprü tasarımlarında ne gibi kolaylıklar sağlar?
PythonParts ile ofise özel otomasyonlar nasıl geliştirilir?

Allplan'da ofise özel otomasyonlar geliştirmek için PythonParts temelde iki farklı yöntemle oluşturulur:
Python API ile Kodlama: Python programlama dili bilgisi gerektirir. Geliştirme ortamı için genellikle Visual Studio Code kullanılır. Allplan içinde CreateVisualStudioCodeWorkspace komutunu çalıştırarak geliştirme ortamınızı hızlıca kurabilirsiniz. Bu yöntemle; özel raporlar üretme, yüzlerce kapı etiketini aynı anda güncelleme veya nesnelerin malzemesine göre (örneğin Betonarme C30) yangın dayanım sınıflarını otomatik atama gibi ofisinize özel karmaşık iş akışlarını otomatikleştirebilirsiniz.
Visual Scripting (Görsel Kodlama): Kod yazma bilgisine sahip olmayan kullanıcılar içindir. Geometri, matematik ve BIM işlevlerini temsil eden görsel düğümleri (node) sürükle-bırak mantığıyla birbirine bağlayarak kendi parametrik objelerinizi (örneğin özel bir temel veya pencere bileşeni) oluşturabilir ve bunları bir Akıllı Nesne/PythonPart olarak kaydedebilirsiniz.
Bu araçlar sayesinde, saatler sürebilecek tekrarlayan modelleme görevleri saniyeler içinde tamamlanarak büyük zaman tasarrufu sağlanır.
Hangi yöntem ofisinizin yapısına daha uygun görünüyor? Dilerseniz Visual Scripting (Görsel Kodlama) arayüzünün nasıl kullanıldığına biraz daha yakından bakabiliriz veya otomasyon konularını tamamlayıp bu modellerden nasıl Metraj ve Maliyet (Quantity Take-off) raporları alındığına geçebiliriz. Hangisiyle devam edelim?
Visual Scripting arayüzünün kullanımıyla ilgili detaylara göz atalım.
Modelden otomatik metraj ve maliyet raporları nasıl alınır?
PythonParts ile ofise özel ne tür otomasyonlar geliştirilebilir?
Parametrik öngerilme araçları köprü tasarımlarında ne gibi kolaylıklar sağlar?

Allplan Civil'deki parametrik öngerilme araçları, köprü tasarımlarında özellikle şu kolaylıkları sağlar:
Çok Yönlü Tendon Modelleme: İç, dış, boyuna, enine veya dikey fark etmeksizin çeşitli öngerilme ve artgerme tendon tiplerini 3B olarak parametrik şekilde oluşturabilirsiniz. Kopyalama ve aynalama gibi standart araçlar bu süreci daha da hızlandırır.
Germe Süreci Planlaması: Tendon kablosunun başlangıcında, sonunda veya her iki tarafında eşzamanlı olarak "germe" (stressing), "serbest bırakma" (releasing) ve "kama kayması" (wedge slip) gibi işlemleri uygulayabilir ve planlayabilirsiniz.
Otomatik Kayıp Hesaplamaları: Kablo geometrisine ve malzeme özelliklerine bağlı olarak sürtünme ve yalpalamadan (wobbling) kaynaklanan gerilme kuvveti kayıplarını sistem otomatik olarak hesaplar.
Bu özellikler sayesinde karmaşık köprü projelerinde manuel hesaplama hataları ortadan kalkar ve tasarımdaki her değişiklik öngerilme sistemine anında yansır.
Köprü tasarım sürecinin bir diğer önemli aşaması olan 4D İnşaat Sırası Simülasyonu (Zaman Çizelgesi) konusuna geçmek ister misiniz? Yoksa köprülerle ilgili farklı bir detayı mı inceleyelim?
Yapısal analiz verilerinin SCIA programına aktarımı nasıl yapılır?
4D inşaat sırası simülasyonu ile zaman çizelgesi nasıl yönetilir?
Köprü tasarımlarında farklı tendon tiplerini nasıl modelleyebilirim?
Tendon kayıpları ve sürtünme hesaplamaları otomatik mi yapılıyor?

Evet, bu hesaplamalar tamamen otomatik olarak yapılıyor.
Siz programda germe işlemlerini (germe, serbest bırakma veya kama kayması) tanımladığınızda sistem; kablonun geometrisine ve malzemenin özelliklerine bağlı olarak sürtünme (friction) ve yalpalamadan (wobbling) kaynaklanan gerilme kuvveti kayıplarını kendiliğinden hesaplar.
Böylece geometride veya güzergahta bir değişiklik yaptığınızda, kayıpları manuel olarak baştan hesaplamakla uğraşmazsınız.
Köprü ve altyapı projelerinde oluşturulan bu parametrik geometrik modelin, Yapısal Analiz (Structural Analysis) modeline nasıl dönüştürüldüğüne göz atalım mı? Yoksa Yol Tasarımı (Road Design) gibi başka bir konuya mı geçmek istersiniz?
Yapısal analiz modeline geçiş nasıl sağlanır?
Yol Tasarımı modülündeki yeni özellikleri inceleyelim.
Parametrik öngerilmeli köprü tasarımlarını nasıl optimize ederiz?
Analiz verilerinin SCIA programına aktarım süreci nasıl işler?

Allplan'daki geometrik modelin SCIA programına aktarımı "AutoConverter" aracı ve "SAF" (Structural Analysis Format) kullanılarak oldukça pratik bir şekilde gerçekleşir. Süreç temel olarak şu şekilde işler:
Analitik Modele Dönüşüm: AutoConverter aracı, 3B fiziksel yapı modelinizi akıllı bir şekilde analitik modele dönüştürür.
SAF Formatında Aktarım: Oluşturulan bu analitik model, yapısal analiz verileri için özel olarak tasarlanmış standart SAF formatında dışa aktarılır.
SCIA Entegrasyonu: SCIA Engineer (veya FRILO gibi diğer programlar) bu SAF dosyasını kayıpsız bir şekilde okuyarak modeli doğrudan analiz ve yük atamaları için hazır hale getirir.
Bu iş akışı sayesinde modeli analiz programında baştan çizmenize gerek kalmaz, manuel veri girişi hataları önlenir ve büyük bir zaman tasarrufu sağlanır.
Bu aktarımın ardından SCIA tarafında yapılan analiz sonuçlarının Allplan'a nasıl geri çağrıldığına (çift yönlü aktarım) bakmak ister misiniz? Yoksa FRILO entegrasyonuna mı geçelim?
Analiz sonuçlarının Allplan'a çift yönlü aktarımı nasıl yapılır?
FRILO entegrasyonu mühendislik süreçlerini nasıl kolaylaştırır?
AutoConverter ile analitik model dönüşümü nasıl özelleştirilir?
Analiz verilerinin SCIA programına aktarım süreci nasıl işler?

Analiz verilerinin SCIA programına aktarımı, manuel veri girişini ortadan kaldıran AutoConverter aracı ve SAF formatı sayesinde oldukça hızlı bir şekilde yapılır. Süreç pratik olarak şu adımlarla işler:
Analitik Modele Dönüşüm: Allplan'da hazırladığınız 3B fiziksel model, Bimplus bulut platformu üzerinden çalışan AutoConverter aracı sayesinde tek bir tıklamayla analitik modele (hesap modeline) dönüştürülür.
SAF Formatı ile Aktarım: Oluşturulan bu analitik model, yapısal analiz verileri için özel tasarlanmış SAF (Structural Analysis Format) formatında dışa aktarılır ve SCIA Engineer programına sorunsuzca iletilir.
Çift Yönlü Veri Alışverişi: Bu entegrasyon çift yönlüdür. SCIA üzerinde yük analizleri ve tasarımlar tamamlandıktan sonra veriler tekrar Allplan modelinizle senkronize edilebilir.
Bu sayede veri aktarımındaki hatalar önlenir ve süreç saniyeler içinde tamamlanır.
Bu entegrasyonun merkezinde yer alan Bimplus bulut platformunun doküman ve proje yönetimi avantajlarına göz atmak ister misiniz? Yoksa modelinizden otomatik olarak Metraj ve Maliyet Hesaplamalarının nasıl yapıldığına mı geçelim?
14 günlük ücretsiz deneme sürümünü nasıl kurabilirim?
Allplan Campus eğitim lisansı başvuru şartları nelerdir?
PythonParts ile ofise özel otomasyonlar nasıl geliştirilir?
Allplan'ın temel mimari modelleme araçlarını inceleyelim.

Allplan'ın mimari modülü, tasarımı hızlandıran akıllı ve parametrik araçlar sunar. Temel modelleme araçlarının işleyişi şu şekildedir:
Duvarlar: Tek veya çok katmanlı (yalıtım, kaplama vb.) olarak modellenebilir. Farklı duvarlar kesişim noktalarında birbirleriyle otomatik olarak birleşir ve köşeleri akıllıca çözer.
Kapı ve Pencereler: Duvarlarda yerleştirildikleri an kendi boşluklarını otomatik açan parametrik nesnelerdir. Boyut, renk, malzeme ve pervaz detayları kolayca özelleştirilebilir.
Döşeme ve Tavan Sistemleri: Çok katmanlı zeminlerin yanı sıra asma tavanlar da tasarlanabilir. Tavan aracı, aydınlatma ve havalandırma gibi tesisat elemanlarının koordinasyonunu görselleştirerek kolaylaştırır.
Çatılar: Beşik, kırma veya serbest formda karmaşık çatı geometrileri parametrik olarak tasarlanabilir. Eğim, saçak uzantıları, baca ve çatı pencereleri kolayca eklenebilir.
Merdivenler: Düz, döner veya sarmal merdivenler; basamak boyutları, sahanlık ve korkuluk detayları girilerek 3B olarak hızlıca modellenir.
Oda ve Alan Yönetimi: Zemin tipi, tavan yüksekliği ve duvar kaplaması gibi bilgileri taşıyan akıllı hacimlerdir. Alan hesaplamalarını otomatik yapar ve oda etiketlerini oluşturur.
Bu mimari elemanları kullanarak modelimizi oluşturduktan sonra tasarımlarınızı müşteriye sunmanızı sağlayan Yapay Zeka Destekli Görselleştirme (AI Visualizer / Render) araçlarına mı göz atalım, yoksa bu model üzerinden otomatik olarak nasıl Metraj ve Maliyet (Quantity Take-off) raporları alındığına mı geçelim?
Metraj verilerini Excel veya maliyet programlarına nasıl aktarabiliriz?
Yapay zeka destekli görselleştirme araçlarının sunduğu imkanlar nelerdir?
PythonParts teknolojisi donatı otomasyonunu teknik olarak nasıl sağlar?
4D inşaat sırası simülasyonu ile zaman çizelgesi nasıl yönetilir?

Allplan'da 4D inşaat sırası simülasyonu, 3B modele "zaman" boyutunun eklenmesiyle pratik bir şekilde yönetilir:
Görev Tanımlama (Tasking): İnşaat planı; beton dökümü, betonun priz alması, tendonların gerilmesi veya kirişlerin yerleştirilmesi gibi spesifik aşamalara bölünür ve modeldeki ilgili yapı elemanları bu görevlere atanır.
Gantt Şeması ve Şablonlar: Süreç, görsel bir Gantt şeması üzerinden kronolojik olarak planlanır. Üretim, depolama, taşıma ve montaj gibi standart süreçler için "İnşaat Şablonları" (Construction Templates) kullanılarak bu işlem büyük ölçüde otomatikleştirilebilir.
Yapısal Analiz Entegrasyonu: Oluşturulan zaman çizelgesi sadece görsel bir simülasyon sağlamaz; aynı zamanda betonun sünmesi (creep) ve büzülmesi (shrinkage) gibi zamana bağlı, doğrusal olmayan yapısal etkileri hesaplamak için analiz modeline otomatik olarak aktarılır.
Bu sayede köprü veya altyapı projenizin ilerleyen günlerde nasıl görüneceğini ve yapısal olarak nasıl davranacağını henüz tasarım aşamasındayken test etmiş olursunuz.
Köprü ve altyapı modelleme özelliklerini detaylıca inceledik. Dilerseniz bu parametrik modellerden nasıl otomatik Metraj ve Maliyet Hesaplamaları (Quantity Take-off) alındığına bakabiliriz veya sahaya yönelik Şantiye Planlaması (BIM2Field) konusuna geçebiliriz. Hangisiyle devam edelim?
Analiz sonuçlarının Allplan'a çift yönlü aktarımı nasıl yapılır?
Bimplus bulut platformunun proje yönetimi avantajları nelerdir?
Modelden otomatik metraj ve maliyet raporları nasıl alınır?
Parametrik öngerilmeli köprü tasarımlarını nasıl optimize ederiz?

Allplan Civil ile parametrik öngerilmeli köprü tasarımlarını şu yöntemlerle optimize edebilirsiniz:
Akıllı Şablonlar (Templates): Tanımladığınız köprü kesitleri, donatılar ve öngerilme tendonları şablon olarak kaydedilebilir. Ana güzergah veya geometri değiştiğinde, modele eklediğiniz tüm tendonlar ve donatılar bu yeni forma anında otomatik olarak uyum sağlar.
Otomatik Kayıp Hesaplamaları: Germe, serbest bırakma ve kama kayması gibi işlemleri tanımladığınızda sistem; kablo geometrisi ve malzeme özelliklerine bağlı olarak sürtünme ve yalpalamadan (wobbling) kaynaklanan gerilme kuvveti kayıplarını kendiliğinden hesaplar.
İnşaat Süreci (4D) Otomasyonu: Üretim, depolama, taşıma, yerleştirme ve germe gibi aşamalar, önceden tanımlanmış inşaat şablonlarıyla kolayca simüle edilir ve bu da manuel hesaplama yükünü ciddi şekilde azaltır.
Çift Yönlü Analiz Doğrulaması: Modele yerleştirilen donatı alanları, etriye aralıkları ve tendon verileri, standartlara uygunluk (code checking) testlerinin yapılması için yapısal analiz modeline çift yönlü olarak geri aktarılır.
Köprü tasarımlarının hatasız ilerlemesi için farklı disiplin modellerinin birleştirildiği Çakışma Kontrolü (Clash Detection) süreçlerine göz atmak ister misiniz?
Yapısal analiz modelinin SCIA tarafındaki sonuçları Allplan'a geri aktarılabilir mi?
FRILO entegrasyonu ile analiz süreci nasıl farklılık gösteriyor?
Bimplus platformunun doküman ve proje yönetimi avantajlarını inceleyelim.
Yapısal analiz modeline geçiş nasıl sağlanır?

Allplan'da geometrik (fiziksel) modelden yapısal analiz modeline geçiş, temel olarak AutoConverter aracı ile sağlanır.
Süreç şu şekilde işler:
Bimplus bulut platformuna entegre çalışan AutoConverter, oluşturduğunuz 3B fiziksel modeli akıllı bir şekilde analitik (hesap) modele dönüştürür.
Oluşturulan bu analitik model, FRILO, SCIA Engineer ve diğer pek çok analiz programının doğrudan okuyabildiği standart SAF (Structural Analysis Format) formatında dışa aktarılır.
Bu otomasyon sayesinde modeli analiz yazılımında sıfırdan oluşturmanıza gerek kalmaz ve manuel veri girişi hatalarının önüne geçilir.
Mimari ve mühendislik araçlarını kapsamlı bir şekilde inceledik. Dilerseniz Allplan Civil ile Yol ve Köprü Tasarımı (Altyapı) özelliklerine göz atabiliriz veya proje ekiplerinin bulut üzerinden nasıl ortak çalıştığını gösteren Bimplus İşbirliği detaylarına geçebiliriz. Hangisi ilginizi çeker?
Analiz sonuçlarını SCIA'dan Allplan'a geri çağırmak nasıl bir avantaj sağlar?
Tasarım değişiklikleri sonrası metraj raporları Excel'e nasıl aktarılır?
Daha önce bahsettiğimiz 14 günlük ücretsiz deneme sürümünü kuralım.
Yapay zeka destekli görselleştirme araçlarının sunduğu imkanlar nelerdir?

Allplan'daki yapay zeka destekli görselleştirme araçları (Nemetschek AI Visualizer ve Veras AI Visualizer), saniyeler içinde çarpıcı ve detaylı görseller oluşturmanızı sağlar. Bu araçların sunduğu temel imkanlar şunlardır:
Hızlı Stil Denemeleri: Farklı mimari stilleri, malzemeleri ve dokuları anında test edebilir, tamamen yeni manzaralar yaratabilirsiniz.
Metinden Görsele (Text-to-Image): "Sadece metin" modunu kullanarak kelimelerle vizyonunuzu tarif edip yapay zekanın bunu görselleştirmesini sağlayabilirsiniz.
Basit Modellerden Yüksek Kaliteye: Basit bir 2B çizimi veya 3B modeli; suluboya, konsept veya fotogerçekçi gibi farklı stillerde yüksek çözünürlüklü bir başyapıta dönüştürebilirsiniz.
Çok Yönlü Kullanım: Hem dış cephe hem de iç mekan tasarımlarında başarılı sonuçlar elde edersiniz.
Görselleştirme süreçlerini tamamladığımıza göre, bu model üzerinden otomatik olarak nasıl Metraj ve Maliyet Hesaplamaları (Quantity Take-off) alındığına geçmek ister misiniz?
Bimplus bulut platformunun proje yönetimi avantajlarını inceleyelim.
Modelden otomatik metraj ve maliyet raporları nasıl alınır?
4D inşaat simülasyonu ile saha planlaması nasıl yapılır?
Yapay zeka destekli görselleştirme araçlarının sunduğu imkanlar nelerdir?

Az önce temel hatlarından bahsettiğimiz yapay zeka destekli görselleştirme (Nemetschek AI ve Veras AI) imkanlarını biraz daha detaylandıralım:
Metinden Görsele (Text-to-Image): "Sadece metin" modunu kullanarak tasarım vizyonunuzu kelimelerle tarif ettiğinizde, yapay zeka bunu saniyeler içinde çarpıcı bir görsele dönüştürür.
Basit Çizimlerden Başyapıta: Düşük çözünürlüklü bir taslağı, basit bir 2B çizimi veya ham bir 3B modeli alıp; suluboya, konsept veya tamamen fotogerçekçi stillerde yüksek çözünürlüklü sunumlara çevirebilirsiniz.
Hızlı Stil ve Materyal Denemeleri: Hem dış cephe hem de iç mekan tasarımlarında farklı mimari stilleri, malzemeleri, dokuları ve manzaraları anında test ederek müşterinize saniyeler içinde yepyeni alternatifler sunmanızı sağlar.
Bu teknoloji, tasarım fikirlerinizi saniyeler içinde hayata geçirerek sunum süreçlerinizi ciddi şekilde hızlandırır.
Görselleştirme süreçlerini netleştirdiğimize göre, dilerseniz oluşturduğumuz bu üç boyutlu model üzerinden otomatik olarak nasıl Metraj ve Maliyet Hesaplamaları (Quantity Take-off) alındığına geçebiliriz. Devam edelim mi?
Metraj verilerinin Excel'e veya maliyet programlarına aktarımını inceleyelim.
PythonParts ile otomasyonun nasıl geliştirildiğine göz atalım.
Yapay zeka araçlarıyla hazırlanan görsellerin proje sunumundaki etkileri nelerdir?
4D inşaat simülasyonu ile saha planlaması nasıl yapılır?

Allplan'da 4D inşaat simülasyonu ve saha planlaması, 3B modele "zaman" boyutunun entegre edilmesiyle şu şekilde yapılır:
Görev Atamaları (Zaman Çizelgesi): İnşaat süreci belirli aşamalara (beton dökümü, montaj vb.) bölünür ve modeldeki yapı elemanları bu görevlere atanarak bir Gantt şeması oluşturulur.
Şantiye Yerleşimi: Lojistik planlamayı optimize etmek için vinçler, şantiye çitleri, konteynerler ve geçici yollar 3B olarak arazi modeline yerleştirilir.
Görsel Simülasyon: Bu adımların sonucunda projenin günden güne nasıl inşa edileceği görsel olarak simüle edilir. Böylece sahada yaşanabilecek lojistik sorunlar inşaat başlamadan çözülür.
Şantiye süreçlerini de planladığımıza göre, bu model üzerinden otomatik olarak Metraj ve Maliyet (Quantity Take-off) raporlarının nasıl alındığına geçelim mi?
Metraj ve Maliyet Hesaplamaları raporları nasıl alınır?
Şantiye Planlaması (BIM2Field) araçlarını inceleyelim.
Lojistik planlamada vinç ve ekipman yerleşimi nasıl yapılır?
Modelden otomatik metraj ve maliyet raporları nasıl alınır?

Allplan'da 3B modelden metraj ve maliyet raporları almak tamamen otomatik ve dinamik bir süreçtir:
Anında Miktar Çıkarımı: Program, modeldeki yapı elemanlarının hacim, alan, uzunluk ve ağırlık gibi verilerini otomatik olarak okur. Tasarımda bir değişiklik yaptığınızda tüm miktar listeleri anında güncellenir.
Modellenmemiş Metrajlar: Yalnızca modelde fiziksel olarak bulunan elemanların (örn. metreküp beton) değil, kalıp alanı gibi modellenmemiş değerlerin de hassas metrajı alınabilir.
Özelleştirilebilir Tablolar: Verileri malzeme, kat veya eleman tipine göre gruplandırarak ofisinize özel raporlar oluşturabilirsiniz.
Maliyet ve Excel Entegrasyonu: Elde edilen metrajları doğrudan Excel'e aktarabilir veya 3. taraf fiyat/maliyet sistemleriyle senkronize ederek çok kısa sürede kesin maliyet tahminleri elde edebilirsiniz.
Böylece raporlama ve bütçeleme konusunu da netleştirmiş olduk. Bu modellerin diğer disiplinlerle (mekanik, elektrik vb.) kayıpsız paylaşımını sağlayan IFC (OpenBIM) Formatı ve Veri Alışverişi detaylarına geçmek ister misiniz?
IFC formatı ile diğer disiplinlerle veri paylaşımı nasıl yapılır?
Bimplus bulut platformunun proje yönetimi avantajları nelerdir?
AI Visualizer ile basit modellerden fotogerçekçi render nasıl alınır?
Bimplus bulut platformunun proje yönetimi avantajlarını inceleyelim.

Bimplus, ekiplerin bulut üzerinden gerçek zamanlı olarak birlikte çalışmasını sağlayan güçlü bir açık BIM platformudur. Proje yönetimindeki temel avantajları şunlardır:
Merkezi Veri (Tek Hakikat Kaynağı): Tüm 3B modeller, çizimler, fotoğraflar ve raporlar bulutta tek bir merkezde saklanır; böylece projedeki tüm paydaşlar her zaman en güncel veriye ulaşır.
Gelişmiş Doküman ve Versiyon Yönetimi: Dosyaların geçmiş versiyonları otomatik kayıt altında tutulur (denetim izi), böylece erişim izinleri ve proje onay iş akışları güvenle yönetilir.
Disiplinler Arası Koordinasyon: Mimari, statik ve tesisat modelleri platformda birleştirilir. Çakışma kontrolleri yapılarak, BCF (BIM Collaboration Format) aracılığıyla sorunlar anında ilgili mühendislere görev olarak atanır ve çözümü takip edilir.
Mobil Şantiye Erişimi: Ekipler sahada tablet veya telefonları üzerinden modellere erişebilir, projeye fotoğraf veya not ekleyerek anında durum güncellemesi yapabilir.
Bluebeam Entegrasyonu: 2B dokümanlar Bluebeam Studio ortamından sorunsuzca Bimplus'a aktarılarak ofis ile şantiye arasındaki iletişim hızlandırılır.
Bimplus ile işbirliği ve proje yönetimi süreçlerini tamamlamış olduk. Dilerseniz modeller üzerinden otomatik metraj ve maliyet (Quantity Take-off) hesaplamalarının nasıl alındığına geçebiliriz. Veya tasarımların sunuma hazırlandığı Pafta Düzenleme ve Çıktı (Layout & Export) süreçlerine bakabiliriz. Hangisiyle devam edelim?
Bimplus bulut platformunun avantajlarını inceleyelim.
Metraj ve maliyet raporları modelden nasıl alınır?
Pafta düzenleme ve çıktı alma süreçlerine bakalım.
Analiz sonuçlarını SCIA'dan Allplan'a geri çağırmak nasıl bir avantaj sağlar?

Analiz sonuçlarını SCIA'dan Allplan'a çift yönlü olarak geri çağırmak, tasarım ve uygulama süreci arasındaki kopukluğu tamamen ortadan kaldırır.
Bu entegrasyonun sağladığı temel avantajlar şunlardır:
Doğrudan Görselleştirme ve Güncelleme: SCIA'da hesaplanan yapısal sonuçlar ve gerekli donatı alanları Allplan'daki 3B modele doğrudan aktarılır ve görselleştirilir.
İnsan Hatalarının Önlenmesi: Tasarım verilerinin analiz programından CAD programına manuel olarak tekrar girilmesi gerekmediği için veri tutarsızlıkları ve insan kaynaklı hatalar önlenir.
Hızlı ve İteratif Tasarım: SCIA tarafında yapılan bir revizyon anında Allplan modelinize yansır, böylece tasarımı çok daha hızlı bir şekilde optimize edebilirsiniz.
Bu çift yönlü aktarım yeteneklerini incelediğimize göre, dilerseniz diğer bir analiz çözümü olan FRILO entegrasyonuna göz atabiliriz. Yoksa bu akıllı modellerden otomatik olarak nasıl Metraj ve Maliyet (Quantity Take-off) raporları alındığına mı geçmek istersiniz?
Analiz sonuçlarının Allplan modeline geri aktarılmasını inceleyelim.
FRILO entegrasyonu tasarım sürecinde ne gibi avantajlar sunar?
Otomatik metraj ve maliyet raporları nasıl oluşturulur?
Tasarım değişiklikleri sonrası metraj raporları Excel'e nasıl aktarılır?

Allplan'da modeliniz parametrik olduğu için, tasarımda bir değişiklik yaptığınızda tüm metraj ve malzeme miktarları anında otomatik olarak güncellenir. Yani baştan bir hesaplama yapmanıza gerek kalmaz.
Güncel raporları Excel'e aktarmak ise şu şekilde işler:
Raporu Oluşturma: Allplan'ın "Raporlar" (Reports) aracını kullanarak güncel metraj, donatı veya alan listesini oluşturursunuz.
Excel Formatını Seçme: Raporun çıktı (Output) ayarlarında dosya türü olarak doğrudan Excel (.xlsx veya .xls) formatını seçip dışa aktar demeniz yeterlidir.
Çift Yönlü Çalışma: Bu entegrasyon çift yönlüdür. Dilerseniz Excel'de yaptığınız veri düzenlemelerini tekrar Allplan'a geri yükleyebilirsiniz.
Bu sayede maliyet hesaplarınızı her zaman güncel tutabilirsiniz.
Metraj ve maliyet konularını da netleştirdiğimize göre, tasarımların sahaya aktarımını sağlayan Şantiye Planlaması (Vinç yerleşimleri, hafriyat vb.) konusuna geçelim mi? Yoksa doğrudan Pafta ve Çıktı (Layout) süreçlerine mi göz atmak istersiniz?
Metraj verilerini Excel'e veya maliyet programlarına nasıl aktarabiliriz?
PythonParts teknolojisinin otomatik donatılandırmadaki rolü nedir?
Bimplus ile şantiye sahasındaki donatı kontrolü nasıl yapılır?
Otomatik metraj ve maliyet raporları nasıl oluşturulur?

Allplan'da otomatik metraj ve maliyet raporları, "Raporlar" (Reports) aracı kullanılarak doğrudan 3B modeldeki verilerin okunmasıyla oluşturulur.
Süreç şu şekilde işler:
Veri Okuma: Program; modeldeki yapı elemanlarının hacim, alan, uzunluk ve ağırlıklarını otomatik olarak hesaplar. Fiziksel olarak modellenmemiş değerler (örneğin kalıp alanı) de bu hesaplamalara dahil edilebilir.
Rapor Şablonları: İhtiyacınıza uygun hazır şablonlardan (malzeme, kat veya eleman bazlı) birini seçerek saniyeler içinde detaylı tablolar üretebilirsiniz.
Maliyet Entegrasyonu: Çıkarılan bu metrajlar, birim fiyat listeleriyle veya 3. taraf maliyet programlarıyla (Excel vb. aracılığıyla) senkronize edilerek hızlıca bütçe ve maliyet tahminlerine dönüştürülür.
Raporlama aşamasını detaylandırmış olduk. Tasarımın sahada hatasız uygulanmasını sağlayan Çakışma Kontrolü (Clash Detection) özelliklerine göz atalım mı? Yoksa tasarımların 2B çizimlere ve sunumlara dönüştürüldüğü Pafta Düzenleme (Layout) sürecine mi geçmek istersiniz?
Çakışma kontrolü (Clash Detection) süreçlerine göz atalım.
Pafta düzenleme ve çıktı (Layout) süreçlerine bakalım.
Bimplus bulut platformunun proje yönetimi avantajlarını inceleyelim.
Analiz sonuçlarının Allplan modeline geri aktarılmasını inceleyelim.

Analiz sonuçlarının Allplan'a geri aktarımı da yine SAF (Structural Analysis Format) ve Bimplus (AutoConverter) üzerinden çift yönlü olarak gerçekleşir. Süreç pratikte şu şekilde işler:
SCIA'dan Dışa Aktarım: SCIA Engineer üzerinde yük analizleri ve gerekli donatı alanı (As) hesaplamaları tamamlandıktan sonra, güncel analitik model SAF formatında kaydedilir.
Bimplus ile İçe Aktarım: Bu dosya doğrudan Bimplus bulut ortamına yüklenir. AutoConverter aracı, bu analitik verileri Allplan'ın okuyabileceği fiziksel model ortamına geri getirir.
Allplan'da Görselleştirme ve Tasarım: Allplan, bu analiz sonuçlarını 3B model üzerinde doğrudan görselleştirir. Örneğin, hangi kirişte ne kadar donatıya ihtiyaç duyulduğunu 3B model üzerinde görerek tasarıma devam edersiniz.
Bu sayede, mühendisin statik hesabına göre mimari veya yapısal modeli manuel olarak baştan çizmeden anında güncelleyebilirsiniz.
Bu veriler ışığında donatıların nasıl yerleştirildiğini görmek için 3B Donatı Detaylandırma (Reinforcement Detailing) özelliklerine geçelim mi? Yoksa farklı bir konuyu mu incelemek istersiniz?
3B Donatı Detaylandırma özelliklerini inceleyelim.
FRILO entegrasyonu yapısal analizde ne sağlar?
Donatı çakışma kontrolleri Allplan modelinde nasıl yapılır?
Otomatik metraj ve maliyet raporları nasıl oluşturulur?

Allplan'da otomatik metraj ve maliyet raporlarını oluşturma işlemi "Raporlar" (Reports) aracı kullanılarak birkaç pratik adımda gerçekleştirilir:
Modeli Hazırlama: Analiz etmek istediğiniz yapı elemanlarının (örneğin belirli bir katın veya tüm binanın) bulunduğu çizim dosyalarını aktif hale getirirsiniz.
Rapor Şablonunu Seçme: Allplan'ın sunduğu zengin rapor kütüphanesinden ihtiyacınıza uygun olanı seçersiniz. Sistem; beton hacmi gibi modellenmiş elemanların yanı sıra, kalıp alanı gibi modellenmemiş değerleri de hesaplayabilen şablonlar sunar.
Filtreleme (İsteğe Bağlı): Sadece belirli bir malzemeyi veya eleman tipini saymak istiyorsanız filtreler uygulayabilirsiniz.
Oluşturma ve Çıktı Alma: Program belirlediğiniz kriterlere göre modeli tarar ve listeyi otomatik üretir. Bu raporu ekranda görüntüleyebilir, çiziminizin içine yerleştirebilir veya maliyet hesaplamaları için doğrudan Excel veya PDF olarak dışa aktarabilirsiniz.
Tasarımdan üretime giden sürecin bir diğer parçası olan Donatı Raporları ve Büküm Listelerinin (Bending Schedules) nasıl otomatik oluşturulduğuna detaylıca bakmak ister misiniz? Yoksa projeyi tamamlayıp Pafta Düzenleme ve Çıktı (Layout) işlemlerine mi geçelim?
BIM2Field ile saha uygulama süreçleri nasıl yönetilir?
Pafta düzenleme ve çıktı alma işlemleri nasıl yapılır?
Donatı raporları ve büküm listeleri otomatik nasıl oluşturulur?
Şantiye Planlaması (BIM2Field) araçlarını inceleyelim.

Allplan'da Şantiye Planlaması (BIM2Field) süreci, dijital tasarımı sorunsuz bir şekilde fiziksel şantiyeye taşımanızı sağlar. Bu alandaki temel araçlar ve işlevler şunlardır:
3B Şantiye Lojistiği: Vinçler (kule vinç kapasite kontrolleri dahil), beton pompaları, konteynerler ve şantiye çitleri gibi ekipmanları doğrudan 3B arazi modeline yerleştirerek lojistik planlamayı ve saha yerleşimini optimize edebilirsiniz.
Kazı ve İksa Planlaması: Hafriyat/dolgu hacimlerini otomatik hesaplayabilir; fore kazık, palplanş duvarlar ve zemin ankrajları gibi kazı destek (iksa) sistemlerini hassas bir şekilde modelleyebilirsiniz.
Sahada Bulut Erişimi (BIM2Field): Bimplus bulut platformu sayesinde, şantiye ekipleri tabletleri veya mobil cihazları üzerinden en güncel 3B modele erişebilir, karmaşık detayları sahada görselleştirebilir ve ofis ekipleriyle anında koordinasyon sağlayabilir.
Böylece projenin sahada nasıl inşa edileceğini henüz ofisteyken dijital olarak çözmüş olursunuz.
Uygulama sırasında sahada sürpriz yaşamamak adına disiplinler arası modellerin denetlendiği Çakışma Kontrolü (Clash Detection) özelliklerine göz atalım mı, yoksa tasarımların paftalandığı 2B Çizim ve Çıktı (Layout) aşamasına mı geçmek istersiniz?
Çakışma kontrolü (Clash Detection) süreçleri nasıl yönetilir?
Pafta düzenleme ve çıktı (Layout) süreçlerine göz atalım.
Bimplus üzerinden disiplinler arası koordinasyon nasıl sağlanır?
Metraj ve maliyet raporları modelden nasıl alınır?

Allplan'da 3B modelden metraj ve maliyet raporları almak "Raporlar" (Reports) aracıyla pratik bir şekilde yapılır. İşlem temel olarak şu şekilde ilerler:
Otomatik Miktar Çıkarımı: Modelinizdeki yapı elemanlarının hacim, alan, uzunluk ve ağırlık gibi bilgileri program tarafından otomatik olarak hesaplanır. Yalnızca 3B olarak çizilmiş nesnelerin değil; fiziksel olarak modellenmemiş olan kalıp alanı gibi spesifik değerlerin de hassas metrajı alınabilir.
Rapor Şablonu Seçimi: Raporlar aracını çalıştırdığınızda; verileri malzemeye, kata veya eleman tipine göre gruplandıran hazır şablonlardan birini seçerek saniyeler içinde detaylı metraj tabloları oluşturabilirsiniz.
Excel ve Maliyet Entegrasyonu: Elde ettiğiniz bu tabloları Excel'e aktarabilir, birim fiyat listelerinizle veya 3. taraf maliyet hesaplama yazılımlarıyla senkronize ederek çok kısa sürede kesin maliyet tahminleri ve bütçe raporları elde edebilirsiniz.
Raporlama aşamasını da netleştirdiğimize göre, projelerinizi diğer disiplinlerle (mekanik, elektrik vb.) paylaşmak için kullandığımız IFC formatı ve OpenBIM iş akışlarına göz atalım mı? Yoksa doğrudan tasarımlarınızı baskıya hazırladığınız Pafta Düzenleme ve Çıktı Alma (Layout) aşamasına mı geçmek istersiniz?
OpenBIM iş akışı ve IFC formatı detaylarını inceleyelim.
Pafta Düzenleme ve Çıktı Alma süreçlerine göz atalım.
Metraj raporlarını özelleştirmek için hangi şablonlar kullanılabilir?
Pafta düzenleme ve çıktı alma işlemleri nasıl yapılır?

Allplan'da pafta düzenleme ve çıktı alma işlemleri, tasarım süreci tamamlandıktan sonra "Pafta Düzenleyici" (Layout Editor) üzerinden oldukça kontrollü ve pratik bir şekilde yapılır. Süreç temel olarak şu şekilde ilerler:
Sayfa ve Çerçeve Ayarları: Öncelikle kağıt boyutu (örn. A2, A0), yönlendirmesi ve kenar boşlukları belirlenir. Standart antetler (title block) ve pafta çerçeveleri seçili paftalara tek tıklamayla yerleştirilebilir.
Görünümleri Yerleştirme: Hazırladığınız 3B model, kat planları, kesitler veya metraj listeleri, "Pafta Penceresi" aracıyla sayfaya istenilen ölçekte yerleştirilir. Modelde daha sonra yapacağınız değişiklikler bu paftalara otomatik yansır.
Çıktı ve Baskı: Hazırlanan paftalar doğrudan ofis yazıcılarına veya çizicilere (plotter) tekli ya da toplu baskı (batch print) olarak gönderilebilir.
Dışa Aktarım (Export): Paftalarınızı standart PDF olarak kaydedebileceğiniz gibi, müşterilerinizin 3B modeli PDF okuyucularından döndürerek incelemesini sağlayan interaktif 3B PDF formatında da dışa aktarabilirsiniz. Ayrıca DWG, DXF veya çeşitli resim formatlarında da kayıt alabilirsiniz.
Böylece projedeki tüm verileri standartlara uygun ve paylaşıma hazır belgelere dönüştürmüş olursunuz.
Tasarım, raporlama ve çıktı aşamalarını böylece tamamlamış olduk. Dilerseniz Allplan'da özel parametrik objelerinizi kodlayarak oluşturabileceğiniz PythonParts ve Visual Scripting (Görsel Kodlama) araçlarına göz atabiliriz. Ya da sormak istediğiniz başka bir detay var mı?
Interaktif 3B PDF çıktısı nasıl oluşturulur ve ne sağlar?
PythonParts ve Visual Scripting ile özel objeler nasıl oluşturulur?
Batch Print ile çoklu pafta baskısı nasıl yönetilir?
Donatı raporları ve büküm listeleri otomatik nasıl oluşturulur?

Allplan'da donatı raporları ve büküm listeleri, hazırladığınız 3B donatı modeli üzerinden tamamen otomatik olarak üretilir. Süreç şu şekilde işler:
Arka Planda Otomatik Hesaplama: Siz 3B donatıyı modelledikçe, program arka planda her bir demir çubuğunun uzunluğunu, ağırlığını ve adedini anında hesaplar.
Raporlar Aracı (Reports): Programdaki "Raporlar" aracını kullanarak "Donatı Listesi - Büküm Şekilleri" gibi hazır şablonlardan birini seçtiğinizde listeniz saniyeler içinde oluşturulur.
Detaylı Görsel Çıktı: Bu tablolar sadece metin veya rakamlardan oluşmaz; poz numaralarını, çap bilgilerini ve ölçülendirilmiş kesme/bükme şemalarını görsel olarak içerir.
Dinamik Güncelleme: Modelde bir donatı çapını veya aralığını değiştirdiğinizde, oluşturulan tüm tablolar, pozlar ve büküm listeleri manuel müdahaleye gerek kalmadan otomatik olarak güncellenir.
Bu özellik sayesinde oldukça karmaşık betonarme yapılarda bile manuel metraj çıkarma derdi ve insan kaynaklı hatalar ortadan kalkar.
Bu adımla birlikte detaylandırma aşamasını da tamamlamış olduk. Tasarımlarımızı baskıya ve sunuma hazırladığımız Pafta Düzenleme ve Çıktı Alma (Layout) aşamasına geçelim mi? Yoksa verilerin diğer yazılımlarla paylaşıldığı OpenBIM (IFC) süreçlerini mi incelemek istersiniz?
Büküm şemalarında poz numaraları ve donatı çapları nasıl gösterilir?
Donatı raporlarını Excel'e aktarırken nelere dikkat edilmelidir?
OpenBIM iş akışı ve IFC formatı ile veri paylaşımı
Pafta Düzenleme ve Çıktı Alma süreçlerine göz atalım.

Allplan'da pafta düzenleme ve çıktı alma işlemleri, 3B modelinizle senkronize çalışan esnek bir süreçtir:
Pafta Hazırlığı (Layout): Modelden otomatik olarak üretilen kat planları, kesitler ve görünümler kolayca pafta düzlemine yerleştirilir. Akıllı antetler (title blocks) sayesinde proje bilgileri (tarih, ölçek, isim vb.) otomatik olarak güncellenir.
Pafta Pencereleri (Layout Windows): Çizimin sadece belirli bir detayını paftaya koymak isterseniz, "pafta pencereleri" kullanarak modelin geri kalanını gizleyebilir ve paftayı dilediğiniz gibi kırpabilirsiniz.
Çıktı ve Dışa Aktarım (Export): Hazırladığınız paftaları doğrudan yazıcıya gönderebilir, yüksek kaliteli 2B veya interaktif 3B PDF olarak kaydedebilirsiniz. Yüksek çözünürlüklü ve karmaşık görsellerin hızlıca yazdırılması için Allplan'ın gelişmiş raster sürücüleri devreye girer. Ayrıca DWG ve DXF gibi CAD formatlarında da sorunsuzca dışa aktarım yapabilirsiniz.
Böylece tasarım sürecinin son aşaması olan dokümantasyon konusunu da tamamlamış olduk.
Projelerinizi başka yazılımlar kullanan mühendislerle (Revit, Tekla vb.) paylaşmanızı sağlayan IFC formatı ve OpenBIM iş akışlarına göz atalım mı? Yoksa sormak istediğiniz başka bir detay var mı?
IFC formatı ve OpenBIM iş akışlarına göz atalım.
Pafta Düzenleme ve Çıktı Alma aşamasına geçelim.
Bimplus üzerinden çakışma kontrolü nasıl yapılır?
Metraj raporlarını özelleştirmek için hangi şablonlar kullanılabilir?

Allplan'da metraj raporlarını özelleştirmek için zengin bir standart rapor kütüphanesi bulunur. Bu raporları ihtiyaçlarınıza göre şu şablon tipleriyle gruplandırarak kullanabilirsiniz:
Malzeme Bazlı Şablonlar: Metrajları projede kullanılan malzemelere göre sınıflandırarak hesaplar.
Kat Bazlı Şablonlar: Projedeki miktarları bulundukları katlara (zemin kat, bodrum vb.) göre ayırarak detaylı tablolar sunar.
Eleman Tipi Bazlı Şablonlar: Sadece belirli yapı elemanlarına odaklanmanızı sağlar (örneğin duvarlar, döşemeler, cephe elemanları veya kapı/pencereler).
Ayrıca bu şablonların formatlarını değiştirebilir, firma logonuzu ekleyebilir veya tabloların düzenini ofis standartlarınıza uygun hale getirebilirsiniz.
Raporlama konusunu tamamladıysak, oluşturduğumuz bu verileri diğer disiplinlerle paylaşmak için kullandığımız IFC (OpenBIM) Formatı detaylarına geçelim mi? Yoksa tasarımların baskıya hazırlandığı Pafta Düzenleme (Layout) sürecini mi incelemek istersiniz?
Rapor şablonlarını ofis standartlarımıza göre nasıl özelleştirebiliriz?
IFC formatı ile diğer disiplinlerle veri alışverişi nasıl yapılır?
Pafta düzenleme ve çıktı alma süreçlerini inceleyelim.
Büküm şemalarında poz numaraları ve donatı çapları nasıl gösterilir?

Allplan'da büküm şemaları oluştururken poz numaraları ve donatı çapları sistem tarafından modele bağlı olarak otomatik olarak eklenir ve detaylı tablolarda görsel şemalarla birlikte sunulur.
Görselleştirme ve etiketleme süreci şu şekildedir:
Parametre Seçimi: Etiket (Label) veya Şema (Schema) aracını kullanırken menüden "Poz Numarası" (Mark Number) ve "Çap" (Diameter) parametrelerini işaretleyerek bu bilgilerin görünür olmasını sağlarsınız.
Otomatik Yerleşim: Giriş seçeneklerinde "Otomatik Poz Numarası" (Automatic mark number) özelliği aktifse, program poz numarasını etiketin yerleştirildiği konuma göre otomatik olarak metnin başına veya sonuna yerleştirir.
Bu etiketlerin metin boyutları ve formatları üzerinde nasıl düzenlemeler yapabileceğimize göz atmak ister misiniz? Yoksa hazırlanan bu donatı raporlarının doğrudan nasıl yazdırılacağına veya dışa aktarılacağına mı geçelim?
Etiketlerdeki metin boyutları ve formatları nasıl düzenlenir?
Donatı raporları doğrudan nasıl yazdırılır veya dışa aktarılır?
3B donatı modelinden büküm şemaları nasıl otomatik oluşturulur?
Donatı raporlarını Excel'e aktarırken nelere dikkat edilmelidir?

Donatı raporlarını Excel'e aktarırken iş akışınızın hatasız olması için şu detaylara dikkat etmelisiniz:
Doğru Format Kullanımı: Rapor çıktı ayarlarında dosya türü olarak .xlsx (Excel 2010 ve üzeri formatlar) veya .xls seçtiğinizden emin olun.
Uygun Şablon Seçimi: Dışa aktarım yapmadan önce "Raporlar" aracından donatı metrajı veya büküm listeleri gibi ihtiyacınıza en uygun şablonu seçin. Böylece veriler Excel'e poz numarası, ağırlık ve çap gibi doğru sütunlar halinde düzenli bir şekilde geçer.
Çift Yönlü Veri Düzenleme: Allplan ile Excel entegrasyonu çift yönlüdür. Excel'e aktardığınız listelere birim fiyatlar ekleyip 3. taraf maliyet programlarıyla senkronize edebilir veya düzenlediğiniz bu verileri projeye entegre etmek üzere tekrar Allplan'a geri çağırabilirsiniz.
Güncel Modeli Aktarma: Modeldeki donatı değişiklikleri miktarlara otomatik yansır. Excel'e aktarım yapmadan önce modelinizdeki 3B revizyonların tamamen bittiğinden emin olmak veri tutarsızlıklarını önler.
Excel'e aktardığımız bu verileri kullanarak doğrudan Maliyet Tahmini ve Bütçeleme süreçlerini nasıl hızlandırabileceğimize göz atalım mı? Yoksa sormak istediğiniz farklı bir detay var mı?
IFC (OpenBIM) formatı ve veri alışverişi süreçlerine bakalım.
Pafta Düzenleme ve Çıktı Alma (Layout) aşamasını inceleyelim.
Bimplus ile çakışma yönetimi (Issue Management) nasıl yapılır?
Bimplus üzerinden çakışma kontrolü nasıl yapılır?

Bimplus üzerinden çakışma kontrolü (Clash Detection), BCF (BIM Collaboration Format) standardı kullanılarak son derece pratik ve hatasız bir iş akışıyla yönetilir:
Modellerin Birleştirilmesi: Mimari, statik ve mekanik (MEP) gibi farklı disiplinlere ait modeller Bimplus bulut platformunda tek bir federatif model olarak birleştirilir ve çakışma testi başlatılır.
Sorun (Issue) Oluşturma: Sistem çakışmaları (örneğin bir havalandırma kanalı ile taşıyıcı kirişin kesişmesini) bulduğunda, 3B kamera açısı, kesin koordinatlar ve eleman kimlikleriyle (GUID) birlikte standart bir BCF kaydı oluşturur ve bunu ilgili mühendislere görev olarak atar.
Allplan İçinden Doğrudan Müdahale: Görevi alan mühendis kendi Allplan yazılımındaki "Sorun Yöneticisi" (Issue Manager) panelinden ilgili soruna tıkladığında, program otomatik olarak model içinde çakışmanın yaşandığı noktaya zum yapar. Yani sorunun nerede olduğunu aramakla vakit kaybedilmez.
Çözüm ve Doğrulama: Mühendis Allplan'da gerekli revizyonu yapar (örneğin kirişte boşluk açar), notunu yazar ve durumu güncelleyerek modeli tekrar Bimplus'a yükler. Koordinatör son durumu onaylayıp sorunu kapatır.
Bu sayede şantiyede haftalarca sürebilecek ve büyük maliyetler yaratacak sorunlar, e-posta karmaşası yaşanmadan dakikalar içinde çözülmüş olur.
Bu koordinasyon sürecini de tamamladığımıza göre, kendi özel parametrik objelerinizi ve otomasyonlarınızı yaratabileceğiniz PythonParts ve Visual Scripting (Görsel Kodlama) araçlarına geçelim mi?
PythonParts ve Görsel Kodlama ile neler yapabilirim?
Bimplus üzerinde BCF kayıtlarını nasıl yönetirim?
Pafta pencereleriyle çizimlerin bölümlerini nasıl yerleştiririm?
Etiketlerdeki metin boyutları ve formatları nasıl düzenlenir?

Allplan'da etiketlerin metin boyutlarını ve formatlarını düzenlemek oldukça esnek ve pratiktir:
Oluşturma Sırasında: Etiketi modele yerleştirirken açılan menüden "Metin Parametreleri" (Text Parameters) bölümüne tıklayarak metin yüksekliğini, genişliğini, en-boy oranını (aspect) ve yazı tipini belirleyebilirsiniz.
Sonradan Düzenleme (Özellikler Paleti): Mevcut bir etikete tıkladığınızda, sağ taraftaki "Özellikler" (Properties) paletinden metin yüksekliğini ve genişliğini anında değiştirebilirsiniz veya sağ tıklayıp "Metin Parametrelerini Değiştir" (Change Text Parameters) aracını kullanabilirsiniz.
Gelişmiş Formatlar: Metinlere arka plan dolgusu ekleyebilir, çerçeve çizebilir ve pafta ölçeği değişse bile metin boyutunun her zaman aynı kalmasını sağlayan "Paftada sabit boyut" (Constant size in layout) özelliğini aktif edebilirsiniz.
Bu etiketleme özellikleriyle donatı raporlarınızı ofis standartlarınıza tam uygun hale getirebilirsiniz. Dilerseniz daha önce kısaca bahsettiğimiz, kendi özel parametrik objelerinizi ve otomasyonlarınızı yaratabileceğiniz PythonParts ve Visual Scripting (Görsel Kodlama) araçlarına geçelim mi?
PythonParts ve Visual Scripting ile otomasyon nasıl sağlanır?
Bimplus üzerinde BCF formatıyla çakışmaları nasıl yönetebiliriz?
3B donatı modellemesi ve detaylandırma adımlarını inceleyelim.
Donatı raporları doğrudan nasıl yazdırılır veya dışa aktarılır?

Allplan'da oluşturduğunuz donatı raporlarını "Rapor Görüntüleyici" (Report Viewer) ekranı üzerinden kolayca yazdırabilir veya dışa aktarabilirsiniz. Şu üç pratik seçeneği kullanabilirsiniz:
Doğrudan Yazdırma: Açılan raporun üst menüsündeki "Yazdır" simgesine tıklayarak sayfayı doğrudan ofis yazıcınıza gönderebilirsiniz.
Çizime Yerleştirme: Rapor çıktısını sadece dışarı almakla kalmayıp, doğrudan Allplan çalışma alanınıza (paftaya veya çizime) detaylı bir tablo olarak tıklayıp yerleştirebilirsiniz.
Dışa Aktarma: Verileri başka ekiplerle paylaşmak veya üzerinde çalışmaya devam etmek için raporu PDF, Excel (.xlsx) veya Word (.doc) formatlarında bilgisayarınıza kaydedebilirsiniz.
Böylece detaylandırma ve raporlama süreçlerini tamamlamış olduk. Dilerseniz kendi özel parametrik objelerinizi ve otomasyonlarınızı yaratabileceğiniz PythonParts ve Visual Scripting (Görsel Kodlama) araçlarına geçebiliriz. Yoksa modellerin farklı yazılımlara aktarıldığı OpenBIM ve IFC Dışa Aktarım detaylarını mı incelemek istersiniz?
PythonParts ve Visual Scripting ile otomasyon nasıl sağlanır?
OpenBIM ve IFC dışa aktarım süreçlerini inceleyelim.
Maliyet tahmini ve bütçeleme süreçleri nasıl hızlandırılır?
3B donatı modelinden büküm şemaları nasıl otomatik oluşturulur?

Allplan'da 3B donatı modelinden büküm şemalarını (bending schedules) otomatik olarak oluşturmak için doğrudan "Raporlar" (Reports) veya "Lejantlar" (Legends) aracını kullanırsınız.
Süreç son derece pratiktir:
Siz donatıyı 3B modelledikçe, Allplan her bir demirin uzunluğunu, büküm açısını ve pozunu arka planda zaten hesaplar.
Donatı işleminiz bittiğinde "Raporlar" aracını açıp "Donatı Listesi - Büküm Şekilleri" (Bending Shapes) şablonunu seçmeniz yeterlidir.
Program saniyeler içinde ölçülendirilmiş görsel büküm şemalarını oluşturur. Bu tabloyu doğrudan çizim ekranınıza yerleştirebilir veya yazdırabilirsiniz.
En büyük avantajı dinamik olmasıdır; 3B donatı modelinde yaptığınız herhangi bir değişiklik veya sildiğiniz bir donatı, bu şemalara anında yansır.
Donatı raporlamasını da netleştirdiğimize göre, az önce rafa kaldırdığımız PythonParts ve Visual Scripting (Görsel Kodlama) ile kendi özel otomasyonlarınızı nasıl yaratabileceğinize geçelim mi?
PythonParts ve Visual Scripting ile otomasyon nasıl yapılır?
Büküm şemalarında çap ve poz numarası nasıl etiketlenir?
Parametrik SmartParts objeleri projeye nasıl dahil edilir?
PythonParts ve Visual Scripting ile otomasyon nasıl sağlanır?

Allplan'da otomasyon, kodlama bilginiz olup olmamasına göre iki güçlü araçla sağlanır:
Visual Scripting (Görsel Kodlama - Kodsuz): Hiç kod yazmanıza gerek kalmadan, sürükle-bırak mantığıyla çalışır. Ekranda geometri, matematik ve BIM işlevlerini temsil eden "düğümleri" (nodes) birbirine bağlayarak bir veri akışı oluşturursunuz. Örneğin; genişlik, yükseklik ve kalınlık düğümlerini birleştirerek tamamen size özel parametrik bir "Akıllı Obje" yaratabilirsiniz.
PythonParts (Kodlu Otomasyon): Python programlama dili (API) kullanılarak yazılan gelişmiş parametrik objelerdir. Özellikle çok tekrar eden işlemlerde kullanılır. Örneğin; yüzlerce kapının etiketini tek tıkla güncellemek, dış maliyet yazılımlarıyla entegrasyon kurmak veya bir kolonun sadece donatı çapı ve aralık bilgilerini girerek 3B donatısını otomatik yerleştirmek için kullanılır.
Özetle, bu araçlar sayesinde saatler veya günler sürecek karmaşık manuel modelleme işlerini saniyelere indirebilir ve insan kaynaklı hataları önleyebilirsiniz.
Otomasyon araçlarını da inceleyerek Allplan'ın tasarım ve detaylandırma yeteneklerini büyük ölçüde tamamlamış olduk.
Dilerseniz projelerinizi diğer yazılımlarla kayıpsız paylaşmanızı sağlayan OpenBIM ve IFC Formatı özelliklerine geçebiliriz veya tasarımlarınızı müşterilerinize sunarken kullanabileceğiniz Render, Animasyon ve AI Visualizer (Yapay Zeka Görselleştirme) araçlarına bakabiliriz. Hangisiyle devam edelim?
OpenBIM ve IFC dışa aktarım detaylarını inceleyebilir miyiz?
Yapay zeka ile görselleştirme ve render araçlarına bakalım.
PythonParts ile kolon donatısı otomasyonu nasıl yapılır?
Maliyet tahmini ve bütçeleme süreçleri nasıl hızlandırılır?

Allplan'da maliyet tahmini ve bütçeleme süreçleri, modelden alınan otomatik metrajların fiyat listeleriyle entegre edilmesiyle şu şekilde hızlandırılır:
Dinamik Fiyat Entegrasyonu: Modelden elde edilen hassas miktar verilerini (beton hacmi, donatı ağırlığı vb.), Excel aracılığıyla kendi birim fiyat listelerinizle veya 3. taraf fiyat kitaplarıyla (örn. RICS) senkronize edebilirsiniz.
Zaman Tasarrufu: Manuel metraj çıkarma işlemlerine kıyasla %70'e varan verimlilik artışı sağlanır. Günler sürebilecek maliyet hesaplamaları, bu otomasyon sayesinde dakikalar içinde ve yüksek doğrulukla tamamlanır.
Erken Aşama Tahminleri: Tasarımın henüz ilk aşamalarından itibaren güvenilir malzeme listeleri oluşturulabildiği için, bütçe kontrolleri ve ihale hazırlıkları çok daha erken ve net bir şekilde yapılır.
Böylece projenin bütçe ve maliyet planlamasını da güvence altına almış olduk. Daha önce rafa kaldırdığımız PythonParts ve Visual Scripting (Görsel Kodlama) konusuna şimdi dönmek ister misiniz, yoksa tasarımlarınızı hayata geçiren Görselleştirme ve Render özelliklerine mi göz atalım?
PythonParts ve Visual Scripting ile otomasyon nasıl yapılır?
Görselleştirme ve Render özelliklerini inceleyelim.
Maliyet verilerini Allplan modeline geri yüklemek mümkün mü?
Büküm şemalarında çap ve poz numarası nasıl etiketlenir?

Allplan'da büküm şemalarını etiketlerken çap ve poz numarası eklemek oldukça basittir:
Etiket Aracı (Label Tool): Donatıyı yerleştirdikten sonra otomatik açılan veya sonradan seçtiğiniz "Etiket" (Label) menüsünden "Çap" (Diameter) ve "Poz Numarası" (Mark Number) onay kutularını işaretlemeniz yeterlidir.
Otomatik Poz Numarası: Giriş seçeneklerinde (Input Options) "Otomatik Poz Numarası" (Automatic mark number) özelliğini aktif ederseniz, program etiketi yerleştirdiğiniz konuma göre poz numarasını metnin başına veya sonuna kendiliğinden ekler.
Sonradan Düzenleme: Mevcut bir etiketi değiştirmek isterseniz, üzerine tıklayıp Özellikler (Properties) paletinden bu parametreleri anında açıp kapatabilirsiniz.
Bu etiketleme ayarlarıyla donatı paftalarınızı kolayca standartlara uygun hale getirebilirsiniz. Hazırladığımız bu detaylı donatı çizimlerini son aşama olarak yazdırmak veya sunmak üzere Pafta Düzenleme (Layout) aşamasına geçelim mi?
Allplan ve Bimplus ile çakışma çözüm iş akışı nasıl işler?
PythonParts ve Visual Scripting ile neler yapılabilir?
Allplan modelinden 2B pafta ve çıktı alma süreçleri nasıldır?
Allplan modelinden 2B pafta ve çıktı alma süreçleri nasıldır?

Allplan'da 3B modelden 2B pafta (layout) ve çıktı alma süreci, tasarımla tam senkronize çalışan "Pafta Düzenleyici" (Layout Editor) üzerinden yönetilir.
Süreç temel olarak şu adımlarla ilerler:
Sayfa ve Antet Ayarları: Öncelikle kağıt boyutu (A0, A2 vb.), yönlendirmesi ve kenar boşlukları belirlenir. Ardından proje bilgilerini (tarih, ölçek, isim vb.) otomatik olarak çeken akıllı antetler (title block) ve pafta çerçeveleri sayfaya eklenir.
Görünümleri Yerleştirme: Modelden otomatik üretilen kat planları, cepheler ve kesitler "Pafta Pencereleri" (Layout Windows) kullanılarak sayfaya istenilen ölçekte yerleştirilir. Modelde yaptığınız herhangi bir 3B değişiklik bu 2B paftalara anında yansır.
Çıktı ve Dışa Aktarım: Hazırlanan paftaları doğrudan yazıcı veya çizicilere (plotter) toplu olarak (batch print) gönderebilirsiniz. Ayrıca verileri standart PDF, interaktif 3B PDF, DWG/DXF veya çeşitli resim formatlarında da dışa aktarabilirsiniz.
Böylece projenin dokümantasyon aşamasını hızlıca tamamlamış oluyoruz. Müşteri sunumları için Allplan'ın Görselleştirme (Render, Animasyon) ve yapay zeka destekli AI Visualizer araçlarına göz atalım mı?
Yapay zeka görselleştirme (AI Visualizer) araçlarına göz atalım.
OpenBIM iş akışı ve IFC dışa aktarım detaylarını inceleyelim.
Büküm şemalarında çap ve poz numarası nasıl etiketlenir?
PythonParts ve Visual Scripting ile otomasyon nasıl yapılır?

Allplan'da otomasyon, kodlama bilginiz olup olmamasına göre iki esnek yöntemle yapılır:
Visual Scripting (Görsel Kodlama): Hiç kod yazmanıza gerek yoktur. Arayüzde geometri, matematik ve BIM işlevlerini temsil eden "düğümleri" (nodes) sürükleyip birbirine bağlayarak bir veri akışı oluşturursunuz. Bu yöntemle kendi özel parametrik "Akıllı Nesnelerinizi" (Smart Objects) kolayca tasarlayabilirsiniz.
PythonParts (Kodlu Otomasyon): Allplan'ın Python API'sini temel alır ve Visual Studio Code gibi ortamlar kullanılarak geliştirilir. Özellikle yüzlerce kapı etiketini aynı anda güncellemek, dış maliyet yazılımlarıyla veri entegrasyonu kurmak veya bir kolonun 3B donatısını otomatik yerleştirmek gibi çok tekrar eden karmaşık görevleri otomatikleştirmek için idealdir.
Bu araçlar, manuel yapıldığında saatler sürebilecek modelleme işlerini saniyelere indirerek büyük zaman tasarrufu sağlar.
Otomasyon detaylarını da netleştirdiğimize göre, projelerinizi diğer yazılımlarla sorunsuz paylaşmanızı sağlayan OpenBIM ve IFC Formatı özelliklerine geçebiliriz veya tasarımlarınızı sunarken kullanabileceğiniz Render ve AI Visualizer (Yapay Zeka Görselleştirme) araçlarına bakabiliriz. Hangisiyle devam edelim?
OpenBIM ve IFC dışa aktarım detaylarını inceleyelim.
Render ve AI Visualizer araçlarına göz atalım.
Bimplus ile disiplinler arası çakışma kontrolü nasıl yapılır?
Bimplus ile disiplinler arası çakışma kontrolü nasıl yapılır?

Bimplus ile disiplinler arası çakışma kontrolü (Clash Detection) şu adımlarla pratik bir şekilde gerçekleştirilir:
Modelleri Birleştirme: Mimari, statik ve mekanik gibi farklı disiplinlerden gelen modeller Bimplus bulut platformuna yüklenerek tek bir federatif modelde birleştirilir ve çakışma testi başlatılır.
Otomatik Tespit ve BCF Kaydı: Bimplus çakışmaları otomatik olarak bulur; 3B kamera açısı, kesin koordinatlar ve çakışan eleman kimlikleriyle (GUID) birlikte standart bir BCF (BIM Collaboration Format) sorunu (issue) oluşturur.
Doğrudan Müdahale: İlgili mühendis Allplan içindeki "Sorun Yöneticisi"nden (Issue Manager) soruna tıkladığında, program model içinde otomatik olarak tam çakışma noktasına zum yapar.
Güncelleme ve Kapatma: Allplan üzerinde gerekli düzeltmeler yapılıp model tekrar Bimplus'a yüklenir, çakışma giderildiğinde sorun koordinatör tarafından kapatılır.
Böylece sahada yaşanabilecek büyük maliyetli sorunlar ofis ortamında hızlıca çözülmüş olur.
Koordinasyon sürecini netleştirdiğimize göre, tasarımlarınızı müşterilerinize etkili şekilde sunmanızı sağlayan Render ve AI Visualizer (Yapay Zeka Görselleştirme) özelliklerine geçelim mi?
Render ve AI Visualizer (Yapay Zeka Görselleştirme) araçlarını inceleyelim.
OpenBIM ve IFC Dışa Aktarım süreçlerinin detaylarına bakalım.
BCF dosyalarıyla Allplan içinde sorun yönetimi nasıl yapılır?
Render ve AI Visualizer araçlarına göz atalım.

Allplan'da görselleştirme ve sunum süreçleri, yüksek performanslı render motorları ve yeni nesil yapay zeka teknolojileriyle oldukça pratik bir şekilde yönetilir:
Gelişmiş Render Motorları: Program içinde MAXON'un GPU hızlandırmalı Redshift motorunu kullanarak çok kısa sürede yüksek kaliteli, fotogerçekçi görseller ve animasyonlar elde edebilirsiniz. Sistemde ayrıca CineWare, Real-time Render (NVIDIA OptiX yapay zeka gürültü azaltma destekli) ve Lumion ile Twinmotion için canlı bağlantı (live link) özellikleri yer alır.
AI Visualizer (Yapay Zeka Görselleştirme): Nemetschek ve Veras AI entegrasyonları sayesinde; elinizdeki basit bir 3B modelden, 2B taslaktan veya sadece vizyonunuzu anlatan metinler ("text only") yazarak saniyeler içinde farklı mimari stillerde (suluboya, fotogerçekçi vb.) alternatif görseller üretebilirsiniz.
Bu araçlarla müşterilerinize tasarım fikirlerinizi anında ve çok etkileyici bir biçimde sunabilirsiniz.
Eğer bu görselleri ve 3B modelleri diğer disiplinlerle (mekanik, elektrik vb.) bulut üzerinden nasıl paylaşacağımızı incelemek isterseniz Bimplus ve OpenBIM (IFC) iş akışlarına geçebiliriz. Ne dersiniz?
Bimplus ve OpenBIM (IFC) iş akışlarını inceleyelim.
Yapay zeka görselleştirme ile mimari stiller nasıl değiştirilir?
Redshift motoru ile fotogerçekçi render alma adımları nelerdir?
OpenBIM ve IFC dışa aktarım detaylarını inceleyelim.

Allplan, yazılımdan bağımsız işbirliğini temel alan OpenBIM felsefesini güçlü bir IFC altyapısıyla destekler. Dışa aktarım süreci şu temel yeteneklerle yönetilir:
Gelişmiş Format Desteği: Standart IFC 2x3 ve IFC4'ün yanı sıra, özellikle köprü, yol ve tünel gibi altyapı projeleri için genişletilmiş IFC 4.3 standardı tam olarak desteklenir.
Nitelik Eşleme (Attribute Mapping): Dışa aktarımın en kritik adımıdır. Allplan'daki standart veya özel nitelikleri (malzeme, maliyet kodu, hacim vb.), standart IFC özellik kümelerine (Pset_QuantityTakeOff, Pset_Cost vb.) kolayca eşleyebilirsiniz.
Veri Filtreleme ve Optimizasyon: Modeldeki tüm verileri körü körüne aktarmak yerine, "Yalnızca Atanan Nitelikleri Aktar" seçeneğiyle sadece hedef yazılımın (örneğin maliyetlendirme veya enerji analizi programı) ihtiyaç duyduğu verileri aktarabilirsiniz. Bu sayede dosya boyutları küçülür ve veri kirliliği önlenir.
IDS (Information Delivery Specification) Kontrolü: Projenizin BIM bilgi gereksinimlerine uyup uymadığını (örneğin her duvarın zorunlu olarak "yangın dayanımı" bilgisine sahip olup olmadığını) dışa aktarım öncesinde otomatik olarak denetleyebilirsiniz.
Bu iş akışları sayesinde, modeliniz başka disiplinlerin kullandığı yazılımlarda (Revit, Tekla vb.) veri kaybı veya yanlış yorumlama yaşanmadan hatasız şekilde okunur.
Teknik detaylandırma ve paylaşım süreçlerini de tamamladığımıza göre, tasarımlarınızı müşterilerinize fotogerçekçi şekilde sunmanızı sağlayan Render ve AI Visualizer (Yapay Zeka Görselleştirme) araçlarına göz atalım mı?
OpenBIM ve IFC iş akışlarını daha detaylı inceleyebilir miyiz?
Render ve AI Visualizer ile görselleştirme araçlarına göz atalım.
IFC dışa aktarımında nitelik eşleme (attribute mapping) nasıl yapılır?