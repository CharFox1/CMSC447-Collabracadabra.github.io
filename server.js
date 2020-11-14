const express = require('express');
const bodyParser = require('body-parser');
const { request } = require('express');
const { Timestamp } = require('mongodb');
const app = express();

app.set('view engine', 'ejs');

function main() {
    const MongoClient = require('mongodb').MongoClient;
    MongoClient.connect('mongodb+srv://Admin:Password@cluster0.ejcge.mongodb.net/<dbname>?retryWrites=true&w=majority', (err, client) => {
        console.log('Connected to the server');
        if (err) return console.log(err);
 //       var db = client.db('AFRMS');
        var client = client;
        app.listen(3000, () => { console.log('listening on 3000') });

        app.get('/', function (req, res) { res.render('pages/signinPage'); });
        app.get('/createUser', function (req, res) { res.render('pages/createUser'); });

        app.use(bodyParser.urlencoded({ extended: true }));
        var userID = signIn(client);

    });
}


function signIn(client) {
    console.log("In sign in function");
//    app.get('/', function (req, res) { res.sendFile(__dirname + '/views/pages/signInPage.html'); });  // Note: __dirname is the path to your current working directory. Try logging it and see what you get!
//    app.get('/', (req, res) => { res.sendFile(__dirname + '/views/signinPage.html') });
//    app.get('/', function (req, res) { res.render('pages/signinPage'); });
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
                pinMenu(client, user, req, res);
                //var eventID = submitEventPIN(client, user, req, res);
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

        app.get('/createUser', (req, res) => { res.sendFile(__dirname + '/views/createUser.html') });
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

function pinMenu(client, user, req, res) {

    //res.render('/home/pin');
    app.get('/home/pin/newEvent', function (req, res) { res.render('pages/pinMenu/pinNewEvent', submitEventPIN(client, user, req, res)); });
    app.get('/home/pin', function (req, res) {
        var username = user.username;
        var name = user.name;
        var email = user.email;
        var number = user.phone;

        res.render('pages/pinMenu/pinMenu', {
            username: username,
            name: name,
            email: email,
            number: number
        });
    });
    res.redirect('/home/pin');
}

function submitEventPIN(client, user, req, res) {

//    app.get('/submitEvent', (req, res) => { res.sendFile(__dirname + '/views/submitEvent.html') });
    console.log("In submitEventPin");
    
    app.post('/newEvent', async (req, res) => {
        var name = req.body.name;
        var email = req.body.email;
        var number = req.body.number;
        var location = req.body.location;
        var desc = req.body.description;
        var time = new Date();

        var dataFunc = require("./databaseFunctions");

        console.log(user._id);
        console.log(user.username);
        if (name != null & location != null & desc != null) {
            var eventID = await dataFunc.addEvent(client, {
                PIN: user._id,
                Username: user.username,
                Name: name,
                Number: number,
                Email: email,
                timestamp: time,
                Location: location,
                Description: desc,
                severity: null,
                mission: null,
                Employee: null
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
    //app.get('/home/pin/newEvent', function (req, res) { res.render('pages/pinMenu/pinNewEvent', submitEventPIN(client, user, req, res)); });
    //app.get('/home/oc/viewEvents', function (req, res) { res.render('pages/ocMenu/viewEvents', { events: events }, viewEvents(client, user, req, res)); });
    app.get('/home/oc', async function (req, res) {
        //Inside of create a Mission the Operations Chief will need to select a team, and select an array of events to place inside of the mission.
        //Get an array of all events that have been checked by a dispatcher and have yet to be assigned to a mission.
        const query = {Employee: {$ne:null}, mission: null };
        await client.db("AFRMS").collection("Events").find(query).toArray(function (err, pendingEvents) {

            res.render('pages/ocMenu/ocMenu', {
                pendingEvents: pendingEvents
            });
        });
    });

    app.get('/home/oc/viewEvents', async function (req, res) {
        await client.db("AFRMS").collection("Events").find().toArray(function (err, events) {

            res.render('pages/ocMenu/viewEvents', {
                events: events
            });
        });
    });
    app.get('/home/oc/viewMissions', async function (req, res) {
        await client.db("AFRMS").collection("Missions").find().toArray(function (err, missions) {

            res.render('pages/ocMenu/viewMissions', {
                missions: missions
            });
        });
    });
    res.redirect('/home/oc');
}
/*
function viewEvents(client, user, req, res) {
    //Sends an array to the ejs file so that it outputs all of the events.
    app.get('/home/oc/viewEvents', async function (req, res) {      
        await client.db("AFRMS").collection("Events").find().toArray(function (err, events) {

            res.render('pages/ocMenu/viewEvents', {
                events: events
            });
        });

    });

}
*/

function createMission(client, user, req, res) {


}

function dispMenu(client, user, req, res) {

}

function frMenu(client, user, req, res) {

}

function adminMenu(client, user, req, res) {

}

main();