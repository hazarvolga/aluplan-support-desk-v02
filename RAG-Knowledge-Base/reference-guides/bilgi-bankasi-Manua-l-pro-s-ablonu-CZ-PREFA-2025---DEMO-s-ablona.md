# Manuál pro šablonu CZ PREFA 2025 - DEMO šablona

**Kategori:** Diğer
**Kaynak:** `Manuál pro šablonu CZ PREFA 2025 - DEMO šablona-ckipmui5jqa.pdf`

---

**Toplam Sayfa:** 9


## Sayfa 1

ALLPLAN 2025
MANUÁL pro použití šablony „CZ PREFA 2025 – DEMO šablona“

Obsah
ALLPLAN 2024 ................................................................................................................................................. 1
MANUÁL pro použití šablony „CZ PREFA 2024 – DEMO šablona“ .................................................................. 1
Obsah dokumentu ........................................................................................................................................... 3
Actionbar prefabrikované konstrukce – popis funkcí ..................................................................................... 4
Popis pracovního postupu pro vytvoření prefa prvku a jeho výkresu ............................................................ 6
Vytvoření prefa prvku ..................................................................................................................................... 7
Směr pohledu .................................................................................................................................................. 8
BIM Booster ..................................................................................................................................................... 8
Práce s výkresem prvku ................................................................................................................................... 9
Dočasný výkres ................................................................................................................................................ 9

Obsah dokumentu
Tento dokument slouží jako rychlý návod pro práci se šablonou „CZ Prefa 2025 – DEMO šablona“
Po založení projektu máte k dispozici předdefinovanou strukturu stavby pro jednoduchou prefabrikovanou
jednopodlažní budovu.
Jsou zde založené folie:
Pro definici popisů ve
výkresu prvku
pro zadání 3D prvků
představujících sloupy,
trámy, vazníky atd…
pro detailní výkres
jednotlivých prvků
vodorovný a svislý řez

Actionbar prefabrikované konstrukce – popis funkcí
Konstrukční prefabrikovaný prvek – (starší funkce – již se nepoužívá)
Prefabrikovaný prvek – funkce pro vytvoření prefabrikovaného prvku ze 3D tělesa/Pythonpartu
IFC asistent – funkce pro převod sendvičové konstrukce složené z více 3D těles na skupinu těles pro
prefa prvek
Vestavné prvky - Nástroj pro vkládání, definici a úpravu vestavných prvků
Povrchové úpravy a oblasti betonu – zapne samostatný editor povrchů, kde lze definovat
povrchovou úpravu prvků
Status admin – slouží pro zamknutí prvku proti změnám
TZB asistent – slouží pro automatizovaný převod objektů na vestavné prvky z uživatelského katalogu
(používané zejména pro vedení instalací ve stěnách)
Konstrukční prefabrikovaný dílec zrušit – slouží pro vymazání prefabrikovaného konstrukčního dílu
(starší funkce). Při vytváření funkcí prefabrikovaný dílec se pro vymazání používá klasická funkce
vymazat
Modelování prefabrikátů – (starší funkce) slouží pro úpravu geometrie hotového konstrukčního
prefabrikovaného dílce. Při použití nové funkce lze úpravu provádět pomocí Booleovských operací
Kopírování elementů – umožňuje přenést vybrané elementy (vestavné prvky, výztuž) z prvku na
prvek
Číslo pozice modifikovat – touto funkcí lze upravovat číslování, sjednotit číslo pro stejné prvky a další
Výkres prvku – vytvoří výkres podle šablony (Element plánu)

