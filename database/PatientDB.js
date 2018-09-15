require('dotenv').config();
const mysql = require('promise-mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');

var patient_sql = require('./sql/patient_sql.js')
var message_sql = require('./sql/message_sql.js')
var session_sql = require('./sql/session_sql.js')
var request_sql = require('./sql/request_sql.js')
var general_sql = require('./sql/general_sql.js')


/********************SQL STATEMENTS*******************/

class PatientDB {

    // Objects:
    // Patient = Object(String Date Number Number String)
    // Patient-Session = Object(username dob weight height information last_score last_activity_time last_effort last_motivation last_engagement)
    // Session = Object(score: Number time: Date)
    // Message = Object(String String Date Boolean Number)

    constructor(connection, authorizer) {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: "WHAM_TEST"
        });
        this.authorizer = authorizer;
    }

    // Void -> Promise(([List-of Patient-Session])
    // Returns every patients info and their last session
    get_all_patient_info() {
        return this.pool.getConnection().then(connection => {
            var res = connection.query(patient_sql.get_all_patient_info_sql);
            connection.release();
            return res;
        });

    }

    // String -> Promise([Patient [List-of Session] [List-of Message] [List-of String]])
    // Gives all information for the given patient
    get_patient_info(username) {
        var inserts = [username];
        var info_query = mysql.format(patient_sql.get_patient_info_sql, inserts);
        var session_query = mysql.format(session_sql.get_all_patient_sessions_sql, inserts);
        var message_query = mysql.format(message_sql.get_all_patient_message_sql, inserts);
        var requests_query = mysql.format(request_sql.get_all_patient_requests_sql, inserts);

        var user_info;
        var session_info;

        return this.pool.getConnection().then(connection => {
            let res = Promise.all([
                connection.query(info_query),
                connection.query(session_query),
                connection.query(message_query),
                connection.query(requests_query)
            ]);
            connection.release();
            return res;
        }).then(([user_results, session_results, message_results, requests_results]) => {
            user_info = user_results[0]
            if(user_info == undefined) {
                throw new Error("User not found");
            }

            session_info = [];
            var lastID = undefined
            var curSessionItems = []
            for(var i = 0; i < session_results.length; i++) {
                if(lastID == undefined || session_results[i].sessionID !== lastID) {
                    if(lastID != undefined) {
                        session_info.push({
                            sessionID: lastID,
                            effort: session_results[i-1].effort,
                            motivation: session_results[i-1].motivation,
                            engagement: session_results[i-1].engagement,
                            scores: curSessionItems
                        })
                    }
                    lastID = session_results[i].sessionID
                    curSessionItems = []
                }
                curSessionItems.push({
                    score: session_results[i].score,
                    time: session_results[i].time
                })
            }
            if(lastID != undefined) {
                session_info.push({
                    sessionID: lastID,
                    effort: session_results[session_results.length-1].effort,
                    motivation: session_results[session_results.length-1].motivation,
                    engagement: session_results[session_results.length-1].engagement,
                    scores: curSessionItems
                })
            }

            var requests = [];
            for (var i = 0; i < requests_results.length; i += 1) {
                requests.push(requests_results[i].therapistID);
            }
            return [user_info, session_info, message_results, requests];
        });
    }

    // String String String Number Number String -> Promise(JWT)
    // Tries to add the patient to the database
    // If suceed, returns 
    // If fail, throws an error (user already exists or other)
    // Note: Weight in Kilo, Height in CM, DOB in YYYY-MM-DD
    add_patient(username, unencrypt_password, dob, weight, height, information) {
        // Username, DOB, Weight, Height
        var salt = bcrypt.genSaltSync(saltRounds);
        var password = bcrypt.hashSync(unencrypt_password, salt);


        var user_inserts = [username, password, salt];
        var patient_inserts = [username, dob, weight, height, information];
        var add_user_query = mysql.format(general_sql.add_user_sql, user_inserts);
        var add_patient_query = mysql.format(patient_sql.add_patient_sql, patient_inserts);
        return this.pool.getConnection().then(connection => {
            var res = Promise.all([connection.query(add_user_query), connection.query(add_patient_query)]);
            connection.release();
            return res;
        }).then(result => {
            var token = jwt.sign({
                data: {
                    username: username,
                    password_hash: password
                }
            }, process.env.JWT_SECRET, {
                expiresIn: '10d'
            });
            return token
        });
    }

    // String -> Promise(Void)
    // Tries to purge the patient from the DB
    // Including all session, message, and patient-therapist info
    // If suceed, returns
    // If fail, throws an error (unknown reason, probably server error)
    delete_patient(patientID) {
        var inserts = [patientID];
        return this.pool.getConnection().then(connection => {
            var delete_indiv_user_query = mysql.format(general_sql.delete_user_sql, inserts);
            connection.release();
            var res = connection.query(delete_indiv_user_query)
            return res;
        }).then(res => {
            if (res.affectedRows !== 0) {
                return
            } else {
                throw new Error("No User Deleted");
            }
        })
    }

    // String String -> Promise(JWT)
    // Returns true given a proper login
    // False given an incorrect login
    login(username, unencrypt_password) {
        return this.authorizer.login(username, unencrypt_password);
    }

}

module.exports = PatientDB;