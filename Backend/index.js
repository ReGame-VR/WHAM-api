/******************************LOAD REQUIRED FILES****************************/
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const path = require('path');
const PatientDB = require('./database/PatientDB.js');
const TherapistDB = require('./database/TherapistDB.js');
const AuthenticationDB = require('./database/AuthenticationDB.js');
const ResetDB = require('./database/ResetDB.js');
const responder = require('./helpers/http-responses.js'); // The file that handles sending the actual info 
const methodOverride = require('method-override');
const main_router = require('./routers/main_router.js'); // The main router file that delegates to every sub URL

/******************************CREATE THE DATABASES****************************/

// The database used to authenticate transactions
const authorizer = new AuthenticationDB('WHAM_TEST');
// The db used to change stuff related to patients
const patientDB = new PatientDB('WHAM_TEST', authorizer);
// The db used to change stuf related to therapists
const therapistDB = new TherapistDB('WHAM_TEST', authorizer);
// The db that the admin can query to to reset the app
const resetDB = new ResetDB("WHAM_TEST", patientDB);

/********************************LOAD HANDLEBARS HELPERS********************************/

// The helpers for handlebars to render stuff
var hbs = exphbs.create({
    helpers: {
        json: function (context) {
            return JSON.stringify(context);
        },
        get_date: function () {
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1; //January is 0!
            var yyyy = today.getFullYear();
            if (dd < 10) {
                dd = '0' + dd
            }
            if (mm < 10) {
                mm = '0' + mm
            }
            today = yyyy + "-" + mm + "-" + dd;

            return JSON.stringify(today);
        },
        concat: (...args) => args.slice(0, -1).join('')
    }
});

/****************************BEGIN DOING STUFF TO THE EXPRESS APP***************************/
const app = express();

// Loads the handlebars rendering engine
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Sets the path or something (???)
app.use(express.static(path.join(__dirname, 'public')));

// Gives express the ability to parse JSON
app.use(bodyParser.json());

// Gives the ability to read cookies (for auth_token from browser)
app.use(cookieParser())

// Gives express the ability to parse query parameters
app.use(bodyParser.urlencoded({
    extended: true
}));

// Loads all the DB/helpers to the Req
app.use(function (req, res, next) {
    req.patientDB = patientDB;
    req.therapistDB = therapistDB;
    req.authorizer = authorizer;
    req.responder = responder;
    req.resetDB = resetDB;
    next();
})

// HTML Forms do not support PUT, PATCH, and DELETE so this method
// allows the form to pass a parameter _method that overrides whatever
// the existing method (probably POST) is.
app.use(methodOverride('_method'));

app.use('/', main_router);

app.listen(3000, () => console.log('WHAM listening on port 3000!'));

/************************STUFF FOR TESTING PURPOSES**********************************/

// The helper to reset the app
const resetApp = function (callback) {
    authorizer.reset_self()
    resetDB.reset_db().then(token => {
        callback(token);
    });
}


module.exports = {
    app: app,
    reset: resetApp
}; // for testing with chai