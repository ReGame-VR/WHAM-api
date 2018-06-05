const PatientDB = require('../Database/PatientDB.js');
const TherapistDB = require('../Database/TherapistDB.js');
const AuthenticationDB = require('../Database/AuthenticationDB.js');
const DBReseter = require('../Database/ResetDB.js');
const chai = require("chai");
var expect = chai.expect;

var authorizer = new AuthenticationDB("WHAM_TEST");
var patientDB = new PatientDB("WHAM_TEST", authorizer);
var therapistDB = new TherapistDB("WHAM_TEST", authorizer);
var resetDB = new DBReseter("WHAM_TEST", patientDB);
describe("DBTests", function () {

    describe('DBReseter', function () {
        it("should not error if the deletion is sucessful", function (done) {
            resetDB.reset_db(function (worked) {
                expect(worked).to.be.a('string');
                done();
            });
        });
    });

    describe('TherapistDB', function () {
        describe('#add_therapist()', function (done) {
            it("should give true if the addding worked", function (done) {
                therapistDB.add_therapist("therapist1", "test_password1", function (worked) {
                    expect(worked).to.be.a('string');
                    therapistDB.add_therapist("therapist1", "test_password2", function (worked) {
                        expect(worked).to.be.equal(false);
                        therapistDB.add_therapist("therapist2", "test_password3", function (worked) {
                            expect(worked).to.be.a('string');
                            done();
                        });
                    });
                });
            });
        });

        describe('#login()', function () {
            it("should return true if the login was sucessful", function (done) {
                therapistDB.login("therapist1", "test_password1", function (err, worked) {
                    expect(worked).to.be.not.equal(false);
                    therapistDB.login("therapist15", "test_password1", function (err, worked) {
                        expect(err).to.be.not.equal(null);
                        therapistDB.login("therapist1", "test_password67", function (err, worked) {
                            expect(worked).to.be.equal(false);
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
                patientDB.add_patient("bob", "password1", "1999-05-05", "160", "72", "", function (not_exists) {
                    expect(not_exists).to.be.a('string');
                    patientDB.add_patient("tim", "password2", "1982-10-10", "151", "75", "", function (not_exists) {
                        expect(not_exists).to.be.a('string');
                        patientDB.add_patient("cole", "password3", "1978-01-30", "182", "71", "", function (not_exists) {
                            expect(not_exists).to.be.a('string');
                            patientDB.add_patient("mary", "password4", "1948-03-22", "120", "64", "She is a person.", function (not_exists) {
                                expect(not_exists).to.be.a('string');
                                patientDB.add_patient("jessy", "password5", "2000-11-13", "150", "70", "He is a cool person.", function (not_exists) {
                                    expect(not_exists).to.be.a('string');
                                    done();
                                });
                            });
                        });
                    });
                });
            });
            it('should return false when the patient already exists', function (done) {
                patientDB.add_patient("tim", "password4", "1981-02-20", "112", "79", "", function (not_exists) {
                    expect(not_exists).to.be.equal(false);
                    done();
                });
            });
        });

        describe('#add_patient_session()', function () {
            it('should return true if the insert is sucessful', function (done) {
                patientDB.add_patient_session('cole', 20, "2012-03-04 4:1:01", function (worked) {
                    expect(worked).to.be.equal(true);
                    patientDB.add_patient_session('cole', 17, "2012-03-04 4:1:02", function (worked) {
                        expect(worked).to.be.equal(true);
                        patientDB.add_patient_session('cole', 19, "2012-03-04 4:1:03", function (worked) {
                            expect(worked).to.be.equal(true);
                            patientDB.add_patient_session('cole', 25, "2012-03-04 4:1:04", function (worked) {
                                expect(worked).to.be.equal(true);
                                patientDB.add_patient_session('cole', 29, "2012-03-04 4:1:05", function (worked) {
                                    expect(worked).to.be.equal(true);
                                    patientDB.add_patient_session('tim', 20, "2012-03-04 4:1:01", function (worked) {
                                        expect(worked).to.be.equal(true);
                                        patientDB.add_patient_session('tim', 17, "2012-03-04 4:1:02", function (worked) {
                                            expect(worked).to.be.equal(true);
                                            patientDB.add_patient_session('tim', 19, "2012-03-04 4:1:03", function (worked) {
                                                expect(worked).to.be.equal(true);
                                                patientDB.add_patient_session('tim', 25, "2012-03-04 4:1:04", function (worked) {
                                                    expect(worked).to.be.equal(true);
                                                    patientDB.add_patient_session('tim', 29, "2012-03-04 4:1:05", function (worked) {
                                                        expect(worked).to.be.equal(true);
                                                        done();
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            })
        });

        describe('#get_all_patient_info()', function () {
            it('should return every patient username', function (done) {
                patientDB.get_all_patient_info(function (result) {
                    expect(result[1]['username']).to.be.equal("bob");
                    expect(result).to.be.deep.equal(result, ['admin', 'bob', 'tim', 'cole', 'mary', 'jessy']);
                    done();
                });
            });
        });

        describe('#login()', function () {
            it('should return true given a real login', function (done) {
                patientDB.login("bob", "password1", function (result) {
                    expect(result).to.be.not.equal(false);
                    done();
                });
            });
            it('should return false given a wrong login', function (done) {
                patientDB.login("bob", "password16", function (err, result) {
                    expect(result).to.be.equal(false);
                    patientDB.login("tim", "password4", function (err, result) {
                        expect(result).to.be.equal(false);
                        patientDB.login("asjkaskjsa", "password1", function (err, result) {
                            expect(err).to.be.not.equal(null);
                            done();
                        });
                    });
                });
            });
        });

        describe('#get_patient_info()', function () {
            it('should return false given a non-existing user', function (done) {
                patientDB.get_patient_info("shjasjkas", function (info, sessions, messaages) {
                    expect(info).to.be.equal(false);
                    done();
                });
            });

            it('should return all info given an existing user', function (done) {
                patientDB.get_patient_info("cole", function (info, sessions, messaages) {
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
                    done();
                });
            });
        });

        describe("#delete_patient_session()", function () {
            it("should return true if the session is sucessful deleted", function (done) {
                patientDB.delete_patient_session("cole", 2, function (worked) {
                    expect(worked).to.be.equal(true);
                    done();
                });
            });
        });

        describe('#get_patient_session_specific()', function () {
            it("should return the score of the given session time", function (done) {
                patientDB.get_patient_session_specific("cole", 4, function (score) {
                    expect(score).to.be.deep.equal({
                        activityLevel: 25,
                        id: 4, 
                        time: new Date('2012-03-04T09:01:04.000Z')
                    });
                    done();
                });
            });
        });

        describe("#get_patient_sessions()", function () {
            it("should return every session this user has had", function (done) {
                patientDB.get_patient_sessions("cole", function (sessions) {
                    var sessions = [];
                    sessions.push([20, new Date('2012-03-04 4:1:01')]);
                    sessions.push([19, new Date('2012-03-04 4:1:03')]);
                    sessions.push([25, new Date('2012-03-04 4:1:04')]);
                    sessions.push([29, new Date('2012-03-04 4:1:05')]);
                    expect(sessions).to.be.deep.equal(sessions);
                    done();
                });
            });
        });

        describe('#delete_patient()', function () {
            it('should return true if the deletion was sucessful', function (done) {
                patientDB.delete_patient("cole", function (worked) {
                    expect(worked).to.be.equal(true);
                    done();
                });
            });

            it('should return false given a non-existing user', function (done) {
                patientDB.get_patient_info("cole", function (info, sessions, messaages) {
                    expect(info).to.be.equal(false);
                    done();
                });
            });
        });

    });

    describe("JointDB", function () {
        describe("#send_patient_a_message()", function () {
            it("should give true if the message was sucessfully added", function (done) {
                patientDB.send_patient_a_message("tim", "therapist1", "You are a cool dude.", "2012-03-04 4:1:04", function (worked) {
                    expect(worked).to.be.equal(true);
                    patientDB.send_patient_a_message("tim", "therapist15", "You are a cool dude.", "2012-03-04 4:1:04", function (worked) {
                        expect(worked).to.be.equal(false);
                        patientDB.send_patient_a_message("timmmm", "therapist1", "You are a cool dude.", "2012-03-04 4:1:04", function (worked) {
                            expect(worked).to.be.equal(false);
                            patientDB.send_patient_a_message("tim", "therapist2", "You are a very cool dude.", "2012-02-01 4:1:04", function (worked) {
                                expect(worked).to.be.equal(true);
                                done();
                            });
                        });
                    });
                });
            });
        });

        describe("#get_all_messages_for_patient()", function () {
            it("should return every message this patient has recieved", function (done) {
                patientDB.get_all_messages_for("tim", function (messages) {
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
                patientDB.mark_message_as_read("tim", "1", function (worked) {
                    expect(worked).to.be.equal(true);
                    done();
                });
            });
        });

        describe("#get_all_messages_for_patient()", function () {
            it("should return every message this patient has recieved", function (done) {
                patientDB.get_all_messages_for("tim", function (messages) {
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
                therapistDB.get_all_messages_from("therapist1", function (messages) {
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
                patientDB.assign_to_therapist("tim", "therapist2", "2018-05-22", function (worked) {
                    expect(worked).to.be.equal(true);
                    done();
                })
            });
        })
    });

    describe("TherapistDB Pt 2", function () {
        describe("#get_all_therapists()", function () {
            it("should return every therapist and the number of patients they have", function (done) {
                therapistDB.get_all_therapists(function (all) {
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