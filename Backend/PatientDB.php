<?php

class PatientDB {

    public $db;

    // Sets the object database equal to the overall one
    function __construct($db_name) {
        $this->db = new mysqli('localhost', get_username(), get_password(), $db_name);
    }

    // Destroys the database object
    function __destruct() {
        $this->db->close();
    }

    // String String Date Double Double String -> Void
    // EFFEFCT: Adds this patient information to the database
    function addPatient($username, $password, $dob, $weight, $height, $information) {
        $addUserQuerry = $this->db->prepare("INSERT INTO USERS VALUES (?, ?, ?, ?, ?, ?);");
        $addUserQuerry->bind_param("sssdds", $username, $password, $dob, $weight, $height, $information);
        $addUserQuerry->execute();
        $addUserQuerry->close();
    }

}

?>