---
title: "Allplan-2022-0-Yenilikler-R1"
category: Features_and_Updates
source: Allplan-2022-0-Yenilikler-R1.pdf
tags: [PDF_Extraction, Allplan, Auto_Categorized]
---

ALLPLAN 2022

Allplan 2022'deki Yeni Özellikler

Bu dokümantasyon, azami özen gösterilerek hazırlanmıştır.
ALLPLAN GmbH ve program yazarlarının, herhangi bir kesinti dahil ancak
bunlarla sınırlı olmamak üzere, doğrudan veya dolaylı olarak bu yazılım ve
dokümantasyonundan kaynaklanan herhangi bir sorumluluk, kayıp veya
hasara ilişkin olarak alıcıya veya başka herhangi bir kuruluşa karşı hiçbir
sorumluluğu
yoktur hizmet, iş kaybı, beklenen karlar veya bu yazılımın ve belgelerinin
kullanımından veya çalıştırılmasından kaynaklanan dolaylı zararlar.
Açıklamalar ve program arasında uyuşmazlık olması durumunda, program
tarafından görüntülenen menü ve program satırları önceliklidir.
Bu belgedeki bilgiler önceden haber verilmeksizin değiştirilebilir. Örneklerde
kullanılan şirketler, isimler ve veriler aksi belirtilmedikçe hayalidir. ALLPLAN
GmbH'nin açık yazılı izni olmaksızın, bu belgelerin hiçbir bölümü herhangi bir
amaçla elektronik veya mekanik olarak çoğaltılamaz veya aktarılamaz.
Allfa®, ALLPLAN GmbH, Münih'in tescilli ticari markasıdır.
Allplan®, Nemetschek Group, Münih'in tescilli ticari markasıdır.
Adobe®, Acrobat® ve Acrobat Reader®, Adobe Systems Incorporated'ın
ticari markaları veya tescilli ticari markalarıdır.
AutoCAD®, DXF ™ ve 3D Studio MAX®, Autodesk Inc., San Rafael, CA'nın
ticari markaları veya tescilli ticari markalarıdır.
BAMTEC®, Häussler, Kempten, Almanya'nın tescilli ticari markasıdır.
Datalogic ve Datalogic logosu, Amerika Birleşik Devletleri ve Avrupa dahil
birçok ülkede Datalogic S.p.A.'nın tescilli ticari markalarıdır. Her hakkı saklıdır.
Microsoft® ve Windows®, Microsoft Corporation'ın ticari markaları veya
tescilli ticari markalarıdır.
MicroStation®, Bentley Systems, Inc.'in tescilli ticari markasıdır.
Bu ürünün parçaları LEADTOOLS, (c) LEAD Tech-nologies, Inc. kullanılarak
geliştirilmiştir. Tüm hakları saklıdır.
Bu ürünün parçaları "The Apache Software Foundation" Xerces kitaplığı
kullanılarak geliştirilmiştir.
fyiReporting Software LLC, bu ürünün parçalarını, Apache Yazılım lisansı
sürüm 2 ile kullanıma sunulan fyiReporting kitaplığını kullanarak geliştirdi.
Allplan güncelleme paketleri 7-Zip, (c) Igor Pavlov kullanılarak oluşturulur.
Cineware, render motoru ve kullanıcı dokümantasyonunun parçaları; telif
hakkı 2020 MAXON Computer GmbH. Her hakkı saklıdır.
Diğer tüm (tescilli) ticari markalar, ilgili sahiplerinin mülkiyetindedir.
© ALLPLAN GmbH, Munich. Her hakkı saklıdır.
Çeviri: Aluplan Bilgisayar - Ferdi Dinekli

Allplan 2022'deki Yeni Özellikler

İçindekiler

i

İçindekiler
Allplan 2022 - En iyi şekilde inşa edilebilirlik ....................... 1
Kurulum ve Proje İçe Aktarımı için Optimizasyonlar ......2
Allplan Kurulumu Önemli Derecede Basitleştirildi .................................... 3
Projeleri önceki sürümlerden de içe aktarın........................................................ 4

Allplan 2022: başlangıçtan itibaren kolay kullanım ......... 5
Demo projesi “Hello Allplan!”................................................................................. 6
Özellikler Paleti.............................................................................................................. 6
Boşlukların modifikasyonu ............................................................................................. 7
Çakışan Boşluklar ............................................................................................................... 8
Gelişmiş Özellikler Paleti ..................................................................................................9

Katmanlar Paleti......................................................................................................... 10
Tek bir duvar katmanını etkinleştirin ............................................................. 10
Çatı yüzeyi ..................................................................................................................... 10
Seçenekler ......................................................................................................................11
Genişletilmiş Araç İpuçları ..................................................................................... 13
Çizim dosyasını veya paftayı birkaç çizim dosyasına veya
paftasına kopyalayın ............................................................................................... 14
Katman Strüktürünün Yeniden Düzenlenmesi ....................................... 15
Akıllı Katalog ................................................................................................................. 15
Birden çok pafta için pafta çerçevesi ve başlık bloğu .......................... 16
Geliştirilmiş 3B gezinme ........................................................................................ 16
Bir elemanın etrafında döndürme.............................................................................16

ii

İçindekiler

Allplan 2022

Seçenek - navigasyon modunda ters yön ......................................................... 17

Diğer yeni özellikler .................................................................................................. 18
Başlangıç ekranı..................................................................................................................18
Pencere düzenlemesi için varsayılan yapılandırma şimdi 2 + 1
animasyon .............................................................................................................................18
Başlık çubuğu .......................................................................................................................18
Durum Çubuğu ....................................................................................................................19
Kullanıcı Deneyimi Ekibine Geri Bildirim ................................................................20
Çoklu Çizgileri Etiketle ...................................................................................................20
Nişler.........................................................................................................................................20
Lejantları Kaydet................................................................................................................21
Paftayı değiştir sürüme bağlıdır ................................................................................ 21
Yeniden adlandırılan paftayı etiketleme işlevi .................................................. 21
Boş Pafta Pencereleri Korunacak............................................................................ 21

Allplan Share ile daha hızlı ve daha güvenli işbirliği ....... 22
Çizim Dosyalarını ve Paftaları Otomatik Kaydetme ............................ 23

Allplan ile daha verimli ve detaylı modelleme .................. 24
Farklı Bileşenlerin Hakimiyet Yoluyla Kesişimi ........................................ 25
Bileşenlerin 2B etkileşimini devre dışı bırak .............................................. 26

Kendi kodlarınızı yazmak giderek daha kolay hale
geliyor ................................................................................................ 27
Visual Scripting-Görsel Kodlama .................................................................... 28
Görsel bilgi .............................................................................................................................28
Geri al/Yine yap .................................................................................................................29
Seri Satırını Değiştir .........................................................................................................30
Yinelenen Düğüm..............................................................................................................30
Akıllı Sembolün Bağlantısını Kaldır...........................................................................30

Allplan 2022'deki Yeni Özellikler

İçindekiler

iii

Yeni Hotline Aracı cleanvisgui.....................................................................................31

Otomatik Donatılandırma: Hızlı ve Hassas ........................ 32
Otomatik Donatıyı Doğrudan Seçin .............................................................. 33
Şekil Kodu Yöneticisi .............................................................................................. 34
Çizim dosyası filtreli lejantlar ............................................................................. 35
Bağlantılı Taşı .............................................................................................................. 35
Diğer Yeni Özellikler ................................................................................................ 36
Proje Şablonları ..................................................................................................................36
Etiketleme Seçenekleri .................................................................................................36
Lejant Kırılım Birimi ...........................................................................................................36
Tek kod sisteminde kırılımlar .....................................................................................36

Allplan ile çelik konstrüksiyonda daha fazla çeşitlilik ... 37
Çelik Bağlantı Oluşturma ..................................................................................... 38
Yeni Obje Strüktürel Çerçeveleme Çaprazı ............................................. 38
Strüktürel Çerçeveleme Objesi için İşaret Numaraları ...................... 39
Diğer Yeni Özellikler ................................................................................................. 41
Strüktürel çerçeveleme kirişleri için yuvarlak kesit......................................41
Eksen(Aks) Izgarası Genişletildi ve İyileştirildi ..................................................41

Kullanımı kolay ve güçlü: Arazi modeli ve Yol tasarımı42
Yol Tasarımına Giriş ................................................................................................. 43

Nitelik yönetimi için değerli yenilikler ................................. 44
Yeni Formül Düzenleyici ....................................................................................... 45
Özellikler paleti aracılığıyla niteliklerin kaldırılması .................................47
Diğer Yeni Özellikler ................................................................................................ 48

iv

İçindekiler

Allplan 2022

Proje ayarları: Nitelikler için yol ayarları .............................................................. 48
Proje ayarları: Kaynakları devralmak için projeyi değiştirin .................... 48
Genişletilmiş Proje Nitelikleri ..................................................................................... 48
Boş Nitelikleri Dışa Aktar ..............................................................................................49
Formüller ...............................................................................................................................49
Yapı Strüktüründeki Nitelikleri Değiştir ...............................................................49

Zorlu Projelerin Sunumu ........................................................... 50
Pencere araç çubuğunda doğrudan ayarlanabilir perspektif .......... 51
Seçilen görüş yönü ile kesit ekranı .................................................................. 51
NVIDIA grafik kartları için optimize edilmiş RT Gerçek Zamanlı
Render ............................................................................................................................. 52
Diğer Yeni Özellikler ................................................................................................ 53
“Animasyon” görünüm tipinde ton eşleme .......................................................53
Animasyon Görünümü Modunda Blooming ve Lens Efekti ....................53
"Animasyon" görünüm modunda hacimsel sis ...............................................54
"Saklı" ve "eskiz" görünüm modlarında ışık ve gölge ..................................54
"Animasyon" ve "RTRender" görünüm türleri için varsayılan arka plan
olarak fiziksel gökyüzü ..................................................................................................54
Filmleri Sketch, Wire veya Covert Modunda Kaydedin .............................55
"Görselleştir" görevi artık "çevre" rolünde .......................................................55

Görünümleri ve kesitleri hızlı ve kolay bir şekilde
ayarlayın ........................................................................................... 56
Özellikleri Eşleştir...................................................................................................... 57
Görüntülenecek Elemanları Seçin................................................................... 57
Aks Izgarası için Genişletilmiş Seçenekler ................................................. 57
Diğer Yeni Özellikler ................................................................................................ 58
ABD Standart Stili için Yön Sembolü .....................................................................58
Tutamaçlı Kesit Objeleri ................................................................................................58

Allplan 2022'deki Yeni Özellikler

İçindekiler

v

Görünümler/Kesitlerden kesit ................................................................................ 58
Daha iyi Tarama Stili ....................................................................................................... 58

Ölçümlendirmede çeşitli geliştirmeler ................................ 59
Eğrisel Ölçülendirme Güncellendi .................................................................... 60
Açı Ölçülendirmesi Güncellendi......................................................................... 60
Diğer Yeni Özellikler ................................................................................................. 61
Ölçü Yazısını Taşı ................................................................................................................61
İlişkili ölçü çizgileri için ek metin ..................................................................................61
Ölçü metin birimi olarak foot .......................................................................................61

Renk kodlaması sayesinde hataları daha hızlı tespit edin
................................................................................................................ 62
Obje Paleti ..................................................................................................................... 63
Renk Kodlaması için Ek Sütun ...................................................................................63
Seçilen Her Şeyi Sakla....................................................................................................63
"Stil Adı" özelliğine göre filtrele .................................................................................63

Maliyet planlaması için güvenilir temel .............................. 64
OpenBIM Projeleri için Güvenilir İşbirliği ............................. 65
Modelleri İçe Aktarmak için Yeni OBJ Formatı ......................................... 66
SketchUp İçe Aktar, OBJ İçe Aktar ................................................................. 66
SketchUp V2021 İçe Aktarılabilir..............................................................................66

IFC Arayüzü ..................................................................................................................67
IFC İçe Aktarma ve IFC Dışa Aktarma için İyileştirilmiş Arayüz ............. 67
IFC İçe Aktarma ve IFC Dışa Aktarma için Değişim Profilleri .................. 68
Geliştirilmiş Günlük (Log)..............................................................................................69
IFC Nitelikleri ........................................................................................................................69

vi

İçindekiler

Allplan 2022

DWG aracılığıyla CAFM Programları (örn. waveware) ile Veri
Alışverişi ..........................................................................................................................72

Aksiyon çubuğunda yeni rol: Yapım işinin yürütülmesi
............................................................................................................... 73
Yeni: Prekast kirişlerden köprü tasarımı ........................... 74
ALLPLAN'da yeni: Prekast elemanların tasarımı ve
üretimi için çözüm......................................................................... 75
Bimplus'ta çoklu optimizasyonlar ......................................... 76
Allplan Web Servisleri için Tek Oturum Açma ......................................... 76

Dizin ...................................................................................................... 77

Allplan 2022'deki Yeni Özellikler

Allplan 2022 - En iyi şekilde inşa edilebilirlik

Allplan 2022 - En iyi
şekilde inşa edilebilirlik
Sorunsuz bir şekilde entegre edilmiş süreçler aracılığıyla Optimum İnşa Edilebilirlik
Allplan 2022, mimarların, mühendislerin ve müteahhitlerin ilk
tasarımdan şantiyede başarılı uygulamaya kadar tek bir platformda sorunsuz çalışma yöntemini temsil eder. Kat planları,
yükseklikler, kesitler, raporlar, miktarlar veya maliyetler gibi
tüm bilgiler tüm proje ortaklarına açıktır. Sistem değişiklikleri
sırasında içe ve dışa aktarımdan kaynaklanan kalite kayıpları
geçmişte kaldı. Bu, koordinasyon süreçlerini kısaltır, verimliliği
artırır ve katma değeri artırır. Allplan 2022, en iyi şekilde inşa
edilebilirlik için size BIM çalışma şekline uygun olarak sorunsuz
bir şekilde entegre edilmiş bir süreç sunar.

