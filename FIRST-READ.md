# FIRST READ — Aluplan Support Desk

> **İnsan ve AI için zorunlu başlangıç belgesi.** Yeni bir Codex/Claude oturumu, hesap değişikliği veya çalışma devri sonrasında başka bir işlem yapmadan önce bu dosyanın tamamını oku.

## Claude son doğrulama kapanış talimatı

> **Uygulama koşulu:** Bu bölüm yalnız kullanıcı Claude'a mevcut bağımsız doğrulama işinin bittiğini ve kapanış kaydını hazırlamasını söylediğinde uygulanır. Normal yeni oturum açılışında kendiliğinden dosya değiştirme veya commit oluşturma talimatı değildir.

Son doğrulama çalışmanı tamamladıktan sonra bu `FIRST-READ.md` dosyasını tamamen oku.

Bu dosya Codex ve Claude için ortak, kanonik yeni-oturum başlangıç belgesidir. Yeni ve çelişebilecek ikinci bir ana durum belgesi oluşturma.

Claude hesabının limiti dolduğunda kullanıcının başka Claude hesabına geçebilmesi için:

1. `FIRST-READ.md` içindeki mevcut güvenlik kurallarını ve Codex bilgilerini silme veya değiştirme.
2. Gerekliyse dosyanın en altına **“Claude hesap değişikliği ve yeni oturum”** başlıklı kısa bir bölüm ekle.
3. Yeni Claude oturumunun hangi dosyaları hangi sırayla okuyacağını belirt.
4. Tamamladığın son doğrulamanın commit numarasını, GO/NO-GO sonucunu, açık işleri ve sıradaki güvenli adımı güncel kaynaklardan kaydet.
5. Claude sohbet geçmişinin farklı hesapta görünmesinin garanti olmadığını; devamlılığın `FIRST-READ.md`, `.ai` belgeleri, ortak rapor ve Git geçmişinden sağlanacağını açıkça yaz.
6. Push, tag-push, deploy, production bağlantısı/yazımı, migration/seed ve canlı veri değişikliği yasaklarını aynen koru.
7. Secret, parola, token veya özel bağlantı değerlerini belgeye yazma.
8. `codex-claude-ortak-rapor.md` dosyasına yalnız en alttan append et; tarihsel içeriği değiştirme.
9. Yalnız dokümantasyon dosyalarının değiştiğini `git diff` ile doğrula.
10. Kullanıcı kapanış commit'ine onay verdiyse bu dokümantasyon değişikliğini ayrı bir `docs:` commit'i olarak kaydet; kesinlikle push veya deploy yapma. Açık commit onayı yoksa değişiklikleri commit etmeden kullanıcıya bildir.

Ayrıca yeni Claude hesabında kullanılacak tek satırlık başlangıç promptunu `FIRST-READ.md` içine ekle ve sonuçta kullanıcıya dosya yolu ile, commit oluşturulduysa commit numarasını bildir.

## 1. Tek kanonik çalışma dizini

```text
/Users/hazarvolgaekiz/dev/studio/aluplan-support-desk-v02/aluplan-support-desk-v02-main-live-site
```

- Bütün inceleme, geliştirme, test ve commit işlemleri yalnız bu dizinde yapılır.
- Ayrı bir geçici repo/restore checkout oluşturma.
- Başlangıçta `pwd`, `git status --short`, `git branch --show-current` ve `git log -1 --oneline` çalıştır; sonucu varsayma.
- Kullanıcıya ait mevcut veya ilgisiz çalışma ağacı değişikliklerini silme ya da geri alma.

## 2. Değişmez güvenlik sınırları

- Kullanıcı açıkça **“push et”** demeden remote push veya tag push **yapma**.
- Kullanıcı ayrıca onaylamadan deploy/publish **yapma**.
- Production/canlı sisteme bağlanma, yazma, migration/seed çalıştırma veya veri değiştirme.
- Canlı kullanıcıları, biletleri, AI etkileşimlerini, dosyaları veya diğer iş verilerini silme.
- Yerel uygulamayı hiçbir zaman production `DATABASE_URL` ile çalıştırma.
- Shadow veritabanı production değildir; yine de salt-okunur/izole veri güvenliği kurallarına uy.
- Production Redis'i yerel ortama kopyalama; canlı kuyruk, session veya işleri yeniden oynatma.
- Secret, parola, token ve özel bağlantıları rapora, sohbete veya Git'e düz metin olarak yazma.

## 3. Her yeni oturumda okuma sırası

1. `AGENTS.md`
2. `.ai/bootstrap.txt`
3. `.ai/current-focus.md`
4. `.ai/session-summary.md`
5. `.ai/architecture-decisions.md`
6. `graphify-out/GRAPH_REPORT.md`
7. `codex-claude-ortak-rapor.md` — özellikle dosyanın en altındaki güncel append-only kayıtlar
8. Aktif konuya ait `.ai/issues/` belgesi varsa onun tamamı

Kod ve testler dokümanlarla çelişirse kod/test/şema/migration gerçeği kazanır. Eski kök raporları tek başına güncel kanıt sayma.

## 4. Hesap değişikliği ve sohbet devamlılığı