Přenést výkres prvku – umožňuje kopírování hotového výkresu včetně výztuže a vestavných prvků
mezi jednotlivými prefabrikovanými prvky
Výkres prvku vytvořit a vydat – pomocí této funkce lze hromadně vytvářet výstupy (PDF, DWG a
další)
Dočasný výkres – slouží pro náhled prefa prvku bez vytvoření výkresu ze šablony
Prefa fólie – základní funkce pro BIM booster – umožní vytvořit kopii prvku v samostatné fólii a poté
prvek zpracovat (vytvořit výkres a vyztužit)
Vymazat prefa fólie – vymaže fólii s kopií prvku
Přenést prefa folii – zkopíruje obsah celé prefa fólie do jiné
Přiřadit prefa fólii – propojí nepropojenou prefa fólii s prvkem v celkovém modelu
Odpojit prefa fólii – odpojí prefa fólii od celkového modelu
Model a detail synchronizovat – zaktualizuje změny v modelu, vestavných prvcích, výztuži mezi
celkovým modelem a prefa fólií a obráceně
Zkontrolovat stav propojení
Knihovny
Konfigurace
Záloha dat
Nastavení továrny

Popis pracovního postupu pro vytvoření prefa prvku a jeho výkresu
Jako podklad pro vytvoření prefa prvku lze použít libovolné 3D těleso/architektonické těleso nebo
PythonParts. Pokud je zdrojem dat architektonický prvek (stěna, sloup, trám, deska…) je potřeba tento prvek
nejprve převést na 3D těleso.
Pro celkový model konstrukce jsou přednastaveny v šabloně fólie 200-209 rozdělené podle typu prvku.
1) Funkcí „Prefabrikovaný prvek“ se převede 3D těleso/ PythonPart na prefa prvek, který je potřeba
dále nastavit. Viz kapitola vytvoření prefa prvku
2) Vytvoření prefa fólie prvku pomocí BIM booster. Viz kapitola BIM Booster
3) Přepnutí do prefa fólie (lze se přepnout ručně pomocí dialogu pro přepnutí fólie nebo lze využít
kontextovou nabídku na prvku a vybrat funkci „Načíst prefa fólii“
4) Vyztužení a osazení prvku
a. Možnost využít dočasného výkresu – tato volba umožní se soustředit na umístění výztuže a
vestavných prvků bez ohledu na finální grafický výstup
b. Použití výkresu prvku – vytvoří výkres dle šablony pro daný prvek, ve kterém se osadí
výztuž a vestavné prvky – v šabloně
• Pro vyztužování se postupuje stejně jako při vyztužování monolitických konstrukcí a lze
využít všechny dostupné funkce Allplanu
5) Synchronizace dat mezi prefa fólií a fólií modelu. Viz kapitola BIM Booster
V nastavení je potřeba vybrat, co se bude synchronizovat (tvar, výztuž, vestavné prvky…) –
obecně je vhodné synchronizovat pouze tvar, atributy a vestavné prvky kvůli koordinaci
celkového modelu
6) Výstup do souboru – export hotového výkresu do PDF, DWG…. Pomocí funkce „výkres prvku
dávkové zpracování“
7) Pro výkres tvaru a přehledové výkresy konstrukce lze využívat všechny dostupné funkce včetně
pohledů, řezů a asociativních popisů.

Vytvoření prefa prvku
Po spuštění této funkce lze vybrat jedno nebo více 3d
prvků a převést je na prefabrikáty – program automaticky
rozpozná stejné tvary a přiřadí jim stejné číslo.
Výrobní závod
- Umožňuje vybrat celkové nastavení pro
popisování a tvorbu výkresů daného prvku –
v šabloně je nastaven CZ-SK
Výběr typu elementu
- Nastaví konkrétní typ prvku (sloup, vazník …) a
s ním související nastavení pro popis, a typy
šablon pro výkres
Zarovnání
- (dostupné pouze při editaci jednoho prvku)
Nastaví referenční bod a směr pohledu na prvek.
Toto je důležité při rozpoznávání stejných tvarů a
následné tvorbě výkresů. Pokud bude u stejných
prvků různé nastavení nedostanou stejné
očíslování.
Popis
- Tato volba umožňuje upravit označení prvku,
jeho číslování a umístění přednastaveného
popisu.
Vrstvy prvku
- Nastavení pro sendvičové konstrukce, tady lze
nastavit tloušťky jednotlivých vrstev a jejich
materiály – pro tento typ prvků je potřeba
nejdříve použít funkci IFC asistent a vytvořit
sendvičovou konstrukci
Atributy
- Zde lze zadat množství atributů pro další třídění a
vykazování. Pomocí tlačítka + lze libovolně
atributy přidávat.
Oblíbené položky
- Slouží pro uložení a načtení oblíbené položky
s nastavením pro daný prvek.

