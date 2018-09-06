DROP TABLE IF EXISTS MESSAGE_REPLY;
DROP TABLE IF EXISTS PATIENT_MESSAGE;
DROP TABLE IF EXISTS PATIENT_SESSION;
DROP TABLE IF EXISTS PATIENT_THERAPIST;
DROP TABLE IF EXISTS PATIENT;
DROP TABLE IF EXISTS THERAPIST;
DROP TABLE IF EXISTS USER;

-- The information for a general user (super table)
CREATE TABLE USER (
    username VARCHAR(100),
    password VARCHAR(100),
    salt VARCHAR(100),
    auth_level VARCHAR(20),
    PRIMARY KEY (username)
);

-- The information for a single patient
CREATE TABLE PATIENT (
    username VARCHAR(100),
    dob DATE,
    weight FLOAT,
    height FLOAT,
    information VARCHAR(100),
    PRIMARY KEY (username),
    FOREIGN KEY (username) REFERENCES USER(username)
);

-- The infromation for a single therapist
CREATE TABLE THERAPIST (
    username VARCHAR(100),
    PRIMARY KEY (username),
    FOREIGN KEY (username) REFERENCES USER(username)
);

-- Shows which therapist is assigned to which patient 
-- multiple patients can have multiple therapists
CREATE TABLE PATIENT_THERAPIST (
    patientID VARCHAR(100),
    therapistID VARCHAR(100),
    date_assigned DATE,
    date_removed DATE, -- CAN BE NULL
    is_accepted BOOLEAN, -- false means patient must accept, true means is accepted
    FOREIGN KEY (patientID) REFERENCES PATIENT(username),
    FOREIGN KEY (therapistID) REFERENCES THERAPIST(username)   
);

-- Shows all recorded patient activies
-- A given activity on a given day will have multiple entires accross times 
CREATE TABLE PATIENT_SESSION ( 
    patientID VARCHAR(100),
    score FLOAT,
    time DATETIME,
    sessionID INTEGER NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (sessionID),
    -- PRIMARY KEY (patientID, time),
    FOREIGN KEY (patientID) REFERENCES PATIENT(username)
);

-- Shows the messages between a given patient and a given therapist
-- A therapists can send any number of messages on a single day 
-- A patient can recieve any number
CREATE TABLE PATIENT_MESSAGE (
    patientID VARCHAR(100),     
    therapistID VARCHAR(100),
    message VARCHAR(8000),
    date_sent DATETIME,
    is_read BOOLEAN,
    messageID INTEGER NOT NULL AUTO_INCREMENT,
    PRIMARY KEY(messageID),
    FOREIGN KEY (patientID) REFERENCES PATIENT(username),
    FOREIGN KEY (therapistID) REFERENCES THERAPIST(username)   
);

-- Stores all the replys either the patient or the therapist has sent in a message thread
CREATE TABLE MESSAGE_REPLY (
    messageID INTEGER,
    fromID VARCHAR(100),
    date_sent DATETIME,
    content VARCHAR(8000),
    replyID INTEGER NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (replyID),
    FOREIGN KEY (messageID) REFERENCES PATIENT_MESSAGE(messageID),
    FOREIGN KEY (fromID) REFERENCES USER(username)
);