require('dotenv').config();
const chai = require("chai");
var expect = chai.expect;
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
const app = require('../index').app;
const reset = require('../index').reset;
const load = require('../index').load;
var jwt = require('jsonwebtoken');

var ryan_auth_token;
var timmy_auth_token;
var cole_auth_token;
var therapist1_auth_token;
var therapist2_auth_token;
var admin_auth_token;

describe("PermTests", function () {

    describe('DBReseter', function () {
        it('should not error if the deletion is sucessful', function (done) {
            reset(function (token) {
                expect(token).to.be.a('string');
                admin_auth_token = token;
                done();
            });
        });
    });


    describe("Adds Users", function () {
        it("should return the patient salt given a sucessful create account", function (done) {
            chai.request(app)
                .post('/patients')
                .send({
                    username: 'ryan',
                    password: 'test_password',
                    dob: "1999-05-05",
                    weight: 160,
                    height: 71,
                    information: "He is a developer of this app!"
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body.token).to.be.a('string');
                    ryan_auth_token = res.body.token;
                    done();
                });

        });

        it("should return the patient salt given a sucessful create account", function (done) {
            chai.request(app)
                .post('/patients')
                .send({
                    username: 'timmy',
                    password: 'this is a valid password',
                    dob: "1981-02-27",
                    weight: 155,
                    height: 78,
                    information: ""
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body.token).to.be.a('string');
                    timmy_auth_token = res.body.token;
                    done();
                });
        });

        it("should return the patient salt given a sucessful create account", function (done) {
            chai.request(app)
                .post('/patients')
                .send({
                    username: 'cole',
                    password: 'enrique',
                    dob: "1975-12-31",
                    weight: 175,
                    height: 68,
                    information: "laksmdlams"
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body.token).to.be.a('string');
                    cole_auth_token = res.body.token;
                    done();
                });

        });

        it("should return the therapist salt given a sucessful adding", function (done) {
            chai.request(app)
                .post('/therapists')
                .send({
                    username: 'therapist1',
                    password: 'passworddddd'
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body.token).to.be.a('string');
                    therapist1_auth_token = res.body.token;
                    done();
                });
        });

        it("should return the therapist salt given a sucessful adding", function (done) {
            chai.request(app)
                .post('/therapists')
                .send({
                    username: 'therapist2',
                    password: 'password'
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body.token).to.be.a('string');
                    therapist2_auth_token = res.body.token;
                    done();
                });
        });

    });

    describe("Joins Patient to Therapist", function () {
        it("should give status 204 if the pair was sucessful", function (done) {
            chai.request(app)
                .post('/therapists/therapist1/patients')
                .query({
                    auth_token: therapist1_auth_token
                })
                .send({
                    patientID: 'ryan'
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });

        it("should give status 204 if the pair was sucessful", function (done) {
            chai.request(app)
                .post('/therapists/therapist2/patients')
                .query({
                    auth_token: therapist2_auth_token
                })
                .send({
                    patientID: 'ryan'
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });

        it("should reject another user", function (done) {
            chai.request(app)
                .post('/therapists/therapist2/patients')
                .query({
                    auth_token: therapist1_auth_token
                })
                .send({
                    patientID: 'ryan'
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe("Has no access before join accept", function () {
        it('should return status 403 because the patient has not yet accepted the join', function (done) {
            chai.request(app)
                .get('/patients/ryan')
                .accept('application/json')
                .query({
                    auth_token: therapist1_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe("Accept Patient-Therapist Join", function () {
        it("should give status 403 if the accept was unsucessful", function (done) {
            chai.request(app)
                .patch('/patients/ryan/therapists/therapist1')
                .query({
                    auth_token: therapist2_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });

        it("should give status 204 if the pair was sucessful", function (done) {
            chai.request(app)
                .patch('/patients/ryan/therapists/therapist1')
                .query({
                    auth_token: ryan_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });

        it("should reject another user", function (done) {
            chai.request(app)
                .patch('/patients/ryan/therapists/therapist2')
                .query({
                    auth_token: therapist1_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });

        it("should not let therapist1 see therapist2's request", function (done) {
            chai.request(app)
                .get('/patients/ryan')
                .accept("application/json")
                .query({
                    auth_token: therapist1_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body.requests.length).to.be.equal(0);
                    done();
                });
        });

        it("should give status 204 if the pair was sucessful", function (done) {
            chai.request(app)
                .patch('/patients/ryan/therapists/therapist2')
                .query({
                    auth_token: ryan_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });

        it("should reject another user", function (done) {
            chai.request(app)
                .patch('/patients/ryan/therapists/therapist2')
                .query({
                    auth_token: timmy_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe("Message Permissions", function () {
        it("should let users assigned therapists add messages to their accounts", function (done) {
            chai.request(app)
                .post('/therapists/therapist1/messages')
                .query({
                    auth_token: therapist1_auth_token
                })
                .send({
                    patientID: "ryan",
                    message_content: "This is a message",
                    date_sent: "2016-02-28T16:41:41"
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });
    });

    describe("Get messages", function () {
        it("should return no messages from therapist1's perspective", function (done) {
            chai.request(app)
                .get('/patients/ryan')
                .accept("application/json")
                .query({
                    auth_token: therapist2_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body.messages.length).to.be.equal(0);
                    done();
                });
        });

        it("should return 1 message from therapist2's perspective", function (done) {
            chai.request(app)
                .get('/patients/ryan')
                .accept("application/json")
                .query({
                    auth_token: therapist1_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body.messages.length).to.be.equal(1);
                    done();
                });
        });

        it("should return no messages from therapist1's perspective", function (done) {
            chai.request(app)
                .get('/patients/ryan/messages')
                .accept("application/json")
                .query({
                    auth_token: therapist2_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body.length).to.be.equal(0);
                    done();
                });
        });

        it("should return no messages from therapist1's perspective", function (done) {
            chai.request(app)
                .get('/patients/ryan/messages/1')
                .accept("application/json")
                .query({
                    auth_token: therapist2_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe("De-pair patient-therapist", function () {
        it("should reject another user", function (done) {
            chai.request(app)
                .delete('/therapists/therapist2/patients/ryan')
                .query({
                    auth_token: timmy_auth_token
                })
                .send()
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
        it("should accept this user", function (done) {
            chai.request(app)
                .delete('/therapists/therapist2/patients/ryan')
                .query({
                    auth_token: therapist2_auth_token
                })
                .send()
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });
    });


    describe("Adds patient session permissions", function () {
        it("should accept a user trying to add sessions to his account", function (done) {
            chai.request(app)
                .post('/patients/ryan/sessions')
                .query({
                    auth_token: ryan_auth_token
                })
                .send({
                    effort: 10,
                    motivation: 5,
                    engagement: 2,
                    scores: [{
                        score: 100,
                        time: "2016-02-28T16:41:11"
                    }]
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });
        it("should reject users trying to add sessions to others accounts", function (done) {
            chai.request(app)
                .post('/patients/ryan/sessions')
                .query({
                    auth_token: timmy_auth_token
                })
                .send({
                    effort: 10,
                    motivation: 5,
                    engagement: 2,
                    scores: [{
                        score: 100,
                        time: "2016-02-28T16:41:11"
                    }]
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe("Adds patient messages", function () {
        it("should not let users add messages to their own accounts", function (done) {
            chai.request(app)
                .post('/therapists/therapist1/messages')
                .query({
                    auth_token: ryan_auth_token
                })
                .send({
                    patientID: "ryan",
                    message_content: "This is a message",
                    date_sent: "2016-02-28T16:41:41"
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });

        it("should let users assigned therapists add messages to their accounts", function (done) {
            chai.request(app)
                .post('/therapists/therapist1/messages')
                .query({
                    auth_token: therapist1_auth_token
                })
                .send({
                    patientID: "ryan",
                    message_content: "This is a message",
                    date_sent: "2016-02-28T16:41:41"
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });

        it("should not let users not-assigned therapists add messages to their accounts", function (done) {
            chai.request(app)
                .post('/therapists/therapist1/messages')
                .query({
                    auth_token: therapist2_auth_token
                })
                .send({
                    therapistID: "ryan",
                    message_content: "This is a message",
                    date_sent: "2016-02-28T16:41:41"
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });

        it("should not let other users add messages to their accounts", function (done) {
            chai.request(app)
                .post('/therapists/therapist1/messages')
                .query({
                    auth_token: timmy_auth_token
                })
                .send({
                    therapistID: "ryan",
                    message_content: "This is a message",
                    date_sent: "2016-02-28T16:41:41"
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe("Add message reply", function () {
        it("should return 204 if the reply was sucesfully sent", function (done) {
            chai.request(app)
                .put('/patients/ryan/messages/1')
                .accept('application/json')
                .query({
                    auth_token: ryan_auth_token,
                })
                .send({
                    sentID: 'therapist1',
                    reply_content: 'This is a reply',
                    date_sent: '2016-02-28T16:42:41',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });

        it("should return 403 if the user does not have permission", function (done) {
            chai.request(app)
                .put('/patients/timmy/messages/1')
                .accept('application/json')
                .query({
                    auth_token: timmy_auth_token,
                })
                .send({
                    sentID: 'ryan',
                    reply_content: 'This is a message',
                    date_sent: '2016-02-28T16:43:41',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe("Get all therapists", function () {
        it("should only accept the user", function (done) {
            chai.request(app)
                .get('/patients/ryan/messages/1')
                .accept("application/json")
                .query({
                    auth_token: ryan_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    done();
                });
        });

        it("should only accept the user", function (done) {
            chai.request(app)
                .get('/patients/ryan/messages/1')
                .accept("application/json")
                .query({
                    auth_token: timmy_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe("Get a message", function () {
        it("should only accept the user", function (done) {
            chai.request(app)
                .get('/patients/ryan/messages/1')
                .accept("application/json")
                .query({
                    auth_token: ryan_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    done();
                });
        });

        it("should reject a user looking for a message they did not sent", function (done) {
            chai.request(app)
                .get('/patients/timmy/messages/1')
                .accept("application/json")
                .query({
                    auth_token: timmy_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });

        it("should only accept the user", function (done) {
            chai.request(app)
                .get('/patients/ryan/messages/1')
                .accept("application/json")
                .query({
                    auth_token: timmy_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe("Get all therapists", function () {
        it("should only accept the admin", function (done) {
            chai.request(app)
                .get('/therapists')
                .accept("application/json")
                .query({
                    auth_token: admin_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    done();
                });

        });

        it("should only accept the admin", function (done) {
            chai.request(app)
                .get('/therapists')
                .accept("application/json")
                .query({
                    auth_token: ryan_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });

        });
    });

    describe("Get all patients", function () {
        it("should only accept the admin", function (done) {
            chai.request(app)
                .get('/patients')
                .accept("application/json")
                .query({
                    auth_token: admin_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    done();
                });

        });

        it("should only accept the admin", function (done) {
            chai.request(app)
                .get('/patients')
                .accept("application/json")
                .query({
                    auth_token: ryan_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe("Get individual patient", function () {
        it("should accept the admin", function (done) {
            chai.request(app)
                .get('/patients/ryan')
                .accept("application/json")
                .query({
                    auth_token: admin_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    done();
                });

        });

        it("should not accept a random user", function (done) {
            chai.request(app)
                .get('/patients/ryan')
                .accept("application/json")
                .query({
                    auth_token: timmy_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });

        it("should accept this patient", function (done) {
            chai.request(app)
                .get('/patients/ryan')
                .accept("application/json")
                .query({
                    auth_token: ryan_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    done();
                });
        });

        it("should accept this patients therapist", function (done) {
            chai.request(app)
                .get('/patients/ryan')
                .accept("application/json")
                .query({
                    auth_token: therapist1_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    done();
                });
        });
    });

    describe("Get single therapists", function () {
        it("should allow a therapist to get their info", function (done) {
            chai.request(app)
                .get('/therapists/therapist2')
                .accept("application/json")
                .query({
                    auth_token: therapist2_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    done();
                });
        });

        it("should allow the admin to get their info", function (done) {
            chai.request(app)
                .get('/therapists/therapist2')
                .accept("application/json")
                .query({
                    auth_token: admin_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    done();
                });
        });

        it("should not allow another therapist to get their info", function (done) {
            chai.request(app)
                .get('/therapists/therapist2')
                .accept("application/json")
                .query({
                    auth_token: therapist1_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe("Get single therapists messages", function () {
        it("should allow a therapist to get their info", function (done) {
            chai.request(app)
                .get('/therapists/therapist2/messages')
                .accept("application/json")
                .query({
                    auth_token: therapist2_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    done();
                });
        });

        it("should allow the admin to get their info", function (done) {
            chai.request(app)
                .get('/therapists/therapist2/messages')
                .accept("application/json")
                .query({
                    auth_token: admin_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    done();
                });
        });

        it("should not allow another therapist to get their info", function (done) {
            chai.request(app)
                .get('/therapists/therapist2/messages')
                .accept("application/json")
                .query({
                    auth_token: therapist1_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe("Get single therapists patients", function () {
        it("should allow a therapist to get their info", function (done) {
            chai.request(app)
                .get('/therapists/therapist2/patients')
                .accept("application/json")
                .query({
                    auth_token: therapist2_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    done();
                });
        });

        it("should allow the admin to get their info", function (done) {
            chai.request(app)
                .get('/therapists/therapist2/patients')
                .accept("application/json")
                .query({
                    auth_token: admin_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    done();
                });
        });

        it("should not allow another therapist to get their info", function (done) {
            chai.request(app)
                .get('/therapists/therapist2/patients')
                .accept("application/json")
                .query({
                    auth_token: therapist1_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe("Mark messages as read", function () {
        it("should accept this user only", function (done) {
            chai.request(app)
                .patch('/patients/ryan/messages/1')
                .query({
                    auth_token: ryan_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });
        it("should reject other users", function (done) {
            chai.request(app)
                .patch('/patients/ryan/messages/1')
                .query({
                    auth_token: timmy_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe("Get every message to a patient", function () {
        it("should accept this user", function (done) {
            chai.request(app)
                .get('/patients/ryan/messages')
                .accept("application/json")
                .query({
                    auth_token: ryan_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    done();
                });
        });

        it("should reject other users", function (done) {
            chai.request(app)
                .get('/patients/ryan/messages')
                .accept("application/json")
                .query({
                    auth_token: timmy_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe("Get messages (specific and all)", function () {
        it("should accept this user", function (done) {
            chai.request(app)
                .get('/patients/ryan/messages/1')
                .accept("application/json")
                .query({
                    auth_token: ryan_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    done();
                });
        });
        it("should reject other users", function (done) {
            chai.request(app)
                .get('/patients/ryan/messages')
                .accept("application/json")
                .query({
                    auth_token: timmy_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
        it("should reject other users", function (done) {
            chai.request(app)
                .get('/patients/ryan/messages/1')
                .accept("application/json")
                .query({
                    auth_token: timmy_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe("Delete a message", function () {
        it("should only accept the user", function (done) {
            chai.request(app)
                .delete('/patients/ryan/messages/1')
                .accept("application/json")
                .query({
                    auth_token: timmy_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });

        it("should only accept the user", function (done) {
            chai.request(app)
                .delete('/patients/ryan/messages/1')
                .accept("application/json")
                .query({
                    auth_token: ryan_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });
    });

    describe("Delete a session", function () {
        it("should only accept the user", function (done) {
            chai.request(app)
                .delete('/patients/ryan/sessions/1')
                .accept("application/json")
                .query({
                    auth_token: timmy_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });

        it("should only accept the user", function (done) {
            chai.request(app)
                .delete('/patients/ryan/sessions/1')
                .accept("application/json")
                .query({
                    auth_token: ryan_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });
    });

    describe("Get patient sessions", function () {
        it("should accept this user", function (done) {
            chai.request(app)
                .get('/patients/ryan/sessions')
                .accept("application/json")
                .query({
                    auth_token: ryan_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    done();
                });
        });
        it("should reject other users", function (done) {
            chai.request(app)
                .get('/patients/ryan/sessions')
                .accept("application/json")
                .query({
                    auth_token: timmy_auth_token
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe("Deletes a single therapist", function () {
        it("should allow a therapist to delete themselves", function (done) {
            chai.request(app)
                .delete('/therapists/therapist2')
                .query({
                    auth_token: therapist2_auth_token
                })
                .send()
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });

        it("should not allow another user to delete this therapist", function (done) {
            chai.request(app)
                .delete('/therapists/therapist1')
                .query({
                    auth_token: ryan_auth_token
                })
                .send()
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe("Deletes a single patient", function () {
        it("should allow a patient to delete themseleves", function (done) {
            chai.request(app)
                .delete('/patients/ryan')
                .query({
                    auth_token: ryan_auth_token
                })
                .send()
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });

        it("should not allow another patinet to delete this one", function (done) {
            chai.request(app)
                .delete('/patients/timmy')
                .query({
                    auth_token: cole_auth_token
                })
                .send()
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe("Should reject a forged token", function () {
        it("should reject", function (done) {
            chai.request(app)
                .get('/patients/ryan')
                .accept("application/json")
                .query({
                    auth_token: "asjhdnasndkjasndfkdsjnfkjsnfs"
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

});