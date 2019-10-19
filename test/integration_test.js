/* eslint-env node, mocha */

process.env.NODE_ENV = 'test';

const db = require("../db/database.js");
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');
const { exec } = require('child_process');

chai.should();

chai.use(chaiHttp);


// describe('Testing auth and report functions', () => {
//     before(() => {
//         return new Promise((resolve) => {
//             db.run("DELETE FROM users", (err) => {
//                 if (err) {
//                     console.error("Could not empty test DB table users", err.message);
//                 }
//                 db.run("DELETE FROM reports", (err) => {
//                     if (err) {
//                         console.error("Could not empty test DB table reports", err.message);
//                     }
//                     exec(
//                         'cat db/test-data.sql | sqlite3 db/test.sqlite',
//                         (error, stdout, stderr) => {
//                             if (error) {
//                                 console.error(error.message);
//                                 return;
//                             }
//
//                             if (stderr) {
//                                 console.error(stderr);
//                                 return;
//                             }
//
//                             resolve();
//                         });
//                 });
//             });
//         });
//     });
//
//
//     describe('POST /register', () => {
//         it('should get 401 as we do not provide email', (done) => {
//             let user = {
//                 name: "example",
//                 // email: "test@example.com",
//                 password: "123test",
//                 birthdate: "1990-10-10"
//             };
//
//             chai.request(server)
//                 .post("/auth/register")
//                 .send(user)
//                 .end((err, res) => {
//                     res.should.have.status(401);
//                     res.body.should.be.an("object");
//                     res.body.errors.status.should.be.equal(401);
//                     done();
//                 });
//         });
//         it('should get 401 as we do not provide password', (done) => {
//             let user = {
//                 name: "example",
//                 email: "test@example.com",
//                 // password: "123test",
//                 birthdate: "1990-10-10"
//             };
//
//             chai.request(server)
//                 .post("/auth/register")
//                 .send(user)
//                 .end((err, res) => {
//                     res.should.have.status(401);
//                     res.body.should.be.an("object");
//                     res.body.errors.status.should.be.equal(401);
//                     done();
//                 });
//         });
//
//         it('should get 201 HAPPY PATH', (done) => {
//             let user = {
//                 name: "example",
//                 email: "test@example.com",
//                 password: "123test",
//                 birthdate: "1990-10-10"
//             };
//
//             chai.request(server)
//                 .post("/auth/register")
//                 .send(user)
//                 .end((err, res) => {
//                     res.should.have.status(201);
//                     res.body.should.be.an("object");
//                     res.body.should.have.property("data");
//                     res.body.data.should.have.property("message");
//                     res.body.data.message.should.equal("User successfully registered.");
//
//                     done();
//                 });
//         });
//     });
//
//     describe('POST /login', () => {
//         it('should get 401 as we do not provide email', (done) => {
//             let user = {
//                 //email: "test@example.com",
//                 password: "123test",
//             };
//
//             chai.request(server)
//                 .post("/auth/login")
//                 .send(user)
//                 .end((err, res) => {
//                     res.should.have.status(401);
//                     res.body.should.be.an("object");
//                     res.body.errors.status.should.be.equal(401);
//                     done();
//                 });
//         });
//
//         it('should get 401 as we do not provide password', (done) => {
//             let user = {
//                 email: "test@example.com",
//                 // password: "123test",
//             };
//
//             chai.request(server)
//                 .post("/auth/login")
//                 .send(user)
//                 .end((err, res) => {
//                     res.should.have.status(401);
//                     res.body.should.be.an("object");
//                     res.body.errors.status.should.be.equal(401);
//                     done();
//                 });
//         });
//
//         it('should get 401 as user not found', (done) => {
//             let user = {
//                 email: "nobody@example.com",
//                 password: "123test"
//             };
//
//             chai.request(server)
//                 .post("/auth/login")
//                 .send(user)
//                 .end((err, res) => {
//                     res.should.have.status(401);
//                     res.body.should.be.an("object");
//                     res.body.errors.status.should.be.equal(401);
//                     done();
//                 });
//         });
//
//         it('should get 401 incorrect password', (done) => {
//             let user = {
//                 email: "test@example.com",
//                 password: "wrongpassword"
//             };
//
//             chai.request(server)
//                 .post("/auth/login")
//                 .send(user)
//                 .end((err, res) => {
//                     res.should.have.status(401);
//                     res.body.should.be.an("object");
//                     res.body.errors.status.should.be.equal(401);
//                     done();
//                 });
//         });
//
//         it('should get 200 HAPPY PATH', (done) => {
//             let user = {
//                 email: "test@example.com",
//                 password: "123test",
//             };
//
//             chai.request(server)
//                 .post("/auth/login")
//                 .send(user)
//                 .end((err, res) => {
//                     res.should.have.status(200);
//                     res.body.should.be.an("object");
//                     res.body.should.have.property("data");
//                     res.body.data.should.have.property("type");
//                     res.body.data.type.should.equal("success");
//                     res.body.data.should.have.property("type");
//
//                     done();
//                 });
//         });
//     });
//
//     describe('GET/POST /reports', () => {
//         it('should get 404 page not found as invalid url', (done) => {
//             chai.request(server)
//                 .get("/week/2")
//                 .end((err, res) => {
//                     res.should.have.status(404);
//                     res.body.should.be.an("object");
//                     done();
//                 });
//         });
//
//         it('should get valid week', (done) => {
//             chai.request(server)
//                 .get("/reports/week/1")
//                 .end((err, res) => {
//                     res.should.have.status(200);
//                     res.body.should.be.an("object");
//                     res.body.data[0].title.should.equal("Header test");
//                     res.body.data[0].weeknumber.should.equal(1);
//                     res.body.data[0].description.should.equal("Text test");
//                     done();
//                 });
//         });
//
//         it('edit weekly report', (done) => {
//             let user = {
//                 email: "test@example.com",
//                 password: "123test",
//             };
//
//             chai.request(server)
//                 .post("/auth/login")
//                 .send(user)
//                 .end((err, res) => {
//                     // console.log(res.body.data.token);
//
//                     chai.request(server)
//                         .get("/reports/edit-week/1")
//                         .set({"x-access-token": res.body.data.token})
//                         .end((err, res) => {
//                             res.should.have.status(200);
//                             res.body.should.be.an("object");
//                             res.body.data[0].title.should.equal("Header test");
//                             res.body.data[0].weeknumber.should.equal(1);
//                             res.body.data[0].description.should.equal("Text test");
//                         });
//                     done();
//                 });
//         });
//         it('should get 401 unauthorized as edit weekly report ', (done) => {
//             chai.request(server)
//                 .get("/reports/edit-week/1")
//                 .set({"x-access-token": "no token here"})
//                 .end((err, res) => {
//                     res.should.have.status(401);
//                     res.body.should.be.an("object");
//                     res.body.errors.title.should.be.equal("Unauthorized");
//                     res.body.errors.status.should.be.equal(401);
//                 });
//             done();
//         });
//
//         it('update weekly report', (done) => {
//             let user = {
//                 email: "test@example.com",
//                 password: "123test",
//             };
//
//             let reportdata = {
//                 title: "Header test2",
//                 description: "Text test2",
//                 weeknumber: 1
//             };
//
//             chai.request(server)
//                 .post("/auth/login")
//                 .send(user)
//                 .end((err, res) => {
//                     // console.log(res.body.data.token);
//
//                     chai.request(server)
//                         .post("/reports/update-report/")
//                         .send(reportdata)
//                         .set({"x-access-token": res.body.data.token})
//                         .end((err, res) => {
//                             res.should.have.status(200);
//                             res.body.should.be.an("object");
//                             res.body.data.message.should.equal("Report successfully updated.");
//
//                             chai.request(server)
//                                 .get("/reports/week/1")
//                                 .end((err, res) => {
//                                     res.should.have.status(200);
//                                     res.body.should.be.an("object");
//                                     res.body.data[0].title.should.equal("Header test2");
//                                     res.body.data[0].weeknumber.should.equal(1);
//                                     res.body.data[0].description.should.equal("Text test2");
//                                 });
//                         });
//                     done();
//                 });
//         });
//
//         it('should get 401 unauthorized as update weekly report ', (done) => {
//             chai.request(server)
//                 .post("/reports/update-report/")
//                 .set({"x-access-token": "no token here"})
//                 .end((err, res) => {
//                     res.should.have.status(401);
//                     res.body.should.be.an("object");
//                     res.body.errors.title.should.be.equal("Unauthorized");
//                     res.body.errors.status.should.be.equal(401);
//                 });
//             done();
//         });
//
//         it('should get all weeknumbers', (done) => {
//             chai.request(server)
//                 .get("/reports/get-weeknumbers")
//                 .end((err, res) => {
//                     res.should.have.status(200);
//                     res.body.should.be.an("object");
//                     res.body.data[0].weeknumber.should.equal(1);
//                     done();
//                 });
//         });
//
//         it('add weekly report', (done) => {
//             let user = {
//                 email: "test@example.com",
//                 password: "123test",
//             };
//
//             let reportdata = {
//                 title: "Header test3",
//                 description: "Text test3",
//                 weeknumber: 2
//             };
//
//             chai.request(server)
//                 .post("/auth/login")
//                 .send(user)
//                 .end((err, res) => {
//                     // console.log(res.body.data.token);
//
//                     chai.request(server)
//                         .post("/reports/add-report/")
//                         .send(reportdata)
//                         .set({"x-access-token": res.body.data.token})
//                         .end((err, res) => {
//                             res.should.have.status(201);
//                             res.body.should.be.an("object");
//                             res.body.data.message.should.equal("Report successfully added.");
//
//                             chai.request(server)
//                                 .get("/reports/week/2")
//                                 .end((err, res) => {
//                                     res.should.have.status(200);
//                                     res.body.should.be.an("object");
//                                     res.body.data[0].title.should.equal("Header test3");
//                                     res.body.data[0].weeknumber.should.equal(2);
//                                     res.body.data[0].description.should.equal("Text test3");
//                                 });
//                         });
//                     done();
//                 });
//         });
//
//         it('should get 401 unauthorized for add weekly report', (done) => {
//             let reportdata = {
//                 title: "Header test3",
//                 description: "Text test3",
//                 weeknumber: 2
//             };
//
//             chai.request(server)
//                 .post("/reports/add-report/")
//                 .send(reportdata)
//                 .set({"x-access-token": "no token here"})
//                 .end((err, res) => {
//                     res.should.have.status(401);
//                     res.body.should.be.an("object");
//                     res.body.errors.title.should.be.equal("Unauthorized");
//                     res.body.errors.status.should.be.equal(401);
//                 });
//             done();
//         });
//     });
//
//     describe('GET /', () => {
//         it('should get homepage', (done) => {
//             chai.request(server)
//                 .get("/")
//                 .end((err, res) => {
//                     res.body.data[0].msg.length.should.be.equal(993);
//                     res.should.have.status(200);
//                     res.body.should.be.an("object");
//                     done();
//                 });
//         });
//     });
// });
