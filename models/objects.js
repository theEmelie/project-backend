const db = require("../db/database.js");
const jwt = require('jsonwebtoken');
const jwtSecret = "averylongpassword";

const objects = {
    buyObject: function(res, body, my_token) {
        const rowid = body.rowid;
        const name = body.name;
        const number_to_buy = body.number_to_buy;
        const auth_data = jwt.verify(my_token, jwtSecret);
        const email = auth_data.email;

        db.get("SELECT rowid, * FROM objects WHERE rowid = ?",
            rowid,
            (err, rows) => {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            source: "/objects/buy-object",
                            title: "Database error",
                            detail: err.message
                        }
                    });
                }
                if (rows !== undefined) {
                    // found item to buy. Now check funds
                    // find user
                    db.get("SELECT rowid, * FROM users WHERE email = ?",
                    email,
                    (err, user_rows) => {
                        if (err) {
                            return res.status(500).json({
                                errors: {
                                    status: 500,
                                    source: "/objects/buy-object",
                                    title: "Database error",
                                    detail: err.message
                                }
                            });
                        }
                        // found user, now get depot for user
                        if (user_rows !== undefined) {
                            db.get("SELECT rowid, * FROM depots WHERE user_rowid = ?",
                            user_rows.rowid,
                            (err, depot_rows) => {
                                if (err) {
                                    return res.status(500).json({
                                        errors: {
                                            status: 500,
                                            source: "/objects/buy-object",
                                            title: "Database error",
                                            detail: err.message
                                        }
                                    });
                                }
                                // checking depot exist
                                if (depot_rows !== undefined) {
                                    // check user can afford item
                                    const purchase_price = number_to_buy * rows.current_price;

                                    if (depot_rows.balance >= purchase_price) {
                                        // user has enough balance
                                        const new_balance = depot_rows.balance - purchase_price;

                                        db.run("UPDATE depots SET balance = ? WHERE user_rowid = ?",
                                        new_balance,
                                        user_rows.rowid,
                                        (err) => {
                                            if (err) {
                                                return res.status(500).json({
                                                    errors: {
                                                        status: 500,
                                                        source: "/objects/buy-object",
                                                        title: "Database error",
                                                        detail: err.message
                                                    }
                                                });
                                            }
                                        });
                                        // check if depot already has item
                                        db.get("SELECT rowid, * FROM objects_in_depot WHERE depot_rowid = ? AND object_rowid = ?",
                                        depot_rows.rowid,
                                        rows.rowid,
                                        (err, obj_depot) => {
                                            if (err) {
                                                return res.status(500).json({
                                                    errors: {
                                                        status: 500,
                                                        source: "/objects/buy-object",
                                                        title: "Database error",
                                                        detail: err.message
                                                    }
                                                });
                                            }
                                            if (obj_depot !== undefined) {
                                                // update objects_in_depot
                                                const new_number = parseInt(obj_depot.number_of_objects) + parseInt(number_to_buy);

                                                db.get("UPDATE objects_in_depot SET number_of_objects = ? WHERE rowid = ?",
                                                new_number,
                                                obj_depot.rowid,
                                                (err) => {
                                                    if (err) {
                                                        return res.status(500).json({
                                                            errors: {
                                                                status: 500,
                                                                source: "/objects/buy-object",
                                                                title: "Database error",
                                                                detail: err.message
                                                            }
                                                        });
                                                    } else {
                                                        return res.status(201).json({
                                                            data: {
                                                                message: "Purchase complete. You have bought " + number_to_buy + " " + rows.name + " which has cost you " + purchase_price,
                                                                number_to_buy: number_to_buy,
                                                                name: rows.name,
                                                                purchase_price: purchase_price
                                                            }
                                                        });
                                                    }
                                                });
                                            } else {
                                                // insert into objects_in_depot
                                                db.get("INSERT INTO objects_in_depot (depot_rowid, object_rowid, number_of_objects) VALUES (?,?,?)",
                                                depot_rows.rowid,
                                                rows.rowid,
                                                number_to_buy,
                                                (err) => {
                                                    if (err) {
                                                        return res.status(500).json({
                                                            errors: {
                                                                status: 500,
                                                                source: "/objects/buy-object",
                                                                title: "Database error",
                                                                detail: err.message
                                                            }
                                                        });
                                                    } else {
                                                        return res.status(201).json({
                                                            data: {
                                                                message: "Purchase complete. You have bought " + number_to_buy + " " + rows.name + " which has cost you " + purchase_price,
                                                                number_to_buy: number_to_buy,
                                                                name: rows.name,
                                                                purchase_price: purchase_price
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    } else {
                                        // user doesnt have enough balance
                                        return res.status(402).json({
                                            errors: {
                                                status: 402,
                                                source: "/objects/buy-object",
                                                title: "Insufficent balance",
                                                detail: "User doesnt have enough funds"
                                            }
                                        });
                                    }
                                } else {
                                    // user has no depot
                                    return res.status(402).json({
                                        errors: {
                                            status: 402,
                                            source: "/objects/buy-object",
                                            title: "User has no balance",
                                            detail: "User doesnt have enough funds"
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            source: "/objects/buy-object",
                            title: "Invalid item",
                            detail: "Invalid item selected"
                        }
                    });
                }
            });
    },
    sellObject: function(res, body, my_token) {
        const object_rowid = body.rowid;
        const number_to_sell = body.number_to_sell;
        const auth_data = jwt.verify(my_token, jwtSecret);
        const email = auth_data.email;

        db.each("SELECT u.rowid as user_rowid, u.name as username, d.balance, " +
            "d.rowid as depot_rowid, object_rowid, number_of_objects, o.name as objname, o.current_price, oid.rowid as oid_rowid " +
            "FROM users u " +
            "LEFT JOIN depots d ON u.rowid = d.user_rowid " +
            "LEFT JOIN objects_in_depot oid ON d.rowid = oid.depot_rowid " +
            "LEFT JOIN objects o ON o.rowid = oid.object_rowid " +
            "WHERE u.email = ? AND oid.object_rowid = ?;",
            email,
            object_rowid,
            function (err, rows) {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            source: "/depots/view-depot",
                            title: "Database error",
                            detail: err.message
                        }
                    });
                }
                if (rows.number_of_objects >= number_to_sell) {
                    // Enough objects to sell
                    const sale_funds = parseFloat(rows.current_price) * parseInt(number_to_sell);
                    const new_number = parseInt(rows.number_of_objects) - parseInt(number_to_sell);
                    const new_balance = parseFloat(rows.balance) + sale_funds;

                    db.get("UPDATE objects_in_depot SET number_of_objects = ? WHERE rowid = ?",
                    new_number,
                    rows.oid_rowid,
                    (err) => {
                        if (err) {
                            return res.status(500).json({
                                errors: {
                                    status: 500,
                                    source: "/objects/buy-object",
                                    title: "Database error",
                                    detail: err.message
                                }
                            });
                        }
                        db.get("UPDATE depots SET balance = ? WHERE rowid = ?",
                        new_balance,
                        rows.depot_rowid,
                        (err) => {
                            if (err) {
                                return res.status(500).json({
                                    errors: {
                                        status: 500,
                                        source: "/objects/buy-object",
                                        title: "Database error",
                                        detail: err.message
                                    }
                                });
                            }
                            return res.status(201).json({
                                data: {
                                    message: "Sale complete. You have sold " + number_to_sell + " " + rows.objname + " for " + sale_funds,
                                    object_rowid: rows.object_rowid,
                                    number_of_objects: new_number,
                                    objname: rows.objname,
                                    balance: new_balance,
                                    number_to_sell: number_to_sell,
                                    sale_funds: sale_funds
                                }
                            });
                        });
                    }
                );
                } else {
                    // Not enough objects to sell
                    return res.status(402).json({
                        errors: {
                            status: 402,
                            source: "/objects/sell-object",
                            title: "Insufficent items",
                            detail: "User doesnt have the items to sell"
                        }
                    });
                }
            });
    },
    viewObjects: function(res, body, my_token) {
        var objects = [];

        db.each("SELECT rowid, * FROM objects",
        function (err, row) {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: "/depots/view-depot",
                        title: "Database error",
                        detail: err.message
                    }
                });
            }
            objects.push({rowid: row.rowid, name: row.name, current_price: row.current_price, });
            }, function() {
                return res.json({ data: objects });
            }
        );
    },

    updatePrices: function(priceCallback) {
        let items;
        let rate = 1.000;
        let variance = 0.8;

        // Get all objects
        items = db.all("SELECT rowid, * FROM objects",
        function (err, objects) {
            if (err) {
                console.log(err);
            }
            // Update prices for all objects and write back to db
            objects.forEach(function(item) {
                item.current_price = Math.round(100*(item.current_price * rate + variance * (Math.random() - 0.5)))/100;

                db.get("UPDATE objects SET current_price = ? WHERE rowid = ?",
                item.current_price,
                item.rowid
                );
            });
            priceCallback(objects);
        });
    }
};

module.exports = objects;
