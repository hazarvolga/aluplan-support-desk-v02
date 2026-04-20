# Hotlinetools

**Kategori:** Hotline Tools
**Kaynak:** `Hotlinetools-peczgytxnk0.pdf`

---

**Toplam Sayfa:** 7


## Sayfa 1

AWT Thema Troubleshooting Q1 2016
Tipps + Tricks
Allmenü – service Hotlinetools
Hier finden Sie eine Sammlung verschiedener Hilfsprogramme, die bei der Lösung eventuell auftretender Prob-
leme helfen und den Programm- und Systemservice mit dem technischen Support automatisieren.
Um die Tools anzuwenden, wählen Sie das gewünschte aus und bestätigen mit OK.
Hinweis: Einige dieser Tools sollten nur im Dialog mit dem technischen Support verwendet werden, oder wenn
man genau weiß, was diese bewirken.
cleanstd
Hinweis: Das Hotlinetool cleanstd sollte nur in Verbindung mit dem Hotlinetool cleanup ausgeführt werden.
Dieses Hotlinetool behebt Probleme, die durch fehlerhafte oder versehentlich vorgenommene Programmeinstel-
lungen entstehen.
Dadurch ändern sich automatisch alle Einstellungen, die über Definitionen bzw. Optionen in den einzelnen Pro-
grammmodulen eingestellt werden können. Die Druckerkonfiguration, die Einstellung von Schraffuren und Mus-
tern sowie die Definition von Makros bleiben unbeeinflusst.
Hinweis: Sie können auch einzelne Dateien (Standardwerte) selektiv löschen, wenn Sie das Frage-Dialogfeld
Möchten Sie alle CAD-Einstellungen zurücksetzen? mit Nein beantworten.
Durch das Löschen dieser Dateien werden alle Benutzerdefinitionen auf den Standardwert bei Auslieferung
zurückgestellt, wodurch beim nächsten Programmstart Ihre Optionen verstellt sein können.
Mit cleanstd werden die folgenden Dateien (Standardwerte) gelöscht:
plastw.dat Benutzer-Standardwerte des
Moduls Planlayout
astw.usr Benutzer-Standardwerte der
Architektur-Module
dstw.usr Benutzer-Standardwerte des
Moduls Maßlinie
estw.usr Benutzer-Standardwerte des
Moduls Einbauteile
fstw.usr Benutzer-Standardwerte des
Moduls Finite Elemente
mstw.usr Benutzer-Standardwerte des
Moduls Matten
qstw.usr Benutzer-Standardwerte von
Allplan Fertigteilwerke
rstw.usr Benutzer-Standardwerte des
Moduls Rundstahl.
Hinweis: Standardwerte und
Vorgaben in Paletten wie
Stabform oder Kreisbeweh-
rung werden nicht gelöscht.
tstw.usr Benutzer-Standardwerte des
Moduls Text
desstw.dat Design-Standardwerte (Modu-
le Animation und Schatten-
berechnung)
zstwzb.dat Allgemeine Standardwerte
(Optionen Arbeitsumge-
bung, Bildschirmdarstel-
lung usw.)
Hotlinetools.doc - 1 - -