- Mevcut Codex hesabının kotası dolduğunda kullanıcı, 12 Ağustos 2026 sıfırlamasını beklemek istemezse kendi diğer hesabıyla giriş yapabilir.
- Hesap değişikliği yerel proje dosyalarını, Git geçmişini, commit'leri ve restore point'leri silmez.
- Eski sohbetlerin yeni hesabın kenar çubuğunda görünmesi garanti değildir. Devamlılığın kaynağı bu dosya ile yukarıdaki proje hafızası belgeleridir.
- Yeni oturumda şu başlangıç talimatını kullan:

```text
Önce kök FIRST-READ.md dosyasını tamamen oku ve içindeki güvenlik sınırlarına uy.
Ardından belirtilen proje hafızası belgelerini sırasıyla oku, git durumunu doğrula
ve bana mevcut durum ile sıradaki güvenli adımı özetle. Kod değiştirme, push veya
deploy yapma; önce benden onay bekle.
```

## 5. Yerel sohbet güvenlik arşivi

Proje ile ilişkili Codex çalışma kayıtlarının yerel güvenlik kopyası:

```text
.private-data/conversation-archives/aluplan-codex-20260807-1825/
```

- Arşiv Git dışında ve `.private-data/` altında tutulur; commit/push edilmez.
- Arşiv, manuel inceleme ve kurtarma içindir. Başka hesaba otomatik veya resmi sohbet içe aktarma garantisi değildir.
- İçinde proje oturum kayıtları, indeksler, proje metadata kopyası ve SHA-256 bütünlük manifestleri bulunur.
- Kimlik doğrulama dosyaları veya tokenlar bilinçli olarak arşive alınmamıştır.
- Arşivi silme, taşımadan önce bütünlük manifestlerini doğrula ve kullanıcıdan açık onay al.

## 6. Şu anki teslimat kapısı

- Review Center soft-delete paritesi **Aşama A**, yerel ürün/test commit'i `69655f1c` ile tamamlandı.
- Post-work restore tag'i: `restore/post-review-center-phase-a-20260807-69655f1c`.
- Restore bundle: `.private-data/restore-points/post-review-center-phase-a-69655f1c.bundle`.
- Codex code-review ve security-review sonucu GO; Critical/High/Medium açık bulgu yok.
- Claude bağımsız doğrulaması da **GO** verdi: restore hash'i, kaynak kod, doğrudan yerel DB paritesi, hedefli/tam testler, typecheck ve sözleşme kapıları bağımsız olarak doğrulandı; çürütülen iddia veya sayı sapması bulunmadı.
- Aşama A teknik ve bağımsız doğrulama bakımından kapalıdır.
- Bu GO yalnız Aşama A içindir. **Aşama B global Prisma soft-delete değişikliğine geçme**; Aşama B hâlâ NO-GO durumundadır ve ayrı envanter, plan, restore point ve kullanıcı onayı gerektirir.
- Global `PrismaService` Proxy/middleware Aşama A kapsamında değiştirilmedi.

Bu durum zamanla değişebilir. Kesin güncel durum için `.ai/current-focus.md`, `.ai/session-summary.md`, Git geçmişi ve `codex-claude-ortak-rapor.md` dosyasının en altını yeniden doğrula.

## 7. Çalışma kapanış disiplini

- Önemli işten önce temiz bir commit ve doğrulanmış yerel restore point oluştur.
- Ürün kodu, test, dokümantasyon, DB/config ve graph çıktısını mümkün olduğunca ayrı commitlerde tut.
- Kod değişikliğinde TDD, hedefli test, typecheck, i18n ve riskle orantılı tam suite uygula.
- Kod değişikliği sonrasında code-review; güvenlik etkisi varsa security-review tamamlanmadan commit kapanışı yapma.
- Önemli çalışma sonunda `.ai/session-summary.md` dosyasını, hedef değiştiyse `.ai/current-focus.md` dosyasını güncelle.
- Ortak raporun tarihsel üst bölümlerini değiştirme; yeni Codex/Claude kayıtlarını yalnız en alta append et.

## 8. Başlangıçta kullanıcıya verilecek kısa teyit

Yeni oturum ilk okumasından sonra şu dört noktayı açıkça teyit et:

1. Doğru çalışma dizini ve güncel Git HEAD görüldü.
2. Çalışma ağacının temiz/kirli durumu görüldü; mevcut değişikliklere dokunulmadı.
3. Push/deploy/production yazma yasağı anlaşıldı.
4. Aktif faz ve beklenen bağımsız doğrulama kapısı güncel kaynaklardan belirlendi.

## 9. Claude hesap değişikliği ve yeni oturum

- Claude hesabının limiti dolduğunda kullanıcı kendi diğer Claude hesabıyla giriş yapabilir.
- Yerel proje, Git geçmişi, restore point'ler ve bu belge hesap değişikliğinden etkilenmez.
- Önceki Claude sohbetlerinin farklı hesapta görünmesi garanti değildir; proje sürekliliği bu dosya, `.ai` hafıza belgeleri, ortak rapor ve Git geçmişi üzerinden kurulur.
- Yeni Claude oturumunda kullanılacak tek satırlık başlangıç talimatı:

```text
Kök dizindeki FIRST-READ.md dosyasını tamamen oku, belirtilen proje hafızası ve Git kontrollerini uygula; mevcut durumu özetle ve benden açık onay almadan kod, commit, push, deploy veya canlı sistem işlemi yapma.
```
