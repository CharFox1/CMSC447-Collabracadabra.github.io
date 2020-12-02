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
        
        //app.listen(3000, () => { console.log('listening on 3000') });
        app.listen(process.env.PORT || 3000);
        console.log('listening');
        
        app.get('/', function (req, res) { res.render('pages/signinPage'); });
        app.get('/createUser', function (req, res) { res.render('pages/createUser'); });
        app.get('/submitEvent', function (req, res) { res.render('pages/submitEvent', submitEvent(client, req, res)); });
        app.get('/map', async function (req, res) {
            res.render('pages/map', {
            })
        });

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
        app.get('/createUser', (req, res) => { res.sendFile(__dirname + '/views/createUser.ejs') });
        res.redirect('/createUser');
        var username = req.body.username;
        var pass = req.body.password;
        var name = req.body.name;

        if (username != "" && pass != "" && name != "") {
            console.log("All information was filled out");
            var dataFunc = require("./databaseFunctions");
            var userID = await dataFunc.addUser(client, username, pass, name, "PIN");

            if (userID == null) {
                console.log("Username unavailable");
                return null;
            }
            else {
                console.log("Successfully created a new user");
                res.redirect("/");
            }

            if (userID == null) {
                console.log("Unable to create user");
                return null;
            }
            else {
                console.log("User created successfully");
                return userID;
            }
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
                mission: false,
                EmployeeName: "Unapproved",
                Employee: null
            });

            if (eventID != null) {
                console.log("Created a new event");
            }
            else {
                console.log("Failed to create a new event");
            }
        }
        else {
            console.log("Please insert a name, location, and description for the event.");
        }
        res.redirect('/');
        return eventID;
    });
}

function pinMenu(client, user, req, res) {

    //res.render('/home/pin');
    app.get('/home/pin/newEvent', function (req, res) { res.render('pages/pinMenu/pinNewEvent', submitEventPIN(client, user, req, res)); });
    app.get('/home/pin', function (req, res) {
        var username = user.username;
        var name = user.name;
        var email = user.email;
        var number = user.number;

        res.render('pages/pinMenu/pinMenu', {
            username: username,
            name: name,
            email: email,
            number: number
        });
    });
    app.get('/home/pin/map', async function (req, res) {
        res.render('pages/pinMenu/pinMap', {
        })
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
                PIN: user,
                Username: user.username,
                Name: name,
                Number: number,
                Email: email,
                timestamp: time,
                Location: location,
                Description: desc,
                severity: null,
                mission: false,
                EmployeeName: "Unapproved",
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
        res.redirect('/home/pin');
    });

}


function ocMenu(client, user, req, res) {
    //The Operations Chief Needs a way to create missions, view missions and events, view the map, view the teams, assign the teams to missions.
    app.get('/home/oc', async function (req, res) {
        //Inside of create a Mission the Operations Chief will need to select a team, and select an array of events to place inside of the mission.
        //Get an array of all events that have been checked by a dispatcher and have yet to be assigned to a mission.
        const query = {Employee: {$ne:null}, mission: false };
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

        var query = {
            mission: false, Employee: { $ne: null }};
        await client.db("AFRMS").collection("Events").find(query).toArray(function (err, events) {
            query = { availability: "Available" };
            client.db("AFRMS").collection("Teams").find(query).toArray(function (err, teams) {
                res.render('pages/ocMenu/createMission', {
                    eventsList: [],
                    events: events,
                    teams: teams,
                }, createMission(client, user, req, res));
            });
        });
    });

    app.get('/home/oc/createTeam', async function (req, res) {
        var query = { availability: true };

        query = { role: "First Responder", availability: "available" };
        await client.db("AFRMS").collection("Employee").find(query).toArray(function (err, employees) {
                res.render('pages/ocMenu/createTeams', {
                    frsList: [],
                    frs: employees,
                }, createTeam(client, user, req, res));
        });
    });
    app.get('/home/oc/map', async function (req, res) {
        res.render('pages/ocMenu/ocMap', {
        })
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

        var eventsList = [];
        for (i in eventsListID) {
            console.log(eventsListID[i]);
            var dataFunc = require("./databaseFunctions");
            var event = await dataFunc.getEvent(client, eventsListID[i]);
            event.mission = true;
            await dataFunc.updateEvent(client, event);

            eventsList.push(event);
        }

        var dataFunc = require("./databaseFunctions");
        var team = await dataFunc.getTeam(client, null, teamname);
        var teamID = team._id;

        if (teamname != "" && teamID != null && eventsList.length != 0) {
            var dataFunc = require("./databaseFunctions");
            var missionID = await dataFunc.addMission(client, {
                teamName: teamname,
                team: team,
                author: user,
                events: eventsList,
                status: status
            });
            team.availability = status;
            await dataFunc.updateTeam(client, team);

            if (missionID != null) {
                console.log("Created a new mission");
                return missionID;
            }
            else {
                console.log("Failed to create a new mission");
                return null;
            }
        }
        else if (teamname == "" || teamID == null) {
            console.log("Please insert a valid team for the mission.");
        }
        else if (eventsList.length == 0) {
            return res.put({
                message: 'Select an Event for the mission'
            });
        }
        res.redirect('/home/oc/createMission');
    });
}

