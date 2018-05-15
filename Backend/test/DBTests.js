const PatientDB = require('../Database/PatientDB.js');
const chai = require("chai");
var assert = chai.assert;

var patientDB = new PatientDB("WHAM_TEST");

describe('PatientDB', function () {

    describe('#delete_all_patients()', function () {
        it("should delete every patient and all the information stored with them", function (done) {
            patientDB.delete_all_patient_info(function (worked) {
                assert(worked);
                done();
            });
        });
    });

    describe('#add_patient()', function () {
        it('should return true when the patient does not exist', function (done) {
            patientDB.add_patient("bob", "password1", "1999-05-05", "160", "72", "", function (not_exists) {
                assert(not_exists);
                patientDB.add_patient("tim", "password2", "1982-10-10", "151", "75", "", function (not_exists) {
                    assert(not_exists);
                    patientDB.add_patient("cole", "password3", "1978-01-30", "182", "71", "", function (not_exists) {
                        assert(not_exists);
                        patientDB.add_patient("mary", "password4", "1948-03-22", "120", "64", "She is a person.", function (not_exists) {
                            assert(not_exists);
                            patientDB.add_patient("jessy", "password5", "2000-11-13", "150", "70", "He is a cool person.", function (not_exists) {
                                assert(not_exists);
                                done();
                            });
                        });
                    });
                });
            });
        });
        it('should return false when the patient already exists', function (done) {
            patientDB.add_patient("tim", "password4", "1981-02-20", "112", "79", "", function (not_exists) {
                assert(!not_exists);
                done();
            });
        });
    });

    describe('#get_all_patient_info()', function () {
        it('should return every patient username', function (done) {
            patientDB.get_all_patient_info(function(result) {
                assert.lengthOf(result, 5);
                assert.equal(result[0], 'bob');
                done();
            });
        });
    });

    describe('#login()', function () {
        it('should return true given a real login', function (done) {
            patientDB.login("bob", "password1", function (result) {
                assert(result);
                done();
            });
        });
        it('should return false given a wrong login', function (done) {
            patientDB.login("bob", "password16", function (result) {
                assert(!result);
                patientDB.login("tim", "password4", function (result) {
                    assert(!result);
                    patientDB.login("asjkaskjsa", "password1", function (result) {
                        assert(!result);
                        done();
                    });
                });
            });
        });
    });

});