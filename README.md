# WHAM

[![Build Status](https://travis-ci.org/ReGame-VR/WHAM-api.svg?branch=master)](https://travis-ci.org/ReGame-VR/WHAM-api)

It is very common for physical therapists to assign activities like Wii games for PT, however once the patients leave the hospital or clinic, there is no way for the therapists to track their progress. The Wearable Home Activity Monitor (WHAM) is a Northeastern ReGame VR Lab project that is attempting to solve this problem.  

We are developing a cheap sensor system that can be used to track the data of patients like range of motion, engagement, heart rate, and many others. Featured on this GitHub Repository are all the software parts to this project.

Important Info For Developers:

Required Setup:

1. Install and Run a MySQL server. Create a database WHAM_TEST
2. Run npm install
3. Create a .env file in the main folder. 
Required Fields:

DB_HOST=?<br>
DB_USER=?<br>
DB_PASS=?<br>
JWT_SECRET=?<br>
ADMIN_PASSWORD=?

4. Run "npm test" "npm restart" or "npm start"

API Next Steps:
1. Link API to actual URL on the Google Cloud Compute Server
1. Make the API support the data that is actually sent from the hardware.
2. Use React Native instead of Handlebars as the template-ing engine.


