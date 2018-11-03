require('dotenv').config();
const mysql = require('promise-mysql');
var fs = require('fs');

class DBReseter {

    constructor(patientDB) {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: "WHAM_TEST",
            multipleStatements: true
        });
        this.patientDB = patientDB;
    }

    // Void -> Promise(Void)
    // Sets the DB schema to the most current one and clears the data
    // Also adds the admin user
    reset_db() {
        var sql = fs.readFileSync(__dirname + '/schemas' + '/schemas.sql').toString();
        var patientDB = this.patientDB;
        return this.pool.getConnection().then(function (connection) {
            var res = connection.query(sql);
            connection.release();
            return res;
        }).then(result => {
            return patientDB.add_patient("admin", process.env.ADMIN_PASSWORD, "1999-05-05", "160", "71", "").then(token => {
                return token;
            });
        })
    }
}

module.exports = DBReseter;
