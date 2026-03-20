# Allplan PythonParts ve Visual Scripting ile Otomasyon Rehberi

## Giriş
Allplan'da otomasyon, tekrarlayan görevleri azaltmak, hata payını minimize etmek ve karmaşık geometrileri parametrik olarak yönetmek için iki ana araç sunar: **PythonParts** ve **Visual Scripting**.

## 1. PythonParts Nedir?
PythonParts, Python programlama dilini (Python API) kullanarak oluşturulan akıllı, parametrik nesnelerdir.
*   **Avantajı:** Sınırsız esneklik, karmaşık algoritmalar ve harici kütüphane (numpy, pandas vb.) desteği.
*   **Kullanım Alanı:** Özel donatı çözümleri, karmaşık cephe sistemleri ve şirket bazlı özel kütüphane oluşturma.

## 2. Visual Scripting (V.S.) Nedir?
Allplan içine entegre, düğüm tabanlı (node-based) bir görsel kodlama arayüzüdür.
*   **Avantajı:** Kod yazma gerektirmez, "sürükle-bırak" mantığıyla çalışır, hızlı prototipleme sağlar.
*   **Kullanım Alanı:** Nitelik (attribute) yönetimi, basit parametrik nesne tasarımı ve veri manipülasyonu.

## 3. Otomasyon Nasıl Yapılır? (Adım Adım)

### Yöntem A: Visual Scripting ile Hızlı Çözüm
1.  **Arayüzü Açın:** Allplan'da "Ekstralar" -> "Visual Scripting" menüsünü kullanın.
2.  **Node Seçimi:** Sol panelden ihtiyacınız olan node'ları (örneğin: `Geometry`, `Input`, `Attribute`) çalışma alanına sürükleyin.
3.  **Bağlantı Kurun:** Node'ların giriş ve çıkış noktalarını birbirine bağlayarak akış şemasını oluşturun.
4.  **Çalıştır:** "Play" butonuna basarak sonucun modelde oluşmasını izleyin.

### Yöntem B: Python API ile Profesyonel Çözüm
1.  **SDK Hazırlığı:** Allplan kurulum klasöründeki `\Etc\PythonPartsFramework` dizinini inceleyin.
2.  **Script Yazımı:** Bir `.py` dosyası ve parametreleri tanımlayan bir `.pyp` (XML) dosyası oluşturun.
3.  **Allplan Entegrasyonu:** Hazırladığınız dosyaları Kitaplık (Library) altına kopyalayarak Allplan içinden doğrudan çağırın.

## 4. İleri Seviye: Hibrit Kullanım
*   **Özel Node Yazımı:** Visual Scripting içindeki standart node'lar yetmediğinde, Python ile kendi "Custom Node"unuzu yazıp V.S. paletine ekleyebilirsiniz.
*   **Veri Pipe Hattı:** Visual Scripting ile modeldeki verileri toplayıp, PythonParts ile bu verileri kullanarak karmaşık donatı veya geometri üretebilirsiniz.

## Teknik Kaynaklar ve Tavsiyeler
*   **Erişim:** Hazır örnekler için `STD\VisualScripts\` ve `STD\Library\PythonParts\` klasörlerini mutlaka inceleyin.
*   **Dökümantasyon:** [Allplan Python API Documentation](https://pythonapi.allplan.com/) adresini referans alın.

## Etiketler
#PythonParts #VisualScripting #Otomasyon #AllplanAPI #ParametrikTasarım #BIM
