var express = require('express');
var router = express.Router();

const jwt = require('jsonwebtoken');
// const payload = { email: "user@example.com" };
const jwtSecret = "averylongpassword";
// const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h'});

const reports = require("../models/reports.js");

function checkTokens(req, res, next) {
    // console.log("checking token");
    const token = req.headers['x-access-token'];

    jwt.verify(token, jwtSecret, function(err) {
        // console.log(err);
        if (err) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/reports",
                    title: "Unauthorized",
                    detail: err.message
                }
            });
        }
        // Valid token send on the request
        next();
    });
}

router.get('/week/:weeknumber', function(req, res) {
    reports.getWeeklyReport(res, req.params.weeknumber);
});

router.get('/get-weeknumbers', function(req, res) {
    reports.getWeeknumbers(res);
});

router.get('/edit-week/:weeknumber',
    (req, res, next) => checkTokens(req, res, next),
    (req, res) => reports.getWeeklyReport(res, req.params.weeknumber));

router.post('/update-report/',
    (req, res, next) => checkTokens(req, res, next),
    (req, res) => reports.updateReport(res, req.body));


module.exports = router;
