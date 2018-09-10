require('dotenv').config();
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const app = require('../index').app;
const reset = require('../index').reset;
var jwt = require('jsonwebtoken');

var admin_auth_token;

describe('HTTPTests', function () {

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
                    password: 'test_password',
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
                    password: 'test_password',
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

    describe('Get all individual patient info', function () {
        it('should return the patient info, sessions, and messages for the given patient', function (done) {
            chai.request(app)
                .get('/patients/ryan')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    let info_expectation = {
                        dob: '1999-05-05T04:00:00.000Z',
                        height: 71,
                        information: 'He is a developer of this app!',
                        username: 'ryan',
                        weight: 160,
                    };
                    let session_expectation = [];
                    let message_expectation = [];
                    let expectation = {
                        info: info_expectation,
                        sessions: session_expectation,
                        messages: message_expectation,
                        requests: ['therapist1', 'therapist2']
                    };
                    expect(res.body).to.be.deep.equal(expectation);
                    done();
                });
        });
    });

    describe("Accept Joins", function () {
        it('should give status 204 if the accept was sucessful', function (done) {
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

        it('should give status 403 if the accept was unsucessful', function (done) {
            chai.request(app)
                .patch('/patients/lskamdfsdmlkdfws/therapists/therapist1')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });

        it('should give status 403 if the accept was unsucessful', function (done) {
            chai.request(app)
                .patch('/patients/ryan/therapists/therapist1555')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });

        it('should give status 204 if the accept was sucessful', function (done) {
            chai.request(app)
                .patch('/patients/ryan/therapists/therapist2')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });
    })

    describe('Adds patient sessions', function () {
        var to_send = []
        for (let i = 10; i < 30; i++) {
            to_send.push({
                score: 100 + i,
                time: '2016-02-28T16:41:' + i,
            });
        }
        it('should give status 204 if the session add was sucessful', function (done) {
            chai.request(app)
                .post('/patients/ryan/sessions')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .send(to_send)
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });

        it('should give status 204 if the session add was sucessful', function (done) {
            chai.request(app)
                .post('/patients/ryan/sessions')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .send(to_send)
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });
    })


    it('should give status 403 if the session add was unsucessful', function (done) {
        chai.request(app)
            .post('/patients/hello/sessions')
            .accept('application/json')
            .query({
                auth_token: admin_auth_token,
            })
            .send([{
                score: 100,
                time: '2016-02-28T16:41:41',
            }])
            .end(function (err, res) {
                expect(res.status).to.be.equal(403);
                done();
            });
    });
    describe('Adds patient messages', function () {
        it('should give status 204 if the message was sucessfully added', function (done) {
            chai.request(app)
                .post('/therapists/therapist1/messages')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .send({
                    patientID: 'ryan',
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
                .post('/therapists/therapist2/messages')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .send({
                    patientID: 'timmy',
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
                .post('/therapists/skjdfnakjsndsfko/messages')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .send({
                    patientID: 'ryan',
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
                .post('/therapists/therapist1/messages')
                .accept('application/json')
                .send({
                    patientID: 'askjmndqkls',
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

    describe("Add message reply", function () {
        it("should return 204 if the reply was sucesfully sent", function (done) {
            chai.request(app)
                .put('/patients/ryan/messages/1')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
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

        it("should return 204 if the reply was sucesfully sent", function (done) {
            chai.request(app)
                .put('/patients/ryan/messages/1')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .send({
                    sentID: 'ryan',
                    reply_content: 'This is a message',
                    date_sent: '2016-02-28T16:43:41',
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
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

    describe('Get all patient info', function () {
        it('should return general info for every patient', function (done) {
            chai.request(app)
                .get('/patients')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);

                    let toExpect = [];
                    toExpect.push({
                        dob: '1999-05-05T04:00:00.000Z',
                        height: 71,
                        information: '',
                        last_score: null,
                        last_activity_time: null,
                        username: 'admin',
                        weight: 160,
                    });
                    toExpect.push({
                        dob: '1975-12-31T05:00:00.000Z',
                        height: 68,
                        information: 'laksmdlams',
                        last_score: null,
                        last_activity_time: null,
                        username: 'cole',
                        weight: 175,
                    });
                    toExpect.push({
                        dob: '1999-05-05T04:00:00.000Z',
                        height: 71,
                        information: 'He is a developer of this app!',
                        last_score: 129,
                        last_activity_time: '2016-02-28T21:41:29.000Z',
                        username: 'ryan',
                        weight: 160,
                    });
                    toExpect.push({
                        dob: '1981-02-27T05:00:00.000Z',
                        height: 78,
                        information: '',
                        last_score: null,
                        last_activity_time: null,
                        username: 'timmy',
                        weight: 155,
                    });

                    expect(res.body).to.be.deep.equal(toExpect);
                    done();
                });
        });

    });

    describe('Get all individual patient info', function () {
        it('should return the patient info, sessions, and messages for the given patient', function (done) {
            chai.request(app)
                .get('/patients/ryan')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    let info_expectation = {
                        dob: '1999-05-05T04:00:00.000Z',
                        height: 71,
                        information: 'He is a developer of this app!',
                        username: 'ryan',
                        weight: 160,
                    };
                    let session_expectation_1 = [];
                    for (let i = 29; i >= 10; i--) {
                        session_expectation_1.push({
                            score: 100 + i,
                            time: '2016-02-28T21:41:' + i + '.000Z',
                        });
                    }
                    let session_expectation_2 = [];
                    for (let i = 29; i >= 10; i--) {
                        session_expectation_2.push({
                            score: 100 + i,
                            time: '2016-02-28T21:41:' + i + '.000Z',
                        });
                    }
                    var session_expectation = [
                        {
                            sessionID: 1,
                            scores: session_expectation_1
                        },
                        {
                            sessionID: 2,
                            scores: session_expectation_2
                        }
                    ]
                    let message_expectation = [];
                    message_expectation.push({
                        'date_sent': '2016-02-28T21:41:41.000Z',
                        'is_read': 0,
                        'message_content': 'This is a message',
                        'therapistID': 'therapist1',
                        'patientID': 'ryan',
                        'messageID': 1
                    });
                    let expectation = {
                        info: info_expectation,
                        sessions: session_expectation,
                        messages: message_expectation,
                        requests: []
                    };
                    expect(res.body).to.be.deep.equal(expectation);
                    done();
                });
        });
    });

    describe('Get every message to a patient', function () {
        it('should return the info for every message to this patient', function (done) {
            chai.request(app)
                .get('/patients/ryan/messages')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.deep.equal([{
                        therapistID: 'therapist1',
                        patientID: 'ryan',
                        message_content: 'This is a message',
                        date_sent: '2016-02-28T21:41:41.000Z',
                        is_read: 0,
                        messageID: 1
                    }]);
                    done();
                });
        });
    });

    describe('Get a specific message', function () {
        it('should return the info for the given message', function (done) {
            chai.request(app)
                .get('/patients/ryan/messages/1')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.deep.equal({
                        therapistID: 'therapist1',
                        patientID: 'ryan',
                        message_content: 'This is a message',
                        date_sent: '2016-02-28T21:41:41.000Z',
                        is_read: 0,
                        messageID: 1,
                        viewerID: "admin",
                        replies: [{
                                date_sent: "2016-02-28T21:42:41.000Z",
                                messageID: "1",
                                reply_content: "This is a reply",
                                sentID: "therapist1"

                            },
                            {
                                date_sent: "2016-02-28T21:43:41.000Z",
                                messageID: "1",
                                reply_content: "This is a message",
                                sentID: "ryan"

                            }
                        ]
                    });
                    done();
                });
        });

        it('should return the info for the given message', function (done) {
            chai.request(app)
                .get('/patients/timmy/messages/2')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.deep.equal({
                        therapistID: 'therapist2',
                        patientID: 'timmy',
                        message_content: 'This is a very good message',
                        date_sent: '2016-02-28T21:41:41.000Z',
                        is_read: 1,
                        messageID: 2,
                        replies: [],
                        viewerID: "admin"
                    });
                    done();
                });
        });
    });

    describe('Get patient sessions', function () {
        it('should return every session this user has logged', function (done) {
            chai.request(app)
                .get('/patients/ryan/sessions')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    var item_expectation = []
                    for (let i = 29; i >= 10; i--) {
                        item_expectation.push({
                            score: 100 + i,
                            time: '2016-02-28T21:41:' + i + '.000Z',
                        });
                    }
                    var session_expectation = [{
                        sessionID: 1,
                        scores: item_expectation
                    },
                    {
                        sessionID: 2,
                        scores: item_expectation
                    }];
                    expect(res.body).to.be.deep.equal(session_expectation);
                    done();
                });
        });
    });

    describe('Get all therapists', function () {
        it('should return the username and number of patients of every therapist', function (done) {
            chai.request(app)
                .get('/therapists')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.deep.equal([{
                            username: 'therapist1',
                            num_patients: 1,
                        },
                        {
                            username: 'therapist2',
                            num_patients: 1,
                        },
                        {
                            username: 'therapist3',
                            num_patients: 0,
                        },
                    ]);
                    done();
                });
        });
    });

    describe('Returns info about one therapist', function () {
        it('should give info about just this one therapist', function (done) {
            chai.request(app)
                .get('/therapists/therapist1')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.deep.equal([{
                        dob: "1999-05-05T04:00:00.000Z",
                        height: 71,
                        information: "He is a developer of this app!",
                        last_activity_time: "2016-02-28T21:41:29.000Z",
                        last_score: 129,
                        username: "ryan",
                        weight: 160
                    }]);
                    done();
                });
        });
    });

    describe('Returns every message this therapist has sent', function () {
        it('should have the contents of every message this therapist has sent', function (done) {
            chai.request(app)
                .get('/therapists/therapist1/messages')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.deep.equal(
                        [{
                            patientID: 'ryan',
                            therapistID: 'therapist1',
                            date_sent: '2016-02-28T21:41:41.000Z',
                            is_read: 0,
                            message_content: 'This is a message',
                            messageID: 1,
                        }]);
                    done();
                });
        });
    });

    describe('Get all therapist patients', function () {
        it('should return info about every patient this therpist has and their info', function (done) {
            chai.request(app)
                .get('/therapists/therapist1/patients')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.deep.equal(
                        [{
                            username: 'ryan',
                            dob: '1999-05-05T04:00:00.000Z',
                            weight: 160,
                            height: 71,
                            information: 'He is a developer of this app!',
                            last_score: 129,
                            last_activity_time: '2016-02-28T21:41:29.000Z',
                        }]);
                    done();
                });
        });
    });

    describe('Delete a patient session', function () {
        it('should respond status 204 if the deletion is sucessful', function (done) {
            chai.request(app)
                .delete('/patients/ryan/sessions/1')
                .query({
                    auth_token: admin_auth_token,
                })
                .send()
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });

        it('should respond status 403 if the deletion is unsucessful', function (done) {
            chai.request(app)
                .delete('/patients/ryan/sessions/1jdnksw')
                .query({
                    auth_token: admin_auth_token,
                })
                .send()
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe('Get patient sessions after deletion', function () {
        it('should return every session this user has logged', function (done) {
            chai.request(app)
                .get('/patients/ryan/sessions')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    var item_expectation = []
                    for (let i = 29; i >= 10; i--) {
                        item_expectation.push({
                            score: 100 + i,
                            time: '2016-02-28T21:41:' + i + '.000Z',
                        });
                    }
                    var session_expectation = [{
                        sessionID: 2,
                        scores: item_expectation
                    }]
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.deep.equal(session_expectation);
                    done();
                });
        });
    });

    describe('Delete a patient message', function () {
        it('should respond status 204 if the deletion is sucessful', function (done) {
            chai.request(app)
                .delete('/patients/ryan/messages/1')
                .query({
                    auth_token: admin_auth_token,
                })
                .send()
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });

        it('should respond status 403 if the deletion is unsucessful', function (done) {
            chai.request(app)
                .delete('/patients/ryan/messages/1jdnksw')
                .query({
                    auth_token: admin_auth_token,
                })
                .send()
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe('Get all non-deleted messages', function () {
        it('should return all messages', function (done) {
            chai.request(app)
                .get('/patients/ryan/messages/1')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe('De-pair patient-therapist', function () {
        it('should return 204 if the de-pairing is sucessful', function (done) {
            chai.request(app)
                .delete('/therapists/therapist2/patients/ryan')
                .query({
                    auth_token: admin_auth_token,
                })
                .send()
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });

        it('should return 403 if the de-pairing is unsucessful', function (done) {
            chai.request(app)
                .delete('/therapists/kljfnsdlkmnflsd/patients/ryan')
                .query({
                    auth_token: admin_auth_token,
                })
                .send()
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe('Get all therapists after de-pair', function () {
        it('should return the username and number of patients of every therapist', function (done) {
            chai.request(app)
                .get('/therapists')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.deep.equal([{
                            username: 'therapist1',
                            num_patients: 1,
                        },
                        {
                            username: 'therapist2',
                            num_patients: 0,
                        },
                        {
                            username: 'therapist3',
                            num_patients: 0,
                        },
                    ]);
                    done();
                });
        });
    });

    describe('Returns info about one therapist after de-pair', function () {
        it('should give info about just this one therapist', function (done) {
            chai.request(app)
                .get('/therapists/therapist2')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.deep.equal([]);
                    done();
                });
        });
    });

    describe('Get all therapist patients after a de-pair', function () {
        it('should return info about every patient this therpist has and their info', function (done) {
            chai.request(app)
                .get('/therapists/therapist2/patients')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.deep.equal([]);
                    done();
                });
        });
    });

    describe('Deletes a single therapist', function () {
        it('should return 204 if the deletion was sucessful', function (done) {
            chai.request(app)
                .delete('/therapists/therapist2')
                .query({
                    auth_token: admin_auth_token,
                })
                .send()
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });

        it('should return 403 if the deletion was unsucessful', function (done) {
            chai.request(app)
                .delete('/therapists/therapist2')
                .query({
                    auth_token: admin_auth_token,
                })
                .send()
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe('Get all therapists after deletion and de-pair', function () {
        it('should return the username and number of patients of every therapist', function (done) {
            chai.request(app)
                .get('/therapists')
                .accept('application/json')
                .query({
                    auth_token: admin_auth_token,
                })
                .end(function (err, res) {
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.deep.equal([{
                            username: 'therapist1',
                            num_patients: 1,
                        },
                        {
                            username: 'therapist3',
                            num_patients: 0,
                        },
                    ]);
                    done();
                });
        });
    });

    describe('Deletes a single patient', function () {
        it('should return 204 if the deletion is unsucessful', function (done) {
            chai.request(app)
                .delete('/patients/ryan')
                .query({
                    auth_token: admin_auth_token,
                })
                .send()
                .end(function (err, res) {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });

        it('should return 403 if the deletion is unsucessful', function (done) {
            chai.request(app)
                .delete('/patients/ryan')
                .query({
                    auth_token: admin_auth_token,
                })
                .send()
                .end(function (err, res) {
                    expect(res.status).to.be.equal(403);
                    done();
                });
        });
    });

    describe('Get all individual patient info after deletion', function () {
        it('should return the patient info, sessions, and messages for the given patient', function (done) {
            chai.request(app)
                .get('/patients/ryan')
                .accept('application/json')
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