Projenin hemen başında Allplan, arazi modeli ve yol
tasarımı için işlevsellik ile inşaat ortamının kapsamlı bir
şekilde kullanılmasını destekler. Proje süresince optimize
edilmiş modelleme araçları yardımıyla verimliliğinizi ve
hassasiyetinizi artırabilirsiniz. Görselleştirmeler daha
gerçekçi ve daha kaliteli hale geliyor. Beton ve çelik yapı
alanları daha da geliştirilmiştir. Allplan 2022, şantiyede
uygulanmak üzere yeni fonksiyonlar sunar. Aynı zamanda, yeni sürüm birçok alanda optimize edilmiş kullanım
kolaylığı ile etkileyicidir.

1

2

Allplan Kurulumu Önemli Derecede Basitleştirildi

Allplan 2022

Kurulum ve Proje İçe
Aktarımı için
Optimizasyonlar
Artık yeni Windows Installer ile daha da hızlı başlayabilirsiniz. Yeni tasarım ve daha basit bir kullanıcı arayüzü: Daha
hızlı indirme ve kurulum süreci.
Çok sayıda iş istasyonunuz varsa, tüm ayarları kaydedebilir ve ardından kurulumu tamamen otomatik olarak
çalıştırabilirsiniz. Ayrıca, artık herhangi bir kaynaktan projeleri doğrudan proje seçimi iletişim kutusundan içe
aktarabilirsiniz. Allplan Workgroup Manager'ı istediğiniz
zaman etkinleştirebilir veya devre dışı bırakabilirsiniz.

Allplan 2022'deki Yeni Özellikler

Kurulum ve Proje İçe Aktarımı için Optimizasyonlar

3

Allplan Kurulumu Önemli Derecede
Basitleştirildi
Allplan kurulumu önemli ölçüde basitleştirildi. Bir kullanıcı olarak,
kurulum sırasında yaptığınız ayarlar artık program yolu ve veri yolu
tanımlama ve kurulacak seçenekleri belirleme gibi birkaç spesifikasyonla sınırlıdır. Yükseltme kurulumu için, yalnızca mevcut bir Allplan kurulumunu yükseltmek ile yeni veya paralel bir Allplan 2022
kurulumu arasında seçim yapmanız gerekir.
Allplan Teşhis‘i kullanarak diğer tüm ayarları yapabilir ve ayarları, projeleri ve önceki sürümlerden diğer verileri aşağı akış yönünde aktaraProje aç, yeni proje oluştur’dan Projeyi
bilirsiniz veya doğrudan
içe aktar ile yapabilirsiniz.
Workgroup Manager hakkında önemli bilgiler!
Allplan 2022'yi yeniden kurduğunuzda, artık Workgroup Manager ile
mi yoksa onsuz mu kuracağınızı açıkça belirtmeniz gerekmez. Workgroup Manager, 2022 sürümünden itibaren otomatik olarak kurulur.
Allplan'ı bir ağda Workgroup Manager ile çalıştırmak istiyorsanız ve
buna uygun bir lisansınız varsa, Workgroup Manager'ı Allplan Teşhis
(ayarlar sekmesi, çalışma grubu ayarları alanı) aracılığıyla etkinleştirin.
Daha fazla bilgi için, Allplan Yardımında “Allplan Teşhis”e bakın.

4

Allplan Kurulumu Önemli Derecede Basitleştirildi

Allplan 2022

Projeleri önceki sürümlerden de içe aktarın
Yeni tasarlanmış iletişim kutusunda yeni proje aç ile, artık projeleri
veya sıkıştırılmış proje yedeklerini de içe aktarabilirsiniz. Bu şekilde,
desteklenen tüm Allplan sürümlerinden projelere kolayca erişebilirsiniz.

Projeyi içe aktar
Burada herhangi bir yoldan bir veya daha fazla projeyi veya
sıkıştırılmış proje yedeklerini içe aktarabilirsiniz. Proje aynı zamanda
daha önceki, hala desteklenen bir Allplan versiyonundan da olabilir.
Projeleri içe aktar iletişim kutusunda projeleri seçebilir ve mevcut
sürüme aktarabilirsiniz. Kaynak sürüm, sürüm sütununda görüntülenir; proje ilk açtığınızda mevcut sürüme dönüştürülür. Mevcut
Allplan versiyonuna yükselttikten sonra projeleri önceki versiyonlardan yukarı dönüştürmek için bu fonksiyonu kullanabilirsiniz.
İpucu: Yerel projelerin depolandığı yolu Allmenu - Servis- Windows
Gezgini - Benim kendi CAD projelerim (PRJ) aracılığıyla bulabilirsiniz.

Allplan 2022'deki Yeni Özellikler

Allplan 2022: başlangıçtan itibaren kolay kullanım

5

Allplan 2022: başlangıçtan
itibaren kolay kullanım
Allplan'ı kullanmaya başlamayı kolaylaştırmak için araç
ipuçları geliştirildi: fare düğmesiyle bir simgenin üzerine
geldiğinizde, şimdi otomatik olarak işlevin kısa bir açıklaması görüntülenir. Kullanıcı arayüzünü standartlaştırmaya
yönelik geliştirmelere de devam edilmiştir: Örneğin,
açıklıklar ve çelik bağlantı bileşenleri gibi daha fazla nesne
türü için özellik paletleri eklenmiştir. Bulut hizmetlerinin
basitleştirilmiş kullanımı için artık Allplan Connect ve
Bimplus için ortak bir oturum açma var. Diğer bir yeni özellik ise animasyonda seçilen bir nesnenin etrafında
dönme yeteneğidir.

6

Demo projesi “Hello Allplan!”

Allplan 2022

