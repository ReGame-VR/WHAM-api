require('dotenv').config();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;

class TherapistDB {

    // Objects: 
    // Therapist = String
    // Patient = Object(String Date Number Number String)
    // Patient-Session = Object(String Date Number Number String Number Date)
    // Session = Object(Number Date)
    // Message = Object(String String Date Boolean Number)

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
    //([Maybe [List-of Message]] -> Void)
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
                    toSend.push({
                        patientID: result[i].patientID,
                        message: result[i].message,
                        date_sent: result[i].date_sent,
                        is_read: result[i].is_read,
                        messageID: result[i].messageID
                    });                
                }
                callback(toSend);
            }
        });
    }

    // (Maybe(List-of String) -> Void) -> Void
    // Gives a list of every therapist and the number of patients they have
    get_all_therapists(callback) {
        var sql = "SELECT username FROM THERAPIST";
        this.connection.query(sql, function (error, results, fields) {
            if (error) {
                callback(false);
            } else {
                var toSend = [];
                for (var i = 0; i < results.length; i += 1) {
                    toSend.push({username: results[i].username});
                }
                callback(toSend);
            }
        });
    }

    // String (Boolean -> Void) -> Void
    // Deletes this therapist
    delete_therapist(therapistID, callback) {
        var deleteJoinSQL = "DELETE FROM PATIENT_THERAPIST WHERE therapistID = ?";
        var deleteInfoSQL = "DELETE FROM THERAPIST WHERE username = ?";
        var inserts = [therapistID];
        deleteJoinSQL = mysql.format(deleteJoinSQL, inserts);
        deleteInfoSQL = mysql.format(deleteInfoSQL, inserts);
        var connection = this.connection

        connection.query(deleteJoinSQL, function (error, result, fields) {
            if (error) {
                callback(false);
            } else {
                connection.query(deleteInfoSQL, function (error, result, fields) {
                    if (error) {
                        callback(false);
                    } else {
                        callback(true);
                    }
                });
            }
        });
    }

    // String (Listof Patient-Session -> Void) -> Void
    get_all_patients(therapistID, callback) {
        var sql = 
        `SELECT username, dob, weight, height, information, 
        (SELECT score FROM PATIENT_SESSION PS WHERE P.username = PS.patientID ORDER BY PS.time LIMIT 1) as score, 
        (SELECT time FROM PATIENT_SESSION PS WHERE P.username = PS.patientID ORDER BY PS.time LIMIT 1) as time 
        FROM PATIENT P, PATIENT_THERAPIST PT
        WHERE P.username = PT.patientID AND PT.therapistID = ?`;
        var inserts = [therapistID];
        sql = mysql.format(sql, inserts);

        this.connection.query(sql, function (error, results, fields) {
            if (error) {
                callback(false);
            } else {
                var toReturn = [];
                for (var i = 0; i < results.length; i += 1) {
                    toReturn.push({
                        username: results[i].username,
                        dob: results[i].dob,
                        weight: results[i].weight,
                        height: results[i].height,
                        information: results[i].information,
                        score: results[i].score,
                        time: results[i].time
                    });
                }
                callback(toReturn);
            }
        });
    }
}

module.exports = TherapistDB;