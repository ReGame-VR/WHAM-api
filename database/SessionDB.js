require('dotenv').config();
const mysql = require('promise-mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');

var session_sql = require('./sql/session_sql.js')

class SessionDB {

    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: "WHAM_TEST"
        });
    }

    // String -> Promise([List-of Session])
    // Gives all the session info for a given patient
    get_patient_sessions(patientID) {
        var inserts = [patientID];

        return this.pool.getConnection().then(connection => {
            var session_query = mysql.format(session_sql.get_all_patient_sessions_sql, inserts);
            var res = connection.query(session_query);
            connection.release();
            return res;
        }).then(result => {
            var to_output = []
            var lastID = undefined
            var curSessionItems = []
            for(var i = 0; i < result.length; i++) {
                if(lastID == undefined || result[i].sessionID !== lastID) {
                    if(lastID != undefined) {
                        to_output.push({
                            sessionID: lastID,
                            effort: result[i-1].effort,
                            motivation: result[i-1].motivation,
                            engagement: result[i-1].engagement,
                            scores: curSessionItems
                        })
                    }
                    lastID = result[i].sessionID
                    curSessionItems = []
                }
                curSessionItems.push({
                    score: result[i].score,
                    time: result[i].time
                })
            }
            if(lastID != undefined) {
                to_output.push({
                    sessionID: lastID,
                    effort: result[result.length-1].effort,
                    motivation: result[result.length-1].motivation,
                    engagement: result[result.length-1].engagement,
                    scores: curSessionItems
                })
            }
            return to_output;
        })
    }

     // String Number Number Number [List-of Session] -> Promise(Void)
    // Adds an entry for a session to the DB
    // If suceed, returns
    // If fail, throws an error (server error or already added)
    add_session(patientID, effort, motivation, engagement, scores) {
        var connection;
        return this.pool.getConnection().then(con => {
            connection = con;
            var add_patient_session_query = mysql.format(session_sql.add_patient_session_sql, [patientID, effort, motivation, engagement]);
            var res = connection.query(add_patient_session_query);
            return res;
        }).then(res => {
            let sessionID = res.insertId;
            var promises = [];
            for(var i = 0; i < scores.length; i++) {
                var add_patient_session_item_query = mysql.format(session_sql.add_patient_session_item_sql, [sessionID, scores[i].score, scores[i].time]);
                promises.push(connection.query(add_patient_session_item_query))
            }
            var res = Promise.all(promises);
            connection.release();
            return
        });

    }

    // String String -> Promise(Session)
    // Gives the score for the session at the given time/sessionID (accepts both)
    get_session_specific(patientID, sessionID) {
        var inserts = [patientID, sessionID];
        return this.pool.getConnection().then(connection => {
            var get_specif_patient_session_query = mysql.format(session_sql.get_specif_patient_session_sql, inserts);
            var res = connection.query(get_specif_patient_session_query);
            connection.release();
            return res;
        }).then(result => { 
            if(result.length === 0) {
                throw new Error("No session found");
            }
            var to_output = {

            }
            to_output.engagement = result[0].engagement;
            to_output.motivation = result[0].motivation;
            to_output.effort = result[0].effort;
            var scores = [];
            for(var i = 0; i < result.length; i++) {
                scores.push({
                    score: result[i].score,
                    time: result[i].time
                })
            }
            to_output.scores = scores
            return to_output
        });
    }

    // String String -> Promise(Void)
    // Deletes a given patient session for the DB
    // If suceed, gives true
    // If fail, gives false (server error)
    delete_session(patientID, sessionID) {
        var inserts = [patientID, sessionID];

        return this.pool.getConnection().then(connection => {
            var delete_specif_session_query = mysql.format(session_sql.delete_indiv_session_sql, inserts);
            var res = connection.query(delete_specif_session_query);
            connection.release();
            return res;
        }).then(result => {
            if (result.affectedRows === 0) {
                throw new Error("Session not found");
            } else {
                return;
            }
        })
    }


}

module.exports = SessionDB