AWT Thema Troubleshooting Q1 2016
astw.dat Architektur-Standardwerte
pstw.dat Benutzer-Standardwerte des
Moduls Positionsplan
vstw.dat Benutzer-Standardwerte
Vermessung (Digitales Ge-
ländemodell)
BewEingVor.dat Benutzer-Standardwerte der
FF-Bewehrung
KooEingVor.dat Benutzer-Standardwerte der
Punkteingabe und Elemen-
taktivierung
KooEingVorRaster.dat Benutzer-Standardwerte von
Länge rastern der Punk-
teingabe (Fugenbreite)
KoordToolSettings.dat Einstellung für Orthogo-
nal/Winkelsprung
OpenSavePathData.cfg Einstellung im Dialog Spei-
cherorte (Optionen Ar-
beitsumgebung - Spei-
chern)
Default.axfa Benutzer-Standardwerte für
Achsbemaßung
Default.dlfa Benutzer-Standardwerte für
Maßlinie
Default.elfa Benutzer-Standardwerte für
Kote
Default.mmfa Benutzer-Standardwerte für
Maßlinienmodifikation nach
Typ
Default.pofa Benutzer-Standardwerte für
Absteckung
Default.sefa Benutzer-Standardwerte für
Maßlinienmodifikation (Al-
les)
Default.wdfa Benutzer-Standardwerte für
Wandbemaßung
NP_CircAreaProp_Data_last.xml Zuletzt in Paletten gewählte
Parametereinstellungen für
Kreisbewehrung
NP_SpiralProp_Data_last.xml Zuletzt in Paletten gewählte
Parametereinstellungen für
Wendelbewehrung
PG_FFBew2000_Data_last_ExpForm*.xml Zuletzt in Paletten gewählte
Parametereinstellungen für
Expansionsform der Stabform
(* steht für die Nummer der
Form, entsprechend der ana-
logen Form in der FF-
Bewehrung)
PG_FFBew2000_Data_last_Flaeche.xml Zuletzt in Paletten gewählte
Parametereinstellungen für N-
Eck-Bügel der Stabform
PG_FFBew2000_Data_last_Form*.xml Zuletzt in Paletten gewählte
Parametereinstellungen für
Expansionsform der Stabform
(* steht für die Nummer der
Form, entsprechend der ana-
logen Form in der FF-
Hotlinetools.doc - 2 - -

AWT Thema Troubleshooting Q1 2016
Bewehrung)
PG_FFBew2000_Data_last_Frei.xml Zuletzt in Paletten gewählte
Parametereinstellungen für
Freie Form der Stabform
PG_FFBew2000_Data_last_Kreis.xml Zuletzt in Paletten gewählte
Parametereinstellungen für
Kreisbügel der Stabform
PG_FFBew2000_Data_last_Mesh_ExpForm*.xml Zuletzt in Paletten gewählte
Parametereinstellungen für
Expansionsform der Matten-
form (* steht für die Nummer
der Form, entsprechend der
analogen Form in der FF-
Bewehrung)
PG_FFBew2000_Data_last_Mesh_Flaeche.xml Zuletzt in Paletten gewählte
Parametereinstellungen für N-
Eck-Bügel der Mattenform
PG_FFBew2000_Data_last_Mesh_Frei.xml Zuletzt in Paletten gewählte
Parametereinstellungen für
Freie Form der Mattenform
PG_FFBew2000_Data_last_properties.xml Zuletzt in Paletten gewählte
Einstellungen für Modifikation
einer Position
PG_MeshLabel_DlgData_last.xml Zuletzt in Paletten gewählte
Einstellungen für Mattenbe-
schriftung
PG_MeshLabel_DlgData_last_properties.xml Zuletzt in Paletten gewählte
Einstellungen für Modifikation
der Mattenbeschriftung
PG_ReinfLabeling_Data_last_comb.xml Zuletzt in Paletten gewählte
Einstellungen für Verlegebe-
schriftung mit Kamm
PG_ReinfLabeling_Data_last_dimline.xml Zuletzt in Paletten gewählte
Einstellungen für Verlegebe-
schriftung mit Maßlinie
PG_ReinfLabeling_Data_last_fan.xml Zuletzt in Paletten gewählte
Einstellungen für Verlegebe-
schriftung mit Fächer
PG_ReinfLabeling_Data_last_properties.xml Zuletzt in Paletten gewählte
Einstellungen für Modifikation
der Verlegebeschriftung
PG_ReinfLabeling_Data_last_symbol.xml Zuletzt in Paletten gewählte
Einstellungen für Verlegebe-
schriftung mit Positionssymbo-
le
PG_ReinfLabeling_Data_last_text_1.xml Zuletzt in Paletten gewählte
Einstellungen für Verlegetext
einer Position
PG_ReinfPlacement_Data_last_einzel.xml Zuletzt in Paletten gewählte
Einstellungen für Erzeugung
einer Stabform Einzelverle-
gung
PG_ReinfPlacement_Data_last_linear.xml Zuletzt in Paletten gewählte
Einstellungen für Erzeugung
einer linearen Stabformverle-
gung
PG_ReinfPlacement_Data_last_mesh_einzel.xml Zuletzt in Paletten gewählte
Einstellungen für Erzeugung
einer Mattenform Einzelverle-
gung
Hotlinetools.doc - 3 - -