function createTeam(client, user, req, res) {
    var frsListID = [];
    app.post('/AddFR', async (req, res) => {
        frsListID.push(req.body.frID);
    });

    app.post('/createTeam', async (req, res) => {
        var teamname = req.body.teamname;
        var teamtype = req.body.teamtype;
        var availability = req.body.availability;
        var dataFunc = require("./databaseFunctions");

        var frsList = [];
        for (i in frsListID) {
            console.log(frsListID[i]);
            frsList.push(await dataFunc.getEmployee(client, frsListID[i]));
        }

        if (frsList.length != 0 && teamname != "" && teamtype != "" && availability != "") {

            if (teamname != null & frsList != null) {
                var teamID = await dataFunc.addTeam(client, {
                    teamName: teamname,
                    teamType: teamtype,
                    author: user,
                    members: frsList,
                    availability: availability
                });

                if (teamID != null) {
                    console.log("Created a new team");
                    return teamID;
                }
                else {
                    console.log("Failed to create a new team");
                    return null;
                }
            }
            else {
                console.log("Please insert a valid team for the team.");
                return null;
            }
            res.redirect('/home/oc/createTeam');
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
    app.get('/home/disp/map', async function (req, res) {
        res.render('pages/dispMenu/dispMap', {
        })
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
        if (name != "" && location != "" && desc != "" && urgency != "") {
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
                mission: false,
                EmployeeName: user.name,
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
        res.redirect('/home/disp');
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
        event.EmployeeName = user.name;

        await dataFunc.updateEvent(client, event);
        res.redirect('/home/disp/approveEvents');
    });
}

function frMenu(client, user, req, res) {

    app.get('/home/fr', async function (req, res) {
        //First find out what team they belong too.
        var dataFunc = require("./databaseFunctions");
        var employee = await dataFunc.getEmployee2(client, user._id);
        var team = await dataFunc.findTeamFromEmployee(client, employee);
        var mission = await dataFunc.findMissionFromTeam(client, team);

        if (team != null && mission != null) {
            res.render('pages/frMenu/frMenu', {
                mission_status: mission.status,
                mission_author_name: mission.author.name,
                mission_teamName: mission.teamName,
                mission_events: mission.events,
                teamname: team.teamName,
                teamtype: team.teamType,
                availability: team.availability,
                members: team.members,
            });
        }
        else if (mission == null && team != null) {
            console.log("In a team but is not assigned to a mission");
            res.render('pages/frMenu/frMenu', {
                mission_status: "Unassigned",
                mission_author_name: null,
                mission_teamName: null,
                mission_events: [],
                teamname: team.teamName,
                teamtype: team.teamType,
                availability: team.availability,
                members: team.members,
            });
        }
        else if (mission == null && team == null) {
            res.render('pages/frMenu/frMenu', {
                mission_status: null,
                mission_author_name: null,
                mission_teamName: null,
                mission_events: [],
                teamname: null,
                teamtype: null,
                availability: null,
                members: [],
            });
        }
    });
    app.get('/home/fr/updateMission', async function (req, res) {
        var dataFunc = require("./databaseFunctions");
        var employee = await dataFunc.getEmployee2(client, user._id);
        var team = await dataFunc.findTeamFromEmployee(client, employee);
        var mission = await dataFunc.findMissionFromTeam(client, team);

        if (team != null && mission != null) {
            res.render('pages/frMenu/updateMission', {
                mission_status: mission.status,
                mission_author_name: mission.author.name,
                mission_teamName: mission.teamName,
                mission_events: mission.events,
            }, updateMission(client, user, req, res));
        }
        else if (mission == null && team != null) {
            res.render('pages/frMenu/updateMission', {
                mission_status: null,
                mission_author_name: null,
                mission_teamName: null,
                mission_events: [],
            }, updateMission(client, user, req, res));
        }
        else if (mission == null && team == null) {
            res.render('pages/frMenu/updateMission', {
                mission_status: null,
                mission_author_name: null,
                mission_teamName: null,
                mission_events: [],
            }, updateMission(client, user, req, res));
        }
    });
    app.get('/home/fr/map', async function (req, res) {
        res.render('pages/frMenu/frMap', {
        })
    });
    res.redirect('/home/fr');
    
} 

function updateMission(client, user, req, res) {
    app.post('/UpdateMission', async (req, res) => {
        var status = req.body.status;

        var dataFunc = require("./databaseFunctions");
        var employee = await dataFunc.getEmployee2(client, user._id);
        var team = await dataFunc.findTeamFromEmployee(client, employee);
        var mission = await dataFunc.findMissionFromTeam(client, team);


        mission.status = status;

        console.log("Checking if status is Complete");
        if (status == "Complete") {
            console.log("Status is complete");
            team.availability = "Available";
            team.status = "Available"
        }
        else {
            team.status = status;
        }
        
        await dataFunc.updateMission(client, mission);
        await dataFunc.updateTeam(client, team)
    });
}

function adminMenu(client, user, req, res) {
    app.get('/home/admin', async function (req, res) {
        await client.db("AFRMS").collection("Users").find().toArray(function (err, users) {

            res.render('pages/adminMenu/adminMenu', {
                users: users
            }, changeRole(client, user, req, res));
        });
    });
    app.get('/home/admin/map', async function (req, res) {
            res.render('pages/adminMenu/adminMap', {
            },)
    });
    res.redirect('/home/admin');
}

function changeRole(client, user, req, res) {
    app.post('/ChangeRole', async (req, res) => {
        var userID = req.body.UserID;
        var dataFunc = require("./databaseFunctions");
        //var user = await dataFunc.getUser(client, userID);
        var role = req.body.role;

        if (role != null) {
            await dataFunc.updateRole(client, userID, role);
            if (role != "PIN") {
                var user = await dataFunc.getUser(client, userID);
                var employee = await dataFunc.addEmployee(client, user.username, user.password, user.name, role, "available")
                if (employee == null) {
                    console.log("Employee already exists, updating employee info");
                    await dataFunc.updateEmployee(client, userID, user.username, user.password, user.name, role, user.availability);
                }
            }
        res.redirect('/home/admin');
        }
    });
}

main();
