const db = require("../db/database.js");
const jwt = require('jsonwebtoken');
const jwtSecret = "averylongpassword";

const depots = {
    viewDepot: function(res, body, my_token) {
        const auth_data = jwt.verify(my_token, jwtSecret);
        const email = auth_data.email;
        var depot_contents = [];

        console.log(email);

        db.each("SELECT u.rowid as user_rowid, u.name as username, d.balance, d.rowid as depot_rowid, object_rowid, number_of_objects, o.name as objname " +
            "FROM users u " +
            "LEFT JOIN depots d ON u.rowid = d.user_rowid " +
            "LEFT JOIN objects_in_depot oid ON d.rowid = oid.depot_rowid " +
            "LEFT JOIN objects o ON o.rowid = oid.object_rowid " +
            "WHERE u.email = ?;",
            email,
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
                depot_contents.push({user_rowid: row.user_rowid,
                    username: row.username, balance: row.balance, object_rowid: row.object_rowid,
                    number_of_objects: row.number_of_objects, objname: row.objname});
                }, function() {
                    console.log(depot_contents);
                    return res.json({ data: depot_contents });
                });
    },

    addFunds: function(res, body, my_token) {
        const auth_data = jwt.verify(my_token, jwtSecret);
        const email = auth_data.email;
        const funds = body.funds;

        db.get("SELECT u.rowid as user_rowid, d.balance, d.rowid as depot_rowid " +
            "FROM users u " +
            "LEFT JOIN depots d ON u.rowid = d.user_rowid " +
            "WHERE u.email = ?;",
            email,
            (err, rows) => {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            source: "/depots/add-funds",
                            title: "Database error",
                            detail: err.message
                        }
                    });
                }
                console.log(rows);
                const new_balance = parseInt(funds) + parseInt(rows.balance);

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
                    } else {
                        return res.status(201).json({
                            data: {
                                message: funds + " has been added to your balance. Your new balance is " + new_balance
                            }
                        });
                    }
                });
            }
        );
    }
};

module.exports = depots;
