require('dotenv').config();
const mysql = require('mysql');
var fs = require('fs');

class DBReseter {

    constructor(dbName) {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: "WHAM_TEST",
            socketPath: '/tmp/mysql.sock',
            multipleStatements: true
        });
    }

    // (Boolean -> Void) -> Void
    // Sets the DB schema to the most current one and clears the data
    reset_db(callback) {
        var sql = fs.readFileSync(__dirname + '/Schemas' + '/schemas.sql').toString();
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(false);
                throw err;
            }
            connection.query(sql, function (error, result) {
                if (error) {
                    callback(false);
                } else {
                    callback(true);
                }
            });
        });
    }
}

module.exports = DBReseter;