AWT Thema Troubleshooting Q1 2016
PG_ReinfPlacement_Data_last_mesh_linear.xml Zuletzt in Paletten gewählte
Einstellungen für Erzeugung
einer linearen Mattenformver-
legung
PG_ReinfPlacement_Data_last_properties.xml Zuletzt in Paletten gewählte
Einstellungen für Modifikation
einer Verlegung
ReinfGroup_Data_last.xml Zuletzt in Paletten gewählte
Parameterauswahl und -
einstellungen einer Montage-
gruppe
Default.constfa Einstellungen für die Eingabe-
funktionen (Anfangs-, End-
symbol, Eingabeart) bei Linie,
Kreis, ...
fds.usr Zuletzt genutzte Favoriten von
Fassade (Modul Basis:
Wände, Öffnungen, Bautei-
le)
rds.usr Zuletzt genutzte Favoriten von
Geländer (Modul Basis:
Wände, Öffnungen, Bautei-
le)
fds.cfg Zuletzt genutzte Einstellungen
von Fassade (Modul Basis:
Wände, Öffnungen, Bautei-
le)
rds.cfg Zuletzt genutzte Einstellungen
von Geländer (Modul Basis:
Wände, Öffnungen, Bautei-
le)
smt.cfg Zuletzt genutzte Einstellungen
von SmartPart (Modul
SmartParts)
smt.dat Standardwerte des Moduls
SmartParts
PropertyInfoSettings.dat
laststd
Mit diesem Hotlinetool können Sie die letzte Einstellung der Standardwerte wiederherstellen. Somit können Sie
auch alle mit cleanstd gelöschten Standardwerte, die sich das Programm zur Sicherheit merkt, wiederherstel-
len.
savestd
Hiermit speichern Sie die aktuellen Einstellungen der Standardwerte, die Sie selbst vorgenommen haben. Eine
Sicherung der vom Programm standardmäßig vorgegebenen Einstellungen ist nicht erforderlich, da diese Werte
durch das Hotlinetool cleanstd wiederhergestellt werden können.
reststd
Wenn Ihre Einstellungen verstellt oder durch das Hotlinetool cleanstd zurückgesetzt worden sind, können Sie
mit diesem Hotlinetool Ihre ursprünglichen Einstellungen wieder einspielen, vorausgesetzt Sie haben diese mit
dem Hotlinetool savestd gespeichert.
Hinweis: Führen Sie reststd erst nach einer Überprüfung der korrekten Funktionsweise des CAD-Programms
durch.
Sollte ein Problem, das Sie durch cleanstd zu beheben versucht haben, nach der Durchführung von reststd
Hotlinetools.doc - 4 - -

AWT Thema Troubleshooting Q1 2016
erneut auftreten, führen Sie cleanstd nochmals aus und verzichten Sie anschließend auf reststd. In diesem
Fall müssen Sie Ihre ursprünglichen Definitionen manuell wieder anpassen.
cleanreg
Das Hotlinetool cleanreg findet alle in der Systemregistrierung unter HKEY_CURRENT_USER vorhandenen
CAD-spezifischen Einträge, die nicht dem Auslieferungszustand entsprechen, und kann diese bereinigen.
Sie können auch einzelne Registrierungseinträge selektiv löschen, wenn Sie das Frage-Dialogfeld Möchten Sie
alle Registrierungseinstellungen zurücksetzen? mit Nein beantworten.
Hinweis: Es werden nur Registrierungseinstellungen zurückgesetzt, die nicht dem Auslieferungszustand ent-
sprechen. Um eine Übersicht aller geänderten Registrierungseinstellungen zu erhalten, beantworten Sie das
Frage-Dialogfeld Möchten Sie alle Registrierungseinstellungen zurücksetzen? mit Nein.
lastreg
Das Hotlinetool lastreg stellt die letzte Einstellung der Systemregistrierung wieder her. Somit können Sie auch
alle mit cleanreg gelöschten Registrierungseinträge, die das Programm zur Sicherheit speichert, wieder her-
stellen.
savereg
Mit dem Hotlinetool savereg speichern Sie die aktuellen Registrierungseinstellungen.
restreg
Mit dem Hotlinetool restreg können Sie die ursprünglichen Registrierungseinstellungen wieder herstellen, wenn
diese verstellt oder mit cleanreg bereinigt wurden. Voraussetzung dafür ist, dass die Einstellungen zuvor mit
dem Hotlinetool savereg gespeichert wurden.
cleanup
Dieses Hotlinetool initialisiert die Bildschirmdarstellung und behebt damit Probleme, die durch defekte Grafikin-
formationen verursacht wurden. Sie können dieses Tool bedenkenlos verwenden und sollten es immer dann
ausführen, wenn die Bildschirmdarstellung nicht korrekt ist. Anwendungsbeispiele hierfür sind z.B. das Fehlen
des Startlogos oder die verzerrte Darstellung von Symbolleisten.
Nach der Ausführung des Hotlinetools und erneutem Start in das CAD wird in das private Projekt gewechselt.
cleanprint
Hiermit werden geänderte Druckereinstellungen auf Standard zurückgesetzt. Die Vorauswahl für Windowstrei-
ber steht auf dem Windows-Standarddrucker, für Allplan Vektortreiber auf Kanal 1.
toolbar
Mit diesem Hotlinetool werden die Lage und der Inhalt der Symbolleisten auf die Standardeinstellungen gesetzt,
die bei der Neuinstallation des Programms vorhanden sind. Dieses Zurücksetzen erfolgt dabei unabhängig da-
von, ob Sie die Lage der Symbolleisten als Standardposition gespeichert haben.
Wichtig: Mit dem Hotlinetool toolbar werden die aktuelle und alle gespeicherten Symbolleisten-
Konfigurationen gelöscht (Symbolleisten-Konfigurationen, die in einer ubx-Datei gespeichert sind, werden aller-
dings nicht gelöscht). Führen Sie deshalb dieses Hotlinetool nur auf ausdrückliche Anweisung des technischen
Supports aus.
reorg
Hiermit reorganisieren Sie von auszuwählenden Projekten die Projektverwaltung, damit Teilbilder und zugehöri-
ge Listen wieder zusammenpassen.
Als weitere Option steht Ihnen die Wiederherstellung defekter oder unvollständiger Projekt-Verwaltungsdateien
zur Verfügung.
Benutzer local: Die Verwaltungsdateien für das lokale Leerprojekt werden neu erstellt.
Benanntes Projekt: Die Verwaltungsdateien für das auszuwählende Projekt werden neu erstellt. Die
Teilbilder müssen anschließend neu gewählt und aktiviert werden.
Projektverwaltungsdatei wieder herstellen: Die Projektübersichtsdatei wird neu erstellt.
Hotlinetools.doc - 5 - -

