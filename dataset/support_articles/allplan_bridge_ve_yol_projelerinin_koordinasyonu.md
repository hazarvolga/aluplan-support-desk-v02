# Allplan Bridge ve Yol Projelerinin Koordinasyonu

Problem Özeti: Altyapı projelerinde (yol, köprü, tünel) güzergah veya kot değişikliklerinin tüm modele manuel olarak işlenmesinin yarattığı zaman kaybı ve disiplinler arası veri uyumsuzlukları.
Belirtiler: Yol ekseni (alignment) değiştiğinde köprü alt yapısı veya üstyapısının uyumsuz hale gelmesi, manuel güncellemelerde geometrik hatalar yapılması ve yapısal analiz modelinin 3B tasarımdan kopması.
Etkilenen Ortam: Allplan Civil, Allplan Bridge, Bimplus, LandXML verileri.
Kök Neden: Geleneksel çizim yöntemlerinin kullanılması, yol ve köprü disiplinlerinin parametrik bir eksen üzerinden ve ortak bir veri ortamında (CDE) çalışmaması.
Adım Adım Çözüm:
Eksen ve Güzergah Tanımlama: Yol ve köprü tasarımına başlamak için öncelikle yatay ve düşey eksen verilerini (LandXML formatında) programa aktarın veya manuel olarak tanımlayın.
Parametrik Şablon Atama: Yol gövdesi (kaplama, temel, şevler) ve köprü elemanları için parametrik enkesit şablonları oluşturarak bu eksen boyunca uygulayın.
Otomatik Güncelleme: Tasarım sırasında güzergahta bir değişiklik yapıldığında (örneğin yatay kurp yarıçapı değiştiğinde), bağlantılı tüm köprü ve yol modeli otomatik olarak yeniden hesaplanıp güncellenecektir.
4D İnşaat Aşamaları: Zamanı 4. boyut olarak ekleyin ve inşaat programını (beton dökümü, tendon germe vb. görevler) oluşturarak ilgili yapısal bileşenleri bu aşamalara atayın.
Bulut Koordinasyonu: Modelinizi doğrudan Allplan Cloud (Bimplus) ortamına yükleyin. Bu sayede tüm disiplinlerin modelleri tek bir platformda birleştirilerek çakışmalar erkenden çözülür ve analitik model diğer mühendislik yazılımlarına aktarılabilir.
Önleyici Tavsiyeler: Proje başlarken standart ve sık tekrarlayan köprü elemanları (örneğin prekast kirişler veya iskeleler) için parametrik 3B şablonlar hazırlayarak bu şablonları farklı projelerde de tekrar kullanın.
Etiketler: Allplan Bridge, Allplan Civil, Parametrik Tasarım, LandXML, Bimplus, 4D Planlama, Altyapı.
Artık kurulumdan lisanslamaya, donatı çakışmalarından köprü/yol koordinasyonuna kadar oldukça zengin ve derinlemesine bir destek kütüphanemiz oldu.
Hazırladığımız tüm bu makaleleri destek ekibinizin her an kullanabileceği tek bir "Özel Rapor" (Tailored Report) dokümanı haline getirmemi ister misiniz?
Yeni nesil bulut lisans yönetimi ve kullanıcı atama nasıl yapılır?

