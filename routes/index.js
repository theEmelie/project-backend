var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    const data = {
        data: [
            {
                msg: "Välkommen till Hummingbird Creations! Vi är ett trading företag som " +
                "specialiserar oss på blommor. Vårat nuvarande utbud är rosor, tulpaner, liljor " +
                "orkidéer och pioner. Priset på blommorna varierar beroende på hur blomhandeln " +
                "ser ut för tillfället. Som medlem kan du köpa blommor och sälja till andra " +
                "användare. För att kunna köpa måste du först lägga in pengar på ett konto. " +
                "Vi är ett verifierat företag så du kan lita på oss!"
            }
        ]
    };

    res.json(data);
});

module.exports = router;
