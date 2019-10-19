const objects = require("../models/objects.js");

var express = require('express');
var router = express.Router();

const jwt = require('jsonwebtoken');
const jwtSecret = "averylongpassword";

router.post("/sell-object",
    (req, res, next) => checkToken(req, res, next),
    (req, res) => objects.sellObject(res, req.body, req.headers['x-access-token']));

router.post("/buy-object",
    (req, res, next) => checkToken(req, res, next),
    (req, res) => objects.buyObject(res, req.body, req.headers['x-access-token']));

router.get("/view-objects",
    (req, res, next) => checkToken(req, res, next),
    (req, res) => objects.viewObjects(res, req.body, req.headers['x-access-token']));

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
