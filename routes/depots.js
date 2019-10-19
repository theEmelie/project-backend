const depots = require("../models/depots.js");

var express = require('express');
var router = express.Router();

const jwt = require('jsonwebtoken');
const jwtSecret = "averylongpassword";

router.get("/view-depot",
    (req, res, next) => checkToken(req, res, next),
    (req, res) => depots.viewDepot(res, req.body, req.headers['x-access-token']));

router.post("/add-funds",
    (req, res, next) => checkToken(req, res, next),
    (req, res) => depots.addFunds(res, req.body, req.headers['x-access-token']));

function checkToken(req, res, next) {
    const token = req.headers['x-access-token'];

    jwt.verify(token, jwtSecret, function(err) {
        if (err) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/objects",
                    title: "Unauthorized",
                    detail: err.message
                }
            });
        }
        // Valid token send on the request
        next();
    });
}

module.exports = router;
