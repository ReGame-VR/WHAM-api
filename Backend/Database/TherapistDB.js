require('dotenv').config();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;

class TherapistDB {

    constructor(dbName) {
        this.connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: dbName
        });

        this.connection.connect(function (err) {
            if (err) throw err;
        });
    }

    // String String (Boolean -> Void) -> VoidI
    add_therapist(username, unencrypt_password, callback) {
        var sql = "INSERT INTO THERAPIST VALUES (?, ?, ?)"
        var salt = bcrypt.genSaltSync(saltRounds);
        var password = bcrypt.hashSync(unencrypt_password, salt);

        var inserts = [username, password, salt];
        sql = mysql.format(sql, inserts);
        this.connection.query(sql, function (error, results, fields) {
            if (error) {
                callback(false);
            } else {
                callback(true);
            }
        });
    }

    // String String (Boolean -> Void) -> Void
    // Calls the callback with true given a proper login
    // False given an incorrect login
    login(username, unencrypt_password, callback) {
        var get_salt_sql = "SELECT salt FROM THERAPIST T WHERE T.username = ?";
        var get_salt_insert = [username];
        get_salt_sql = mysql.format(get_salt_sql, get_salt_insert);
        var loginFunc = this._login;
        var connection = this.connection;
        connection.query(get_salt_sql, function (error, results, fields) {
            if (error || results.length == 0) {
                callback(false);
            } else {
                var salt = results[0].salt;
                var password = bcrypt.hashSync(unencrypt_password, salt);
                var login_sql = "SELECT username FROM THERAPIST T where T.username = ? AND T.password = ?";
                var login_insert = [username, password];
                login_sql = mysql.format(login_sql, login_insert);
                connection.query(login_sql, function (error, results, fields) {
                    if (error || results.length == 0) {
                        callback(false);
                    } else {
                        callback(true);
                    }
                });
            }
        });
    }

    // String String String String (Boolean -> Void) -> Void
    // Adds a message to this patients database entry
    // Calls the callback with the sucess of the querry
    send_patient_a_message(patientID, therapistID, message, time, callback) {
        var sql = "INSERT INTO PATIENT_MESSAGE (patientID, therapistID, message, date_sent, is_read) VALUES (?, ?, ?, ?, false)";
        var inserts = [patientID, therapistID, message, time];
        sql = mysql.format(sql, inserts);
        this.connection.query(sql, function (error, results, fields) {
            if (error) {
                callback(false);
            } else {
                callback(true);
            }
        });
    }

    // String
    //([Maybe [List-of (list String String Date Boolean Int)]] -> Void)
    // -> Void
    // Gives every message that this patient has ever recieved
    get_all_messages_from(therapistID, callback) {
        var sql = "SELECT patientID, message, date_sent, is_read, messageID FROM PATIENT_MESSAGE WHERE therapistID = ?";
        var inserts = [therapistID];
        sql = mysql.format(sql, inserts);
        this.connection.query(sql, function (error, result, fields) {
            if (error) {
                callback(false);
            } else {
                var toSend = [];
                for (var i = 0; i < result.length; i += 1) {
                    toSend.push([result[i].patientID, result[i].message, result[i].date_sent, result[i].is_read, result[i].messageID]);
                }
                callback(toSend);
            }
        });
    }

    // (Maybe(List-of (list String Number)) -> Void) -> Void
    // Gives a list of every therapist and the number of patients they have
    get_all_therapists(callback) {
        var sql = "SELECT therapistID, COUNT(*) as count FROM THERAPIST T, PATIENT_THERAPIST PT WHERE T.username = PT.therapistID GROUP BY therapistID";
        this.connection.query(sql, function (error, results, fields) {
            if (error) {
                callback(false);
            } else {
                var toSend = [];
                for (var i = 0; i < resutls.length; i += 1) {
                    toSend.push([results[i].therapistID, results[i].count]);
                }
                callback(count);
            }
        });
    }

}

module.exports = TherapistDB;