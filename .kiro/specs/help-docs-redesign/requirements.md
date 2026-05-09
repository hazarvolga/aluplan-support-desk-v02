# Gereksinimler Belgesi

## Giriş

Bu özellik, Aluplan Destek platformunun mevcut yardım sayfasını (`/help`) Dify docs benzeri kapsamlı, navigasyonlu ve çok bölümlü bir dokümantasyon sistemine dönüştürmeyi hedefler. Mevcut 4 bölümlük basit sekme yapısı yerine; sol sidebar navigasyon, rol bazlı içerik ağaçları, tüm platform fonksiyonalitelerini kapsayan ayrıntılı açıklama sayfaları ve düzgün yapılandırılmış i18n key'leri içeren modern bir dokümantasyon deneyimi sunulacaktır.

Aynı zamanda mevcut `page.tsx` dosyasındaki hatalı i18n key referansları (gereksiz `.guide` nesting, typo'lar, duplicate render satırları) düzeltilecektir.

## Sözlük

- **Help_Page**: `/help` rotasındaki dokümantasyon sayfası bileşeni
- **Sidebar**: Sol taraftaki kategori ve alt başlık navigasyon paneli
- **Doc_Section**: Sidebar'da seçilen bir konuya karşılık gelen içerik alanı
- **i18n_Key**: `next-intl` kütüphanesi ile yönetilen çeviri anahtarı (`en.json` / `tr.json`)
- **Role_Guard**: Kullanıcının `admin`, `agent` veya `customer` rolüne göre içerik filtreleme mekanizması
- **Customer_Tree**: Müşteri rolüne özel dokümantasyon navigasyon ağacı
- **Admin_Tree**: Admin ve Agent rollerine özel dokümantasyon navigasyon ağacı
- **Doc_Node**: Sidebar'daki tıklanabilir bir navigasyon öğesi (kategori veya alt başlık)
- **Content_Panel**: Seçili Doc_Node'a karşılık gelen sağ taraftaki içerik alanı
- **Accordion**: Uzun içerikleri daraltılabilir/genişletilebilir bölümler halinde gösteren UI bileşeni
- **Tip_Box**: İpucu veya uyarı içeren vurgulu bilgi kutusu
- **Code_Block**: Teknik komut veya yol bilgisi gösteren biçimlendirilmiş metin alanı
- **Breadcrumb**: Kullanıcının dokümantasyon içindeki konumunu gösteren üst navigasyon izi
- **Active_Section**: Sidebar'da o an seçili olan Doc_Node

---

## Gereksinimler

### Gereksinim 1: i18n Key Yapısının Düzeltilmesi

**Kullanıcı Hikayesi:** Bir geliştirici olarak, i18n key'lerinin tutarlı ve hatasız olmasını istiyorum; böylece çeviri eksikliği veya yanlış key referansı nedeniyle UI'da boş/hatalı metin görünmez.

#### Kabul Kriterleri

1. THE `en.json` ve `tr.json` dosyaları, `help.admin_guide.guide.*` altındaki tüm key'leri `help.admin_guide.*` olarak yeniden yapılandırmalıdır (gereksiz `.guide` nesting kaldırılmalıdır).
2. WHEN `page.tsx` dosyası `t('admin_guide.guide.section1.title')` gibi bir key çağırırsa, THE `Help_Page` bileşeni boş string veya hata yerine doğru çeviriyi render etmelidir.
3. THE `en.json` ve `tr.json` dosyaları, `card2_item22` typo'sunu `card2_item2` olarak, `item2_desc3` typo'sunu `item2_desc` olarak, `card2_desc4` typo'sunu `card2_desc` olarak düzeltmelidir.
4. THE `Help_Page` bileşeni, `card1_item1_label` ve `card1_item1_desc` key'lerini yalnızca bir kez render etmelidir (duplicate `<li>` satırları kaldırılmalıdır).
5. THE `Help_Page` bileşeni, `item1_way1_label`, `item1_way2_label`, `item1_way3_label` key'lerini yalnızca bir kez render etmelidir.
6. THE `Help_Page` bileşeni, `card1_rule_label` ve `card1_rule_desc` key'lerini yalnızca bir kez render etmelidir.
7. WHEN bir i18n key `en.json`'da tanımlıysa, THE aynı key `tr.json`'da da tanımlı olmalıdır (key simetrisi korunmalıdır).

---

### Gereksinim 2: Sol Sidebar Navigasyon Yapısı

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, dokümantasyon içinde hızlıca gezinebilmek istiyorum; böylece aradığım konuya doğrudan ulaşabilirim.

#### Kabul Kriterleri

1. THE `Help_Page` bileşeni, sol tarafta sabit konumlu bir `Sidebar` paneli render etmelidir.
2. THE `Sidebar`, kategorileri ve her kategorinin altındaki alt başlıkları hiyerarşik olarak listelemelidir.
3. WHEN bir `Doc_Node`'a tıklanırsa, THE `Content_Panel` ilgili içeriği göstermeli ve `Sidebar`'da o node `Active_Section` olarak işaretlenmelidir.
4. THE `Sidebar`, `Customer_Tree` ve `Admin_Tree` olmak üzere iki ayrı navigasyon ağacını desteklemelidir.
5. WHERE kullanıcı `customer` rolündeyse, THE `Sidebar` yalnızca `Customer_Tree`'yi göstermelidir.
6. WHERE kullanıcı `admin` veya `agent` rolündeyse, THE `Sidebar` hem `Customer_Tree`'yi hem de `Admin_Tree`'yi göstermelidir.
7. THE `Sidebar` genişliği, mobil görünümde (`< 768px`) gizlenebilir olmalı ve bir toggle butonu ile açılıp kapatılabilmelidir.
8. WHEN sayfa ilk yüklendiğinde, THE `Help_Page` bileşeni kullanıcının rolüne göre varsayılan `Active_Section`'ı otomatik olarak seçmelidir.

---

### Gereksinim 3: Müşteri Dokümantasyon Ağacı (Customer_Tree)

**Kullanıcı Hikayesi:** Bir müşteri olarak, platformun tüm özelliklerini nasıl kullanacağımı adım adım öğrenmek istiyorum; böylece destek ekibine başvurmadan sorunlarımı çözebilirim.

#### Kabul Kriterleri

1. THE `Customer_Tree`, en az şu kategorileri içermelidir: "Başlarken", "AI Asistanı", "Destek Taleplerim", "Bilgi Bankası", "Profil & Ayarlar".
2. THE `Customer_Tree`'deki her kategori, en az bir alt başlık (`Doc_Node`) içermelidir.
3. WHEN "Başlarken" kategorisi seçildiğinde, THE `Content_Panel` sisteme giriş, dashboard genel bakış ve duyurular konularını açıklamalıdır.
4. WHEN "AI Asistanı" kategorisi seçildiğinde, THE `Content_Panel` AI asistanının nasıl kullanılacağını, RAG mekanizmasını ve etkili soru sorma ipuçlarını içermelidir.
5. WHEN "Destek Taleplerim" kategorisi seçildiğinde, THE `Content_Panel` yeni talep oluşturma adımlarını, dosya eki kurallarını ve talep takibini açıklamalıdır.
6. THE `Content_Panel`, dosya eki kuralları için kabul edilen ve reddedilen dosya türlerini ayrı listeler halinde göstermelidir.
7. THE `Content_Panel`, teknik yollar ve komutlar için `Code_Block` bileşeni kullanmalıdır.
8. THE `Content_Panel`, önemli ipuçları için `Tip_Box` bileşeni kullanmalıdır.

---

### Gereksinim 4: Admin/Agent Dokümantasyon Ağacı (Admin_Tree)

**Kullanıcı Hikayesi:** Bir admin veya agent olarak, platformun tüm yönetim özelliklerini ve iş akışlarını kapsamlı biçimde öğrenmek istiyorum; böylece operasyonları verimli yürütebilirim.

#### Kabul Kriterleri

1. THE `Admin_Tree`, en az şu kategorileri içermelidir: "Destek Talepleri Yönetimi", "AI & Bilgi Havuzu", "CRM & Ürün Yapılandırması", "Ekip & Müşteri Yönetimi", "Duyuru Yönetimi", "Sistem & Ayarlar".
2. THE `Admin_Tree`'deki her kategori, en az bir alt başlık (`Doc_Node`) içermelidir.
3. WHEN "Destek Talepleri Yönetimi" kategorisi seçildiğinde, THE `Content_Panel` bilet havuzu, durum değiştirme, iç notlar, atama ve AI Co-Pilot özelliklerini açıklamalıdır.
4. WHEN "AI & Bilgi Havuzu" kategorisi seçildiğinde, THE `Content_Panel` Knowledge Pool yönetimini (PDF yükleme, web scraper, raw text), öğrenme döngüsünü ve AI onay sürecini açıklamalıdır.
5. WHEN "CRM & Ürün Yapılandırması" kategorisi seçildiğinde, THE `Content_Panel` ürün ve modül yönetimini, taksonomi kurallarını ve anahtar kelime yapılandırmasını açıklamalıdır.
6. WHEN "Ekip & Müşteri Yönetimi" kategorisi seçildiğinde, THE `Content_Panel` müşteri onaylama, ekip oluşturma ve SLA kural yapılandırmasını açıklamalıdır.
7. WHEN "Duyuru Yönetimi" kategorisi seçildiğinde, THE `Content_Panel` şablon hazırlama, duyuru oluşturma, hedef kitle seçimi ve yayınlama adımlarını açıklamalıdır.
8. WHEN "Sistem & Ayarlar" kategorisi seçildiğinde, THE `Content_Panel` sistem topolojisi, genel ayarlar ve profil yönetimini açıklamalıdır.

---

### Gereksinim 5: Tüm Platform Fonksiyonalitelerinin Kapsanması

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, platformdaki her sayfanın ne işe yaradığını dokümantasyondan öğrenmek istiyorum; böylece hiçbir özelliği keşfetmeden geçmem.

#### Kabul Kriterleri

1. THE dokümantasyon içeriği, şu sayfaların tamamını kapsamalıdır: Dashboard (`/`), AI Asistanı (`/ai`), Destek Taleplerim (`/my-tickets`), Destek Talepleri - Agent görünümü (`/tickets`), Bilgi Bankası (`/knowledge-base`), Bilgi Havuzu (`/knowledge-pool`), FAQ Yönetimi (`/faq`, `/faq-learning`), KB Onayları (`/kb-approvals`), Müşteri Yönetimi (`/customers`), Ürünler & Modüller (`/products`), Ekip Yönetimi (`/teams`), Duyuru Yönetimi (`/admin/announcements`), Sistem Topolojisi (`/system-topology`), Ayarlar (`/settings`), Profil (`/profile`).
2. THE her sayfa için dokümantasyon, sayfanın amacını, temel işlevlerini ve kullanım adımlarını içermelidir.
3. WHERE bir sayfa yalnızca `admin` veya `agent` rolüne özeldir, THE ilgili `Doc_Node` yalnızca `Admin_Tree`'de görünmelidir.
4. WHERE bir sayfa yalnızca `customer` rolüne özeldir, THE ilgili `Doc_Node` yalnızca `Customer_Tree`'de görünmelidir.
5. THE `Content_Panel`, her sayfa için en az bir `Tip_Box` veya önemli not içermelidir.

---

### Gereksinim 6: İçerik Kalitesi ve Biçimlendirme

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, dokümantasyonun okunması kolay ve görsel olarak tutarlı olmasını istiyorum; böylece bilgiye hızlıca ulaşabilirim.

#### Kabul Kriterleri

1. THE `Content_Panel`, başlık hiyerarşisini (H2 → H3 → H4) tutarlı biçimde kullanmalıdır.
2. THE adım adım süreçler, numaralı liste veya `border-l` timeline bileşeni ile gösterilmelidir.
3. THE teknik terimler ve yollar (`%AppData%\Nemetschek\Allplan` gibi), `Code_Block` veya `<code>` etiketi ile biçimlendirilmelidir.
4. THE `Tip_Box` bileşeni, ipucu (`Tip`), uyarı (`Warning`) ve bilgi (`Info`) olmak üzere en az 3 görsel varyantı desteklemelidir.
5. THE her `Doc_Section` başlığı, ilgili bir Lucide React ikonu ile birlikte gösterilmelidir.
6. WHEN içerik uzunsa (500 kelimeden fazla), THE `Content_Panel` içeriği `Accordion` bileşeni ile bölümlere ayırmalıdır.
7. THE `Content_Panel` üst kısmında, kullanıcının dokümantasyon içindeki konumunu gösteren `Breadcrumb` navigasyonu bulunmalıdır.

---

### Gereksinim 7: i18n Genişletme — Yeni İçerik Key'leri

**Kullanıcı Hikayesi:** Bir geliştirici olarak, tüm yeni dokümantasyon içeriğinin `en.json` ve `tr.json` dosyalarında tanımlı olmasını istiyorum; böylece platform dil değiştirildiğinde tüm içerik doğru dilde görünür.

#### Kabul Kriterleri

1. THE `en.json` ve `tr.json` dosyaları, yeni `Admin_Tree` ve `Customer_Tree` navigasyon başlıkları için i18n key'leri içermelidir.
2. THE `en.json` ve `tr.json` dosyaları, mevcut 4 bölümün ötesinde kapsanan tüm yeni sayfa dokümantasyonları için i18n key'leri içermelidir.
3. WHEN `next-intl` locale `tr` olarak ayarlandığında, THE `Help_Page` tüm içeriği Türkçe olarak render etmelidir.
4. WHEN `next-intl` locale `en` olarak ayarlandığında, THE `Help_Page` tüm içeriği İngilizce olarak render etmelidir.
5. THE yeni i18n key yapısı, `help.docs.customer.*` ve `help.docs.admin.*` namespace'lerini kullanmalıdır.
6. IF bir i18n key `en.json`'da tanımlı ama `tr.json`'da eksikse, THEN THE `Help_Page` İngilizce fallback değerini göstermeli ve konsola uyarı yazmalıdır.

---

### Gereksinim 8: Erişilebilirlik ve Performans

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, dokümantasyon sayfasının hızlı yüklenmesini ve klavye ile erişilebilir olmasını istiyorum; böylece farklı cihaz ve erişim yöntemleriyle kullanabilirim.

#### Kabul Kriterleri

1. THE `Sidebar` navigasyonu, klavye ile (`Tab`, `Enter`, `Arrow` tuşları) gezinilebilir olmalıdır.
2. THE `Sidebar`'daki her `Doc_Node`, uygun `aria-label` ve `aria-current="page"` (aktif durum için) nitelikleri içermelidir.
3. THE `Help_Page`, `next/dynamic` ile lazy loading kullanarak büyük içerik bölümlerini yalnızca seçildiğinde yükleyebilmelidir.
4. THE `Content_Panel` içindeki görseller ve ikonlar, `alt` metni veya `aria-hidden="true"` niteliği içermelidir.
5. WHEN `Sidebar` mobil görünümde kapatılırsa, THE toggle butonunun `aria-expanded` niteliği `false` olarak güncellenmelidir.
6. THE `Help_Page`, Lighthouse erişilebilirlik skoru 90 veya üzerinde olmalıdır.
