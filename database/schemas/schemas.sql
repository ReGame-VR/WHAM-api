DROP TABLE IF EXISTS MESSAGE_REPLY;
DROP TABLE IF EXISTS PATIENT_MESSAGE;
DROP TABLE IF EXISTS SESSION_ITEM;
DROP TABLE IF EXISTS SESSION;
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
    FOREIGN KEY (username) REFERENCES USER(username) ON DELETE CASCADE
);

-- The infromation for a single therapist
CREATE TABLE THERAPIST (
    username VARCHAR(100),
    PRIMARY KEY (username),
    FOREIGN KEY (username) REFERENCES USER(username) ON DELETE CASCADE
);

-- Shows which therapist is assigned to which patient 
-- multiple patients can have multiple therapists
CREATE TABLE PATIENT_THERAPIST (
    patientID VARCHAR(100),
    therapistID VARCHAR(100),
    date_assigned DATE,
    date_removed DATE, -- CAN BE NULL
    is_accepted BOOLEAN, -- false means patient must accept, true means is accepted
    PRIMARY KEY(patientID, therapistID),
    FOREIGN KEY (patientID) REFERENCES PATIENT(username) ON DELETE CASCADE, 
    FOREIGN KEY (therapistID) REFERENCES THERAPIST(username) ON DELETE CASCADE  
);

-- The general object for a SESSION (spans a period of time)
-- Stores ID, patient, and feedback things
CREATE TABLE SESSION ( 
    patientID VARCHAR(100),
    sessionID INTEGER NOT NULL AUTO_INCREMENT,
    effort INTEGER,
    motivation INTEGER,
    engagement INTEGER,
    PRIMARY KEY (sessionID),
    FOREIGN KEY (patientID) REFERENCES PATIENT(username) ON DELETE CASCADE
);

-- A single session item for one point in time
-- Stores a score, time, and ID
CREATE TABLE SESSION_ITEM (
    sessionID INTEGER,
    score FLOAT,
    time DATETIME,
    FOREIGN KEY (sessionID) REFERENCES SESSION(sessionID) ON DELETE CASCADE
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
    FOREIGN KEY (patientID) REFERENCES PATIENT(username) ON DELETE CASCADE,
    FOREIGN KEY (therapistID) REFERENCES THERAPIST(username) ON DELETE CASCADE
);

-- Stores all the replys either the patient or the therapist has sent in a message thread
CREATE TABLE MESSAGE_REPLY (
    messageID INTEGER,
    fromID VARCHAR(100),
    date_sent DATETIME,
    content VARCHAR(8000),
    replyID INTEGER NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (replyID),
    FOREIGN KEY (messageID) REFERENCES PATIENT_MESSAGE(messageID) ON DELETE CASCADE,
    FOREIGN KEY (fromID) REFERENCES USER(username) ON DELETE CASCADE
);