AWT Thema Troubleshooting Q1 2016
updprjattr
Hiermit werden die Projektattribute (nicht die CAD-Attribute) eines Projekts aktualisiert. Dieses Hotlinetool
sollte nach Durchführung von reorg bei Projekten mit Projektattributen ebenfalls durchgeführt werden, damit
diese richtig angezeigt werden.
wopro
Hiermit werden der Pfad und der Dateiname für ein ausgewähltes Projekt angezeigt.
listpro
Hiermit werden die Projektbezeichnungen aller vorhandenen Projekte mit Pfad und Dateiname angezeigt. Für
die Ausgabe können Sie zwischen Bildschirm, Datei und Drucker wählen.
datwainit
Mit diesem Tool können Sie beim nächsten Allplan-Start die Datenkonvertierung starten. Damit können Sie
bisher nicht gewandelte Daten automatisch in die aktuelle Version wandeln lassen, wie z.B.:
Symboldateien im Bürostandard
Makrodateien im Bürostandard
Private CAD-Benutzerdaten
Benannte Projekte
datwaprjs
Mit diesem Tool können Sie sofort die Datenkonvertierung aller Projekte starten.
ACHTUNG!
Verwenden Sie diese Funktion nur, wenn Sie eine geprüfte Datensicherung Ihrer Projekte besitzen.
getenv
Mit diesem Tool werden Ihnen die Windows-Umgebungsvariablen angezeigt.
showcfg
Mit diesem Tool werden Ihnen die Allplan Systemvariablen angezeigt.
showreg
Mit diesem Tool werden Ihnen die Registry-Einträge angezeigt.
docsize
Hier haben Sie die Möglichkeit, den von Allplan im Arbeitsspeicher vorgehaltenen Platz für alle geladenen Do-
kumente an die Ausstattung Ihres Rechners anzupassen.
Bei genügend großem Arbeitsspeicher können Sie z.B. für die Bearbeitung besonders großer Pläne die Spei-
cherkapazität für die geladenen Dokumente vergrößern oder bei besonders kleinem Arbeitsspeicher die Spei-
cherkapazität verringern. Die Eingabe erfolgt in MegaByte.
Erfahrungsgemäß sind 8 GigaByte Arbeitsspeicher oder mehr für alle vorgeschlagenen Einstellungen ausrei-
chend. Es spielt jedoch auch immer eine Rolle, welche weiteren Anwendungen Arbeitsspeicher verbrauchen.
Empfehlungen:
256 MB Dokumentgröße bei Standard Hardwareausstattung
512 MB Dokumentgröße bei guter Hardwareausstattung
1024 MB Dokumentgröße bei sehr großer Datenmenge
Hinweis: Beachten Sie, dass auch bei einer höheren Einstellung der Dokumentgröße ein einzelnes Dokument
maximal 256 MB groß sein kann. Wird dieser Wert überschritten, dann erhalten Sie eine entsprechende Mel-
dung und werden aufgefordert, einen Teil der Daten auf ein anderes Dokument zu verschieben.
Hinweis: Sollte der freie Arbeitsspeicher des Rechners nicht ausreichen, um die Speicheranforderung zu erfül-
len, wird eine sogenannte Auslagerungsdatei verwendet. Die Verwendung der Auslagerungsdatei verlangsamt
sämtliche auf dem Rechner laufenden Anwendungen.
Hotlinetools.doc - 6 - -

