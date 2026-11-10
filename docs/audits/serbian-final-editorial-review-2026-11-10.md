# Završni urednički pregled srpske lokalizacije

Datum: 10. novembar 2026. Polazni commit: `1284303f9a8769cc650e7288aeb40e77f1e6dd32`, grana `feat/serbian-localization`.

## Urednička ocena

Srpsko iskustvo dobro prenosi stvarnu vrednost proizvoda: jasan redosled treninga, smernice tokom izvođenja, prethodne vrednosti kao polaznu tačku i mogućnost nastavka posle nepotpunog treninga. Home objašnjava konkretne koristi. Bulk Pro zadržava usmerenost na rast i napredovanje, a Cut Pro na očuvanje snage i upravljanje zamorom. Vodiči zadržavaju stručan, praktičan ton i razumevanje za oporavak i promene rasporeda. Šire prepisivanje dobrog teksta nije opravdano.

Oznake „Odrađeno”, „Završeno” i „Zatvoreno” odgovaraju različitim radnjama i stanjima u aplikaciji. Sačuvana je razlika između unosa vrednosti, potvrde odrađene serije i zatvaranja dana sa nepotpunim ili praznim zapisom. Core ostaje zasebno evidentiran. Javne informacije i potvrda pri prvom pokretanju ne zahtevaju novu jezičku intervenciju.

Pregled je obuhvatio svih 1.611 unosa, engleske izvore i kontekst upotrebe. Preostale jasne probleme rešava 21 izmena prevoda u četiri kataloga. Otvorena pitanja ispod odnose se na postojeći sadržaj i obećanja proizvoda; njihovo značenje nije samostalno menjano.

## Unete ispravke

P1 označava preciznost izvođenja ili uslova napredovanja, P2 jasnoću i stručnu doslednost, a P3 završnu jezičku obradu.

| Prioritet | Mesto | Ispravka i razlog |
| --- | --- | --- |
| P1 | Bugarski čučanj, Bulk i Cut | „Korak” / „Pravi kraće korake” zamenjeno je sa „Koristi kraći raskorak”. Uputstvo opisuje položaj nogu u statičnoj vežbi. |
| P1 | Razvlačenje na sajlama | „Laktove … u istom položaju” zamenjeno je sa „zadrži isti ugao tokom pokreta”. Nepromenjen ugao savijanja više se ne meša sa nepomeranjem laktova. |
| P1 | Pomoć za napredovanje | Povećanje težine zahteva da korisnik „zaista zadrži ciljani RIR”. Prethodna „realna procena ciljanog RIR-a” nije dovoljno jasno iskazivala da cilj mora biti ispunjen. |
| P2 | Tri naziva vežbi za triceps i jedna napomena dana | „Opružanje tricepsa” postalo je „opružanje ruku”. Precizno je imenovan pokret; rekviziti i položaji su očuvani. Isti naziv usklađen je u sažetku naprednih metoda za dan. |
| P2 | Pregib ručnih zglobova | „Pregibači podlaktice” zamenjeno je sa „pregibači ručnog zgloba”, u skladu sa konkretnom vežbom. |
| P2 | Napredovanje u Core bloku | „Poboljšaj … broj ponavljanja” postalo je „povećavaj broj ponavljanja”. Redosled kontrola → ponavljanja → opterećenje ostaje isti. |
| P2 | Vodiči, četiri unosa | Tempo objašnjava da su brojevi trajanja faza u sekundama; zagrevanje se „ne beleži”, umesto da se „ne računa u napredak”; „MVP verzija” postaje „ova verzija”; Cut pravilo daje prednost očuvanju učinka nad osećajem pečenja, umesto dvosmislenog „pre nego što”. |
| P2 | Upozorenje pri zatvaranju dana, četiri brojača | Dodato je „prazna polja”. Brojevi označavaju nedostajuće vrednosti u odrađenim serijama, što je provereno prema logici upozorenja. |
| P2 | Dva uputstva pri otvaranju dnevnika | Poruke sada daju konkretan korak: prvo otvori pregled dana koji je na redu, pa iz njega dnevnik vežbe/Core. Objašnjenje internog kreiranja zapisa uklonjeno je iz korisničkog uputstva. |
| P3 | Home naslov | Uklonjena je završna tačka iz prevoda jer je komponenta već dodaje. U kompletnom naslovu ostaje jedna završna tačka. |

