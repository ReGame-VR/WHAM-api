

DROP TABLE IF EXISTS PATIENT;
DROP TABLE IF EXISTS THERAPIST;
DROP TABLE IF EXISTS PATIENT_THERAPIST;
DROP TABLE IF EXISTS PATIENT_SESSION;
DROP TABLE IF EXISTS PATIENT_MESSAGE;

CREATE TABLE PATIENT (
    -- The information for a single patient
    username VARCHAR(100),
    password VARCHAR(100),
    dob DATE,
    weight FLOAT,
    height FLOAT,
    information VARCHAR(100),
    PRIMARY KEY (username)
);

CREATE TABLE THERAPIST (
    -- The infromation for a single therapist
    username VARCHAR(100),
    password VARCHAR(100),
    PRIMARY KEY (username)
);

CREATE TABLE PATIENT_THERAPIST (
    -- Shows which therapist is assigned to which patient 
    -- multiple patients can have multiple therapists
    patientID VARCHAR(100),
    therapistID VARCHAR(100),
    date_assigned DATE,
    date_removed DATE, -- CAN BE NULL
    FOREIGN KEY (patientID) REFERENCES PATIENT(username),
    FOREIGN KEY (therapistID) REFERENCES THERAPIST(username)   
);

CREATE TABLE PATIENT_SESSION ( 
    -- Shows all recorded patient activies
    -- A given activity on a given day will have multiple entires accross times 
    patientID VARCHAR(100),
    score FLOAT,
    time DATE,
    PRIMARY KEY (patientID, score, time),
    FOREIGN KEY (patientID) REFERENCES PATIENT(username)
);

CREATE TABLE PATIENT_MESSAGE (
    -- Shows the messages between a given patient and a given therapist
    -- A therapists can send any number of messages on a single day 
    -- A patient can recieve any number
    patientID VARCHAR(100),     
    therapistID VARCHAR(100),
    message VARCHAR(8000),
    date_sent DATE,
    is_read BOOLEAN,
    FOREIGN KEY (patientID) REFERENCES PATIENT(username),
    FOREIGN KEY (therapistID) REFERENCES THERAPIST(username)   
    -- No primary key
);