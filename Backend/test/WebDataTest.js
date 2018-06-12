require('dotenv').config();
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const app = require('../index').app;
const reset = require('../index').reset;
var jwt = require('jsonwebtoken');

var admin_auth_token;

describe('LoadTestData', function () {
    describe('DBReseter', function () {
        it('should not error if the deletion is sucessful', function (done) {
            reset(function (token) {
                expect(token).to.be.a('string');
                admin_auth_token = token;
                done();
            });
        });
    });

    describe('Adds Patients', function () {
        it('should return the patient salt given a sucessful create account', function (done) {
            chai.request(app)
                .post('/patients')
                .accept('application/json')
                .send({
                    username: 'ryan',
                    password: 'p',
                    dob: '1999-05-05',
                    weight: 160,
                    height: 71,
                    information: 'He is a developer of this app!',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body.token).to.be.a('string');
                    done();
                });
        });

        it('should return the patient salt given a sucessful create account', function (done) {
            chai.request(app)
                .post('/patients')
                .accept('application/json')
                .send({
                    username: 'timmy',
                    password: 'this is a valid password',
                    dob: '1981-02-27',
                    weight: 155,
                    height: 78,
                    information: '',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body.token).to.be.a('string');
                    done();
                });
        });

        it('does not allow invalid dates', function (done) {
            chai.request(app)
                .post('/patients')
                .accept('application/json')
                .send({
                    username: 'timmy2',
                    password: 'password',
                    dob: '1981-20-27',
                    weight: 155,
                    height: 78,
                    information: '',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });

        it('does not allow invalid dates', function (done) {
            chai.request(app)
                .post('/patients')
                .accept('application/json')
                .send({
                    username: 'timmy3',
                    password: 'password',
                    dob: '1981-02-40',
                    weight: 155,
                    height: 78,
                    information: '',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });

        it('does not allow spaces in usernames', function (done) {
            chai.request(app)
                .post('/patients')
                .accept('application/json')
                .send({
                    username: 'this is a bad username',
                    password: 'password',
                    dob: '1981-02-20',
                    weight: 155,
                    height: 78,
                    information: '',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });

        it('should return the patient salt given a sucessful create account', function (done) {
            chai.request(app)
                .post('/patients')
                .accept('application/json')
                .send({
                    username: 'cole',
                    password: 'enrique',
                    dob: '1975-12-31',
                    weight: 175,
                    height: 68,
                    information: 'laksmdlams',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body.token).to.be.a('string');
                    done();
                });
        });

        it('should return 403 if the patient already exists', function (done) {
            chai.request(app)
                .post('/patients')
                .accept('application/json')
                .send({
                    username: 'ryan',
                    password: 'test_password',
                    weight: 160,
                    height: 71,
                    dob: '1999-05-05',
                    information: 'He is a developer of this app!',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    expect(res.body.error).to.be.a('string');
                    done();
                });
        });
    });


    describe('Logs patient in', function () {
        it('should return the patient salt given a sucessful login', function (done) {
            chai.request(app)
                .post('/login/patient')
                .accept('application/json')
                .send({
                    username: 'ryan',
                    password: 'p',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    done();
                });
        });

        it('should return 403 status given a false login', function (done) {
            chai.request(app)
                .post('/login/patient')
                .accept('application/json')
                .send({
                    username: 'ryan',
                    password: 'akojsfnkjsnmfklsmn',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });

        it('should return 403 status given a false login', function (done) {
            chai.request(app)
                .post('/login/patient')
                .accept('application/json')
                .send({
                    username: 'lasksmnfdlskmf',
                    password: 'test_password',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe('Adds Therapists', function () {
        it('should return the therapist salt given a sucessful adding', function (done) {
            chai.request(app)
                .post('/therapists')
                .accept('application/json')
                .send({
                    username: 'therapist1',
                    password: 'passworddddd',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body.token).to.be.a('string');
                    done();
                });
        });

        it('should return an error if therapist name was taken', function (done) {
            chai.request(app)
                .post('/therapists')
                .accept('application/json')
                .send({
                    username: 'therapist1',
                    password: 'passworddddd',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    expect(res.body.error).to.be.a('string');
                    done();
                });
        });

        it('should return the therapist salt given a sucessful adding', function (done) {
            chai.request(app)
                .post('/therapists')
                .accept('application/json')
                .send({
                    username: 'therapist2',
                    password: 'password',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body.token).to.be.a('string');
                    done();
                });
        });

        it('should return the therapist salt given a sucessful adding', function (done) {
            chai.request(app)
                .post('/therapists')
                .accept('application/json')
                .send({
                    username: 'therapist3',
                    password: 'test',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body.token).to.be.a('string');
                    done();
                });
        });
    });

    describe('Logs therapist in', function () {
        it('should return the patient salt given a sucessful login', function (done) {
            chai.request(app)
                .post('/login/therapist')
                .accept('application/json')
                .send({
                    username: 'therapist3',
                    password: 'test',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body.token).to.be.a('string');
                    done();
                });
        });

        it('should return 403 status given a false login', function (done) {
            chai.request(app)
                .post('/login/therapist')
                .accept('application/json')
                .send({
                    username: 'therapist3',
                    password: 'akojsfnkjsnmfklsmn',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });

        it('should return 403 status given a false login', function (done) {
            chai.request(app)
                .post('/login/therapist')
                .accept('application/json')
                .send({
                    username: 'lasksmnfdlskmf',
                    password: 'test_password',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe('Joins Patient to Therapist', function () {
        it('should give status 204 if the pair was sucessful', function (done) {
            chai.request(app)
                .post('/therapists/therapist1/patients')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .send({
                    patientID: 'ryan',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });

        it('should give status 403 if the pair was unsucessful', function (done) {
            chai.request(app)
                .post('/therapists/therapist1/patients')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .send({
                    patientID: 'lskamdfsdmlkdfws',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });

        it('should give status 403 if the pair was unsucessful', function (done) {
            chai.request(app)
                .post('/therapists/therapist1555/patients')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .send({
                    patientID: 'ryan',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });

        it('should give status 204 if the pair was sucessful', function (done) {
            chai.request(app)
                .post('/therapists/therapist2/patients')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .send({
                    patientID: 'ryan',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });
    });

    describe('Accept Patient-Therapist Join', function () {
        it('should give status 204 if the pair was sucessful', function (done) {
            chai.request(app)
                .patch('/patients/ryan/therapists/therapist1')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });
    });

    describe('Adds patient sessions', function () {
        for (let i = 10; i < 30; i++) {
            (function (cntr) {
                it('should give status 204 if the session add was sucessful', function (done) {
                    chai.request(app)
                        .post('/patients/ryan/sessions')
                        .accept('application/json')
                        .query({
                            auth_token: admin_auth_token,
                        })
                        .send({
                            score: 100 + cntr,
                            time: '2016-02-28T16:41:' + cntr,
                        })
                        .end(function (err, res) {
                            expect(res.status).to.be.equal(204);
                            done();
                        });
                });
            })(i);
        }


        it('should give status 403 if the session add was unsucessful', function (done) {
            chai.request(app)
                .post('/patients/hello/sessions')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .send({
                    score: 100,
                    time: '2016-02-28T16:41:41',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe('Adds patient messages', function () {
        it('should give status 204 if the message was sucessfully added', function (done) {
            chai.request(app)
                .post('/patients/ryan/messages')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .send({
                    therapistID: 'therapist1',
                    message_content: 'This is a message',
                    date_sent: '2016-02-28T16:41:41',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });

        it('should give status 204 if the message was sucessfully added', function (done) {
            chai.request(app)
                .post('/patients/timmy/messages')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .send({
                    therapistID: 'therapist2',
                    message_content: 'This is a very good message',
                    date_sent: '2016-02-28T16:41:41',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });

        it('should give status 403 if the message was sucessfully added', function (done) {
            chai.request(app)
                .post('/patients/ryan/messages')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .send({
                    therapistID: 'skjdfnakjsndsfko\'sa',
                    message_content: 'This is a message',
                    date_sent: '2016-02-28T16:41:41',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });

        it('should give status 403 if the message was sucessfully added', function (done) {
            chai.request(app)
                .post('/patients/askjmndqkls/messages')
                .accept('application/json')
                .send({
                    therapistID: 'therapist1',
                    message_content: 'This is a message',
                    date_sent: '2016-02-28T16:41:41',
                })
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe('Mark messages as read', function () {
        it('should give status 204 if the message was sucessfully marked as read', function (done) {
            chai.request(app)
                .patch('/patients/timmy/messages/2')
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });

        it('should give status 403 if the message does not exist', function (done) {
            chai.request(app)
                .patch('/patients/timmy/messages/12982189')
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });

        it('should give status 403 if the patient does not exist', function (done) {
            chai.request(app)
                .patch('/patients/askjdnaksmn/messages/2')
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

});