| Katalog | Pregledano | Izmenjeno |
| --- | ---: | ---: |
| [exercises.js](../../src/i18n/sr-Latn/exercises.js) | 493 | 7 |
| [guides.js](../../src/i18n/sr-Latn/guides.js) | 294 | 4 |
| [support.js](../../src/i18n/sr-Latn/support.js) | 164 | 3 |
| [ui.js](../../src/i18n/sr-Latn/ui.js) | 456 | 7 |
| [plans.js](../../src/i18n/sr-Latn/plans.js) | 17 | 0 |
| [warmups.js](../../src/i18n/sr-Latn/warmups.js) | 98 | 0 |
| [public.js](../../src/i18n/sr-Latn/public.js) | 89 | 0 |
| **Ukupno** | **1.611** | **21** |

## Za odluku vlasnika proizvoda i autora treninga

Ovo nisu novouvedene greške prevoda. Prioritet označava redosled razjašnjavanja; pitanja o izvođenju treba rešiti pre konačnog sadržajnog odobrenja tih uputstava. Nisu menjani program, opterećenja ili sekvence na osnovu pretpostavke.

### P1 — Položaj i izvođenje pokreta

1. **Sedeći pregib nogu: šta je „gornji položaj”?** Izvor traži „squeeze the hamstrings hard at the top”, a napredovanje „a clear top squeeze”. Nije navedeno da li položaj opisuje noge ili teret na spravi. Autor treba da imenuje tačnu fazu kontrakcije. Reference: [bulkProExercises.js](../../src/data/exercises/bulkProExercises.js), redovi 475, 481 i 970; [cutProExercises.js](../../src/data/exercises/cutProExercises.js), redovi 466 i 934.
2. **Bočno podizanje na spravi: početak i kraj pokreta.** „Start slightly below shoulder level” stoji uz „Stop around a clean parallel range”. Potvrditi da li se misli na podešavanje sprave, početni položaj ruku ili nameran delimičan opseg. Referenca: [bulkProExercises.js](../../src/data/exercises/bulkProExercises.js), redovi 593–595.
3. **Zagrevanje opruženim rukama: kada se savijaju laktovi?** „Band straight-arm pulldown … Feel lats before bending elbows” ne razdvaja ovu vežbu od mogućeg narednog pokreta. Potvrditi da li savijanje lakta pripada narednoj vežbi. Referenca: [bulkProWarmups.js](../../src/data/warmups/bulkProWarmups.js), red 51.

### P2 — Doziranje, uslovi i obećanja proizvoda

| Pitanje | Potrebna odluka | Izvor |
| --- | --- | --- |
| Mehanički dropset sklekova | Potvrditi niz široki → uski → pliometrijski sklekovi i naziv metode u odnosu na pomoć koja nalaže prelazak na lakšu varijantu. Ovo je sadržajno pitanje, odvojeno od poznatog problema identifikatora. | [bulkProExercises.js](../../src/data/exercises/bulkProExercises.js):804; [advancedTechniqueHelp.js](../../src/data/contextualHelp/advancedTechniqueHelp.js):92, 98–99 |
| Osnova procenata pri zagrevanju — ranije evidentirano | Navesti na koju težinu se procenti odnose. Prevod ne dodaje pretpostavku o radnoj težini ili maksimumu. | [bulkProWarmups.js](../../src/data/warmups/bulkProWarmups.js) i [cutProWarmups.js](../../src/data/warmups/cutProWarmups.js), procentualne uvodne serije |
| „Keep the single set long…” — ranije evidentirano | Potvrditi da li „long” označava trajanje serije ili opseg pokreta. Postojeći srpski prevod tumači ga kao veliki opseg; to tumačenje ostaje nepotvrđeno. | [cutProExercises.js](../../src/data/exercises/cutProExercises.js):514; [srpski prevod](../../src/i18n/sr-Latn/exercises.js):428 |
| Jedinica zagrevanja D5 | „1 easy assisted pull-up or light row” može se pročitati kao jedno ponavljanje, dok prethodna stavka izričito traži jednu seriju. Autor treba da potvrdi jedinicu. | [bulkProWarmups.js](../../src/data/warmups/bulkProWarmups.js):142; [cutProWarmups.js](../../src/data/warmups/cutProWarmups.js):142 |
| Dostupnost prethodnog ciklusa | Tekst obećava „uvid u prethodni rad”. Stari ciklusi jesu sačuvani i služe za prenos vrednosti, ali pregledane rute koriste samo tekući ciklus i nemaju birač arhive. Precizirati da li se obećava pristup celom starom dnevniku ili samo prethodne vrednosti. | [EndCyclePage.jsx](../../src/pages/EndCyclePage.jsx):143–145, 362; [appReducer.js](../../src/state/appReducer.js):105; [carryOverHelpers.js](../../src/utils/runtime/carryOverHelpers.js) |
| „Dodaj kardio … ako se napredak uspori” | U kontekstu Cut plana verovatno se misli na cilj definicije, ali sama stavka ne imenuje merilo. Potvrditi da li je reč o telesnoj težini/masti; izbeći tumačenje da pad učinka u vežbama automatski nalaže više kardija. | [cutProGuide.js](../../src/data/guides/cutProGuide.js):326 |

