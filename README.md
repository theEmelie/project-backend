This is the backend for a project in course jsramverk

To run the project
======================
npm start


Backend
======================
För att skapa de olika databaserna har jag använt mig utav sqlite. Jag har en migrate.sql fil där jag skapar de olika databaserna som jag
behöver (user, depot, object och object in depot). Och i objects.sql lägger jag in alla mina objekt till object tabellen. Sedan med hjälp utav texts.sqlite läser jag in dom två filerna (.read).

I min app.js inkluderar jag dom olika routsen som jag använder. Jag använder cors som tillåter cross-domain communication från webbläsaren och sedan använder jag bodyParser som är en middleware och parsar json data.

Jag har två olika mappar, 'models' och 'routes'. Allt i 'routes' sätter routrarna och i vissa fall kollar om ett token existerar (när en användare än inloggad skapas ett token) och kallar på en funktion som finns i 'models' som berättar vad som ska finnas i de olika routsen.
