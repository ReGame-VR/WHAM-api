function handle_error(error, connection, callback) {
    if (connection !== undefined && connection && connection.release) {
        try {
            connection.release();
        } catch(error) {

        }
    }
    connection = undefined;
    callback(false);
}

module.exports = handle_error;