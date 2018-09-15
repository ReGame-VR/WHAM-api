require('dotenv').config();
const mysql = require('promise-mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');

var request_sql = require('./sql/request_sql.js')

class RequestDB {

    constructor(connection, authorizer) {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: "WHAM_TEST"
        });
        this.authorizer = authorizer;
    }

    // String String Date -> Promise(Void)
    // Pairs this therapist and patient in the PATIENT_THERAPIST DB
    assign_to_therapist(patientID, therapistID, date_added) {
        var inserts = [patientID, therapistID, date_added];
        return this.pool.getConnection().then(connection => {
            var query = mysql.format(request_sql.add_patient_therapist_join_sql, inserts);
            var res = connection.query(query);
            connection.release();
            return res;
        });
    }

    // String String -> Promise(Void)
    // Marks this patient-therapist join as accepted
    accept_therapist_request(patientID, therapistID) {
        var inserts = [patientID, therapistID];
        return this.pool.getConnection().then(connection => {
            var query = mysql.format(request_sql.accept_therapist_request_sql, inserts);
            var res = connection.query(query);
            connection.release();
            return res;
        }).then(result => {
            if (result.affectedRows === 0) {
                throw new Error("Pair does not exist");
            }
        });
    }

    // String String Date -> Promise(Void)
    // Unpairs this therapist and patient in the PATIENT_THERAPIST DB
    // DOES NOT delete this pair, simply marks its date_removed as the given date
    unassign_to_therapist(patientID, therapistID, date_removed) {
        var inserts = [date_removed, patientID, therapistID];
        return this.pool.getConnection().then(connection => {
            var query = mysql.format(request_sql.remove_patient_therapist_join_sql, inserts);
            connection.release();
            var res = connection.query(query);
            return res;
        }).then(result => {
            if (result.affectedRows === 0) {
                throw new Error("Pair not found");
            }
        });
    }

}

module.exports = RequestDB