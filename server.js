const express = require('express');
const bodyParser = require('body-parser');
const { request } = require('express');
const { Timestamp } = require('mongodb');
const app = express();

app.use(express.urlencoded({
    extended: true
}));

function main() {
    const MongoClient = require('mongodb').MongoClient;
    MongoClient.connect('mongodb+srv://Admin:Password@cluster0.ejcge.mongodb.net/<dbname>?retryWrites=true&w=majority', (err, client) => {
        console.log('Connected to the server');
        if (err) return console.log(err);
 //       var db = client.db('AFRMS');
        var client = client;
        app.listen(3000, () => { console.log('listening on 3000') });

//        app.get('/', function (req, res) { res.render(__dirname + '/views/pages/signInPage.html'); });  // Note: __dirname is the path to your current working directory. Try logging it and see what you get!
//        app.get('/createUser', function (req, res) { res.render(__dirname + '/views/pages/createUser.html'); });

        app.use(bodyParser.urlencoded({ extended: true }));
        var userID = signIn(client);

    });
}


function signIn(client) {
    console.log("In sign in function");
//    app.get('/', function (req, res) { res.sendFile(__dirname + '/views/pages/signInPage.html'); });  // Note: __dirname is the path to your current working directory. Try logging it and see what you get!
    app.get('/', (req, res) => { res.sendFile(__dirname + '/signinPage.html') });
    app.post('/Userlogin', async (req, res) => {
        var username = req.body.username;
        var pass = req.body.password;
        console.log("username and pass are set");

        console.log("Searching for user: ");
        console.log(username);
        console.log(pass);
        var dataFunc = require("./databaseFunctions");
        var userID = await dataFunc.findUser(client, username, pass);

        //If employeeID is null that means that either the username or password were incorrect
        console.log(userID);
        if (userID == null) {
            console.log("Did not find an User");
            //return null;
        }
        else {
            console.log("Found User!");
            //GO TO THE MENU PAGE
            var user = await dataFunc.getUser(client, userID);
            console.log(user.role);
            if (user.role == "PIN") {
                console.log("User role: PIN");
                var eventID = submitEventPIN(client, user, req, res);
            }
            else if (user.role == "Operations Chief") {
                console.log("User role: OC");
                ocMenu(client, user, req, res);

            }
            else if (user.role == "Dispatcher") {
                console.log("User role: Dispatcher");
                dispMenu(client, user, req, res);

            }
            else if (user.role == "First Responder") {
                console.log("User role: First Responder");
                frMenu(client, user, req, res);

            }
            else if (user.role == "Admin") {
                console.log("User role: Admin");
                adminMenu(client, user, req, res);

            }
        }
        res.end();
    });

    app.post('/createUser', async (req, res) => {
        var username = req.body.username;
        var pass = req.body.password;

        app.get('/createUser', (req, res) => { res.sendFile(__dirname + '/createUser.html') });
        res.redirect('/createUser');

        var dataFunc = require("./databaseFunctions");
        var userID = await dataFunc.addUser(client, username, pass, "PIN");

        if (userID == null) {
            console.log("Username unavailable");
            return null;
        }
        else {
            console.log("Successfully created a new user");
            signIn(client);
        }

        if (userID == null) {
            console.log("Unable to create user");
            return null;
        }
        else {
            console.log("User created successfully");
            return userID;
        }
        res.end();
    });
}

function submitEventPIN(client, user, req, res) {

    app.get('/submitEvent', (req, res) => { res.sendFile(__dirname + '/submitEvent.html') });
    res.redirect('/submitEvent');
    app.post('/SubmitEvent', async (req, res) => {
        var name = req.body.name;
        var number = req.body.number;
        var email = req.body.email;
        var location = req.body.location;
        var desc = req.body.description;
        var time = new Date();

        var dataFunc = require("./databaseFunctions");

        if (name != null & location != null & desc != null) {
            var eventID = await dataFunc.addEvent(client, {
                PIN: user.userID,
                PIN_Name: name,
                Number: number,
                Email: email,
                Location: location,
                Description: desc,
                timestamp: time,
                EmployeeIDCheck: null
            });

            if (eventID != null) {
                console.log("Created a new event");
                return eventID;
            }
            else {
                console.log("Failed to create a new event");
                return null;
            }
        }
        else {
            console.log("Please insert a name, location, and description for the event.");
            return null;
        }

    });

}

function ocMenu(client, user, req, res) {
    //The Operations Chief Needs a way to create missions, view missions and events, view the map, view the teams, assign the teams to missions.
    app.get('/ocMenu', (req, res) => { res.sendFile(__dirname + '/ocMenu.html') });
    res.redirect('/ocMenu');
    //Create a Mission:
    app.post('/CreateMission', async (req, res) => {
        createMission(client, user, req, res);
    });

    //View the Missions:
    app.post('/ViewMissions', async (req, res) => {

    });
    //View the events:
    app.post('/ViewEvents', async (req, res) => {

    });
    //View the teams:
    app.post('/ViewTeams', async (req, res) => {

    });
    //Assign teams to missions:
    app.post('/AssignTeams', async (req, res) => {

    });

}

function dispMenu(client, user, req, res) {

}

function frMenu(client, user, req, res) {

}

function adminMenu(client, user, req, res) {

}

main();