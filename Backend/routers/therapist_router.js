const express = require('express');

const all_therapists = require('../main/therapists/all_therapists.js');
const single_therapist = require('../main/therapists/id/single_therapist.js');
const therapist_patients = require('../main/therapists/id/patients/therapist_patients.js');
const therapist_patient = require('../main/therapists/id/patients/id/therapist_patient.js');
const therapist_messages = require('../main/therapists/id/messages/therapist_messages.js');

// The file path that has the code for verifying the JWT and checking permissions
const auth_helpers = require('../helpers/auth_helper.js');

const therapist_route = express.Router();

therapist_route.param('patientID', auth_helpers.canViewPatient);
therapist_route.param('therapistID', auth_helpers.canViewTherapist)

therapist_route.use(auth_helpers.verifyJWT);

// Returns info about every therapist
therapist_route.get('/', auth_helpers.hasAdminPriv, all_therapists.getAllTherapists);

// Returns info about this therapist in particuliar
therapist_route.get('/:therapistID', single_therapist.getTherapist);

// Removed this therapist and all assicated information from the server
therapist_route.delete('/:therapistID', single_therapist.deleteTherapist);

// Returns info about this therapists patients
therapist_route.get('/:therapistID/patients', therapist_patients.getTherapistPatients);

// Pairs the given patient with this therapist
therapist_route.post('/:therapistID/patients', therapist_patients.addPatientTherapist);

// Unpairs this therapist from this patient
// DOES NOT delete the pair, simply marks its "date_removed" as today
therapist_route.delete('/:therapistID/patients/:patientID', therapist_patient.removePatientTherapist);

// Returns every message this therapist has sent
therapist_route.get('/:therapistID/messages', therapist_messages.getMessagesFromTherapist);

// Sends a message to this patient
therapist_route.post('/:therapistID/messages', therapist_messages.addPatientMessage);

module.exports = therapist_route;


