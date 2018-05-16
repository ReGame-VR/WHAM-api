require('dotenv').config();
const mysql = require('mysql');
var fs = require('fs');

class DBReseter {


    constructor(dbName) {
        this.connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: dbName,
            multipleStatements: true
        });

        this.connection.connect(function (err) {
            if (err) throw err;
        });
    }

    // (Boolean -> Void) -> Void
    // Sets the DB schema to the most current one and clears the data
    reset_db(callback) {
        var sql = fs.readFileSync(__dirname + '/Schemas' + '/schemas.sql').toString(); 
        this.connection.query(sql, function(error, result) {
            if (error) {
                throw error;
                callback(false);
            } else {
                callback(true);
            }
        });
    }
}

module.exports = DBReseter;

