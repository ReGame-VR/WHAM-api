const PatientDB = require('../Database/PatientDB.js');
const chai = require("chai");
var expect = chai.expect;

var patientDB = new PatientDB("WHAM_TEST");

describe('PatientDB', function () {

    describe('#delete_all_patients()', function () {
        it("should delete every patient and all the information stored with them", function (done) {
            patientDB.delete_all_patient_info(function (worked) {
                expect(worked).to.be.equal(true);
                done();
            });
        });
    });

    describe('#add_patient()', function () {
        it('should return true when the patient does not exist', function (done) {
            patientDB.add_patient("bob", "password1", "1999-05-05", "160", "72", "", function (not_exists) {
                expect(not_exists).to.be.equal(true);
                patientDB.add_patient("tim", "password2", "1982-10-10", "151", "75", "", function (not_exists) {
                    expect(not_exists).to.be.equal(true);
                    patientDB.add_patient("cole", "password3", "1978-01-30", "182", "71", "", function (not_exists) {
                        expect(not_exists).to.be.equal(true);
                        patientDB.add_patient("mary", "password4", "1948-03-22", "120", "64", "She is a person.", function (not_exists) {
                            expect(not_exists).to.be.equal(true);
                            patientDB.add_patient("jessy", "password5", "2000-11-13", "150", "70", "He is a cool person.", function (not_exists) {
                                expect(not_exists).to.be.equal(true);
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

    describe('#add_patient_session()', function() {
        it('should return true if the insert is sucessful', function(done) {
            patientDB.add_patient_session('cole', 20, "2012-03-04 4:1:01", function(worked) {
                expect(worked).to.be.equal(true);
                patientDB.add_patient_session('cole', 17, "2012-03-04 4:1:02", function(worked) {
                    expect(worked).to.be.equal(true);
                    patientDB.add_patient_session('cole', 19, "2012-03-04 4:1:03", function(worked) {
                        expect(worked).to.be.equal(true);
                        patientDB.add_patient_session('cole', 25, "2012-03-04 4:1:04", function(worked) {
                            expect(worked).to.be.equal(true);
                            patientDB.add_patient_session('cole', 29, "2012-03-04 4:1:05", function(worked) {
                                expect(worked).to.be.equal(true);
                                done();
                            });
                        });
                    });
                });
            });
        })
    });

    describe('#get_all_patient_info()', function () {
        it('should return every patient username', function (done) {
            patientDB.get_all_patient_info(function(result) {
                expect(result).to.be.deep.equal(result, ['bob', 'tim', 'cole', 'mary', 'jessy']);
                done();
            });
        });
    });

    describe('#login()', function () {
        it('should return true given a real login', function (done) {
            patientDB.login("bob", "password1", function (result) {
                expect(result).to.be.equal(true);
                done();
            });
        });
        it('should return false given a wrong login', function (done) {
            patientDB.login("bob", "password16", function (result) {
                expect(result).to.be.equal(false);
                patientDB.login("tim", "password4", function (result) {
                    expect(result).to.be.equal(false);
                    patientDB.login("asjkaskjsa", "password1", function (result) {
                        expect(result).to.be.equal(false);
                        done();
                    });
                });
            });
        });
    });

    describe('#get_patient_info()', function () {
        it('should return false given a non-existing user', function (done) {
            patientDB.get_patient_info("shjasjkas", function(info, sessions, messaages) {
                expect(info).to.be.equal(false);
                done();
            });
        });

        it('should return all info given an existing user', function (done) {
            patientDB.get_patient_info("cole", function(info, sessions, messaages) {
                expect(info).to.be.deep.equal(['cole', new Date('1978-01-30T05:00:00.000Z'), 182, 71, ""]);
                var sessions = [];
                sessions.push([20, new Date('2012-03-04 4:1:01')]);
                sessions.push([17, new Date('2012-03-04 4:1:02')]);
                sessions.push([19, new Date('2012-03-04 4:1:03')]);
                sessions.push([25, new Date('2012-03-04 4:1:04')]);
                sessions.push([29, new Date('2012-03-04 4:1:05')]);

                expect(sessions).to.be.deep.equal(sessions);
                expect(messaages).to.be.deep.equal([]);
                done();
            });
        });
    });

    describe("#delete_patient_session()", function() {
        it("should return true if the session is sucessful deleted", function(done) {
            patientDB.delete_patient_session("cole", '2012-03-04 4:1:02', function(worked) {
                expect(worked).to.be.equal(true);
                done();
            });
        });
    });

    describe('#get_patient_session_specific()', function() {
        it("should return the score of the given session time", function(done) {
            patientDB.get_patient_session_specific("cole", '2012-03-04 4:1:04', function(score) {
                expect(score).to.be.equal(25);
                done();
            });
        });
    });

    describe("#get_patient_sessions()", function() {
        it("should return every session this user has had", function(done) {
            patientDB.get_patient_sessions("cole", function(sessions) {
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
            patientDB.delete_patient("cole", function(worked) {
                expect(worked).to.be.equal(true);
                done();
            });
        });

        it('should return false given a non-existing user', function (done) {
            patientDB.get_patient_info("cole", function(info, sessions, messaages) {
                expect(info).to.be.equal(false);
                done();
            });
        });
    });

});