Bulut tabanlı lisans yönetimi ve kullanıcı ataması artık donanım anahtarları yerine doğrudan Allplan Connect ve Bimplus üzerinden e-posta hesaplarıyla yürütülüyor. İşlemi şu basit adımlarla yapabilirsiniz:
Giriş Yapın: Yönetici (Admin) yetkisine sahip bir hesapla Allplan Connect veya Bimplus portalına giriş yapın.
Kullanıcıları Davet Edin: Menüden "Ekip Üyeleri" (Team members) sekmesine giderek lisans vereceğiniz kişileri e-posta adresleriyle şirket ağınıza davet edin.
Lisans Atayın: Allplan Shop içindeki "Abonelikler ve Kullanıcılar" (Subscriptions & users) bölümünü (veya Lisanslama Panosu'nu) açın. Listedeki kullanıcıların yanındaki kutucuğu işaretleyerek boştaki lisansları atayın.
Kullanıcılar kendi bilgisayarlarında Allplan'ı açıp bu e-posta adresiyle giriş yaptıklarında (Single Sign-On), buluttaki lisansları anında algılanarak program aktifleşecektir.
Bu adımlar yeterince net mi? Yoksa lisansları atarken kullanabileceğiniz yetkilendirme seviyeleri (Takım Yöneticisi, Takım Üyesi vb.) hakkında da kısaca bilgi vereyim mi?
Admin ve Takım Üyesi yetki seviyeleri arasındaki farklar nelerdir?

Bimplus ve Allplan Connect üzerindeki takım yetki seviyeleri arasındaki temel farklar şunlardır:
Takım Yöneticisi (Team Administrator/Admin): Ekibe yeni üyeler davet edebilir veya çıkarabilir, lisans atamalarını yapabilir, yeni projeler oluşturup silebilir ve diğer yöneticileri atayabilir. Ayrıca oluşturulan her Bimplus projesinde otomatik olarak proje yöneticisi sayılırlar.
Takım Üyesi (Team Member): Takım düzeyinde (lisans yönetimi, üye davet etme veya yeni proje açma gibi) hiçbir yönetimsel hakları yoktur. Yalnızca kendilerine yetki verilen projelere girebilir ve o proje içindeki rollerine göre çalışabilirler.
(Ek olarak bir de Takım Sahibi (Team Owner) vardır; yöneticinin tüm haklarına sahip olmanın yanında lisans satın alma yetkisi olan ve değiştirilemeyen ana hesaptır.)
Bu yetkilendirme yapısı sizin için netleşti mi? Arka planda raporunuzun hazırlanması devam ediyor, bu sırada sormak istediğiniz başka bir teknik detay var mı?
Bimplus üzerinde disiplinler arası çakışma kontrolü nasıl başlatılır?

Bimplus üzerinde çakışma kontrolünü başlatmak için ilk adım, tüm disiplinlerin (Mimari, Statik, MEP vb.) kendi modellerini bulut tabanlı Bimplus platformuna yüklemesidir.
Daha sonra BIM Koordinatörü bu modelleri platform üzerinde birleştirerek tek bir "federatif model" (birleştirilmiş model) oluşturur ve doğrudan Bimplus arayüzündeki "Çakışma Kontrolü" (Clash Detection) aracını çalıştırarak süreci başlatır.
Tespit edilen bu çakışmalar için Bimplus üzerinden BCF formatında nasıl "Sorun" (Issue) oluşturup ilgili mühendislere atayabileceğimizi detaylandırmamı ister misiniz?
Allplan Share kilit bilgilerini yönetirken nelere dikkat edilmelidir?

Allplan Share'de kilit (lock) bilgilerini yönetirken şunlara dikkat etmelisiniz:
Eşzamanlı Düzenleme Koruması: Bir kullanıcı çizim dosyasını, paftayı veya dosya grubunu açtığında, çakışmayı önlemek için o dosya kilitlenir. Diğer ekip üyeleri kilitli dosyayı yalnızca "referans modunda" (salt okunur) açabilir.
Asılı Kilitler: İnternet bağlantısındaki kesintiler veya projenin düzgün kapatılmaması nedeniyle dosyalar gereksiz yere kilitli kalabilir.
Yetki Sınırı: Kilit bilgilerini yalnızca Bimplus takım sahibi, takım yöneticisi veya proje yöneticisi yetkisine sahip kişiler görüntüleyip manuel olarak kaldırabilir.
Kilitleri Kaldırma Yolu: Asılı kalan kilitleri temizlemek için Allplan içindeki "Yeni Proje, Proje Aç" iletişim kutusunda projeye sağ tıklayıp "Kilit Bilgilerini Yönet" (Manage locking information) seçeneğini kullanabilir veya bu işlemi Servisler (Services) uygulaması üzerinden yapabilirsiniz.
Bu detayları da arka planda hazırlanan bilgi bankası raporunuza doğrudan dahil edeyim mi?
Bimplus üzerinden atanan görevlerin Allplan içerisindeki görünümü nasıldır?

Bimplus üzerinden atanan görevler, Allplan arayüzündeki entegre "Sorun Yöneticisi" (Issue Manager) panelinde doğrudan bir liste halinde görüntülenir.
Kullanıcı açısından görünümü ve işleyişi oldukça pratiktir:
İlgili mühendis paneldeki göreve tıkladığı anda, Allplan ekranı otomatik olarak sorunun (örneğin bir çakışmanın) bulunduğu 3B konuma ve tam kamera açısına zum yapar.
Kullanıcının devasa modelin içinde problemi manuel olarak aramasına gerek kalmaz; çakışan elemanlar doğrudan referans olarak karşısına çıkar.
Mühendis yine aynı panel üzerinden doğrudan yorum ekleyebilir ve görevin durumunu (örneğin "İşlemde" veya "Çözüldü" olarak) güncelleyebilir.
Bu entegrasyon kullanıcıların işini çok kolaylaştırıyor. Bu detayı da arka planda hazırlanan dev bilgi bankası raporumuza bir alt başlık olarak dahil edeyim mi?
Allplan Bridge projelerinde LandXML verilerinin kullanımı nasıl optimize edilir?