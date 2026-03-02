# Gelişmiş Donatı Raporları ve Şekil Kodu (Shape Code) Yönetimi

Problem Özeti: Donatı metraj raporlarında (Bending Schedule) veya pafta lejantlarında büküm şekillerinin (shape codes) eksik/tanımsız çıkması veya modeldeki değişikliklerin listelere otomatik yansımaması.
Belirtiler: Rapor alındığında bazı donatı çubuklarının büküm şemalarının görünmemesi, metraj tablosunda poz numaralarının güncellenmemesi veya ofis standartlarındaki özel büküm tiplerinin sistemde bulunamaması.
Etkilenen Ortam: Allplan Engineering, Raporlar (Reports), Donatı Lejantları (Reinforcement Legends), Şekil Kodu Yöneticisi (Shape Code Manager).
Kök Neden: Özel (serbest form) donatı büküm şekillerinin Allplan kütüphanesine (ShapeCodes metin dosyalarına) tanımlanmamış olması veya paftaya yerleştirilen lejantın "Otomatik Güncelle" (Update automatically) ayarının kapalı kalması.
Adım Adım Çözüm:
Eksik Şekil Kodlarını Ekleme: Standart dışı şekil kodlarını sisteme tanıtmak için Etc dizinindeki ShapeCodes klasörüne gidin ve kullanılan standardın metin dosyasını (örneğin ShapeCodes_ACI.txt) düzenleyerek yeni şekil kodunuzu ekleyin.
Otomatik Rapor Alma: Aksiyon Çubuğu (Actionbar) üzerinden Donatı (Reinforcement) sekmesine geçin ve Raporlar (Reports) aracını çalıştırın.
Standart (Default) klasöründen Donatı listesi - büküm şemaları (Reinforcement schedule - bending shapes) raporunu seçin.
Modeldeki tüm pozları (mark numbers) dâhil etmek için giriş seçeneklerinden Tümü (All) seçeneğine tıklayın.
Lejant Güncelleme: Pafta üzerine yerleştirilmiş kalıcı bir donatı lejantı kullanıyorsanız, oluşturma sırasında giriş seçeneklerinden Otomatik Güncelle (Update automatically) kutucuğunun işaretli olduğundan emin olun; böylece modelde poz silindiğinde veya eklendiğinde liste anında güncellenir.
Önleyici Tavsiyeler: Değiştirilen veya ofisinize özel olarak yeni oluşturulan şekil kodu metin dosyalarını, her güncellemede silinmemesi için ilgili proje klasörünün ShapeCodes alt klasörüne veya Std (Ofis Standardı) dizinine kopyalayın.
Etiketler: Donatı Raporu, Büküm Şeması, Bending Schedule, Shape Code, Metraj, Reinforcement Legend.