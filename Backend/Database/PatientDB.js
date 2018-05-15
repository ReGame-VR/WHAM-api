require('dotenv').config();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;

class PatientDB {


    constructor(dbName) {
        this.connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: dbName
        });

        this.connection.connect(function (err) {
            if (err) throw err;
            console.log("Connected!");
        });
    }

    // (Boolean -> Void) -> Void
    // Deletes all patients from the DB
    // If suceed, calls the callback with true
    // If fail, calls the callback with false (server error or other)
    delete_all_patient_info(callback) {
        var sql = "DELETE FROM PATIENT_SESSION";
        var connection = this.connection;
        connection.query(sql, function (error, results, fields) {
            if (error) {
                callback(false);
            } else {
                var sql = "DELETE FROM PATIENT_MESSAGE";
                connection.query(sql, function (error, results, fields) {
                    if (error) {
                        callback(false);
                    } else {
                        var sql = "DELETE FROM PATIENT_MESSAGE";
                        connection.query(sql, function (error, results, fields) {
                            if (error) {
                                callback(false);
                            } else {
                                var sql = "DELETE FROM PATIENT_THERAPIST";
                                connection.query(sql, function (error, results, fields) {
                                    if (error) {
                                        callback(false);
                                    } else {
                                        var sql = "DELETE FROM PATIENT";
                                        connection.query(sql, function (error, results, fields) {
                                            if (error) {
                                                callback(false);
                                            } else {
                                                callback(true);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    // ([List-of String] -> Void) -> Void
    // Calls the callback with the usernames of every patient
    get_all_patient_info(callback) {
        var sql = "SELECT username FROM PATIENT";
        this.connection.query(sql, function (error, results, fields) {
            if (error) {
                callback([]);
            } else {
                var toReturn = [];
                for(var i = 0; i < results.length; i += 1) {
                    toReturn.push(String(results[i].username));
                }
                callback(toReturn);
            }
        });
    }

    // String -> ???
    // Returns all information for the given patient
    get_patient_info(patientID) {

    }

    // String String String Number Number String (Boolean -> Void) -> Void
    // Tries to add the patient to the database
    // If suceed, calls the callback with true
    // If fail, calls the callback with false (user already exists or other)
    // Note: Weight in Kilo, Height in CM, DOB in YYYY-MM-DD
    add_patient(username, unencrypt_password, dob, weight, height, information, callback) {
        // Username, password, salt, DOB, Weight, Height, (?) Information
        var sql = "INSERT INTO PATIENT VALUES (?, ?, ?, ?, ?, ?, ?)"
        var salt = bcrypt.genSaltSync(saltRounds);
        var password = bcrypt.hashSync(unencrypt_password, salt);

        var inserts = [username, password, salt, dob, weight, height, information];
        sql = mysql.format(sql, inserts);
        this.connection.query(sql, function (error, results, fields) {
            if (error) {
                callback(false);
            } else {
                callback(true);
            }
        });
    }

    // String -> Boolean
    // Tries to purge the patient from the DB 
    // Including all session, message, and patient-therapist info
    // If suceed, returns true
    // If fail, returns false (unknown reason, probably server error)
    delete_patient(patientID) {

    }

    // String -> ???
    // Returns all the session info for a given patient
    get_patient_sessions(patientID) {

    }

    // String Number Date -> Boolean
    // Adds an entry for a session to the DB
    // If suceed, returns true
    // If fail, returns false (server error or already added)
    add_patient_session(patientID, score, time) {

    }

    // String Date -> Boolean
    // Deletes a given patient session for the DB
    // If suceed, returns true
    // If fail, returns false (server error)
    delete_patient_session(patientID, time) {

    }

    // String String (Boolean -> Void) -> Void
    // Calls the callback with true given a proper login
    // False given an incorrect login
    login(username, unencrypt_password, callback) {
        var get_salt_sql = "SELECT salt FROM PATIENT P WHERE P.username = ?";
        var get_salt_insert = [username];
        get_salt_sql = mysql.format(get_salt_sql, get_salt_insert);
        var loginFunc = this._login;
        var connection = this.connection;
        connection.query(get_salt_sql, function (error, results, fields) {
            if(error || results.length == 0) {
                callback(false);
            } else {
                var salt = results[0].salt;
                var password = bcrypt.hashSync(unencrypt_password, salt);
                var login_sql = "SELECT username FROM PATIENT P where P.username = ? AND P.password = ?";
                var login_insert = [username, password];
                login_sql = mysql.format(login_sql, login_insert);
                connection.query(login_sql, function (error, results, fields) {
                    if(error || results.length == 0) {
                        callback(false);
                    } else {
                        callback(true);
                    }
                });
            }
        });
    }

}

module.exports = PatientDB;