Demo projesi “Hello Allplan!”
HELLO ALLPLAN! - Allplan'a nasıl başlayacağınıza dair hızlı bir
giriş.
Demo projesi “Hello Allplan!” Allplan ile otomatik olarak kurulur.
Örnek bir proje kullanarak Allplan'a başlamanızı kolaylaştırmak,
araçları mevcut elemanlar üzerinde rahatça denemenize
olanak sağlamak için tasarlanmıştır. Hiçbir şey ters gidemez,
çünkü demo projeyi istediğiniz zaman silebilir ve yeniden kurabilirsiniz.
Demo projesi Hello Allplan! projeye uyarlanmış ve sizi modele
dayalı planlama yönteminin çeşitli olasılıklarına götüren videolar. Videolara HELLO ALLPLAN üzerinden ulaşabilirsiniz!
(https://www.allplan.com/hello-allplan/) web sitesi.
“Hello Allplan!” demo projesini burada bulabilirsiniz. ALLPLAN
karşılama iletişim kutusunda Allplan'ı başlattıktan sonra sadece
seç ve başla!

Özellikler Paleti
Modelinizi daha da etkili ve hızlı bir şekilde özelleştirmek için artık
özellikler paletini kullanarak karmaşık pencere ve kapı boşluklarını
değiştirebilirsiniz. Tek tip iş akışları kullanırsınız ve geometrik özelliklerin yanı sıra burada pervaz, parapet, stoper veya pervaz tiplerinin
yanı sıra Shading SmartParts gibi entegre nesneleri de değiştirebilirsiniz.
Ayrıca, istenen açıklıkları etkinleştirerek ve özellikler paletindeki
değişiklikleri girerek özellikler paleti aracılığıyla ilgili tüm pencere veya
kapı boşluklarını tek adımda değiştirebilirsiniz. Sonuç olarak,
etkinleştirilen tüm boşluklar, yapılan değişiklikleri tek adımda alır.

Allplan 2022'deki Yeni Özellikler

Allplan 2022: başlangıçtan itibaren kolay kullanım

7

Boşlukların modifikasyonu
Bir veya daha fazla kapı veya pencere boşluğunu etkinleştirdiğinizde,
özellikler paleti artık kapı veya pencere iletişim kutularında bulunan
tüm parametreleri sunar. Bu, bir veya daha fazla boşluğu tek adımda
hızlı ve kolay bir şekilde değiştirmenize olanak tanır.

Şekil: Modifikasyon için palet özellikleri, bir pencere etkinleştirildi

8

Özellikler Paleti

Allplan 2022

Çakışan Boşluklar
Başlangıçta yalnızca özellikler paletinde sunulan üst/alt kesme
düzlemi seçeneği, üst üste binen boşlukların (pencereler, kapılar,
nişler) nasıl görüntüleneceğini belirlemenizi sağlar.
Seçenek etkinleştirilirse, duvardaki boşluk kesilmeyecek, yalnızca
ana hat olarak görüntülenecektir; duvar kaplaması korunacaktır.
Boşluğu ve boşluk elemanının biçim özelliklerini ayrı ayrı atayabilirsiniz. Bu, kat planında ve paftada çakışan boşlukların doğru bir temsilini
oluşturur.

Şekil: Kesme düzleminin üzerindeki boşlukların gösterimi

Allplan 2022'deki Yeni Özellikler

Allplan 2022: başlangıçtan itibaren kolay kullanım

Gelişmiş Özellikler Paleti
Bazı işlevler için paletler, özellikler paletine entegre edilmiştir. İlgili
işlevler için, özellikler paleti yerine artık daha önce ayarları tanımlamak için görüntülenen ek palet görüntüleniyor.
Ayrıntılı olarak, bunlar aşağıdaki işlevler için paletlerdir:
• Görünüm tipi kutusu (görünüm araç çubuğu)
•

3B görünüm kutusu (görünüm araç çubuğu)

•

çevre (yüzeyler, açık görev alanı)

•

3b mimari elemanlara özel yüzeyler ata (yüzeyler, açık
görev alanı)

•

yüzey ayarla (yüzeyler, açık görev alanı)

•

render (yüzeyler, açık görev alanı)

•

proje için ışık ayarla (yüzeyler, açık görev alanı)

•

ışık elemanı (yüzeyler, açık görev alanı)

•

ışık elemanı ayarla (yüzeyler, açık görev alanı)

•

kamera yolu tanımla (kamera görev alanı)

•

filmi kaydet (kamera görev alanı)

9

10

Katmanlar Paleti

Allplan 2022

Katmanlar Paleti
Artık katmanları katmanlar paletinde alfabetik olarak sıralayabilirsiniz.
Bunu yapmak için liste başlığındaki kısa ad veya uzun ad sütun etiketlerini tıklayın. Sıralama için üç konum vardır. İlk tıklamadan sonra
sıralama A'dan Z'ye yapılır, ikinci tıklamadan sonra Z'den A'ya ve
üçüncü tıklamada varsayılan sıralama geri yüklenir.

Tek bir duvar katmanını etkinleştirin
Çok katmanlı bir bileşenin tek bir katmanını etkinleştirmek için eskiden iki tıklama gerekliydi: İlk tıklama ile tüm bileşeni seçebiliyordunuz,
ikinci bir tıklama ile istediğiniz katmanı seçebiliyordunuz. İki tıklama
arasında yeterli zaman yoksa sistem bunu çift tıklama olarak algılar
ve özellikler iletişim kutusunu açar.
Yeni: Boşluk tuşunu (spacebar) basılı tutarak ve doğrudan istediğiniz
duvar katmanına tıklayarak tek bir tıklamayla duvar katmanlarını ayrı
ayrı seçebilirsiniz. Bu şekilde etkinleştirilen duvar katmanı, özellikler
paletinde hemen seçilir ve düzenlenebilir.

Çatı yüzeyi
Bir
çatı alanı oluştururken, ilgili tüm parametreler artık özellikler
paletinde hemen görüntülenir.
Özellikler paletinde kenar ayarları alanında kenar seçimi eklendi. Çatı
alanını oluştururken, burada hangi çatı kenarının oluşturulduğu konusunda bilgilendirileceksiniz.
Konturu tamamladıktan sonra, kenar numarasını girerek giriş alanında istediğiniz kenarı veya birkaç kenarı (örn. 1-3 veya 1,4) seçebilirsiniz. Mevcut görüntülenen kenarın önceki kenarını veya onu takip
eden kenarı seçmek için ok tuşlarını kullanın.

Allplan 2022'deki Yeni Özellikler

Allplan 2022: başlangıçtan itibaren kolay kullanım

11

Seçenekler
Yeni seçenek ‘bağlantı çizgileri, bölme çizgileri için sabit kalem
ve renk’.
seçenekler – bileşenler ve mimari altında yeni bağlantı çizgileri,
bölme çizgileri için sabit kalem ve renk seçeneğini bulacaksınız. Bu,
bileşenler arasındaki bağlantı ve bölme çizgilerinin nasıl görüntüleneceğini tanımlamanıza olanak tanır.
• Seçenek devre dışıysa (varsayılan), bağlantı ve bölme çizgilerinin
format özellikleri ilgili bölümden alınır.
• Seçenek etkinleştirilirse, bağlantı ve bölme çizgilerinin görüntüleneceği sabit bir kalem ve renk ayarlayabilirsiniz.
Bu seçeneği, ekranı örneğin ülkeye özgü standartlara uyarlamak için
kullanabilirsiniz.
Not: Bu seçenek genel bir Allplan ayarıdır ve global olarak tüm projelere uygulanır.

A: Seçenek devre dışı bırakıldı; bileşen gibi bağlantı ve bölme çizgilerinin kalemi/rengi
B: Seçenek etkinleştirildi; Sabit kalem/renkli bağlantı ve bölme çizgileri

12

Seçenekler

Allplan 2022

Yeni seçenek 'Pafta düzenlemesine görünümler ve kesitlerotomatik güncelleme'.
Model verileri değiştiğinde pafta düzenleyicisine her geçiş yaptığınızda model verilerine referans verilen görünümlerin ve kesitlerin
güncellenip güncellenmeyeceğine karar vermek zorunda kalmamak
için, iletişim kutusu görüntüsünün yerini alan yeni pafta düzenleyicisi
seçenekler – görünüşler altında bulacaksınız.
bölümünü
Temel olarak, tüm görünümler ve kesitler, pafta düzenleyicisine
geçildiğinde her zaman güncellenir. Model verileri, bağlantılı görünümler ve kesitler etkinleştirilmeden değiştirilmişse, görünüm ve kesitlerdeki temsil doğru olmayabilir. Görünümleri ve kesitleri pafta düzenleyiciye göre otomatik olarak güncelle seçeneği etkinleştirilirse, bu
tür görünüm ve kesitlerde gösterim de güncellenecektir. Pafta
düzenleyiciye geçerken, otomatik güncellemeyi ayarlayabileceğiniz
konusunda bilgilendirileceksiniz.
Öte yandan, 'Pafta düzenlemesine görünümler ve kesitlerotomatik güncelleme'seçeneği devre dışı bırakılırsa, model verilerinin
doğru gösterilmediği görünümleri ve kesitleri içeren pafta elemanları,
eski arka plan rengi altında ayarlanan arka plan rengi ile görüntülenecektir.
pafta güncelleme fonksiyonunu kullanarak manuel olarak
bu tür pafta elemanlarını güncelleyebilirsiniz.

Allplan 2022'deki Yeni Özellikler

Allplan 2022: başlangıçtan itibaren kolay kullanım

13

Genişletilmiş Araç İpuçları
Genişletilmiş Araç İpuçları, işlevin kısa bir açıklamasından oluşur;
ayrıca daha fazla bilgi, resim ve/veya kısa açıklayıcı videolara
bağlantılar içerebilirler. Allplan'a başlarken bunları destek için kullanabilirsiniz. Bunları göstermek için, ilgili Araç İpucu zaten gösteriliyorsa
imleci bir simgenin üzerine getirmeye devam edin.

Genişletilmiş Araç İpuçları varsayılan olarak etkindir; Kullanıcı
arayüzünü özelleştir - özelleştirme sekmesine (hızlı erişim araç
çubuğu) sahip Araç İpuçları ile aynı şekilde etkinleştirilir veya devre
dışı bırakılırlar.
Not: Genişletilmiş Araç İpuçları yalnızca aksiyon çubuğu konfigüratörü etkinleştirildiğinde görüntülenir.

14

Çizim dosyasını veya paftayı birkaç çizim dosyasına veya
paftasına kopyalayın

Allplan 2022

Çizim dosyasını veya paftayı birkaç çizim
dosyasına veya paftasına kopyalayın
Artık yapı strüktüründe tek adımda bir çizim dosyasını birkaç çizim
dosyasına kopyalayabilirsiniz; bu, değişkenler oluşturduğunuzda
yardımcı olabilir. Yapı strüktüründe, bir çizim dosyasına sağ tıklayın ve
ardından kısayol menüsünde kopyala seçeneğine tıklayın. Ardından
birkaç boş çizim dosyasını etkinleştirin (örneğin CTRL tuşunu basılı
tutarak), seçime sağ tıklayın ve ardından bağlam menüsünde
yapıştır'a tıklayın: Çizim dosyası panodan tüm etkinleştirilmiş hedef
çizim dosyalarına kopyalanır; çizim dosyası adı korunur. Çizim dosyasının mevcut çizim dosyalarına kopyalanması mümkün değildir.
Pafta elemanları için: Pafta yapısında, bir paftaya sağ tıklayın ve
ardından kısayol menüsünde kopyala öğesine tıklayın. Pafta aktif
olmamalıdır. Ardından birkaç paftayı etkinleştirin, örn. yapı seviyesinde tüm paftalarda (örn. CTRL tuşuna basıldığında), seçime sağ
tıklayın ve ardından bağlam menüsünde yapıştır'a tıklayın: Pafta panodan tüm etkinleştirilmiş paftalara kopyalanır. Çizim dosyasının
aksine, etkinleştirilmiş paftalar da zaten dolu olabilir.
Etkinleştirilmiş paftalarda halihazırda dolu paftalar varsa, bunların da
değiştirilip değiştirilmeyeceğine karar verebilirsiniz. Bu durumda pafta
adını bir seçenek olarak kopyalayabilirsiniz. Yalnızca boş paftaları
etkinleştirdiyseniz, pafta adı da dahil olmak üzere pafta içeriği, başka
bir sorgulama olmaksızın tüm paftalara eklenecektir. Mevcut pafta
adları bununla değiştirilecektir.
Not: Bu seçenek yalnızca yapı strüktüründe veya pafta yapısında
mevcuttur, ancak ProjeRehber'inde mevcut değildir.

Allplan 2022'deki Yeni Özellikler

Allplan 2022: başlangıçtan itibaren kolay kullanım

15

Katman Strüktürünün Yeniden
Düzenlenmesi
Allplan ile sağlanan katman strüktürleri, aşağıdaki yeni katman strüktürleriyle genişletildi: ALLPLAN GENEL ve INFRASTRUCTURE.
ALLPLAN GENEL, katman gruplarını, yüzey elemanlarını, metni,
ölçü çizgisini, görünümleri ve kesitleri, yerleşimi, görselleştirmeyi
ve inşaat katmanı grubunun genel katmanlarını içerir. Şimdiye kadar,
bu katman gruplarını katman yapısı MİMARİSİ altında bulabilirsiniz.
INFRASTRUCTURE katman yapısına genel, geçici, ölçü, astar,
bileşenler, kaplama ve ekipman katman grupları eklendi.

Akıllı Katalog
Akıllı Katalog size kendi malzeme kataloğunuzu oluşturma imkanı
sunar. Bu XML kataloğunu projenizi oluştururken seçebilirsiniz, ancak
daha sonra proje özelliklerinde de (yol ayarları - CAD-TAI proje ataması) atayabilirsiniz. Katalogda toplanan malzeme verileri daha sonra
elemanlarınız için malzeme seçiminde size sunulur.
Akıllı Katalog bazı örnek veriler içerir. Kataloğunuzun kurulumunda bu
örnek verilerin yapısına bağlı değilsiniz. Malzeme verilerinizin türü ve
sayısının yanı sıra hiyerarşiyi seçmekte özgürsünüz. Akıllı Kataloğunuza veri eklediyseniz, bunlar kaydedildikten sonra ofis varsayılan klasörü ...\STD\XML Katalog Verileri'nde depolanacaktır.
Kataloğu düzenleme çağrısı şu anda Allmenu - servis - akıllı katalog
üzerinden yapılıyor.

16

Birden çok pafta için pafta çerçevesi ve başlık bloğu

Allplan 2022

Birden çok pafta için pafta çerçevesi ve
başlık bloğu
Plan yapısının bağlam menüsündeki başlık bloğu ata girişini kullanarak, artık tek adımda tüm seçili paftalara bir plan çerçevesi ve/veya
bir plan lejantı atayabilirsiniz. Bir pafta çerçevesi seçilirse, başlık bloğu
olarak bir etiket stili de kullanabilirsiniz. Pafta açıklaması ve başlık
bloğu için sağa kaydırmayı ve aşağıya kaydırmayı belirtebilirsiniz.
Mesafe seçeneğini etkinleştirmezseniz ve seçilen paftalar için pafta
açıklaması veya başlık bloğu yoksa, 5,0 mm'lik varsayılan değerler
geçerlidir. Aksi takdirde mevcut mesafeler korunacaktır.
Seçili paftalar için önceden bir pafta çerçevesi ve/veya bir pafta
açıklaması veya bir başlık bloğu tanımladıysanız, bunlar burada tanımlanan atamalarla değiştirilecektir.

Geliştirilmiş 3B gezinme
Artık navigasyon (gezinme) modunda daha kolay ve sezgisel olarak
hareket edebilirsiniz, örn. animasyon pencerelerinde. Bu, aşağıdaki
yeni özellikler sayesinde:

Bir elemanın etrafında döndürme
Küre modunda dönerken (farenin sol tuşuna basılıyken), kamera
önceden sahnenin veya modelin ekseni etrafında döndürülüyordu.
Şimdi dönüş ekseninin konumunu aşağıdaki gibi ayarlayabilirsiniz.:
• Modelin dışına tıklarsanız, kamera daha önce olduğu gibi sahnenin
ekseni etrafında, yani tüm model etrafında döndürülür.

Allplan 2022'deki Yeni Özellikler

Allplan 2022: başlangıçtan itibaren kolay kullanım

17

• Modele tıkladığınızda, tıklanan noktada bir koordinat çaprazı
görüntülenir ve kamera bu nokta etrafında döndürülür. Bindirilen
koordinat çaprazının Z ekseni, sahnenin dönüş eksenine karşılık
gelir. Bu, özellikle iç mekanlarda hareket etmeyi kolaylaştırır:
Örneğin, odanın ortasındaki bir masaya tıklayıp kamerayı etrafında döndürebilirsiniz.

Şekil: Tıklanan noktada koordinat çaprazı ile modelin bir noktası etrafında döndürme

Seçenek - navigasyon modunda ters yön
Hareket mod yönünü tersine çevir, varsayılan modda etkindir. Hareket şimdi diğer programlara benzer.
seçenekler - genel
Hareket mod yönünü tersine çevir seçeneğini
– fare ve kursör - fare bölümünde bulabilirsiniz.

18

Diğer yeni özellikler

Allplan 2022

Diğer yeni özellikler
Başlangıç ekranı
Allplan'ı ilk kez başlattığınızda, çalışma alanı
2 + 1 animasyon
penceresi düzenlemesinde açılır. Üst üste yerleştirilmiş görünüm ve
animasyon grafik pencereleri sağda konumlandırılmıştır. Koordinat
sistemi grafik pencerelerinde görüntülenir.

Pencere düzenlemesi için varsayılan yapılandırma şimdi 2 + 1 animasyon
Pencere düzenlemesi için varsayılan konfigürasyon 2+1 animasyon
pencereleri olarak değiştirilmiştir..

Başlık çubuğu
Şimdi
Allplan durum sayfası fonksiyonu Allplan uygulama penceresinin başlık çubuğuna eklendi. Daha fazlası
yardım açılır menüsü,
uzaktan destek işleviyle genişletildi ve mevcut girişler yeniden
düzenlendi.

“Allplan Durum Sayfası” Fonksiyonu
Çalışan sistemlerin durumu hakkında bilgi almak için
Allplan durum
sayfası işlevini kullanabilirsiniz, örn. ALLPLAN Cloud'a bağlıysanız.
Allplan durum sayfası işlevini seçtiğinizde, https://status.allplan.com
web sitesi açılır..
aksiyon çubuğu konfigüratörü‘nde (aksiyon çubuğunun sağında) yeni işlevi daha fazla işlev bölümünde bulabilirsiniz..

“ Uzaktan Destek” Fonksiyonu
yardım simgesinin (Allplan uygulama penceresinin başlık çubuğu)
açılır menüsüne uzaktan destek fonksiyonu eklendi.
Bu fonksiyonu etkinleştirerek, doğrudan Allplan'dan bir uzaktan
erişim yazılımını (örn. TeamViewer) başlatabilirsiniz.

Allplan 2022'deki Yeni Özellikler

Allplan 2022: başlangıçtan itibaren kolay kullanım

19

“Uzaktan Destek Download” Fonksiyonu
Allplan on web altında ( help simgesinin açılır menüsü), Allplan
uzaktan bakım fonksiyonu, uzaktan indirmeyi desteklemek için yeniden adlandırılmıştır. Çalışma modu aynı kalır: Bir uzaktan bakım programı indirebilirsiniz.

Durum Çubuğu
Allplan uygulama penceresinin durum çubuğu tek bir öğeyle genişletildi: bildirim merkezi.
bildirimler, altında model veya modelleme ile ilgili uyarıları, ipuçlarını veya hataları görebilirsiniz. Bunun amacı, modelinizin oluşturulmasını iyileştirmenize ve kontrol etmenize yardımcı olmaktır. Yeni
bir önemli bilgi olduğunda, aşağıdaki simgeyi göreceksiniz ve ekranın
sağ alt köşesinde kısa bir süre için Bildirim Merkezi mesajı/bildirimi
görüntülenecektir . Durum çubuğunda değiştirilen simgeye
tıklayarak mesajı/notu kalıcı olarak gösterebilirsiniz. Mesajların/talimatların gelecekteki eylemler için otomatik olarak görüntülenmesini istemiyorsanız, proje değişikliğine kadar bastır mesajını
etkinleştirin. Bildirim Merkezi'nde listelenen hatalar düzeltilirse simge
şuna döner: .
Not: Şu anda, Bildirim Merkezi yanlızca strüktürel çerçeveleme elemanlarının konumlandırılmasıyla ilgili bildirimleri yönetir. Diğer alanlar
gelecekte eklenecektir. Mevcut mesajlar gelecekte Bildirim Merkezi'nde de görüntülenecektir.

20

Diğer yeni özellikler

Allplan 2022

Kullanıcı Deneyimi Ekibine Geri Bildirim
Allplan'ı geliştirmek için kullanıcı arayüzü, operasyon veya önerileriniz
hakkında herhangi bir yorumunuz var mı? Artık, Allplan destek aracı
olan hotinfo aracılığıyla Kullanıcı Deneyimi ekibimizle doğrudan iletişime geçebilirsiniz.
Hotinfo'yu başlatın, geri bildirim kullanıcı deneyimini seçin ve programla diyaloğu takip edin.

Çoklu Çizgileri Etiketle
çokluçizgi ötele (seç) ile oluşturulan çoklu çizgilerin bağlam
menüsü şimdi
3B çokluçizgi ötele (seç) ile oluşturulan çoklu çizgilere benzer bir
etiket fonksiyonu sunuyor.

Nişler
Eski binalardaki karmaşık açıklıklar genellikle iki bitişik niş tarafından
modellenir. Bu tür nişlerin ortak alanı artık bitişik odaların bitiş
yüzeyleriyle doldurulmamaktadır.

Allplan 2022'deki Yeni Özellikler

Allplan 2022: başlangıçtan itibaren kolay kullanım

21

Lejantları Kaydet
Bir lejant oluştururken, lejantın kaydedileceği ZLE dosyası çok
büyükse artık ilgili bir mesaj alacaksınız. Alternatif olarak, lejantı başka
bir klasöre kaydedebilirsiniz.

Paftayı değiştir sürüme bağlıdır
Bir klasörden veya ZIP dosyasından bir paftayı başka bir paftayla
değiştirmek için, artık önceki üç sürümün yanı sıra geçerli sürümden
paftaları seçebilirsiniz.

Yeniden adlandırılan paftayı etiketleme işlevi
Bir paftayı etiket stiliyle etiketleme işlevi yeniden adlandırıldı, çünkü
açıklama görev alanındaki adın
etiket işleviyle aynı olması nedeniyle tekrar tekrar yanlış anlamalar ortaya çıktı. Fonksiyon şimdi
etiket paftası sınırı olarak adlandırıldı.

Boş Pafta Pencereleri Korunacak
Pafta penceresini, oluşturduğunuzda ilişkili pafta elemanlarının dışına
ayarlarsanız veya pafta penceresini, ilişkili pafta elemanları pafta
penceresinin dışında olacak şekilde değiştirirseniz, şimdi, bilgileri tutan
boş bir pafta penceresi ile kalacaksınız, dahil edilen pafta elemanları
hakkında; istediğiniz zaman düzenleyebilirsiniz.

22

Diğer yeni özellikler

Allplan 2022

Allplan Share ile daha hızlı
ve daha güvenli işbirliği
Allplan Share ile lokasyonlar arasında çalışmak için çok
sayıda optimizasyon yapılmıştır. Örneğin, veriler bekleme
süresi olmadan arka planda yüklenir. Ek olarak, çizim
dosyalarının ve planların revizyonlarını otomatik olarak
kaydetmek için kullanılabilecek yeni bir yedekleme işlevi
vardır. İnternet yoksa veya kesintiye uğrarsa, bilgisayarınızın önbelleğindeki verilere erişebilir ve çalışmaya
devam edebilirsiniz.

Allplan 2022'deki Yeni Özellikler

Allplan Share ile daha hızlı ve daha güvenli işbirliği

23

Çizim Dosyalarını ve Paftaları Otomatik
Kaydetme
Artık diyalog kutusundaki
ayarlar - proje bazlı aç: dosya
grubu/yapı strüktüründen çizim dosyaları veya proje bazlı aç
paftalar seçeneğinden çizim dosyalarının ve paftaların nasıl otomatik
olarak kaydedileceğini belirleyebilirsiniz. Varsayılan olarak
kaydetmeyi devre dışı bırakabilir ve değişiklik sayısını ayarlayabilirsiniz..
Çizim dosyaları ve paftalar için ayarlar ayrı ayrı yapılır ve birbirinden
bağımsızdır. AutoBackupSettings.xml dosyasındaki ilgili proje
klasörüne kaydedilirler. Çizim dosyalarındaki ve paftalardaki bireysel
değişiklikleri, ilgili proje klasörünün yedekleme klasöründeki ndw ve
pafta alt klasörlerinde bulabilirsiniz.
Not: Projelerde verilerin tekrarını önlemek için, çizim dosyaları ve
paftalar için veri dönüştürme sırasında hiçbir değişiklik oluşturulmaz.

24

Çizim Dosyalarını ve Paftaları Otomatik Kaydetme

Allplan 2022

Allplan ile daha verimli ve
detaylı modelleme
Ayrıntılı ve kesin modeller, BIM projelerinin verimli bir şekilde işlenmesi için önemli bir ön koşuldur. Allplan 2022 ile
bileşenlerin etkileşimi temelden revize edilmiştir. Bir çizim
dosyasındaki kesişim artık öncelikler aracılığıyla tutarlı bir
şekilde kontrol ediliyor. Manuel yeniden işleme artık gerekli değildir. Ortaya çıkan artan model kalitesi, çalışma
çizimleri ve ayrıntılı çizimler oluşturmak için gereken
çabayı azaltır. Çakışmalar önlenir ve metrajlar daha güvenilir bir şekilde belirlenebilir.
Ek olarak, boşlukların ve çatı yüzeylerinin değiştirilmesine
yönelik iş akışları basitleştirildi ve optimize edildi. Korkuluk
işlevi revize edildi, böylece korkuluklar artık spline'lar
boyunca yerleştirilebilir. Bu, yeni uygulama alanları açar,
örn. organik mimari için değil, aynı zamanda köprü korkulukları veya korkuluklar için.

Allplan 2022'deki Yeni Özellikler

Allplan ile daha verimli ve detaylı modelleme

25

Farklı Bileşenlerin Hakimiyet Yoluyla
Kesişimi
Bir parça oluştururken belirttiğiniz Hakimiyet değerleri, yalnızca bir
çizim dosyasındaki aynı tipteki elemanları etkilemekle kalmaz (önceki
gibi), aynı zamanda farklı bileşenlerin birbiriyle kesişimini de kontrol
eder.

Şekil: Bir çizim dosyasındaki farklı bileşenlerin öncelik yoluyla kesişimi

• Bileşenin türü ve yüksekliği ne olursa olsun (yatay, dikey, farklı
yükseklikler) kesişim yapılır.
• Kesişim Hakimiyet özelliğine dayalıdır.
• Hakimiyet niteliği, özellikler paletinde veya nitelikleri değiştir
iletişim kutusunda da ayarlanabilir..
• Kesişimi kat planında da görebilirsiniz (ör. farklı yükseklikler için).
Hakimiyeti daha sonra özellikler paletinde de değiştirebilirsiniz:
Bunun avantajı, bileşenin kesişen tüm elemanlarla kesişiminin
3B
görünümü geri yükle işlemini açıkça gerçekleştirmeye gerek kalmadan hemen yeniden hesaplanmasıdır.
Not: Şimdiye kadar, altta farklı göreli yükseklikler kullanarak iki
bileşenin kesişmesini önleyebiliyordunuz. Bu artık mümkün değil;
lütfen bunun yerine Hakimiyeti kullanın.

26

Bileşenlerin 2B etkileşimini devre dışı bırak

Allplan 2022

Bileşenlerin 2B etkileşimini devre dışı bırak
Özellikler paletinde artık bileşenler veya bileşenlerin tek tek katmanları için yeni 2B etkileşim seçeneğini bulacaksınız. Bu, mimari bileşenlerin kat planındaki diğer bileşenlerle etkileşimini kontrol etmenizi
sağlar, 3B gösterim değişmez.
2B etkileşim seçeneği varsayılan olarak etkindir. Seçeneği devre dışı
bırakırsanız, bileşenler artık 2B kat planında kesişmez. Örneğin bazı 2B
çizgiler gizlenebilir.

Şekil: Kirişin 2B etkileşim seçeneği devre dışı bırakıldı

Allplan 2022'deki Yeni Özellikler

Kendi kodlarınızı yazmak giderek daha kolay hale geliyor

27

Kendi kodlarınızı yazmak
giderek daha kolay hale
geliyor
Visual Scripting alanındaki bir dizi optimizasyon, özel
komut dosyaları oluşturmayı daha da kolay ve hızlı hale
getirir. Örneğin, yeni palet tasarımcısı, parametrelerin
seçici olarak birden çok sekmeye yerleştirilmesine izin
verir. Araç ipuçları geliştirildi ve kaydırıcılar artık destekleniyor. Kolonlar ve kirişler gibi ek bileşenlere erişmek ve
IFC dışa aktarımını kontrol etmek de mümkündür. Ek olarak, eylemler tek bir tıklama ile geri alınabilir veya tekrarlanabilir.

28

Visual Scripting-Görsel Kodlama

Allplan 2022

Visual Scripting-Görsel Kodlama
Görsel bilgi
Palet tasarımcısının alt alanından üst alanına bir parametreyi
sıraladığınızda, artık sürükle ve bırak davranışı hakkında görsel geri
bildirim alırsınız.
Parametreyi yeni grup simgesine veya mevcut bir sekmeye ya da
yeni bir sekmeye sürüklerseniz, bu alanlar renkli bir arka planla
görüntülenecektir. Şimdi parametrenizi yerleştirin, tam olarak seçilen
konuma yerleştirilecektir.
Bir sekmenin son liste girişinden sonra parametreyi boş alana sürüklerseniz, parametrenizi yerleştirebileceğiniz bir yer tutucu (yeni
grup oluşturun) oluşturacaksınız.
Gruplar
daraltıldığında, genişleticilerin görünümü, grubun öğeler
siyah dolu üçgen) veya grubun boş
içerip içermediğini (genişletici =
gri hatlı üçgen) gösterir. Yine boş bir
olup olmadığı (genişletici =
grubu, grup adının italik ve gri renkli görüntülenmesinden de anlayabilirsiniz.
Kod mantığında düğümleri silmek veya eklemek gibi herhangi bir
değişiklik yaptıysanız, Allplan'ın özellikler paletinde bununla ilgili bir not
run görsel komut dosyası
göreceksiniz. Tekrar kodunuzu
uygulama penceresinde çalıştırabileceksiniz. Sonuç olarak, ayarlanan
parametreleri Allplan'ın özellikler paletinde göreceksiniz.

geri al/yine yap
Geri alma ve yineleme işlevleri artık görsel komut dosyası uygulama
penceresinde (araç çubuğu ve düzenleme menüsü) de mevcuttur.
Undo (CTRL+Z): Bir veya daha fazla eylemi geri almanızı sağlar.
Redo (CTRL+Y): Bu, geri alınmış eylemleri geri yüklemenizi sağlar.

Allplan 2022'deki Yeni Özellikler

Kendi kodlarınızı yazmak giderek daha kolay hale geliyor

29

Seri satırını değiştir
Giriş bağlantı noktasında yanlışlıkla bir seri satırının bağlantısını
kestiyseniz, ESC tuşuna tıklayarak bağlantıyı geri yükleyin.
Seri çizgisinin görünümü artık seçim durumunu tanımayı kolaylaştırıyor:
• gri ve dar = normal ve seçilmemiş
• açık gri ve dar = fareyle üzerine gelme
• koyu gri ve geniş = seçili ve içerik menüsü açık

Yinelenen düğüm
Tek bir düğümü çoğalttığınızda (düzenleme menüsü veya CTRL+D),
yalnızca giriş bağlantıları çoğaltılır, çıkış bağlantıları kopyalanmaz.

Akıllı Sembolün Bağlantısını Kaldır
Allplan'da bir görsel komut dosyası nesnesinin kısayol menüsü artık
akıllı sembol bağlantısını kaldır fonksiyonunu sunuyor. PythonPart yer değiştirmenin yapısını çözmek için bu aracı kullanabilirsiniz.
Daha sonra PythonPart kurulumunu oluşturan tasarım varlıklarını ayrı
ayrı değiştirebilirsiniz.

Geri al/Yine yap
Geri alma ve yineleme işlevleri artık görsel komut dosyası uygulama
penceresinde (araç çubuğu ve düzenleme menüsü) de mevcuttur.
Undo (CTRL+Z): Bir veya daha fazla eylemi geri almanızı sağlar.
Redo (CTRL+Y): Bu, geri alınmış eylemleri geri yüklemenizi sağlar.

30

Visual Scripting-Görsel Kodlama

Allplan 2022

Seri Satırını Değiştir
Giriş bağlantı noktasında yanlışlıkla bir seri satırının bağlantısını
kestiyseniz, ESC tuşuna tıklayarak bağlantıyı geri yükleyin.
Seri çizgisinin görünümü artık seçim durumunu tanımayı kolaylaştırıyor:
• gri ve dar = normal ve seçilmemiş
• açık gri ve dar = fareyle üzerine gelme
• koyu gri ve geniş = seçili ve içerik menüsü açık

Yinelenen Düğüm
Tek bir düğümü çoğalttığınızda (düzenleme menüsü veya CTRL+D),
yalnızca giriş bağlantıları çoğaltılır, çıkış bağlantıları kopyalanmaz.

Akıllı Sembolün Bağlantısını Kaldır
Allplan'da bir görsel komut dosyası nesnesinin kısayol menüsü artık
akıllı sembol bağlantısını kaldır fonksiyonunu sunuyor. PythonPart yer değiştirmenin yapısını çözmek için bu aracı kullanabilirsiniz.
Daha sonra PythonPart kurulumunu oluşturan tasarım varlıklarını ayrı
ayrı değiştirebilirsiniz.

Allplan 2022'deki Yeni Özellikler

Kendi kodlarınızı yazmak giderek daha kolay hale geliyor

31

Yeni Hotline Aracı cleanvisgui
Hotfix Allplan 2021-0-6, hotline aracı temizliğini genişletti (Servisler
uygulamasında - servis - hotline araçlarında); ayrıca görsel komut
dosyası gösterimini başlattı. Allplan 2022, bu amaç için cleanvisgui
yardım hattı aracını sağlar: Çalıştırılınca, PypConWpfDlg.vsprofile.xml
ve VisualEditor_WindowLayout.config dosyalarını yeniden oluşturur.
Bu işlevsellik temizlemede atlanmıştır.

32

Visual Scripting-Görsel Kodlama

Allplan 2022

Otomatik Donatılandırma:
Hızlı ve Hassas
Allplan 2021-1 ile sunulan kirişler, kolonlar, duvarlar ve
zımbalama profili donatıları için otomatik donatı birçok
açıdan iyileştirildi. Sonuç olarak, temeldeki PythonParts,
yerleştirmeden sonra bile bozulmadan kalır ve herhangi
bir zamanda parametrik olarak ayarlanabilir.
Yeni bir özellik olarak, kullanıcıya özel çubuk şekilleri
tanımlayabilirsiniz. İlişkili lejantların içeriği, çizim dosyası
filtreleri aracılığıyla hassas bir şekilde kontrol edilir. Bir
başka yükseltilmiş özellik, kesitler ve metin etiketleri dahil
olmak üzere donatıyı kopyalayabilmenizdir. Bu, çok sayıda
benzer donatı durumunu görüntülerken çok zaman kazandırır.

Allplan 2022'deki Yeni Özellikler

Otomatik Donatılandırma: Hızlı ve Hassas

33

Otomatik Donatıyı Doğrudan Seçin
Artık kirişler, kolonlar ve duvarlar için otomatik donatı ve otomatik
zımbalama profili donatısını doğrudan eylem çubuğunda oluşturmak
için PythonParts'ı seçebilirsiniz. Mühendislik yapıları görevinde, yeni
otomatik donatı görev düzlemini bulacaksınız. Alternatif olarak
standart PythonParts otomatik donatı altında kütüphana paletinde açılabilir.

34

Şekil Kodu Yöneticisi

Allplan 2022

Şekil Kodu Yöneticisi
Şimdiye kadar, lejant çubuğu çizelgesinde kullanılan şekil kodları - ACI
sabit kodluydu. Bu şekil kodlarını artık ShapeCodes_ACI.txt metin
dosyasındaki ShapeCodes klasöründeki Etc dizininde bulabilirsiniz. Bu
size mevcut şekil kodlarını değiştirme ve yeni şekil kodları ekleme
imkanı verir.
Değiştirilen şekil kodlarını sadece projede veya ofis standardında
kullanmak istiyorsanız, metin dosyasını ilgili proje klasörünün ShapeCodes klasörüne veya Std dizinine kopyalayın. Güncelleme sırasında
Etc dizinindeki dosyaların üzerine yazıldığını lütfen unutmayın..
Lejant oluşturulurken, ShapeCodes_ACI.txt metin dosyası için arama
proje klasörü, Std dizini ve Etc dizinindeki ShapeCodes klasöründe
gerçekleştirilir. Bu, dosyanın muhtemelen farklı içeriklerle birkaç kez
bulunabileceği, ancak yalnızca tanımlanan önceliğe göre değerlendirildiği anlamına gelir.
Not: Etc dizininin ShapeCodes klasöründe EndPreparations.txt metin
dosyasını da bulacaksınız. Bu dosyada, yeni son işleme kısaltma niteliğini atamak için kullanabileceğiniz tüm girdileri bulacaksınız. Bu
özelliği mühendislik grubunda bulabilirsiniz. Kolların kullanımı ile
bağlantılı olarak kullanılır. Nitelik, manşonlar oluşturulurken ürün kataloğuna bir parametre olarak da eklendi ve buna göre atanabilir. Bu
amaçla, ilgili kılıf üreticisinin Lst klasöründe Abbreviation_Endpreparation.lst dosyası atanmalıdır.

Allplan 2022'deki Yeni Özellikler

Otomatik Donatılandırma: Hızlı ve Hassas

35

Çizim dosyası filtreli lejantlar
Hasır, donatı çubuğu ve vaziyet planı lejandlarında, bu çizim dosyaları
seçilmese bile, seçilen çizim dosyalarının elemanları artık dikkate
alınmaktadır.
Genel lejant ve ısı yalıtımı, peyzaj planlama ve çizim sembolleri lejandı
durumunda ise, seçilen çizim dosyalarının elemanları, sadece çizim
dosyaları aktif veya pasif olarak yüklendiğinde filtrelenmeye devam
eder.

Bağlantılı Taşı
Taşınan görünümler ve kesitler, ilişkili model verileriyle birlikte artık
normal
taşı düzenleme işleviyle, öğelerin birbirine göre konumu
değişmeden kalacak şekilde çalıştığından,
bağlantılı taşı işlevi artık
geçerli değildir.
Ayrıca ilgili model verileriyle birlikte görünümlerin ve kesitlerin
kopyalanması, aynalanması, döndürülmesi, ... artık normal düzenleme
işlevleriyle çalışır.

36

Diğer Yeni Özellikler

Allplan 2022

Diğer Yeni Özellikler
Proje Şablonları
Artık projeleri oluştururken inşaat mühendisliği için iki proje şablonu
da kullanabilirsiniz. Kalıp ve donatının tek bir yapısal seviyede birlikte
oluşturulduğu ve kalıp ve donatının ayrı yapısal seviyelerde oluşturulduğu bir varyantınız var.

Etiketleme Seçenekleri
Donatı etiketleme seçeneklerindeki ayarları yalnızca yöneticiler ve
proje sahipleri kalıcı olarak değiştirebilir. Yönetici haklarına sahip
olmayan kullanıcılar, ayarları yalnızca geçici olarak değiştirebilirler. Bu
aynı zamanda yazı tipini seçmek için de geçerlidir.

Lejant Kırılım Birimi
Lejant içindeki kırılımı tanımlamak için diyalog satırına bir değer
girerseniz, bu şimdi ayarlanan uzunluk birimine girilmelidir.

Tek kod sisteminde kırılımlar
İngiliz ölçü birimleri için mümkün olan en kompakt donatı etiketlemesini elde etmek için kesirler artık Unicode tarzında kullanılmaktadır.

Allplan 2022'deki Yeni Özellikler

Allplan ile çelik konstrüksiyonda daha fazla çeşitlilik

37

Allplan ile çelik
konstrüksiyonda daha
fazla çeşitlilik
Allplan 2022 için strüktürel çerçeveleme objelerine dayalı
olarak cıvatalı ve kaynaklı çelik bağlantıları yeni
geliştirilmiştir. Muazzam çeşitliliğe uyum sağlamak için
yapısal çelik bağlantılar temel elemanlara dayanmaktadır,
örn. sac, gövdeler, cıvatalar veya kaynaklar için. Bunlar
yeni bağlantı araçlarında mevcuttur, ancak Python betikleri ile bağlantılarda birleştirilebilirler. Kodlama dosyalarına tüm kullanıcılar erişebilir ve diğer çelik bağlantılar
için uyarlanabilir, genişletilebilir ve hatta tamamen yeniden tanımlanabilir.
Ayrıca birçok çelik yapının dayandığı aks ızgarası, gösterim ve etiketleme açısından daha da iyileştirildi. Standart
veya ülkeye özel malzeme katalogları Bimplus üzerinden
indirilebilir ve bileşenlere bağlanabilir. Strüktürel
çerçeveleme objeleri durumunda, küme ayracı türü
eklenmiştir. Farklı çizim dosyaları arasında ve Allplan
Workgroup Manager veya Allplan Share kullanırken bile
objeleri otomatik olarak konumlandırabilirsiniz.

38

Çelik Bağlantı Oluşturma

Allplan 2022

Çelik Bağlantı Oluşturma
Strüktürel çerçeveleme objeleri görev alanındaki yeni
bağlantı
araç kutusu fonksiyonuyla doğrudan aksiyon çubuğunda strüktürel
çerçeveleme objeleri ile bağlantılar oluşturmak için PythonPart'ı
açabilirsiniz. Fonksiyona tıklarsanız standart PythonParts destek
yapısı altında kütüphanede bulabileceğiniz PythonParts bağlantı araç
kutusunun giriş paleti açılır.
Bağlantı araç kutusu paletinin iki sekmesinde her bir elemanın parametrelerini ayarlayın, eleman oluştur kısmındaki konumlandırma
alanında onayla butonuna tıklayın ve elemanı istenilen konuma yerleştirin.

Yeni Obje Strüktürel Çerçeveleme Çaprazı
Strüktürel çerçeveleme objeleri görev alanında yeni
strüktürel
çerçeveleme kuvvetlendirici fonksiyonuyla artık kolonlara ve
kirişlere ek olarak çapraz oluşturabilirsiniz. Çapraz parametrelerinin
kapsamı kirişin kapsamına karşılık gelir ve kiriş ile aynı şekilde üretilir.

Allplan 2022'deki Yeni Özellikler

Allplan ile çelik konstrüksiyonda daha fazla çeşitlilik

39

Strüktürel Çerçeveleme Objesi için İşaret
Numaraları
Strüktürel Çerçeveleme Objesi paletlerinde, nitelikler sekmesine
konumlandırma bölümü eklendi. Burada şemanın ifadesini ve
başlangıç numarasının sayısal değerini tanımlarsınız. Strüktürel
konumlandırma
Çerçeveleme Objesi görev alanında yeni
fonksiyonuyla yeni konum numarasını oluşturmak için kullanılır.
Bunu yapmak için, işlevi seçtikten sonra, bir işaret numarası
oluşturmak istediğiniz tüm strüktürel çerçeveleme objelerini seçin ve
seçiminizi onaylamak için çalışma alanına sağ tıklayın.
İşaret numaralarını oluşturmak için, aktif olarak yüklenen çizim
dosyasına ek olarak, aktif olarak arka planda bulunan tüm çizim
dosyaları da dikkate alınır. Aynı şemaya, aynı başlangıç numarasına ve
aynı parametrelere ve niteliklere sahip strüktürel çerçeveleme objeleri aynı işaret numarasını alır.
Not: Şema için herhangi bir ifade belirtilmemişse, hiçbir öğe numarası
üretilmez.
Strüktürel çerçeveleme objelerini değiştirirseniz, bilgi için işaret
numarası görüntülenir. İşaret numarasını strüktürel çerçeveleme
objesinin bir özelliği olarak kullanabilirsiniz, örn. etiketleme için.

40

Strüktürel Çerçeveleme Objesi için İşaret Numaraları

Allplan 2022

Konumlandırma parametreleri hakkında notlar
• Şema için ifadedeki rastgele karakter sayısı "$", işaret numarasındaki sayının en az kaç basamaklı çıktısını belirler. Örneğin,
şema olarak C4$$x ve başlangıç numarası olarak 8 tanımlanmışsa, aşağıdaki işaret numaralarını alırsınız: C408x; C409x;
C410x; ... C499x; C4100x; C4101x;...
• Şema için ifade ve başlangıç numarası için sayısal değer, favoriler
dosyasında saklanır.
• Şema için varsayılan değeri ve/veya başlangıç numarasını manuel olarak, mevcut parametreleri devralarak veya yapısal objeleri oluştururken bir sık kullanılanlar dosyası yükleyerek değiştirirseniz, bunları diğer tüm objeler için veya yalnızca mevcut obje için
kullanabilirsiniz.
• İşaret numarası zaten oluşturulmuşsa ve mevcut parametreleri
devralarak veya bir sık kullanılanlar dosyası yükleyerek şemayı
ve/veya başlangıç numarasını manuel olarak değiştirirseniz,
önceden oluşturulmuş işaret numaraları tekrar silinir ve yeniden
oluşturulmalıdır. Bir not size bunu söyler.

Değişikliklerden sonra konumlandırma kontrolü
Değiştirilen strüktürel objeler için zaten işaret numaraları oluşturduysanız ve değişikliklerin doğru konumlandırma üzerinde bir etkisi varsa,
paleti kapattıktan sonra ekranın sağ alt kısmında yanlış işaret numaralarına sahip objelerin mevcut olduğunu belirten kısa bir mesaj
bildirimler‘e tıklayagörüntülenir. Bu bildirimi durum çubuğundaki
rak gösterebilirsiniz. Gelecekteki değişiklikler için mesajların otomatik
olarak görüntülenmesini istemiyorsanız, proje değişikliğine kadar
mesajı bastır seçeneğini etkinleştirin..
Yanlış konumlandırma düzeltilirse simge buna değişir:
. Bu, yanlış
işaret numaralarına sahip hiçbir obje olmadığını açıkça ortaya koymaktadır.

Allplan 2022'deki Yeni Özellikler

Allplan ile çelik konstrüksiyonda daha fazla çeşitlilik

41

Diğer Yeni Özellikler
Strüktürel çerçeveleme kirişleri için yuvarlak kesit
Strüktürel çerçeveleme kolonları için, şimdi kesit şekli‘nden
seçebilirsiniz.

daire

Eksen(Aks) Izgarası Genişletildi ve İyileştirildi
Eksen ızgarası için artık etiket sekmesinin nitelikler alanına eksen
ızgarası için herhangi bir atama girebilirsiniz; bu, aynı zamanda ızgaranın bir özelliği olarak sık kullanılanlara da kaydedilecektir..
Eksen ızgarasını oluştururken ve değiştirirken, artık ilk eksenden
önce bir eksen de oluşturabilirsiniz. Bunu, çalışma alanındaki konuma
tıklayarak veya paletteki ofsetler için negatif bir başlangıç değeri
girerek sezgisel olarak yapabilirsiniz. Ayrıca, artık ilk ekseni de silebilirsiniz.

42

Diğer Yeni Özellikler

Allplan 2022

Kullanımı kolay ve güçlü:
Arazi modeli ve Yol
tasarımı
Arazi modelleme ve yol tasarımı için işlevsellik tamamen
yeniden geliştirildi ve daha hızlı başlamak için sezgisel bir
kullanıcı arayüzü içeriyor. Ayrıca, nokta listelerinin,
LandXML ve REB dosyalarının içe aktarılmasının yanı sıra
Bimplus'tan yol hizalamalarının aktarımı da desteklenmektedir. Performansı daha da optimize etmek için ilgili
alanlar bir arazi modelinden kesilebilir. Ayrıca arazi modelindeki nokta sayısı azaltılabilir. Arazideki süreksizlikler
kırılma çizgileri ile modellenebilir.
Yol tasarımı, vaziyet planında ve cephede düz çizgilerin,
geçiş eğrilerinin ve yayların parametrik modellemesini
destekler. Eğimler bağımsız olarak oluşturulur. Boyuna ve
enine kesitler önceden tanımlanmış kurallara göre otomatik olarak oluşturulabilir ve yerleştirilebilir.
Su, kanalizasyon, elektrik, internet, doğal gaz veya bölgesel ısıtma gibi yolların altına veya yanına yerleştirilen
yardımcı tesislerin tasarımı da desteklenmektedir. Borular
ve menholler oluşturulur ve boyutlandırılmış ve etiketlenmiş bölümlerde görüntülenir.

Allplan 2022'deki Yeni Özellikler

Kullanımı kolay ve güçlü: Arazi modeli ve Yol tasarımı

43

Yol Tasarımına Giriş
Programın yeni yol planlama kısmına kısa bir giriş yaparak aşağıdaki
gibi açabilirsiniz:
• Başlık çubuğunun sağında,
masına katılmaya tıklayın.

yardım, ve ardından sokak planla-

44

Yol Tasarımına Giriş

Allplan 2022

Nitelik yönetimi için
değerli yenilikler
BIM projeleri için merkezi önemi nedeniyle, Allplan ve
Bimplus ile nitelik yönetimi sürekli olarak geliştirilmektedir. Örneğin, Allplan ve Bimplus arasındaki etkileşimin performansı iyileştirildi.
Nitelikler için formül düzenleyici artık Python programlama dilini ve yanlış formülleri algılamak için bir sözdizimi
denetimini destekliyor. Niteliklerin uzunluğu üzerinde artık
herhangi bir kısıtlama yoktur.
Özellik paleti de optimize edilmiştir: Nitelikler artık IFC
uyumlu PSet Commons'ın yanı sıra standarda özel ve
kullanıcıya özel niteliklerde gruplandırılmıştır. Bu durumda,
ilgili IFC PSet, IFC obje tipi atanarak otomatik olarak etkinleştirilir. Ek olarak, artık bina yapısında IFC PS'leri atamak
mümkündür.

Allplan 2022'deki Yeni Özellikler

Nitelik yönetimi için değerli yenilikler

45

Yeni Formül Düzenleyici
Yeni
formül düzenleyici kıcı bir kullanıcı arayüzü, daha iyi genel
bakış, daha hızlı nitelik seçimi ile formülleri ve formül niteliklerini
tanımlamanıza yardımcı olur ve sözdizimi tutarsızlıkları hakkında daha
iyi geri bildirim sağlar.
Yeni nitelikleri tanımlarken, yeni nitelik tanımla iletişim kutusunda,
formüllerin mümkün olduğu bir veri türü seçin (tarih hariç tümü).
Kontrol olarak formülü seçin; ardından formül düzenleyiciyi açtığınız
simge görüntülenir: .

formül düzenleyici aşağıdaki parçalardan oluşur:
Nitelik
Tüm nitelikleri alfabetik sırayla listeler. Bir niteliğe tıklarsanız, genişletilmiş nitelik adına ve dahili numaraya sahip bir araç ipucu görüntülenir; niteliği düz adıyla giriş alanına aktarmak için çift tıklayın.
Fonksiyon
Kullanılabilir aritmetik işlevleri listeler. Bir fonksiyona tıklarsanız, genişletilmiş ada sahip bir araç ipucu görüntülenir; işlevi kutuya aktarmak için çift tıklayın.

46

Yeni Formül Düzenleyici

Allplan 2022

Operatör
Olası işlemleri listeler. Bir operatöre tıklarsanız, genişletilmiş ada sahip
bir araç ipucu görüntülenir; operatörü kutuya aktarmak için çift
tıklayın.
Kutuya sayıları, hesaplamaları ve iç içe parantezleri girmek için klavyeyi kullanın.
Kutu, formül
Kutu, seçili nitelikleri açık metin, işlevler ve operatörleri görüntüler.
Klavye girişlerini buradan da yapabilirsiniz; girilen karakter dizisiyle
eşleşen nitelikler listelenir ve bir tıklama ile giriş alanına aktarılır.
Aşağıdaki formül satırı, yukarıda seçilen nitelikleri dahili numaraları,
işlevleri ve işleçleriyle birlikte görüntüler. Formüller 2048 karaktere
kadar olabilir.
Formül hesaplanamazsa, giriş alanının solunda
simgesi belirecektir. Simgeye tıklamak, imleci hatanın önüne getirir ve düzeltebilirsimgesi görüntülenecektir.
siniz. Formül doğruysa

Allplan 2022'deki Yeni Özellikler

Nitelik yönetimi için değerli yenilikler

47

Özellikler paleti aracılığıyla niteliklerin
kaldırılması
Özellikler paletindeki kısayol menüsünde artık bir veya daha fazla
bileşenden nitelikleri kaldırabilirsiniz: Bunu yapmak için bileşen(ler)i
seçin ve kaldırmak istediğiniz niteliğe sağ tıklayın. Niteliği bileşenlerden kaldıran yeniden taşıma girişi kısayol menüsünde yenidir.

48

Diğer Yeni Özellikler

Allplan 2022

Diğer Yeni Özellikler
Proje ayarları: Nitelikler için yol ayarları
Önceki sürümlerde, nitelik grupları, nitelikler için yol ayarlarından
bağımsız olarak her zaman ofis varsayılanında depolanırdı. Artık proje
yolu ayarı yalnızca nitelikler için değil, aynı zamanda nitelik grupları için
de geçerlidir.

Proje ayarları: Kaynakları devralmak için projeyi değiştirin
Proje kaynaklarının devralınacağı projeyi değiştirmek istiyorsanız in
yeni proje, proje aç... yolu projeye ayarlanmış mevcut bir projede
açın, daha sonra proje kaynaklarının aktarılacağı projeyi değiştirmek
istiyorsanız, önce projeden ofise değiştirmeniz ve ardından notu ve
iletişim kutusunu onaylamanız gerekir.
Bu, proje kaynaklarını ofis varsayılanına sıfırlar; yapılan tüm değişikliklerin üzerine yazılacaktır.
Ardından projeye geri dönün ve projeyi seçmek için

kullanın.

Genişletilmiş Proje Nitelikleri
Coğrafi referans için nitelikler
Proje özellikleri - nitelikler bölümünde, artık coğrafi referans
grubundaki aşağıdaki nitelikleri seçebilir ve bunlara değer atayabilirsiniz.:
• Koordinat referans sistemi adı
• Arazi noktaları doğuya doğru
• Arazi noktaları kuzeye doğru
• Arazi noktaları yüksekliği
• Arazi noktaları dönüş açıları

Allplan 2022'deki Yeni Özellikler

Nitelik yönetimi için değerli yenilikler

49

Boş Nitelikleri Dışa Aktar
Bir objeye atanan ancak girişi olmayan ("boş" nitelikler) nitelikler
metraj verisini dışa aktar ile aktarılmaz.Boş nitelikler
nitelikleri dışa aktar ile dikkate alınır.

Formüller
Formüller artık en fazla 2048 karakterden oluşabilir.

Yapı Strüktüründeki Nitelikleri Değiştir
Yapı strüktürünün kısayol menüsündeki nitelikleri değiştir ile artık
yapı seviyeleri site, bina, bina ve kata nitelikler atayabilir veya mevcut
olanları değiştirebilir veya hatta yenilerini atayabilirsiniz.

50

Diğer Yeni Özellikler

Allplan 2022

Zorlu Projelerin Sunumu
Allplan'ın entegre görselleştirme yetenekleri uzun
zamandır göz kamaştırıcıydı. Allplan 2022 sürümü için,
grafik motoru, daha iyi performans ve ikna edici görselleştirmeler için modern grafik kartlarının özelliklerini daha
da iyi kullanabilmeniz için revize edilmiştir.
Özellikle NVIDIA® grafik kartları için Vulkan™ teknolojisi
burada önemli avantajlar sunar: NVIDIA® OptiX™ Denoiser, gerçek zamanlı renderlardan gelen görüntü parazitini
daha da hızlı azaltmak için yapay zeka kullanır. Bu, yüksek
kaliteli görüntüler elde etme süresini önemli ölçüde
kısaltır. Ayrıca, hacimsel sis, bloom ve mercek parlaması
dahil olmak üzere Vulkan™ teknolojisi kullanılarak yeni
efektler mevcuttur.
Önemli! Bu seçenekler yalnızca grafik kartınız donanım hızlandırma
için Vul-kan™ teknolojisini destekliyorsa kullanılabilir (ilgili grafik
penceresinin başlık çubuğundaki kırmızı nokta ile tanınır). Bu genellikle
yalnızca daha yeni NVIDIA® grafik kartlarında geçerlidir.

Allplan 2022'deki Yeni Özellikler

Zorlu Projelerin Sunumu

51

Pencere araç çubuğunda doğrudan
ayarlanabilir perspektif
Artık doğrudan pencere araç çubuğundan paralel ve merkezi projeksiyon arasında geçiş yapabilirsiniz. Bu amaçla yeni
3b görünüm
(perspektif) fonksiyonu pencere araç çubuğuna eklenmiştir.
Şimdiye kadar (yine aynı pencere araç çubuğundaki)
fonksiyonuyla yapılıyordu.

3b görünüm

Not: As long as the
3b görünüm (perspektif) aktif olduğu sürece
standart projeksiyonları seçebilirsiniz, ancak model her zaman merkezi projeksiyonda görüntülenir. Bu, projeksiyon simgesinde kırmızı
( perspective fonksiyonu
işaretin olmamasıyla gösterilir.
baskın).

Seçilen görüş yönü ile kesit ekranı
Yapınızı bir mimari bölümde görüntülerken, artık pencere araç
çubuğundaki bölüm görüntüleme liste kutusunda istediğiniz kesit
atamasını seçtiğinizde pencerede ayarlanan görüş yönünü koruma
kesitin görüş yönü ile
seçeneğine sahipsiniz. Bunu yapmak için
temsili simgenin dışında istenen bölüm tanımına tıklayın.
Eğer liste kutusunda
kesitin görüş yönü ile temsili ikonuna tıklarsanız, girişi seçin ve ardından kesit çizgisini tıklayın veya görünüm
menüsü aracılığıyla kesit görüntüsünü oluşturun, model verileri seçilen bölümün görüş yönü ile görüntülenmeye devam edecektir.

52

NVIDIA grafik kartları için optimize edilmiş RT Render

Allplan 2022

NVIDIA grafik kartları için optimize edilmiş
RT Gerçek Zamanlı Render
NVIDIA® grafik kartıyla donatılmış iş istasyonları için NVIDI-A® OptiX™ gürültü filtresi yeni görselleştirme olanakları sunar. Gürültü
azaltma işlemi, NVIDIA® GPU'nun yeteneklerinden en iyi şekilde
yararlanarak, mümkün olan en kısa sürede sofistike, yüksek
çözünürlüklü görsellerin elde edilmesini sağlar.
Gürültü filtresi, RTRender görünüm türünde kullanıldığı gibi
RT_Render oluşturma işlemi için aşağı akış sonrası işlem olarak mevcuttur. Bunu yapmak için, gürültü azaltma filtresi altındaki işlem
sonrası ayarlar alanında RT_Render oluşturma yöntemi için görünüm
tipi paletinde NVIDIA OptiX girişini seçin..
Önemli! Bu seçenek yalnızca iş istasyonunuzda Vulkan™ teknolojisini
destekleyen bir NVIDIA® grafik kartı varsa kullanılabilir (ilgili grafik
penceresinin başlık çubuğundaki kırmızı noktadan tanınabilir).

Allplan 2022'deki Yeni Özellikler

Zorlu Projelerin Sunumu

53

Diğer Yeni Özellikler
“Animasyon” görünüm tipinde ton eşleme
Dinamik aralığı (dinamik sıkıştırma) azaltarak aşırı pozlanmış alanları
yeniden ayarlamak için "ton eşleme" artık animasyon görünüm türünde veya RT_Render oluşturma yöntemini kullanan tüm kullanıcı
tanımlı görünüm türlerinde de mevcuttur..

Animasyon Görünümü Modunda Blooming ve Lens Efekti
Phong gölgeleme türünü kullanmanız koşuluyla, animasyon
görünüm türü (veya gölgeli oluşturma yöntemine dayanan kendi
kendine tanımlı görünüm türleri), modelinizin ekran görüntüsünü optimize etmek için size iki yeni yol daha sunar: Bloom ve lens efekti.
Her iki ayar da gölgeli işleme yönteminin görünüm tipi paletinden
seçilir..
Blooming açıldığında, güneş veya nokta şeklindeki ışık kaynakları gibi
ışık kaynaklarının etrafına ek bir ışık halkası yerleştirilir. Bu nedenle ön
çevre (seç) aracılığıyla arka plan olarak fiziksel gökyüzünün
koşul
seçilmesi veya
proje için ışık ayarla (seç) aracılığıyla bir veya daha
fazla yapay ışık kaynağının ayarlanmış olmasıdır.
Mercek efekti açıldığında, görüntüde ek dairesel ışık yansımaları (bir
ışık kaynağının kamera merceğindeki yansımasına benzer) serpiştirilir.
Önemli! Her iki efekt de yalnızca iş istasyonunuzda Vulkan™ teknolojisini destekleyen bir grafik kartı varsa (ilgili grafik penceresinin başlık
çubuğundaki kırmızı noktadan tanınabilir) ekranınızda görüntülenebilir. Oluşturmalarda, her iki etki de genellikle dikkate alınmaz..

54

Diğer Yeni Özellikler

Allplan 2022

"Animasyon" görünüm modunda hacimsel sis
Önceden sis
seçenekler (masaüstü ortamı - animasyon sekmesi) ile yapılıyordu. Bu seçenek şimdi
çevre (görselleştirme
görevi, yüzeyler, ışık görev alanı) içinde bulunuyor. Çok daha ayrıntılı
varyasyon seçenekleri artık burada mevcuttur.
Ayrıca, animasyon görünüm türünde (gölgeli oluşturma yöntemi)
Phong gölgeleme türü kullanılıyorsa, sis hacimsel sis olarak görüntülenir. Bu, mevcut sahnenin diğer gölgeleme türleri veya işlemeleri
için geçerli değildir! Bu amaçla homojen bir sis gösterimi halen
kullanılmaktadır..
Önemli! Sis, yalnızca iş istasyonunuz Vulkan™ teknolojisini
destekleyen bir grafik kartına sahipse (ilgili grafik penceresinin başlık
çubuğundaki kırmızı noktadan tanınabilir) ekranınızda hacimsel olarak
görüntülenebilir.

"Saklı" ve "eskiz" görünüm modlarında ışık ve gölge
çevre aracılığıyla tanımlanan güneşin konumu, saklı ve eskiz
görünüm türlerinde aydınlatma durumu için kullanılabilir. Ortaya çıkan
gölge sonucu da görüntülenebilir.
Her iki ayar da ilgili işleme yönteminin saklı çizgi hesaplama veya
eskizin görünüm tipi paletinden seçilir.

"Animasyon" ve "RTRender" görünüm türleri için varsayılan arka plan
olarak fiziksel gökyüzü
Önceden tanımlanmış görünüm türleri animasyon ve RTRender için,
grafik penceresindeki varsayılan arka plan artık fiziksel gökyüzüne
(önceden renkli) ayarlanmıştır.
Bu ayarlar
çevre (görselleştirme görevi, yüzeyler, ışık görev
alanı) ile değiştirilebilir.

Allplan 2022'deki Yeni Özellikler

Zorlu Projelerin Sunumu

55

Filmleri Sketch, Wire veya Covert Modunda Kaydedin
Eğer filmlerinizi
kamera yolu tanımla veya
filmi kaydet ile
yapacaksanız, artık aynı adı taşıyan görünüm türlerinden aşina
olduğunuz eskiz, wire ve saklı oluşturma yöntemlerini de kullanabilirsiniz.
İlişkili ön tanımlı görünüm tipinde (kullanıcı tanımlı bir görünüm tipinde
değil) ilgili işleme yöntemi için seçilen ayarlar otomatik olarak parametre olarak kullanılır (Allplan Yardım'da “görünüm tipi paleti”ne
bakın).

"Görselleştir" görevi artık "çevre" rolünde
Görselleştirme görevi artık çevre rolüne dahil edilmiştir.

56

Diğer Yeni Özellikler

Allplan 2022

Görünümleri ve kesitleri
hızlı ve kolay bir şekilde
ayarlayın
Allplan 2022 ile görünümler ve kesitler daha da optimize
edilmiştir. Örneğin, özellikler artık özellikler paleti, bağlam
menüsü veya sihirbazlar aracılığıyla kolayca aktarılabilir.
Objelerin görünürlüğü ve temsili, çizim dosyası ve katman
filtrelerinin yanı sıra açık seçim ve seçimi kaldırma
kullanılarak tam olarak kontrol edilebilir. Görünür alan tutamaçlarla hızlı ve kolay bir şekilde ayarlanabilir.

Allplan 2022'deki Yeni Özellikler

Görünümleri ve kesitleri hızlı ve kolay bir şekilde ayarlayın

57

Özellikleri Eşleştir
Görünümler ve kesitler oluştururken kısayol menüsünden
eşleştir‘e tıklayarak artık mevcut görünüm ve kesitlerin özelliklerini çalışma alanında veya sihirbazda eşleştirebilirsiniz. Seçilen
görünümün/kesitin referans çizim dosyaları benimsenmedi.
Ayrıca palet kenarlığında bulunan bir görünüm veya kesiti oluştururken veya değiştirirken
özellikleri eşleştir seçeneğine tıklayarak
parametrelerini uygulayabilirsiniz.

Görüntülenecek Elemanları Seçin
Görünümleri ve kesitleri oluştururken ve değiştirirken, görüntülemek
için hangi elemanların dikkate alınacağını artık doğrudan seçebilirsiniz.
Bunu yapmak için filtre alanına gidin, ardından giriş yapın ve ardından
ayar seçimini seçin; ardından görüntülenmesini istediğiniz öğeleri
seçebilirsiniz. Onaylamak için çalışma alanına sağ tıklayın.
Lütfen giriş seçeneği için seçtiğiniz ayara bağlı olarak buton veya
eleman ekle/kaldır fonksiyonu ile elemanların seçilmesinin farklı
görünümlerle sonuçlanacağını unutmayınız. Giriş için tüm ayarı vurgu
renginde gösterilen elemanları göstermezken, seçim ayarı yalnızca
bu elemanları görüntüler. Tüm ayarlardan seçim ayarına veya tam
eleman ekle/kaldır butonu veya işlevi
tersine geçiş yaptığınızda
kullanılarak yapılan seçim sıfırlanır.
“

Aks Izgarası için Genişletilmiş Seçenekler
aks ızgarası işlevini kullanarak oluşturduğunuz bir aks ızgarası için
aks etiketinin konumunu tanımlarken, artık giriş seçeneklerinde ızgara çizgilerinin başlangıç noktası için bir ofset tanımlayabilir ve isteğe
bağlı olarak çift taraflı bir etiket oluşturabilirsiniz.

58

Diğer Yeni Özellikler

Allplan 2022

Diğer Yeni Özellikler
ABD Standart Stili için Yön Sembolü
ABD standart stilini seçerseniz, yön sembolünün kenar seçimi
genişletilmiştir. Artık yön sembolünü bakış yönü yönünde ve kesit
her iki tarafında da oluşturabilirsiniz.
nesnesinin

Tutamaçlı Kesit Objeleri
Artık doğrudan obje değişikliğini kullanarak kesitte gösterilen kırpma yolunu sezgisel olarak düzenleyebilirsiniz. Üzerine tıklayarak
seçtikten sonra, kesit objesi üzerinde olağan tutamaçlar ve diyaloglar
sunulur.

Görünümler/Kesitlerden kesit
Mevcut bir görünümden/kesitten bir kesit oluştururken, üst seviye
ve alt seviye için giriş kutuları artık her zaman gizlidir. Bu, gerekirse z
yönündeki bölümler için yüksekliği daha sonra ayarlamanız gerektiği
anlamına gelir.

Daha iyi Tarama Stili
Coğrafi referanslı model verileri genellikle döndürülmüş biçimde bulunur. Bunun bölümleri z yönünde oluşturulur ve yatay olarak döndürülürse, tarama artık doğru şekilde görüntüleniyor.

Allplan 2022'deki Yeni Özellikler

Ölçümlendirmede çeşitli geliştirmeler

Ölçümlendirmede çeşitli
geliştirmeler
Allplan 2022 ile açıların, yarıçapların ve yayların ilişkisel
boyutlandırılması da artık mümkün. Ayrıca, mevcut
boyutların uyarlanması optimize edilmiştir. Ayrıca, ek
metinler mümkündür ve yükseklik ölçülendirmesi döndürülebilir.

59

60

Eğrisel Ölçülendirme Güncellendi

Allplan 2022

Eğrisel Ölçülendirme Güncellendi
Eğrisel ölçülendirme güncellendi ve doğrusal ölçülendirmeye
uyarlandı:
• İlişkilendirme seçeneği artık eğrisel ölçülendirmesi için de
mevcuttur.
• Dairesel ve eğri duvarların ilişkisel ölçülendirmesi, duvar ekseni
açıkken artık mümkündür.
• Parametre seçimi birleştirildi; Bunun için düz ölçü çizgilerinden
bilinen diyalog kutusunu göreceksiniz. Tüm parametreler artık
eğrisel ölçülendirme ile de kullanılabilir.
• Bir eğrisel ölçümlendirmesi oluşturduğunuzda, bir önizleme olarak
görüntülenir.
• Eğrisel ölçümlendirme artık doğrusal ölçümlendirme gibi işleniyor.
• Pencere yüksekliği, korkuluk yüksekliği ve odalar tanımlanır ve
ölçü çizgisine göre eşleştirilir.
• Ölçü çizgisi parametreleri özellikler paletinde listelenir ve burada
değiştirilebilir.
• Tüm eğrisel ölçümlendirme çizgilerine eğrisel ölçümlendirme adı
verilir (örneğin, özellikler paletinde, objeler paletinde veya eleman
bilgilerinde).

Açı Ölçülendirmesi Güncellendi
Açı ölçülendirmesi güncellendi
• İlişkilendirme seçeneği artık açı ölçülendirmesi için de mevcuttur.
• Parametre seçimi birleştirildi: Düz ölçü çizgilerinden bilinen tüm
parametreler artık açı ölçülendirme için de kullanılabilir.

Allplan 2022'deki Yeni Özellikler

Ölçümlendirmede çeşitli geliştirmeler

61

Diğer Yeni Özellikler
Ölçü Yazısını Taşı
ölçü yazısını taşı, komutunda artık yeni bir serbest düğme var:
Bu düğmeye basılırsa, ölçü metnini herhangi bir yere yerleştirebilirsiniz. Daha önce bunu yapabilmek için paralel ve dikey butonlarını
aynı anda devre dışı bırakmanız gerekiyordu.

İlişkili ölçü çizgileri için ek metin
Artık mevcut ilişkisel ölçü çizgileri için ek metin girebilirsiniz.
Ölçü çizgisini seçin. Özellikler paletinde boyut çizgisinin parametrelerini görebilirsiniz. Ek metin eklemek istediğiniz bölümü seçin, ek metni
görüntüle seçeneğini seçin ve istediğiniz metni ek metin olarak girin.

Ölçü metin birimi olarak foot
Başka bir emperyal ölçü birimi olarak, artık boyutlandırmayı feet olarak ayarlayabilirsiniz. Ölçü metninin çıktısı, ondalık noktadan sonra 4
basamaklı veya 2 sıfırlı bir ondalık sayı olarak yapılır.

62

Diğer Yeni Özellikler

Allplan 2022

Renk kodlaması
sayesinde hataları daha
hızlı tespit edin
Allplan 2022'den itibaren objeler, obje paleti aracılığıyla
hızlı bir şekilde filtrelenebilmekle kalmıyor, aynı zamanda
renk kodlu olarak da görüntülenebiliyor. Bu, bileşen özelliklerinin net bir şekilde görüntülenmesini ve bir bakışta
kontrol edilmesini sağlar. Atanmamış veya yanlış atanmış
nitelikler böylece hızlı bir şekilde tanınabilir.

Allplan 2022'deki Yeni Özellikler

Renk kodlaması sayesinde hataları daha hızlı tespit edin

63

Obje Paleti
Renk Kodlaması için Ek Sütun
Modelin kontrolünü daha da geliştirmek için, obje paletinin başlığındaki tüm objeler için bir renk seçebilirsiniz. Bir açılır alanı kullanarak 256
Allplan standart rengi arasından seçim yapabilirsiniz. Açma/kapama
simgesiyle rengi devre dışı bırakabilir ve yeniden etkinleştirebilirsiniz.
Not: Bu ayar yalnızca animasyon görünümü türünü etkiler.
seçenek‘lerde donanım hızlandırma - masaüstü ortamındaki
grafik alanı - görüntüleme sayfasında tüm görünüm pencereleri için
donanım hızlandırmayı kullan seçeneğinin seçili olduğundan emin olun.
İlgili grup için rengi ayarlayabilirsiniz. Tek tek objeler, üst veya alt obje
grubuyla aynı renge sahiptir (örn. boşluklar ve/veya korkuluk,
pencere, kapı aralığı, vb.).
Bir obje grubu içindeki alt gruplar (örneğin boşluklar ) farklı renklere
sahipse (örneğin eşik, pencere, kapı açıklığı vb.), üst grupta karışık
renk seçimi için bir simge belirir.
Renk kodlamasını ve şeffaflığı birleştirebilirsiniz. İşlemler şeffaflık ve
görünürlük ile benzerdir.

Seçilen Her Şeyi Sakla
Şimdi object paletinin üst kısmına, yeni
seçilen her şeyi sakla
butonu eklendi.
Bu, panonuzda seçili olan tüm elemanları görünmez olarak ayarlamanıza olanak tanır.

"Stil Adı" özelliğine göre filtrele
Artık objeler niteliğe göre sıralanmış komutundan objeleri
(duvarları) stil adı niteliği ile filtreleyebilirsiniz. Ön koşul, sıralanacak
niteliğin birinci düzey olarak belirtilmesidir. Bu, stil adı niteliğini
(mimari genel nitelik grubu) seçebileceğiniz nitelik seçimi iletişim
kutusunu açar..

64

Obje Paleti

Allplan 2022

Maliyet planlaması için
güvenilir temel
İzlenebilir metrajların belirlenmesi, tasarım sürecinde önemli bir görevdir. Allplan 2022 ile sadece modelde bulunan miktarlar (örn. metreküp beton) değerlendirilemez.
Modellenmemiş metrajların (örn. kalıp alanının metrekaresi) çıktısı da alınabilir. Bu, maliyet planlaması için güvenilir
bir temel sağlar.

Allplan 2022'deki Yeni Özellikler

OpenBIM Projeleri için Güvenilir İşbirliği

65

OpenBIM Projeleri için
Güvenilir İşbirliği
Sorunsuz veri alışverişi ALLPLAN için en önemli önceliktir.
Allplan 2022 ve Allplan Bridge, yeni IFC 4.3 standardını da
destekler. Bu, özellikle köprüler, yollar, demiryolları ve su
yolları gibi altyapı yapıları için genişletilmiştir. Geliştirilmiş
veya yeni eklenenler, hem geometrik hem de görsel özelliklere sahip verileri aktarabilen SketchUp (*.skp) ve
Wavefront (*.obj) veri aktarımıdır. Bu, çeşitli içerik objelerinin yanı sıra lazer taramalarını (ör. Zephyr veya RealityCapture) içe aktarmanıza olanak tanır. Ek olarak, artık
donatı verilerini manşonlarla dışa aktarabilirsiniz.

66

Modelleri İçe Aktarmak için Yeni OBJ Formatı

Allplan 2022

Modelleri İçe Aktarmak için Yeni OBJ
Formatı
OBJ verisini içe aktar ile artık OBJ dosyaları olarak mevcut olan
yüksek kaliteli modelleri Allplan'a aktarabilirsiniz. Bundan, Allplan objeleri oluşturulur. Malzemeler varsa, bunlar da içe aktarılır ve UV koordinatları ile doğrudan modele yerleştirilir.
OBJ verileri aracılığıyla nokta bulutu tabanlı ölçme sistemleriyle (ör.
Zephyr, Reality Capture) veri alışverişi yapabilirsiniz.

SketchUp İçe Aktar, OBJ İçe Aktar
Allplan'da bir objeye yalnızca bir malzeme atayabilirsiniz. Bir SKP
veya OBJ dosyası, birkaç malzeme veya yüzeyin atandığı bir obje
içeriyorsa, bu obje içe aktarma sırasında malzemeye bağlı olarak
birkaç objeye bölünür; aynı malzemeye sahip alt objeler tekrar
birleştirilir. Bu, objeyi Allplan'da doğru şekilde görüntüleyecektir.
Diğerlerinin yanı sıra aşağıdaki malzeme özellikleri benimsenmiştir:
Renk, renk kanallı doku ve şeffaflık.
3B model, oluşturma sırasında tanımlanan koordinatlarla belgeye
yerleştirilir..
Yüzeyler ve dokular projede \design\SKP-Import\model adı veya
\design\OBJ-Import\model adı altında kaydedilir. Aynı yüzeyler
bulunursa, bir mesaj alacaksınız. Mevcut yüzeyleri değiştirebilir veya
tutabilirsiniz.

SketchUp V2021 İçe Aktarılabilir
Artık içe aktarmalar için SketchUp sürüm 2021 verilerini de kullanabilirsiniz.

Allplan 2022'deki Yeni Özellikler

OpenBIM Projeleri için Güvenilir İşbirliği

67

IFC Arayüzü
IFC İçe Aktarma ve IFC Dışa Aktarma için İyileştirilmiş Arayüz
IFC verisi içe aktar ve
IFC verisi dışa aktar arayüzleri
geliştirildi. Aktarım sırasında dosya toplama ve ayar seçenekleri için
iletişim kutuları birleştirildi ve basitleştirildi.
Ayarları zaten belirlediyseniz veya bir değişim favorisi kullanıyorsanız,
hedef için yol ve dosya adını belirtmeniz yeterlidir - yapılır. Daha
ayrıntılı olarak dışa veya içe aktarmayı belirtmek istiyorsanız, ayarlara tıklayın; ardından iletişim kutusu genişleyecek ve önceki gibi
sekmelerdeki seçenekleri belirleyebilirsiniz..

68

IFC Arayüzü

Allplan 2022

IFC İçe Aktarma ve IFC Dışa Aktarma için Değişim Profilleri
IFC dışa aktarma için ek değişim profilleri geliştirildi.
Artık dışa aktarma için aşağıdaki değişim profillerini
kullanabilirsiniz:
• IFC2x3 Coordination View 2.0
• IFC2x3 Standard Export
• IFC4 Reference View
• IFC4 Standard Export
• IFC4.3 Standard Export
• Autodesk Revit
• G&W California IFC2x3
• G&W California IFC4
• Orca IFC2x3
• Orca IFC4
Daha önce olduğu gibi, içe aktarma için aşağıdaki değişim
profillerini kullanabilirsiniz:
• Autodesk Revit
• G&W California
Değişim profili hakkında daha fazla bilgi görüntülemek için bilgi...
düğmesine tıklayın.

Allplan 2022'deki Yeni Özellikler

OpenBIM Projeleri için Güvenilir İşbirliği

69

Geliştirilmiş Günlük (Log)
Veri aktarımı tamamlandıktan sonra bir günlük alacaksınız; sonunda,
yok sayılan elemanlar (örneğin geometrisi olmayan objeler) türe göre
sıralanarak listelenir. Daha iyi bir genel bakış için, ayrı kategoriler artık
daraltılmış olarak görüntüleniyor.

IFC Nitelikleri
Yeni değişim profili IFC4 referans görünümü ve planlanan sertifikasyon için Allplan'da çeşitli ayarlamalar ve eklemeler yapıldı.

Yapı strüktüründeki düğümler için IFC özellikleri
Artık yapı strüktüründeki (binalar gibi) tüm düğümlere nitelikler
atayabilirsiniz, örn. adresleri değerlendirmek için:
• Bölüm
• Adres (sokak, ev numarası, adres son eki)
• Posta kutusu
• Şehir
• Bölge
• Posta kodu
• Ülke
Bu nitelikler, IFC verilerini dışa aktardığınızda dahil edilecektir.

70

IFC Arayüzü

Allplan 2022

Varsayılan olarak IFC obje tipine sahip 3B objeler
Belirli 3B objeler artık varsayılan olarak IFC obje türü niteliği ile
oluşturulur ve tanımsız bir nitelik değeri atanır.
• 3B Çizgi
• Küboid (piramit), küre, silindir
• Kullanıcı tanımlı mimari eleman, dönüştürülmüş kullanıcı tanımlı
mimari eleman

Diğer IFC obje türleri
Yeni değişim profili IFC4 referans görünümü ve planlanan sertifikasyon için Allplan'da çeşitli ayarlamalar ve eklemeler yapıldı.

Tüm duvarın uzunluğu
IFC belgelerine göre, IfcWall tipi bir duvarın uzunluğu (poligonal veya
değişen kalınlık), duvar yolundan farklı olsa bile, duvarın merkez hattı
boyunca duvarın nominal uzunluğunun tamamı olmalıdır. Tam bir
duvarın IFC dışa aktarımı için aşağıdaki değişiklikler sonuçlanır:
• Bir Allplan length @220@ toplam duvar şimdi IFC'ye göre hesaplanmaktadır.
• Bir thickness @221@ toplam duvar şimdi tek tek katmanların
kalınlığının toplamı olarak hesaplanır.
• length_absolute @198@ ve thickness_absolute @199@ toplam
duvarda, eksen yönünde x-y yönündeki maksimum uzama şimdi
hesaplanır.

IfcMaterialLayerSet
'IfcMaterialLayerSet' artık parçalara atanabilir ve doğrudan bir ad
verilebilir; şimdi bunun için 'referans' özelliği kullanılıyor. Bir parçaya
veya bir parçanın ilk katmanına 'kod metni' niteliğini atama yolu artık
gerekli değildir.

Allplan 2022'deki Yeni Özellikler

OpenBIM Projeleri için Güvenilir İşbirliği

71

Pencere ve kapı SmartParts için IfcType
Artık, pencere SmartParts yanı sıra kapı veya kapı SmartParts
oluştururken ayarlar sekmesinde IfcType'ı atayabilirsiniz. Varsayılan
seçeneği belirlerseniz, algılanan IfcType otomatik olarak seçilecek ve
görüntülenecektir. Kullanıcı tanımlı seçenek, istediğiniz IfcType'ı
seçmenize ve atamanıza olanak tanır.

Kolonların geometri özellikleri
IFC standardına uymak için, kolonların geometri nitelikleri IFC dışa
aktarma sırasında yeniden adlandırılır:
• Yükseklik (@222@) uzunluk olur
• Uzunluk (@220@) genişlik olur
• Kalınlık (@221@) derinlik olur

72

DWG aracılığıyla CAFM Programları ile Veri Alışverişi

Allplan 2022

DWG aracılığıyla CAFM Programları (örn.
waveware) ile Veri Alışverişi
Allplan 2021'den beri, temel noktayı bir odaya yerleştirmek için bir
oda damgası kullanılabilir. Odalar (damgalar dahil) waveware gibi
CAFM programlarında tanınır.
Waveware ile veri alışverişi için artık odanın tanımını, işlevini ve zemin
alanını (ölçü birimi m2 olmadan) değerlendiren yeni etiketleme ekranı
oda damgası FM'yi kullanabilirsiniz. Oda damgası FM'yi belirli etiket
stili altında bulabilirsiniz - standart dizin - dosya 1 oda damgası.
Not: Baz noktasının oda içindeki oda damgası ile yerleştirilebilmesi için
lütfen önce aşağıdaki kayıt anahtarını ayarlayın:
Computer\HKEY_CURRENT_USER\Software\Nemetschek\Allplan\2022.
0\Settings\ODX Data yolunu seçin, gerekirse UseRoomReferencePoint girişini oluşturun ve bunun için sıfır olmayan bir değer girin.
Ayrıntılar, "Odaları DWG olarak CAFM programı waveware'e aktarın"
altındaki Tüm plan yardımında bulunabilir.

Allplan 2022'deki Yeni Özellikler

Aksiyon çubuğunda yeni rol: Yapım işinin yürütülmesi

73

Aksiyon çubuğunda yeni
rol: Yapım işinin
yürütülmesi
BIM ve dijitalleştirme, planlama süreciyle sınırlı değildir, aynı zamanda
inşaatta giderek daha önemli bir rol oynamaktadır. Buna göre, planlama ve prefabrikasyon sırasında inşaat sürecine zaten daha fazla önem verilmektedir. Allplan 2022 bu eğilimi desteklemektedir. Özellikle
şantiyelerin planlanması için vinçler ve beton pompaları gibi yeni nesneler dahil edilmiştir.

74

DWG aracılığıyla CAFM Programları ile Veri Alışverişi

Allplan 2022

Yeni: Prekast kirişlerden
köprü tasarımı
Allplan Bridge 2022 ile parametrik modelleme
seçenekleri bir kez daha önemli ölçüde genişletildi. Özel bir
odak noktası, prekast kirişli köprülerin tasarımıdır. Demiryolu köprülerinin tasarımı için bloss eğrileri de desteklenir.
2021-1 versiyonundan bu yana Allplan Bridge'de yerleştirilebilen PythonParts, şimdi parametrik donatılandırma ve
fikstürler dahil olmak üzere Allplan Bridge'de ayrıntılı olarak gösteriliyor. Eurocode'a ek olarak artık Amerikan
AASHTO LRFD standardına göre kod bazlı tasarım ve
kontroller yapılabilmektedir.
Geliştirilmiş kullanılabilirlik için, geri alma ve yineleme
işlevleri artık baştan sona mümkün.

Allplan 2022'deki Yeni Özellikler

ALLPLAN'da yeni: Prekast elemanların tasarımı ve üretimi için çözüm

75

ALLPLAN'da yeni:
Prekast elemanların
tasarımı ve üretimi için
çözüm
Daha önce bağımsız olan Nemetschek markası PRECAST
SOFTWARE ENGINEERING entegrasyonu, ALLPLAN
portföyüne prekast elemanların tasarımı ve üretimi için bir
çözüm ekledi. Planbar zaten Allplan platformuna
dayandığından, bu müşteriler için yeni olanaklar sunuyor:
Mimarlar, mühendisler ve inşaat şirketleri BIM modellerini
MES ve ERP sistemlerine bağlantı dahil olmak üzere
tamamen dijital olarak endüstriyel üretime aktarabilir. Ek
olarak, prekast tesisleri tasarımcıların mevcut BIM modellerini geliştirebilir ve bunları doğrudan üretim sürecine
entegre edebilir.
İlk adımda, Allplan lisanslama sistemi artık Planbar için de
mevcuttur. Daha sonraki adımlarda, iki ürünün birleştirilmesi için çalışmalar yapılacaktır. Müşteriler, yeni openBIM
arayüzü IFC4precast veya kesitler, boyut çizgileri ve etiketleme ile otomatik olarak oluşturulan eleman planları
gibi prefabrike özel geliştirmelerden halihazırda yararlanmaktadır.

76

Allplan Web Servisleri için Tek Oturum Açma

Allplan 2022

Bimplus'ta çoklu
optimizasyonlar
Disiplinlerarası işbirliği için açık BIM platformu Bimplus,
örneğin büyük modellerin yüklenmesini hızlandıran,
ölçümü basitleştiren ve belge yönetimini optimize eden
çeşitli iyileştirmeler sunar.
Ek olarak, belgeler ve bağlantılar artık Konu ve Slayt Gösterisi Yöneticisine eklenebilir ve Konu Yöneticisindeki özellikler özelleştirilebilir. Son olarak, seçilen objelerin IFC
formatında dışa aktarılması artık mümkün.

Allplan Web Servisleri için Tek Oturum
Açma
Oturum açma, Allplan web hizmetleri için birleştirildi: Bir web hizmetinde oturum açtığınızda, kayıtlı olduğunuz diğer tüm web hizmetlerinde otomatik olarak oturum açmış olursunuz (şu anda hala
Allplan exchange hariç):
- Allplan Connect
- Allplan Bimplus
- Allplan Share
- Allplan Shop
- Allplan Campus

Allplan 2022'deki Yeni Özellikler

Dizin

77

Dizin
3
3B gezinme 16

A
ABD Standart Stili için Yön
Sembolü 58
Açı Ölçülendirmesi 60
Akıllı Katalog 15
Allplan Durum Sayfası 18
Araç İpuçları 13

B
Bağlantılı Taşı 35
Başlangıç ekranı 18
Başlık bloğu 16
Başlık çubuğu 18
Bileşen kesişimi 2B 26
Bir elemanın etrafında döndürme
16
Blooming 53
Boşlukların çakışması 8
Boşlukların modifikasyonu 7

C
CAFM Programları ile Veri
Alışverişi 72
Çakışan Boşluklar 8
Çatı yüzeyi 10
Çelik Bağlantılar 38
Çizim dosyaları ve paftalar için
yedekleme 23
Çizim dosyası filtreli lejantlar 35
Çizim dosyası kopyala 14
cleanvisgui 31
Çoklu Çizgileri Etiketle 20

D
Demo projesi 6
Durum Çubuğu 19
Duvar katmanını etkinleştirin 10

E
Eğrisel Ölçülendirme 60
Eksen Izgarası 41

F
Filmleri kaydet 55
Fiziksel gökyüzü 54
Formül Düzenleyici 45, 49

G
Genişletilmiş Araç İpuçları 13
Gezinme 16
Bir elemanın etrafında
döndürme 16
Navigasyon modunda ters yön
17
Gezinme modu 16
Görünümler ve kesitler 56
Aks Izgarası için Seçenekler
58
Görüntülenecek Elemanlar 57
Özellikleri eşleştir 57
Tarama Stili 58
Görünümler/Kesitlerden kesit
58
Görüş yönü ile kesit ekranı 51

H
Hacimsel sis 54
Hakimiyet 25
Hakimiyet üzerinden bileşen
kesişimi 25
Hello Allplan 6
Hotline Aracı cleanvisgui 31

I
IFC Arayüzü 67
Değişim Profilleri 68
Geliştirilmiş Günlük 69
IFC Nitelikleri 69

78

Dizin
İlişkili ölçü çizgileri için ek metin 61
Isik, Gölge 54

K
Katman Strüktürü 15
Katman Strüktürünün Yeniden
Düzenlenmesi 15
Katmanlar Paleti 10
Konumlandırma 39
Kullanıcı Geri Bildirimi 20
Kurulum 3

L
Lejant Kırılım Birimi 36
Lejantları Kaydet 21
Lens Efekti 53

M
Mühendislik proje şablonları 36

N
Nişler 20
Nitelikleri Değiştir 49
Nitelikleri Dışa Aktar 49
Niteliklerin kaldırılması 47

O
OBJ verisini içe aktar 66
Obje Paleti 63
Renk Kodlaması 63
Seçilen Her Şeyi Sakla 63
Ölçü metin birimi olarak foot 61
Ölçü Yazısını Taşı 61
Otomatik donatı seçimi 33
Özellikler Paleti 6, 9

P
Pafta çerçevesi 16
Pafta çerçevesini etiketleyin 21
Pafta kopyala 14
Pafta Pencereleri 21
Paftayı değiştir 21
Perspektif 51
Proje ayarları 48
Proje Nitelikleri 48
Projeden içeri aktar 4
Projeleri içeri aktar 4

Allplan 2022

R
RT Gerçek Zamanlı Render 52

S
Seçenekler 11, 36
Şekil Kodu Yöneticisi 34
SketchUp İçe Aktar 66
Strüktürel çerçeveleme kirişleri
için kesit 41

T
Tek kod sisteminde kırılımlar 36
Tek Oturum Açma 76
Ton eşleme 53
Tutamaçlı Kesit Objeleri 58

U
Uzaktan Destek 18
Uzaktan Destek Download 19

V
Visual Scripting 28, 29, 30

Y
Yapısal Payanda 38
Yol Tasarımına 43