### P3 — Dodatna preciznost i doslednost izvora

- **Roler za podlaktice:** „1–2 rotations” / „1 rotation” ne definiše da li je jedinica okret ručki ili ceo ciklus namotavanja. Reference: [bulkProExercises.js](../../src/data/exercises/bulkProExercises.js):1178 i [cutProExercises.js](../../src/data/exercises/cutProExercises.js):1095.
- **Abduktor/aduktor:** „Switch sides” stoji uz objašnjenje da jedan krug čine abdukcija i adukcija. Potvrditi da li „strane” znače vežbe/smerove ili jednostrano izvođenje. Referenca: [cutProExercises.js](../../src/data/exercises/cutProExercises.js):538–540.
- **Dva stimulansa po mišićnoj grupi:** statički opisi oba plana tvrde „Each major muscle group is trained twice per cycle”, dok ruke imaju direktan rad i u dodatnim danima. Definisati šta tvrdnja podrazumeva pod velikom grupom i da li ubraja pomoćni rad. Ovaj statički tekst trenutno nije glavno obećanje aktivnog pregleda plana. Reference: [bulkPro.js](../../src/data/plans/bulkPro.js):22, [cutPro.js](../../src/data/plans/cutPro.js):23 i podaci dana D1/D2/D4/D5/D6.
- **D5 ima dva naziva:** vodiči koriste „Back Depth + Chest Pump”, a liste dana „Chest Pump & Rows”. Potvrditi jedinstven naziv/naglasak pre usklađivanja obe jezičke verzije. Reference: oba fajla u [guides](../../src/data/guides), red 216, i oba fajla u [days](../../src/data/days), red 37.

## Provere i granice pregleda

- `node --test tests/*.test.js` — prošla oba test fajla, lokalizacija i praćenje treninga, bez neuspeha. Postojeće provere obuhvataju prikaze na oba jezika, brojeve, promenljive u porukama, gramatičke oblike, prazna/delimična stanja i prenos vrednosti.
- `npm run lint` — prošao.
- `npm run build` — prošao. Ostaje postojeće upozorenje o veličini paketa; JavaScript je 913,02 kB, odnosno 259,54 kB gzip.
- `git diff --check` — prošao. Provera diff-a potvrđuje 21 promenjen prevod i iste engleske ključeve. Nisu menjani testovi da bi se prilagodili tekstu.
- Interaktivni pregled nije izvršen: Browser nije imao povezan pregledač. Provera konteksta zasniva se na komponentama, izvorima podataka, logici stanja i testovima renderovanja; ne predstavlja potvrdu vizuelnog rasporeda ili interakcija u pregledaču.
- Nisu menjani engleski originali, brojčani zahtevi treninga, identifikatori, rute, logika, čuvanje podataka, zavisnosti ili raspored elemenata. Poznati problem identifikatora naprednih metoda ostaje van ovog zadatka. Nije izvršen commit, push, merge ili deploy.
