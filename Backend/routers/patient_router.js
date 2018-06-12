const express = require('express');

const all_patients = require('../main/patients/all_patients.js');
const single_patient = require('../main/patients/id/single_patient.js');
const patient_sessions = require('../main/patients/id/sessions/patient_sessions.js');
const single_session = require('../main/patients/id/sessions/id/single_session.js');
const patient_messages = require('../main/patients/id/messages/patient_messages.js');
const single_message = require('../main/patients/id/messages/id/single_message.js');
const therapist_patient = require('../main/therapists/id/patients/id/therapist_patient.js');

// The file path that has the code for verifying the JWT and checking permissions
const auth_helpers = require('../helpers/auth_helper.js');

const patient_route = express.Router();

patient_route.use(auth_helpers.verifyJWT);

// If these params are present, these helpers should be run
patient_route.param('patientID', auth_helpers.canViewPatient)
patient_route.param('messageID', auth_helpers.canViewMessage)

// Returns info about every patient
patient_route.get('/', auth_helpers.hasAdminPriv, all_patients.getPatients);

// Returns info about this patient
patient_route.get('/:patientID', single_patient.getPatient);

// Deletes this patient and all associated information
patient_route.delete('/:patientID', single_patient.deletePatient);

// Returns info about every session this patient has logged
patient_route.get('/:patientID/sessions', patient_sessions.getPatientSessions);

// Adds a session to this patients log
patient_route.post('/:patientID/sessions', patient_sessions.addPatientSession);

// Returns informaiton about this specific session
patient_route.get('/:patientID/sessions/:sessionID', single_session.getSession);

// Deletes this specific session
patient_route.delete('/:patientID/sessions/:sessionID', single_session.deletePatientSession);

// Sends a message to this patient
patient_route.post('/:patientID/messages', patient_messages.addPatientMessage);

// Returns every message this patient has recieved
patient_route.get('/:patientID/messages', patient_messages.getPatientMessages);

// Marks this message as read
patient_route.patch('/:patientID/messages/:messageID', single_message.markMessageAsRead);

// Marks this message as read
patient_route.put('/:patientID/messages/:messageID', single_message.replyToMessage);

// Return info about this message in specific
patient_route.get('/:patientID/messages/:messageID', single_message.getMessage);

// Deletes this message from the DB
patient_route.delete('/:patientID/messages/:messageID', single_message.deletePatientMessage);

// Accepts this patient-therapist join
// Marks is_accepted as true
patient_route.patch('/:patientID/therapists/:therapistID', therapist_patient.acceptPair);

// Unpairs this therapist from this patient
// DOES NOT delete the pair, simply marks its "date_removed" as today
patient_route.delete('/:patientID/therapists/:therapistID', therapist_patient.removePatientTherapist);

module.exports = patient_route;