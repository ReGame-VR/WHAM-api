const PatientDB = require('../database/PatientDB.js');
const TherapistDB = require('../database/TherapistDB.js');
const AuthenticationDB = require('../database/AuthenticationDB.js');
const MessageDB = require('../database/MessageDB.js');
const SessionDB = require('../database/SessionDB.js');
const RequestDB = require('../database/RequestDB.js');
const DBReseter = require('../database/ResetDB.js');
const chai = require("chai");
var expect = chai.expect;

var authDB = new AuthenticationDB();
var patientDB = new PatientDB(authDB);
var therapistDB = new TherapistDB(authDB);
const messageDB = new MessageDB();
const sessionDB = new SessionDB();
const requestDB = new RequestDB();
var resetDB = new DBReseter(patientDB);

var adminToken;

describe("DBTests", function () {
    describe('DBReseter', function () {
        it("should not error if the reset is sucessful", function (done) {
            resetDB.reset_db().then(worked => {
                expect(worked).to.be.a('string');
                adminToken = worked;
                done();
            });
        });
    });

    describe("AuthDB", function() {
        it("should verify the admin's auth token", function(done) {
            var req = {
                cookies: {
                    auth_token: adminToken
                }
            }
            authDB.verifyJWT(req).then(username => {
                expect(username).to.be.equal('admin');
                done();
            });
        });
    });

    describe('TherapistDB', function () {
        describe('#add_therapist()', function (done) {
            it("should give true if the addding worked", function (done) {
                therapistDB.add_therapist("therapist1", "test_password1").then(worked => {
                    expect(worked).to.be.a('string');
                    therapistDB.add_therapist("therapist1", "test_password2").then(worked => {
                        expect(worked).to.be(2131231221); //dont ever want to get here
                    }).catch(error => {
                        expect(1).to.be.equal(1); //We want there to be an error
                        therapistDB.add_therapist("therapist2", "test_password3").then(worked => {
                            expect(worked).to.be.a('string');
                            done();
                        });
                    });
                });
            });
        });

        describe('#login()', function () {
            it("should return true if the login was sucessful", function (done) {
                therapistDB.login("therapist1", "test_password1").then(worked => {
                    expect(worked.token).to.be.a('string');
                    therapistDB.login("therapist15", "test_password1").then(worked => {}).catch(error => {
                        expect(false).to.be.equal(false);
                        therapistDB.login("therapist1", "test_password67").then(worked => {}).catch(error => {
                            expect(false).to.be.equal(false);
                            done();
                        });
                    });
                });
            });
        });
    });

    describe('PatientDB', function () {

        describe('#add_patient()', function () {
            it('should return true when the patient does not exist', function (done) {
                patientDB.add_patient("bob", "password1", "1999-05-05", "160", "72", "").then(not_exists => {
                    expect(not_exists).to.be.a('string');
                    patientDB.add_patient("tim", "password2", "1982-10-10", "151", "75", "").then(not_exists => {
                        expect(not_exists).to.be.a('string');
                        patientDB.add_patient("cole", "password3", "1978-01-30", "182", "71", "").then(not_exists => {
                            expect(not_exists).to.be.a('string');
                            patientDB.add_patient("mary", "password4", "1948-03-22", "120", "64", "She is a person.").then(not_exists => {
                                expect(not_exists).to.be.a('string');
                                patientDB.add_patient("jessy", "password5", "2000-11-13", "150", "70", "He is a cool person.").then(not_exists => {
                                    expect(not_exists).to.be.a('string');
                                    done();
                                })
                            })
                        });
                    });
                });
            });
            it('should return false when the patient already exists', function (done) {
                patientDB.add_patient("tim", "password4", "1981-02-20", "112", "79", "").then(not_exists => {
                }).catch(error => {
                    expect(1).to.be.equal(1);
                    done();
                })
            });
        });

        describe('#add_session()', function () {
            it('should return true if the insert is sucessful', function (done) {
                sessionDB.add_session('cole',1,1,1, [
                    {score: 20, time: "2012-03-04 4:1:01"},
                    {score: 20, time: "2012-03-04 4:1:01"},
                    {score: 20, time: "2012-03-04 4:1:01"},
                    {score: 20, time: "2012-03-04 4:1:01"},
                    {score: 20, time: "2012-03-04 4:1:01"},
                    {score: 20, time: "2012-03-04 4:1:01"},
                    {score: 20, time: "2012-03-04 4:1:01"}
                ]).then(res => {
                    done();
                })
            });
        });

        describe('#get_all_patient_info()', function () {
            it('should return every patient username', function (done) {
                patientDB.get_all_patient_info().then(result => {
                    expect(result[1]['username']).to.be.equal("bob");
                    expect(result).to.be.deep.equal(result, ['admin', 'bob', 'tim', 'cole', 'mary', 'jessy']);
                    done();
                });
            });
        });

        describe('#login()', function () {
            it('should return true given a real login', function (done) {
                patientDB.login("bob", "password1").then(result => {
                    expect(result.token).to.be.a('string');
                    done();
                });
            });
            it('should return false given a wrong login', function (done) {
                patientDB.login("bob", "password16").catch(error => {
                    expect(1).to.be.equal(1);
                    patientDB.login("tim", "password4").catch(error => {
                        expect(1).to.be.equal(1);
                        patientDB.login("asjkaskjsa", "password1").catch(error => {
                            expect(1).to.be.equal(1);
                            done();
                        });
                    });
                });
            });
        });


        describe('#get_patient_info()', function () {
            it('should return false given a non-existing user', function (done) {
                patientDB.get_patient_info("shjasjkas").catch(error => {
                    expect(1).to.be.equal(1);
                    done();
                });
            });

            it('should return all info given an existing user', function (done) {
                patientDB.get_patient_info("cole").then(([info, sessions, messaages, requests]) => {
                    expect(info).to.be.deep.equal({
                        username: 'cole',
                        dob: new Date('1978-01-30T05:00:00.000Z'),
                        weight: 182,
                        height: 71,
                        information: ""
                    });
                    var sessions = [];
                    sessions.push({
                        score: 20,
                        time: new Date('2012-03-04 4:1:01')
                    });
                    sessions.push({
                        score: 20,
                        time: new Date('2012-03-04 4:1:02')
                    });
                    sessions.push({
                        score: 20,
                        time: new Date('2012-03-04 4:1:03')
                    });
                    sessions.push({
                        score: 20,
                        time: new Date('2012-03-04 4:1:04')
                    });
                    sessions.push({
                        score: 20,
                        time: new Date('2012-03-04 4:1:05')
                    });

                    expect(sessions).to.be.deep.equal(sessions);
                    expect(messaages).to.be.deep.equal([]);
                    expect(requests).to.be.deep.equal([]);
                    done();
                });
            });
        });

        describe('#get_session_specific()', function () {
            it("should return the score of the given session time", function (done) {
                sessionDB.get_session_specific("cole", 1).then(score => {
                    expect(score.scores.length).to.be.equal(7);
                    done();
                });
            });
        });

        describe("#get_patient_sessions()", function () {
            it("should return every session this user has had", function (done) {
                sessionDB.get_patient_sessions("cole").then(online_sessions => {
                    expect(online_sessions.length).to.be.equal(1);
                    done();
                });
            });
        });

        describe("#delete_session()", function () {
            it("should return true if the session is sucessful deleted", function (done) {
                sessionDB.delete_session("cole", 1).then(() => {
                    expect(1).to.be.equal(1);
                    done();
                });
            });
        });

        describe('#delete_patient()', function () {
            it('should return true if the deletion was sucessful', function (done) {
                patientDB.delete_patient("cole").then(() => {
                    expect(1).to.be.equal(1);
                    done();
                });
            });

            it('should return false given a non-existing user', function (done) {
                patientDB.get_patient_info("cole").then(([info, sessions, messaages, requests]) => {
                }).catch(error => {
                    expect(1).to.be.equal(1);
                    done();
                })
            });
        });

    });

    describe("JointDB", function () {
        describe("#send_patient_a_message()", function () {
            it("should give true if the message was sucessfully added", function (done) {
                messageDB.send_patient_a_message("tim", "therapist1", "You are a cool dude.", "2012-03-04 4:1:04").then(worked => {
                    expect(worked).to.be.an('number');
                    messageDB.send_patient_a_message("tim", "therapist15", "You are a cool dude.", "2012-03-04 4:1:04").catch(error => {
                        expect(1).to.be.equal(1);
                        messageDB.send_patient_a_message("timmmm", "therapist1", "You are a cool dude.", "2012-03-04 4:1:04").catch(error => {
                            expect(1).to.be.equal(1);
                            messageDB.send_patient_a_message("tim", "therapist2", "You are a very cool dude.", "2012-02-01 4:1:04").then(worked => {
                                expect(worked).to.be.an('number');
                                done();
                            });
                        });
                    });
                });
            });
        });

        describe("#get_all_messages_for_patient()", function () {
            it("should return every message this patient has recieved", function (done) {
                messageDB.get_all_messages_for("tim").then(messages => {
                    var expectation = [];
                    expectation.push({
                        therapistID: "therapist1",
                        patientID: 'tim',
                        message_content: "You are a cool dude.",
                        date_sent: new Date("2012-03-04 4:1:04"),
                        is_read: 0,
                        messageID: 1
                    });
                    expectation.push({
                        therapistID: "therapist2",
                        patientID: 'tim',
                        message_content: "You are a very cool dude.",
                        date_sent: new Date("2012-02-01 4:1:04"),
                        is_read: 0,
                        messageID: 4
                    });
                    expect(messages).to.be.deep.equal(expectation);
                    done();
                });
            });
        });

        describe("#mark_as_read()", function () {
            it("should return true if the message was properly marked as read", function (done) {
                messageDB.mark_message_as_read("tim", "1").then(() => {
                    expect(1).to.be.equal(1);
                    done();
                });
            });
        });

        describe("#get_all_messages_for_patient()", function () {
            it("should return every message this patient has recieved", function (done) {
                messageDB.get_all_messages_for("tim").then(messages => {
                    var expectation = [];
                    expectation.push({
                        therapistID: "therapist1",
                        patientID: 'tim',
                        message_content: "You are a cool dude.",
                        date_sent: new Date("2012-03-04 4:1:04"),
                        is_read: 1,
                        messageID: 1
                    });
                    expectation.push({
                        therapistID: "therapist2",
                        patientID: 'tim',
                        message_content: "You are a very cool dude.",
                        date_sent: new Date("2012-02-01 4:1:04"),
                        is_read: 0,
                        messageID: 4
                    });
                    expect(messages).to.be.deep.equal(expectation);
                    done();
                });
            });
        });

        describe("#get_all_messages_from_therapist", function () {
            it("should return every message this therapist has sent", function (done) {
                messageDB.get_all_messages_from("therapist1").then(messages => {
                    expect(messages).to.be.deep.equal([{
                        patientID: "tim",
                        therapistID: "therapist1",
                        message_content: "You are a cool dude.",
                        date_sent: new Date("2012-03-04 4:1:04"),
                        is_read: 1,
                        messageID: 1
                    }]);
                    done();
                });
            });
        })
    });

    describe("JointDB Pt 2", function () {
        describe("#assign_to_therapist()", function () {
            it("should return true if the pair is sucessful", function (done) {
                requestDB.assign_to_therapist("tim", "therapist2", "2018-05-22").then(() => {
                    expect(1).to.be.equal(1);
                    done();
                })
            });
        })
    });

    describe("TherapistDB Pt 2", function () {
        describe("#get_all_therapists()", function () {
            it("should return every therapist and the number of patients they have", function (done) {
                therapistDB.get_all_therapists().then(all => {
                    expect(all).to.be.deep.equal([{
                        num_patients: 0,
                        username: "therapist1"
                    }, {
                        num_patients: 0,
                        username: "therapist2"
                    }]);
                    done();
                });
            });
        });
    });

    describe("JointDB Pt 2", function () {
        describe("#accept_therapist_request", function () {
            it("should give true if sucessful", function (done) {
                requestDB.accept_therapist_request("tim", "therapist2").then(() => {
                    expect(1).to.be.equal(1);
                    done();
                });
            });
        });
    });

    describe("TherapistDB Pt 3", function () {
        describe("#get_all_therapists()", function () {
            it("should return every therapist and the number of patients they have", function (done) {
                therapistDB.get_all_therapists().then(all => {
                    expect(all).to.be.deep.equal([{
                        num_patients: 0,
                        username: "therapist1"
                    }, {
                        num_patients: 1,
                        username: "therapist2"
                    }]);
                    done();
                });
            });
        });
    });
});
