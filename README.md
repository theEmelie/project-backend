[![Build Status](https://travis-ci.org/theEmelie/project-backend.svg?branch=master)](https://travis-ci.org/theEmelie/project-backend)
[![Code Coverage](https://scrutinizer-ci.com/g/theEmelie/project-backend/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/theEmelie/project-backend/?branch=master)
[![Build Status](https://scrutinizer-ci.com/g/theEmelie/project-backend/badges/build.png?b=master)](https://scrutinizer-ci.com/g/theEmelie/project-backend/build-status/master)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/theEmelie/project-backend/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/theEmelie/project-backend/?branch=master)

This is the backend for a project in course jsramverk

To run the project
======================
`npm start`

To run the tests
======================
`npm test`



Backend
======================
För att skapa de olika databaserna har jag använt mig utav sqlite. Jag har en migrate.sql fil där jag skapar de olika databaserna som jag
behöver (user, depot, object och object in depot). Och i objects.sql lägger jag in alla mina objekt till object tabellen. Sedan med hjälp utav project.sqlite läser jag in dom två filerna (.read).

I min app.js inkluderar jag dom olika routsen som jag använder. Jag använder cors som tillåter cross-domain communication från webbläsaren och sedan använder jag bodyParser som är en middleware och parsar json data.

Jag har två olika mappar, 'models' och 'routes'. Allt i 'routes' sätter routrarna och i vissa fall kollar om ett token existerar (när en användare än inloggad skapas ett token) och kallar på en funktion som finns i 'models' som berättar vad som ska finnas i de olika routsen.

Om vi börjar med auth, så i routern har jag två post funktioner, login och register. Och i den börjar vi med register funktionen, vi sparar 'email', 'password', 'name' och 'birthdate' ifrån våran databas. Och vi börjar med att kolla om inte email eller lösenord finns så får man ett felmeddelande. Finns dom så gör vi en hash på lösenordet, med hjälp utav en inbyggd funktion. Och har allt gått som det ska så gör vi en 'db.run' och lägger in all data som användaren skrivit. För login funktionen gör vi något liknande, men där måste vi även kolla att användaren finns och att lösenordet matchar.

Om vi fortsätter med depots, så i routern har jag även där två funktioner, en post funktion för att lägga till medel och en get funktion för att se medlet. Innan vi kallar på funktionen så kollar vi först användarens token, dvs att en användare är inloggad. Och sedan hoppar vi in i våran model, vi börjar med view funktionen och där sparar vi våran'auth data' som är bl.a. vårat token, och därifrån sparar vi även våran email. Sedan gör vi en 'db.each' på allt som vi vill använda i våran depot, såsom vilken användare, medel, antal objekt i vårat depot och nuvarande pris. Går allting bra utan något error så sparar vi all data som vi vill använda i frontenden i 'depot_contents' och det är även det vi returnerar. Sedan i funktionen addFunds, även där sparar vi auth data och email, men även funds (medel). Som i view väljer vi de vi vill använda i en db get. Vi kollar om användaren redan har ett depå eller inte, har dom det så gör vi endast en update på deras depå, annars måste vi skapa ett. Går allting bra så sparar vi allt och returnerar vårat nya medel.

Och till sist så ska vi göra våra objekt, i våran route så kallar vi på tre olika funktioner, två post som är 'sell-object' och 'buy-object' och en get funktion som är view-objects. Och som med depåt så kollar vi användarens token innan vi fortsätter till modelen. I våran view funktion så sparar vi objects till en tom array som vi sedan använder för att lägga in alla objekt i vilket vi gör med en enkel select all. I våran köp funktion så så börjar vi med att spara/sätta id, namn, antal och auth data. Vi har en ganska stor 'db.get', vi behöver kolla många delar innan vi kan köpa. Vi måste kolla att användaren existerar och om den gör det så måste vi kolla om depåt existerar, gör den det så kollar vi om användaren har tillräckligt med medel, har dom det så kollar vi om användaren redan har objektet som dom vill köpa, har dom det så behöver vi endast uppdatera antalen objekt i depåt annars måste vi göra en insert. Har inte användaren tillräckligt med medel kommer ett error. Sedan till våran sälj objekt funktion så börjar vi med att spara/sätta id:et för objektet, antal att sälja och auth data. Sedan gör vi en 'db.each' där vi väljer allt som vi vill använda såsom användaren, id för objekt och depå, antal objekt, objekt namn och nuvarande pris. Sedan kollar vi om användaren att tillräckligt med objekt för att sälja (vill användaren sälja 5st men bara har 3st så går det inte) så uppdaterar vi antal objekt i depå och vi uppdaterar användarens medel. Går allt bra returnerar vi den data som vi vill att frontenden ska kunna använda.

Realtid
======================
Vi vill att priset på våra objekt ska vara dynamiskt med hjälp utav sockets.
Vi börjar med att importera dom funktionerna vi behöver för att skapa en socket io server. Vi anger en annan port för våran socket och sedan ger en io.origins vilket är våran frontend adress. Vi gör en enkel 'io.on' connection så vi kan se när en användare har anslutit sig till servern, och en 'socket.on' disconnect när användaren har försvunnit. Sedan har jag en funktion som heter 'pricesUpdated' som tar emot argumentet 'items', och där gör vi en 'io.emit' på newPrices och items, vilket gör att vi kan använda dom i våran frontend senare. Och till sist gör vi en funktion 'setInterval' där vi kallar på en ny funktion 'updatePrices' som vi kommer skapa i våran objekt model och vi har våran föregående funktion som ett argument till den och visätter en interval på 5 sekunder (priserna kommer uppdateras var femte sekund). I våran model så börjar vi med att sätta rate till 1.000 och variance till 0.8, vill man att priserna ska variera med eller mindre så kan man ändra 0.8 och vill man att priserna endast ska gå upp eller ner så kan man ändra 1.000. Sedan hämter vi alla våra objekt med en 'db.all' och till sist uppdaterar vi våra priser för alla objekt och skriver tillbaka till databasen med en foreach loop.

Test
======================
För att testa backenden har jag valt att använda Chai och Mocha. Då det är dom vi använde i föregående kursmoment så kändes det som en bra idé att återanvända verktyg som man är van vid. Jag har inte gjort några enhetstester då jag inte ritkigt vet vad jag skulle kunna testa eftersom det mesta har med databasen att göra. Jag har även inte testat alla 'Database Error' för dom vet jag inte riktigt hur jag ska testa. Jag fick en del problem med min testning som jag i början inte förstod varför, för ibland fick jag fel, men ibland inte. Och det visade sig vara för att alla tester behöver inte vara klara innan nästa test börjar, och en del tester är helt beroende på andra tester t.ex. för att kunna testa att köpa ett objekt så måste vi först ha ett test som lägger in medel på vårat depå. Och det har ju med att göra att funktionerna i våra modeller är asyncade. För att lösa detta så har jag en beforeEach funktion i början där jag sätter en timeout på 500ms, och efter att varje test har körts så kommer den här funktionen kallas och på så sätt kommer alla tester att hamna i rätt ordning. Jag tycker att jag har fått hyfsat bra kodtäckning, om man kollar genom Mocha kan man se att allt är över 80% i Stmts (Sammanlagt 87.5%), över 50% i Branch (Sammanlagt 66.22%) och alla förutom en fil (app.js) är på 100% i Funcs (94.55%) och allt är över 80% i Lines (Sammanlagt 87.34%).

|-------------|----------|----------|----------|----------|
| File        |  % Stmts | % Branch |  % Funcs |  % Lines |
|-------------|----------|----------|----------|----------|
| All files   |     87.5 |    66.22 |    94.55 |    87.34 |
|-------------|----------|----------|----------|----------|

Till min CI-kedja har jag valt att använda Travis och Scrutinizer. Även dom har jag valt eftersom vi använde dom i föregående kursmoment.
Jag tycker inte att Travis ger så jätte mycket för mig, den säger mest om testen har gått igenom eller inte. Jag gillar scrutinizer mer, man kan se kodtäckningen och även kod kvaliteten och på så sätt kan man sträva efter att göra sina tester bättre. Jag fick mina tester godkända utav både Travis och Scrutinizer. I scrutinizer fick jag 87% kodtäckning och 5.75 i kodkvalitet. Jag är nöjd över min kodtäckning, jag är inte lika nöjd över kodkvaliteten, men det verkar vara för att jag har för "komplicerade" kodtester, men jag känner att det blir lite så utav hur jag testar allting, som jag nämnde ovan är mycket beroende utav varandra. Men i helhet är jag nöjd.
