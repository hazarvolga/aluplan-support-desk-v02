---
title: "Allplan Bridge: Modeling of Precast Girder Bridges"
category: User_Guides
source: modeling-of-precast-girder-bridges.txt
tags: [Allplan Bridge, Precast, Girder, Tutorial, 3D Template]
---

# A Dedicated Workflow for Precast Girder Bridges 
*(Prekast / Hazır Kirişli Köprü Modellenmesi Eğitim Rehberi)*

Prekast kirişli köprülerin tasarımı (precast girders), altyapının geometrisine ve kirişin eksen üzerindeki konumlandırmasına bağlı olarak şekillenir. Allplan Bridge'deki modelleme süreci "Parametrik 3B Şablonlar" kullanılarak optimize edilir. Bu yolla prefabrike kiriş gibi tekrar eden köprü elemanları sadece bir kez tanımlanır ve ihtiyaç duyulan sayıda mesafeye (açıklık ve akslara) saniyeler içinde kopyalanır.

## İş Akışı Adımları (Step-by-Step Workflow)

Bu 8 adımlı genel iş akışının her biri, ilgili bir eğitim videosuyla (*YouTube*) desteklenmiştir.

### 1. Creating Axes (Aksların Oluşturulması)
Her köprü taslağı önce bir ya da birden fazla eksen tanımlanarak başlar. Mevcut bir saha çalışması eksenini yatay ve düşey profilleriyle *LandXML* formatından direkt içe aktarabilir, veya parametrik olarak kendiniz çizebilirsiniz. 
*🔗 [İzleyin: Creating Axes](https://youtu.be/2uFnK6J2GsU)*

### 2. Defining a Cross-Section (Kesitin Tanımlanması)
Kesit herhangi bir boyutta serbest çizilir. Çizilen boyutların üzerine kalınlık, en gibi bağımlılık formülleri eklenerek tüm kesit **parametrikleşir**. Sonuç olarak kesiti bir altlık/şablon olarak kullanabilir, değişkenlere göre dinamik yapabilirsiniz.
*🔗 [İzleyin: Defining a Cross-Section](https://youtu.be/dwnGswjBZBg)*

### 3. Designing a Template (Şablonun/Kalıbın Tasarlanması)
İskele bacağı, kuyu, temel pabuç veya asıl kirişin kendisi şablona basılır. Bir önceki adımda ürettiğimiz parametrik kesite formüller atayarak (Örn: genişlik kiriş açıklığına göre matematiksel büyüsün denilerek) değişkenler programlanır. Hangi noktanın uzayıp hangi noktanın rijit duracağı öğretilir.
*🔗 [İzleyin: Designing a Template](https://youtu.be/ZRqoMOCb11U)*

### 4. Building a Substructure (Altyapı-İskele Kurgusu)
İskele bacakları (temelli veya temelsiz), köprünün belirlenen iki ana formül aksına (örn. alt tarafı arazi yüzey aksına değen, üst tarafı karayolu asfalt aksına değen) göre hizalanır ve arasına 3B şablon olarak dikilir.
*🔗 [İzleyin: Building a Substructure](https://youtu.be/LBIEi0bhOeQ)*

### 5. Assembling Girders (Kirişlerin Dizilmesi)
Ana köprü gövdesi ve plak geometrisini çıkarma aşaması; profil 2B modelini "Aks" (path) boyunca 3B uzatmak şeklindedir (Extrude). Ana açıklıklara yerleşen şablonlar (kirişler) detay sınırlarına ve donatı sınırlarına *PythonParts* kullanımıyla kolayca evrilir. 
*🔗 [İzleyin: Assembling Girders](https://youtu.be/LFTDg95kvH4)*

### 6. Constructing a Plate (Plak - Döşeme Üretimi)
Prekast kirişler yerine oturduktan sonra üzerini örten tabliye-döşeme kurgulanır. Aks çizgisinin değişkenleri üst platformda referans alınarak döşeme geometrisi tamamlanır.
*🔗 [İzleyin: Constructing a Plate](https://youtu.be/rqv66ghmUpk)*

### 7. Composing the Haunch (Guşe/Boşlukların Tamamlanması)
Prekast kirişler dümdüz, köprü asfalt aksı ise kavisli veya deverli olduğunda, düz parçalar ile kavisli köprü tabliyesi/yolu arasında boşluklar şevler kalır. Bu varyasyonel geometri (girder varyasyon guşesi) "3D Boolean Operations" sayesinde yazılım tarafından algılanarak otomatik doldurulur.
*🔗 [İzleyin: Composing the Haunch](https://youtu.be/oqLafh87vYI)*

### 8. Completing the Bridge Structure (Köprü Yapısının Tamamlanması)
Son aşamada, mesnetler, gergi tendonları (tendons), kiriş diyaframları vb. özel yapı elemanları projeye oturtulur. Parametrik öğeler kolaylıkla mesafeler boyunca dağıtılır.
*🔗 [İzleyin: Completing the Bridge Structure](https://www.youtube.com/watch?v=XHOmBV4js_E)*

---
*Bu rehber sayfadaki tüm ders videoları Aluplan Program Sistemleri / Allplan Turkey YouTube kanalı [Bağlantı](https://www.youtube.com/c/AllplanTurkey) üzerinden izlenebilmektedir. Demo / Destek Formları için mağaza: [aluplanbim.com](https://aluplanbim.com/)*
