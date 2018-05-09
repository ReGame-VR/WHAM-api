DROP TABLE IF EXISTS PATIENT_MESSAGE;
DROP TABLE IF EXISTS PATIENT_SESSION;
DROP TABLE IF EXISTS PATIENT_THERAPIST;
DROP TABLE IF EXISTS PATIENT;
DROP TABLE IF EXISTS THERAPIST;

-- The information for a single patient
CREATE TABLE PATIENT (
    username VARCHAR(100),
    password VARCHAR(100),
    salt VARCHAR(100),
    dob DATE,
    weight FLOAT,
    height FLOAT,
    information VARCHAR(100),
    PRIMARY KEY (username)
);

-- The infromation for a single therapist
CREATE TABLE THERAPIST (
    username VARCHAR(100),
    password VARCHAR(100),
    PRIMARY KEY (username)
);

-- Shows which therapist is assigned to which patient 
-- multiple patients can have multiple therapists
CREATE TABLE PATIENT_THERAPIST (
    patientID VARCHAR(100),
    therapistID VARCHAR(100),
    date_assigned DATE,
    date_removed DATE, -- CAN BE NULL
    FOREIGN KEY (patientID) REFERENCES PATIENT(username),
    FOREIGN KEY (therapistID) REFERENCES THERAPIST(username)   
);

-- Shows all recorded patient activies
-- A given activity on a given day will have multiple entires accross times 
CREATE TABLE PATIENT_SESSION ( 
    patientID VARCHAR(100),
    score FLOAT,
    time DATE,
    PRIMARY KEY (patientID, score, time),
    FOREIGN KEY (patientID) REFERENCES PATIENT(username)
);

-- Shows the messages between a given patient and a given therapist
-- A therapists can send any number of messages on a single day 
-- A patient can recieve any number
CREATE TABLE PATIENT_MESSAGE (
    patientID VARCHAR(100),     
    therapistID VARCHAR(100),
    message VARCHAR(8000),
    date_sent DATE,
    is_read BOOLEAN,
    FOREIGN KEY (patientID) REFERENCES PATIENT(username),
    FOREIGN KEY (therapistID) REFERENCES THERAPIST(username)   
);