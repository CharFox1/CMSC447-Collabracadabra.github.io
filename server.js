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
        var client = client;
        app.listen(3000, () => { console.log('listening on 3000') });

        app.get('/', function (req, res) { res.render('pages/signinPage'); });
        app.get('/createUser', function (req, res) { res.render('pages/createUser'); });
        app.get('/submitEvent', function (req, res) { res.render('pages/submitEvent', submitEvent(client, req, res)); });

        app.use(bodyParser.urlencoded({ extended: true }));
        var userID = signIn(client);

    });
}


function signIn(client) {
    console.log("In sign in function");
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
    });

    app.post('/createUser', async (req, res) => {
        app.get('/createUser', (req, res) => { res.sendFile(__dirname + '/views/createUser.html') });
        res.redirect('/createUser');
        var username = req.body.username;
        var pass = req.body.password;
        var name = req.body.name;

        var dataFunc = require("./databaseFunctions");
        var userID = await dataFunc.addUser(client, username, pass, name ,"PIN");

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
    });
}


function submitEvent(client, req, res) {
    app.post('/SubmitEvent', async (req, res) => {
        var name = req.body.name;
        var email = req.body.email;
        var number = req.body.number;
        var location = req.body.location;
        var desc = req.body.description;
        var time = new Date();

        var dataFunc = require("./databaseFunctions");

        if (name != null & location != null & desc != null) {
            var eventID = await dataFunc.addEvent(client, {
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
    app.get('/home/oc/viewFR', async function (req, res) {
        await client.db("AFRMS").collection("Teams").find().toArray(function (err, teams) {

            res.render('pages/ocMenu/viewFR', {
                teams: teams
            });
        });
    });

    app.get('/home/oc/createMission', async function (req, res) {
        var query = { availability: true };
        
        query = { mission: null };
        await client.db("AFRMS").collection("Events").find(query).toArray(function (err, events) {
            client.db("AFRMS").collection("Teams").find(query).toArray(function (err, teams) {
                res.render('pages/ocMenu/createMission', {
                    eventsList: [],
                    events: events,
                    teams: teams
                }, createMission(client, user, req, res));
            });
        });
    });

    res.redirect('/home/oc');
}

function createMission(client, user, req, res) {
    var eventsListID = [];
    app.post('/ApproveEvent', async (req, res) => {
        eventsListID.push(req.body.EventID);
    });

    app.post('/createMission', async (req, res) => {
        var teamname = req.body.teamname;
        var status = req.body.status;
        var dataFunc = require("./databaseFunctions");
        var team = await dataFunc.getTeam(client, null, teamname);
        var teamID = team._id;
//        app.use(bodyParser.text({ type: 'text/html' }));
        var eventsList = [];
        for (i in eventsListID) {
            console.log(eventsListID[i]);
            eventsList.push(await dataFunc.getEvent(client, eventsListID[i]));
        }

        if (teamname != null & teamID != null ) {
            var missionID = await dataFunc.addMission(client, {
                teamName: teamname,
                teamID: teamID,
                author: user,
                events: eventsList,
                status: status
            });

            if (missionID != null) {
                console.log("Created a new mission");
                return missionID;
            }
            else {
                console.log("Failed to create a new mission");
                return null;
            }
        }
        else {
            console.log("Please insert a valid team for the mission.");
            return null;
        }

    });
}

function dispMenu(client, user, req, res) {
    app.get('/home/disp/createEvents', function (req, res) { res.render('pages/dispMenu/createEvent', createEvent(client, user, req, res)); });
    app.get('/home/disp', async function (req, res) {

        const query = { Employee: null };
        await client.db("AFRMS").collection("Events").find(query).toArray(function (err, pendingEvents) {

            res.render('pages/dispMenu/dispMenu', {
                pendingEvents: pendingEvents
            });
        });
    });
    app.get('/home/disp/viewEvents', async function (req, res) {
        await client.db("AFRMS").collection("Events").find().toArray(function (err, events) {

            res.render('pages/dispMenu/viewEvents', {
                events: events
            });
        });
    });
    app.get('/home/disp/approveEvents', async function (req, res) {
        const query = { Employee: null };
        await client.db("AFRMS").collection("Events").find(query).toArray(function (err, events) {

            res.render('pages/dispMenu/approveEvents', {
                events: events
            }, approveEvent(client, user, req, res));
        });
    });
    res.redirect('/home/disp');
}

function createEvent(client, user, req, res) {
    app.post('/CreateEvent', async (req, res) => {
        var name = req.body.name;
        var email = req.body.email;
        var number = req.body.number;
        var location = req.body.location;
        var desc = req.body.description;
        var time = new Date();
        var urgency = req.body.urgency;

        var dataFunc = require("./databaseFunctions");

        console.log(user._id);
        console.log(user.username);
        if (name != null & location != null & desc != null & urgency != null) {
            var eventID = await dataFunc.addEvent(client, {
                PIN: user._id,
                Username: user.username,
                Name: name,
                Number: number,
                Email: email,
                timestamp: time,
                Location: location,
                Description: desc,
                severity: urgency,
                mission: null,
                Employee: user
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
function approveEvent(client, user, req, res) {
    app.post('/ApproveEvent', async (req, res) => {
        var severity = req.body.severity;
        var eventID = req.body.EventID;
        var dataFunc = require("./databaseFunctions");
        var event = await dataFunc.getEvent(client, eventID);
        event.severity = severity;
        event.Employee = user;
        await dataFunc.updateEvent(client, event);
    });
}

function frMenu(client, user, req, res) {
    app.get('/home/disp', async function (req, res) {
        //First find out what team they belong too.
        await client.db("AFRMS").collection("Teams").find().toArray(function (err, teams) {
            //With all of the teams selected I need to query through each members array to find one with this user inside of it.
            
        });
    });
    res.redirect('/home/disp');
}

function adminMenu(client, user, req, res) {
    app.get('/home/admin', async function (req, res) {
        await client.db("AFRMS").collection("Users").find().toArray(function (err, users) {

            res.render('pages/adminMenu/adminMenu', {
                users: users
            }, changeRole(client, user, req, res));
        });
    });
    res.redirect('/home/admin');
}

function changeRole(client, user, req, res) {
    app.post('/ChangeRole', async (req, res) => {
        var userID = req.body.UserID;
        var dataFunc = require("./databaseFunctions");
        //var user = await dataFunc.getUser(client, userID);
        var role = req.body.role;
        await dataFunc.updateRole(client, userID, role);
    });
}

main();