|  |
| --- |
|  |
|  |
|  |
|  |
|  |


Směr pohledu
Pomocí kontextového menu na prefa elementu lze vyvolat nastavení pro směr pohledu na prefabrikovaný
prvek a referenčního bodu. Toto je důležité pro porovnání stejných prvků (stejný prvek musí mít nastaven
stejný směr pohledu a referenční bod). Směr pohledu je zobrazen zelenou osou lokálního souřadného
systému. Směr napětí je zobrazen červenou osou lokálního souřadného systému.
BIM Booster
- Vytvoření prefa fólie
o Pomocí funkce „Prefa fólie“ program vytvoří kopii daného prvku do nové fólie (v šabloně
jsou připraveny fólie ve struktuře stavby „prvky>sloupy…“ )
o Název fólie je vytvořen automaticky dle nastavení daného prvku
- Přepínání mezi prefa fólií a fólií modelu
o Kliknutím pravým tlačítkem myši na prvek ve fólii modelu je možné se přepnout na
danou prefa fólii prvku a obráceně – na prefa fólii klinutím na prefa prvek přepnout na
fólii modelu
- Synchronizace dat mezi fóliemi
o Tlačítkem „Model a detail synchronizovat“ lze změny provedené ve fólii prvku přenést do
fólie celého modelu na všechny prvky daného označení (např na všechny sloupy S2)
o V nastavení lze vybrat co se bude synchronizovat
▪ Pro lepší orientaci v celkovém modelu doporučujeme mít při synchronizaci
směrem z detailního modelu zapnutou pouze změnu tvaru, modelované těleso
(pokud se používá k úpravě tvaru funkce modelování prefabrikátů) a vestavné
prvky. Výztuž je tedy ponechána pouze v detailním modelu a v celkovém modelu
není vidět.

Práce s výkresem prvku
Vestavné prvky – vloží vestavný prvek z knihovny uživatele
Vestavné prvky z knihovny – vloží vestavné prvky výrobce (Halfen-Deha, Peikko….)
Přídavná výztuž – funkce pro osazení výztuže do prvku – umožňuje osazení např třmínkových košů do filigránových
prvků
Rozmístit vestavné prvky podél polygonu
ohyb na libovolné hraně - umístí ohyb na hraně plošně ukládané výztuže
Modifikace uložené výztuže
Modelování prefabrikátů – pomocí této funkce lze upravit tvar prefabrikovaného tělesa pomocí vestavných prvků –
lze ale také použít obecný 3D modelář a booleovské operace
Zobrazit skrýt výztuž
Zobrazit skrýt filigrány
Aktualizace element plánu – aktualizuje element plán, případně lze zapnout/vypnout automatickou aktualizaci kót.
Vytvořit nový výkres prvku – vytvoří nový výkres podle šablony, lze ponechat ruční dokresy a popisy
Vymazat element plán
Upravit výkres prvku – umožní změnit rozměr výkresu nebo měřítko
Osadí variantní text propojený s prefabrikovaným prvkem
Tisk stránky
Atributy výkresu – lze vyplnit atributy do rozpisky
Vloží standartní legendu z Allplanu
Výběr položky – přepínač na zapnutí výkresu pomocí čísla prvku nebo kliknutím
Přímé zapnutí editace definice výkresu prvku
Dočasný výkres
Vytvoří pohled na prvek ze všech stran a umožní pracovat s prvkem bez soustředění se na grafickou stránku
výsledného výkresu. V tomto zobrazení se pouze vytváří výztuž a osazují vestavné prvky bez popisování a kótování.
