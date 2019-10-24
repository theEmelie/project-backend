/* eslint-env node, mocha */

process.env.NODE_ENV = 'test';

const db = require("../db/database.js");
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');
const { exec } = require('child_process');

chai.should();

chai.use(chaiHttp);

describe('Testing auth, object and depot functions', () => {
    beforeEach(function (done) {
      setTimeout(function() {
        done();
      }, 500);
    });

    before(() => {
        return new Promise((resolve) => {
            db.run("DELETE FROM users", (err) => {
                if (err) {
                    console.error("Could not empty test DB table users", err.message);
                }
                db.run("DELETE FROM objects", (err) => {
                    if (err) {
                        console.error("Could not empty test DB table objects", err.message);
                    }
                    db.run("DELETE FROM depots", (err) => {
                        if (err) {
                            console.error("Could not empty test DB table depots", err.message);
                        }
                        db.run("DELETE FROM objects_in_depot", (err) => {
                            if (err) {
                                console.error("Could not empty test DB table objects_in_depot", err.message);
                            }
                            exec(
                                'cat db/test-data.sql | sqlite3 db/test.sqlite',
                                (error, stdout, stderr) => {
                                    if (error) {
                                        console.error(error.message);
                                        return;
                                    }

                                    if (stderr) {
                                        console.error(stderr);
                                        return;
                                    }

                                    resolve();
                                });
                        });
                    });
                });
            });
        });
    });


    describe('POST /register', () => {
        it('should get 401 as we do not provide email', (done) => {
            let user = {
                name: "example",
                // email: "test@example.com",
                password: "123test",
                birthdate: "1990-10-10"
            };

            chai.request(server)
                .post("/auth/register")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });
        it('should get 401 as we do not provide password', (done) => {
            let user = {
                name: "example",
                email: "test@example.com",
                // password: "123test",
                birthdate: "1990-10-10"
            };

            chai.request(server)
                .post("/auth/register")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 201 HAPPY PATH', (done) => {
            let user = {
                name: "example",
                email: "test@example.com",
                password: "123test",
                birthdate: "1990-10-10"
            };

            chai.request(server)
                .post("/auth/register")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");
                    res.body.data.should.have.property("message");
                    res.body.data.message.should.equal("User successfully registered.");

                    done();
                });
        });
    });

    describe('POST /login', () => {
        it('should get 401 as we do not provide email', (done) => {
            let user = {
                //email: "test@example.com",
                password: "123test",
            };

            chai.request(server)
                .post("/auth/login")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 401 as we do not provide password', (done) => {
            let user = {
                email: "test@example.com",
                // password: "123test",
            };

            chai.request(server)
                .post("/auth/login")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 401 as user not found', (done) => {
            let user = {
                email: "nobody@example.com",
                password: "123test"
            };

            chai.request(server)
                .post("/auth/login")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 401 incorrect password', (done) => {
            let user = {
                email: "test@example.com",
                password: "wrongpassword"
            };

            chai.request(server)
                .post("/auth/login")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 200 HAPPY PATH', (done) => {
            let user = {
                email: "test@example.com",
                password: "123test",
            };

            chai.request(server)
                .post("/auth/login")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");
                    res.body.data.should.have.property("type");
                    res.body.data.type.should.equal("success");
                    res.body.data.should.have.property("type");

                    done();
                });
        });
    });

    describe('GET/POST /objects', () => {
        it('view objects', (done) => {
            let user = {
                email: "test@example.com",
                password: "123test",
            };

            chai.request(server)
                .post("/auth/login")
                .send(user)
                .end((err, res) => {
                    // console.log(res.body.data.token);

                    chai.request(server)
                        .get("/objects/view-objects")
                        .set({"x-access-token": res.body.data.token})
                        .end((err, res) => {
                            res.body.should.be.an("object");
                            res.body.data[0].name.should.equal("Plastros");
                        });
                    done();
                });
        });

        it('should get error 402 - buy object if no depot', (done) => {
            let user = {
                email: "test@example.com",
                password: "123test",
            };

            let obj = {
                rowid: "1",
                name: "Plastros",
                number_to_buy: "2"
            };

            chai.request(server)
                .post("/auth/login")
                .send(user)
                .end((err, res) => {
                    // console.log(res.body.data.token);

                    chai.request(server)
                        .post("/objects/buy-object")
                        .send(obj)
                        .set({"x-access-token": res.body.data.token})
                        .end((err, res) => {
                            res.should.have.status(402);
                            res.body.should.be.an("object");
                            res.body.errors.title.should.be.equal("User has no balance");
                            res.body.errors.detail.should.be.equal("User doesnt have enough funds");
                            res.body.errors.status.should.be.equal(402);
                        });
                    done();
                });
        });

        it('adding funds to depot', (done) => {
            let user = {
                email: "test@example.com",
                password: "123test",
            };

            let obj = {
                funds: "500"
            };

            chai.request(server)
                .post("/auth/login")
                .send(user)
                .end((err, res) => {
                    // console.log(res.body.data.token);

                    chai.request(server)
                        .post("/depots/add-funds")
                        .send(obj)
                        .set({"x-access-token": res.body.data.token})
                        .end((err, res) => {
                            res.should.have.status(201);
                            res.body.should.be.an("object");
                            res.body.data.new_balance.should.be.equal(500);
                            res.body.data.message.should.be.equal("500 has been added to your balance. Your new balance is 500");
                        });
                    done();
                });
        });

        it('should get HAPPY PATH 201 - buy 2 objects', (done) => {
            let user = {
                email: "test@example.com",
                password: "123test",
            };

            let obj = {
                rowid: "1",
                name: "Plastros",
                number_to_buy: "2"
            };

            chai.request(server)
                .post("/auth/login")
                .send(user)
                .end((err, res) => {
                    // console.log(res.body.data.token);

                    chai.request(server)
                        .post("/objects/buy-object")
                        .send(obj)
                        .set({"x-access-token": res.body.data.token})
                        .end((err, res) => {
                            res.should.have.status(201);
                            res.body.should.be.an("object");
                            res.body.data.number_to_buy.should.be.equal("2");
                            res.body.data.name.should.be.equal("Plastros");
                        });
                    done();
                });
        });

        it('should get HAPPY PATH 201 - buy same object again', (done) => {
            let user = {
                email: "test@example.com",
                password: "123test",
            };

            let obj = {
                rowid: "1",
                name: "Plastros",
                number_to_buy: "3"
            };

            chai.request(server)
                .post("/auth/login")
                .send(user)
                .end((err, res) => {
                    // console.log(res.body.data.token);

                    chai.request(server)
                        .post("/objects/buy-object")
                        .send(obj)
                        .set({"x-access-token": res.body.data.token})
                        .end((err, res) => {
                            res.should.have.status(201);
                            res.body.should.be.an("object");
                            res.body.data.number_to_buy.should.be.equal("3");
                            res.body.data.name.should.be.equal("Plastros");
                        });
                    done();
                });
        });

        it('should get error 402 - buy more object than we got money for', (done) => {
            let user = {
                email: "test@example.com",
                password: "123test",
            };

            let obj = {
                rowid: "1",
                name: "Plastros",
                number_to_buy: "10"
            };

            chai.request(server)
                .post("/auth/login")
                .send(user)
                .end((err, res) => {
                    chai.request(server)
                        .post("/objects/buy-object")
                        .send(obj)
                        .set({"x-access-token": res.body.data.token})
                        .end((err, res) => {
                            res.should.have.status(402);
                            res.body.should.be.an("object");
                            res.body.errors.title.should.be.equal("Insufficent balance");
                            res.body.errors.detail.should.be.equal("User doesnt have enough funds");
                            res.body.errors.status.should.be.equal(402);
                        });
                    done();
                });
        });

        it('should get error 500 - buy object with invalid rowid', (done) => {
            let user = {
                email: "test@example.com",
                password: "123test",
            };

            let obj = {
                rowid: "2",
                name: "Plastros",
                number_to_buy: "10"
            };

            chai.request(server)
                .post("/auth/login")
                .send(user)
                .end((err, res) => {
                    // console.log(res.body.data.token);

                    chai.request(server)
                        .post("/objects/buy-object")
                        .send(obj)
                        .set({"x-access-token": res.body.data.token})
                        .end((err, res) => {
                            res.should.have.status(500);
                            res.body.should.be.an("object");
                            res.body.errors.title.should.be.equal("Invalid item");
                            res.body.errors.detail.should.be.equal("Invalid item selected");
                            res.body.errors.status.should.be.equal(500);
                        });
                    done();
                });
        });

        it('should get error 402 - sell more objects than we own', (done) => {
            let user = {
                email: "test@example.com",
                password: "123test",
            };

            let obj = {
                rowid: "1",
                number_to_sell: "10"
            };

            chai.request(server)
                .post("/auth/login")
                .send(user)
                .end((err, res) => {
                    // if (err) {done(err);}
                    // console.log(res.body.data.token);

                    chai.request(server)
                        .post("/objects/sell-object")
                        .send(obj)
                        .set({"x-access-token": res.body.data.token})
                        .end((err, res) => {
                            res.should.have.status(402);
                            res.body.should.be.an("object");
                            res.body.errors.title.should.be.equal("Insufficent items");
                            res.body.errors.detail.should.be.equal("User doesnt have the items to sell");
                            res.body.errors.status.should.be.equal(402);
                        });
                    done();
                });
        });

        it('should get HAPPY PATH 201 - sell one object', (done) => {
            let user = {
                email: "test@example.com",
                password: "123test",
            };

            let obj = {
                rowid: "1",
                number_to_sell: "1"
            };

            chai.request(server)
                .post("/auth/login")
                .send(user)
                .end((err, res) => {
                    // console.log(res.body.data.token);

                    chai.request(server)
                        .post("/objects/sell-object")
                        .send(obj)
                        .set({"x-access-token": res.body.data.token})
                        .end((err, res) => {
                            // if (err) {done(err);}
                            // console.log(res.body);
                            res.should.have.status(201);
                            res.body.should.be.an("object");
                            res.body.data.object_rowid.should.be.equal(1);
                            res.body.data.number_of_objects.should.be.equal(4);
                            res.body.data.objname.should.be.equal("Plastros");
                            res.body.data.number_to_sell.should.be.equal("1");
                        });
                    done();
                });
        });
    });

    describe('GET/POST /depots', () => {
        it('should get 201 - adding funds to depot when depot exists', (done) => {
            let user = {
                email: "test@example.com",
                password: "123test",
            };

            let obj = {
                funds: "100"
            };

            chai.request(server)
                .post("/auth/login")
                .send(user)
                .end((err, res) => {
                    // console.log(res.body.data.token);

                    chai.request(server)
                        .post("/depots/add-funds")
                        .send(obj)
                        .set({"x-access-token": res.body.data.token})
                        .end((err, res) => {
                            // if (err) {done(err);}
                            res.should.have.status(201);
                            res.body.should.be.an("object");
                        });
                    done();
                });
        });

        it('view depot', (done) => {
            let user = {
                email: "test@example.com",
                password: "123test",
            };

            chai.request(server)
                .post("/auth/login")
                .send(user)
                .end((err, res) => {
                    // console.log(res.body.data.token);

                    chai.request(server)
                        .get("/depots/view-depot")
                        .set({"x-access-token": res.body.data.token})
                        .end((err, res) => {
                            res.body.should.be.an("object");
                            res.body.data[0].user_rowid.should.be.equal(1);
                            res.body.data[0].username.should.be.equal("example");
                            res.body.data[0].object_rowid.should.be.equal(1);
                            res.body.data[0].number_of_objects.should.be.equal(4);
                            res.body.data[0].objname.should.be.equal("Plastros");
                        });
                    done();
                });
        });
    });

    describe('GET /', () => {
        it('get homepage data', (done) => {
            chai.request(server)
                .get("/")
                .end((err, res) => {
                    res.body.should.be.an("object");
                    res.body.data[0].msg.length.should.be.above(400);
                });
            done();
        });
    });
});
