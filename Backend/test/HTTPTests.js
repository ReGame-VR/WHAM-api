const chai = require("chai");
var expect = chai.expect;
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var app = 'localhost:3000';
const DBReseter = require('../Database/ResetDB.js');
var resetDB = new DBReseter("WHAM_TEST");
describe("HTTPTests", function () {

    describe('DBReseter', function () {
        it("should not error if the deletion is sucessful", function (done) {
            resetDB.reset_db(function (worked) {
                expect(worked).to.be.equal(true);
                done();
            });
        });
    });

    describe("Adds Patients", function () {
        it("should return the patient salt given a sucessful create account", function (done) {
            chai.request(app)
                .post('/patients')
                .send({
                    username: 'ryan',
                    password: 'test_password',
                    weight: 160,
                    height: 71,
                    dob: "1999-05-05",
                    information: "He is a developer of this app!"
                })
                .end(function (err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('string');
                    done();
                });

        });

        it("should return 403 if the patient already exists", function (done) {
            chai.request(app)
                .post('/patients')
                .send({
                    username: 'ryan',
                    password: 'test_password',
                    weight: 160,
                    height: 71,
                    dob: "1999-05-05",
                    information: "He is a developer of this app!"
                })
                .end(function (err, res) {
                    expect(res).to.have.status(403);
                    expect(res.body).to.be.a('string');
                    done();
                });
        });
    });


    describe("Logs patient in", function () {
        it("should return the patient salt given a sucessful login", function (done) {
            chai.request(app)
                .post('/login')
                .send({
                    username: 'ryan',
                    password: 'test_password'
                })
                .end(function (err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('string');
                    done();
                });
        });

        it("should return 403 status given a false login", function (done) {
            chai.request(app)
                .post('/login')
                .send({
                    username: 'ryan',
                    password: 'akojsfnkjsnmfklsmn'
                })
                .end(function (err, res) {
                    expect(res).to.have.status(403);
                    done();
                });
        });

        it("should return 403 status given a false login", function (done) {
            chai.request(app)
                .post('/login')
                .send({
                    username: 'lasksmnfdlskmf',
                    password: 'test_password'
                })
                .end(function (err, res) {
                    expect(res).to.have.status(403);
                    done();
                });
        });
    });

    describe("Adds Therapists", function () {
        it("should return the therapist salt given a sucessful login", function (done) {
            done();
        });
    });

    describe("Logs therapist in", function () {
        it("should return this users salt given a sucessful login", function (done) {
            done();
        });
    });

    describe("Joins Patient to Therapist", function () {

    });

    describe("Adds patient sessions", function () {

    });

    describe("Adds patient messages", function () {

    });

});