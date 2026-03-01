# Enterprise Teşhis Rehberi: Ağ Bağlantı Hataları (Decision Tree)

Bu makale, standart bir çözüm metni yerine AI asistanınızın kullanıcıyı adım adım yönlendirmesi için tasarlanmış bir **Karar Ağacı** formundadır.

## Başlangıç Sorusu: "Ağ hatası veya proje kilitlenmesi mi yaşıyorsunuz?"

---

### **ADIM 1: Yerel mi, Sunucu mu?**
- **Soru:** Sorun sadece sizin bilgisayarınızda mı, yoksa tüm ofis genelinde mi?
  - **A: Sadece bende:** -> **GİT: ADIM 2**
  - **B: Tüm ofis genelinde:** -> **GİT: ADIM 3**

### **ADIM 2: Yerel Ayarların Sıfırlanması**
- **Teşhis:** Muhtemel `netmanager.xml` bozulması.
- **Eylem:** 
  1. Allplan'ı kapatın.
  2. `%AppData%\Allplan\...\netmanager.xml` dosyasını silin.
  3. Allplan'ı yeniden açın.
- **Sonuç:** Düzeldi mi? 
  - **Evet:** Sorun çözüldü. (Etiket: #LocalConfig)
  - **Hayır:** -> **GİT: ADIM 4**

### **ADIM 3: Sunucu ve SQL Kontrolü**
- **Teşhis:** Merkezi SQL server veya Lisans Sunucusu arızası.
- **Eylem:** 
  1. IT departmanına SQL servisinin çalışıp çalışmadığını sorun.
  2. Sunucu üzerindeki Firewall'un 1433 portunu bloke etmediğinden emin olun.
- **Sonuç:** Hala devam ediyorsa -> **GİT: ADIM 5**

### **ADIM 4: VPN ve Ağ Gecikmesi**
- **Soru:** Ofis dışından VPN ile mi bağlanıyorsunuz?
  - **Evet:** Ping değerinizi ölçün. >100ms ise Workgroup Manager stabil çalışmaz. **Allplan Share** önerilir.
  - **Hayır:** Lisans anahtarınızı kontrol edin.

### **ADIM 5: Proje Kilidi (lock.lok)**
- **Eylem:** Proje klasöründeki her türlü `.lok` uzantılı dosyayı temizleyin.

---
**AI Entegrasyon Notu:** AI asistanı bu ağacı kullanarak kullanıcıya sırayla sorular sormalıdır.
