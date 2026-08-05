import { smartChunk } from './smart-chunker';
import { createCliLogger } from '../../common/utils/cli-logger';

const cliLogger = createCliLogger('TestSmartChunker');

const massiveText = `
# Giriş
Bu çok uzun bir dökümandır. Test etmek amacıyla oluşturulmuştur.
Amacımız akıllı parçalama algoritmasının büyük metinleri bağlam kopması yaşatmadan,
birbiri üzerine bindirerek ayırıp ayırmadığını kontrol etmektir.

# Bölüm 1
Aluplan sistemine giriş yapmak için şu adımları takip edin:
- Kullanıcı adı ve şifre girin.
- Sisteme giriş yapın.
- Sol menüden 'Knowledge Pool' sekmesini bulun.

` + "Aliquam lorem erat, tincidunt vitame lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(30) +
    `
# Bölüm 2: Tablolar ve Veriler
Sistem logları için aşağıdaki hata kodları yaygındır:
| Kod | Anlamı |
|---|---|
| 400 | Kötü İstek |
| 401 | Yetkisiz |
| 404 | Bulunamadı |
| 500 | Sunucu Hatası |

` + "Maecenas sed diam eget risus varius blandit sit amet non magna. ".repeat(20) +
    `
# Sonuç
Uygulama bu şekilde çalışmalıdır. Eğer büyük dosyalar düzgün ayrılmazsa, modelin kafası karışabilir.
`;

cliLogger.log('--- TEST: SMART CHUNKER ---');
const chunks = smartChunk(massiveText, {
    maxTokens: 500, // Small limit to force chunking
    overlap: 100,
    title: 'test_massive_file'
});

cliLogger.log('TOTAL CHUNKS: ' + chunks.length);
chunks.forEach((chunk, i) => {
    cliLogger.log('\\n================= CHUNK ' + (i + 1) + ' (Seq: ' + chunk.sequence + ') =================');
    cliLogger.log('Length: ' + chunk.content.length + ' chars');
    cliLogger.log(chunk.content.substring(0, 150) + '...');
    cliLogger.log('...');
    cliLogger.log(chunk.content.slice(-100));
});