AWT Thema Troubleshooting Q1 2016
alltrace
Voraussetzung für die Wirksamkeit dieses Hotlinetools ist, dass die Allplanprotokollierung (Trace) im Menü
Service eingeschaltet ist. Zusätzlich zur Ausgabe aller Aktionen des Programms werden dann erweiterte Mel-
dungen ausgegeben, die zur Fehlerbehebung beitragen können.
Beachten Sie, dass durch die hierfür erforderliche eingeschaltete Allplanprotokollierung das Programm sehr
langsam wird. Verwenden Sie dieses Hotlinetool deshalb nur kurzzeitig auf Anweisung des technischen Supports
zur Fehlersuche.
charttrace
Voraussetzung für die Wirksamkeit dieses Hotlinetools ist, dass die Allplanprotokollierung (Trace) im Menü
Service eingeschaltet ist. Zusätzlich zur Ausgabe aller Aktionen des Programms werden dann alle in Allplan
2016 getätigten Funktionsaufrufe in der Datei stdmen.out als Event dokumentiert.
Beachten Sie, dass durch die hierfür erforderliche eingeschaltete Allplanprotokollierung das Programm langsa-
mer wird.
In die Datei stdmen.out werden die Funktionsaufrufe innerhalb desselben Tages immer an das Ende der Datei
geschrieben (auch nach einem Neustart von Allplan 2016 oder dem Rechner).
Wird Allplan 2016 an einem neuen Tag gestartet, so wird die Datei automatisch neu aufgebaut.
Auf diese Weise dokumentiert die Datei immer nur den aktuellen Tag.
Die Datei stdmen.out wird beim ersten Aktivieren von charttrace angelegt und befindet sich im Pfad
...\Users\Windows Benutzername\AppData\Local\Temp.
SMT_Cache
Um das Arbeiten mit SmartParts zu beschleunigen, können diese vorkompilierten Code nutzen. Dieser Code ist
in folgendem Pfad gespeichert:
C:\Users\Windows Benutzername\AppData\Local\Nemetschek\Allplan\2016\...\Tmp\SmartParts
Wurde die Programmierung bestehender SmartParts geändert, dann sollte SMT_Cache ausgeführt werden.
Dadurch werden die alten Daten im genannten Pfad gelöscht. Auch im Zusammenhang mit cleanstd und dem
Löschen von SMT Standardwerten ist die Ausführung von SMT_Cache sinnvoll.
surfupdate
Hier können Sie Oberflächendateien in Projekten aktualisieren. Wenden Sie das Hotlinetool vor allem dann an,
wenn Sie in Projekten von Allplan 2013 Oberflächen verwenden, die für Global Illumination angepasst sind. In
Allplan 2013-1 werden diese nicht mehr benötigt.
Wählen Sie ein oder mehrere Projekte aus. Durch die Ausführung von surfupdate werden alle Dateien (*.surf
und evtl. damit verbundene Texturen) in das Projekt kopiert, die auch im Ordner STD\Design existieren und in
STD neuer als im Projekt sind. Vor dem Überschreiben wird eine gleichnamige Sicherheitskopie mit der Endung
*.bak angelegt.
remotesrv
Hiermit nehmen Sie auf Anweisung des technischen Supports über das Internet an einer
Fernwartung teil. Dies ist für bestimmte Support-Dienstleistungen notwendig.
Hotlinetools.doc - 7 - -
