require('dotenv').config();
const mysql = require('promise-mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');

var therapist_sql = require('./sql/therapist_sql.js')
var message_sql = require('./sql/message_sql.js')
var session_sql = require('./sql/session_sql.js')
var request_sql = require('./sql/request_sql.js')
var general_sql = require('./sql/general_sql.js')


/********************SQL STATEMENTS*******************/

class TherapistDB {

    // Objects:
    // Therapist = String
    // Patient = Object(String Date Number Number String)
    // Patient-Session = Object(String Date Number Number String Number Date)
    // Session = Object(Number Date)
    // Message = Object(String String Date Boolean Number)
    constructor(authDB) {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: "WHAM_TEST"
        });
        this.authDB = authDB;
    }

    // String String -> Promise(JWT)
    // Adds this therapist to the database
    add_therapist(username, unencrypt_password) {
        var salt = bcrypt.genSaltSync(saltRounds);
        var password = bcrypt.hashSync(unencrypt_password, salt);

        var user_inserts = [username, password, salt];
        var therapist_inserts = [username];
        var user_query = mysql.format(general_sql.add_user_sql, user_inserts);
        var therapist_query = mysql.format(therapist_sql.add_therapist_sql, therapist_inserts);
        return this.pool.getConnection().then(connection => {
            var res = Promise.all([connection.query(user_query), connection.query(therapist_query)])
            connection.release();
            return res;
        }).then(([user, therapist]) => {
            var token = jwt.sign({
                data: {
                    username: username,
                    password_hash: password
                }
            }, process.env.JWT_SECRET, {
                expiresIn: '10d'
            });
            return token;
        });
    }

    // String String -> Promise(JWT)
    // Returns true given a proper login
    // False given an incorrect login
    login(username, unencrypt_password) {
        return this.authDB.login(username, unencrypt_password, "therapist");
    }

    // Void -> Promise(List-of (Object String Number))
    // Gives a list of every therapist and the number of patients they have
    get_all_therapists() {
        return this.pool.getConnection().then(connection => {
            var res = connection.query(therapist_sql.get_all_therapist_info);
            connection.release();
            return res;
        }).then(results => {
            var toSend = [];
            for (var i = 0; i < results.length; i += 1) {
                toSend.push({
                    username: results[i].username,
                    num_patients: results[i].c
                });
            }
            return toSend;
        });
    }

    // String -> Promise(Void)
    // Deletes this therapist
    delete_therapist(therapistID) {
        var inserts = [therapistID];
        var deleteUserQuery = mysql.format(general_sql.delete_user_sql, inserts);
        return this.pool.getConnection().then(connection => {
            var res = connection.query(deleteUserQuery)
            connection.release();
            return res;
        }).then(d => {
            if (d.affectedRows === 0) {
                throw new Error("User not found");
            }
        });
    }

    // String -> Promise([List-of Patient-Session])
    // Return every patient this therapist has
    get_all_patients(therapistID) {
        var inserts = [therapistID];
        var connection;
        var get_specific_patient = this.get_specific_patient;
        return this.pool.getConnection().then(con => {
            connection = con;
            var query = mysql.format(therapist_sql.get_therapist_patients_sql, inserts);
            return connection.query(query);
        }).then(results1 => {
            if (results1.length === 0) {
                connection.release();
                return [];
            } else {
                var promises = [];
                for (var i = 0; i < results1.length; i += 1) {
                        var username = results1[i].username;
                        var dob = results1[i].dob;
                        var weight = results1[i].weight;
                        var height = results1[i].height;
                        var information = results1[i].information;
                        promises.push(get_specific_patient(username, dob, weight, height, information, connection))
                }
                connection.release();
                return Promise.all(promises);
            }
        });
    }

    // String Date Number Number String DBConnection -> Promise(Patient)
    get_specific_patient(username, dob, weight, height, information, connection) {
        var query = mysql.format(session_sql.get_patient_recent_sessions_sql, [username]);
        return connection.query(query).then(results2 => {
            var score = undefined;
            var time = undefined;
            var effort = undefined;
            var motivation = undefined;
            var engagement = undefined;
            if (results2.length > 0) {
                score = results2[0].score;
                time = results2[0].time;
                effort = results2[0].effort;
                motivation = results2[0].motivation;
                engagement = results2[0].engagement;
            }
            return {
                username: username,
                dob: dob,
                weight: weight,
                height: height,
                information: information,
                last_score: score,
                last_activity_time: time,
                last_effort: effort,
                last_motivation: motivation,
                last_engagement: engagement
            };
        });
    }
}

module.exports = TherapistDB;