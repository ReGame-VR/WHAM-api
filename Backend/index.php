<?php

// String Array<String> -> ???
function handleRequest($requestType, $requestURL) {
    echo("handling");
    $patientDB = PatientDB("WHAM");
    if($requestType == "PUT") {
        if(length($requestURL) == 2 && $requestURL[0] == "users") {
            // $username, $password, $dob, $weight, $height, $information
            $parts = explode(",", $requestURL[1]);
            return $patientDB->addPatient($parts[0], $parts[1], $parts[2], $parts[3], $parts[4], $parts[5]);
        }
    }
}



?>