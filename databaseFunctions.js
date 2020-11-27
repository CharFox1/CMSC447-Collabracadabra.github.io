// This file has all the functions for creating and interacting with the tables in mongodb

const { time } = require("console");
const { ObjectID, ResumeToken } = require("mongodb");

const tables = ["Users", "Employee", "PIN", "Teams", "Events", "Missions"]

exports.listDatabases = async function listDatabases(client) {
    DatabasesList = await client.db().admin().listDatabases();

    console.log("Tables:");
    DatabasesList.databases.forEach(db => console.log(` - ${db.name}`));
}

exports.cleanDatabase = async function cleanDatabase(client) {

    console.log("[cleanDatabase] removing tables");
    tablesList = await client.db("AFRMS").listCollections().toArray();
    console.log(tablesList);
    for (const table of tablesList) {
        await client.db("AFRMS").dropCollection(table.name);
    }

    console.log("[cleanDatabase] tables removed");
}


// check if each table exists and add it if not
// don't need to do this.  Mongo automatically creates collections as needed

exports.addUser = async function addUser(client, username, pass, name, role) {

    if (username == null | pass == null) {
        console.log("[addUser] name or password cannot be null!");
        return;
    }

    console.log("[addUser] Checking if User already exists");
    const query = {username: username};
    var exists = await client.db("AFRMS").collection("Users").findOne(query);
    if (exists != null) {
        console.log("[addUser] This User already exists!");
        return;
    }

    var collection = client.db("AFRMS").collection("Users");
    var doc = {
        username: username,
        password: pass,
        name: name,
        role: role
    };
    result = await collection.insertOne(doc);
    console.log("[addUser] added User!");
    return (result.insertedId);
    
}

exports.getUser = async function getUser(client, userID) {

    var fixID = ObjectID(userID);
    console.log("[getUser] finding User");
//    var exists = await client.db("AFRMS").collection("Users").findOne({_id: userID});
//    if (exists == null) {
        exists = await client.db("AFRMS").collection("Users").findOne({ _id: fixID });
        if (exists == null) {
            console.log("[getUser] there is no team with this id!");
        return;
//        }
    }
    return(exists);
}

exports.updateRole = async function updateRole(client, id, role) {

    console.log("[updateRole] Checking if User already exists");
    var fixID = ObjectID(id);
    const query = {_id: fixID};
    var collection = client.db("AFRMS").collection("Users");
    var exists = await collection.findOne(query);
    if (exists == null) {
        console.log("[updateRole] This User does not exist!");
        return;
    }

    result = await collection.updateOne(query, {$set: {role: role}});

}

exports.findUser = async function findUser(client, username, pass) {

    console.log("[findUser] Checking if employee exists");
    const query = { username: username, password: pass };
    var exists = await client.db("AFRMS").collection("Users").findOne(query);
    if (exists == null) {
        console.log("[findUser] The employee was not found");
        return null;
    }
    else {
        console.log("[findUser] The employee was found")
        return exists._id;
    }
}

exports.addEmployee = async function addEmployee(client, username, pass, name, role, availability) {

    console.log("[addEmployee] Checking if Employee already exists");
    const query = {username: username, password: pass, role: role};
    var exists = await client.db("AFRMS").collection("Employee").findOne(query);
    if (exists != null) {
        console.log("[addEmployee] This employee already exists!");
        return;
    }
    
    console.log("[addEmployee] Checking if User already exists");
    var exists = await client.db("AFRMS").collection("Users").findOne(query);
    if (exists == null) {
        console.log("[addEmployee] User does not exist yet. adding it");

        var result = await exports.addUser(client, username, pass, name, role);
        if (result == null) {
            console.log("[addEmployee] failed to add user");
            return;
        }
    }

    const user = await client.db("AFRMS").collection("Users").findOne(query);
    var userID = user._id;

    var collection = client.db("AFRMS").collection("Employee");
    var doc = {
        userID: userID,
        username: username,
        password: pass,
        name: name,
        role: role,
        availability: availability,
    };
    var result = await collection.insertOne(doc);
    console.log("[addEmployee] Added employee!");
    return(result.insertedId);
}

exports.getEmployee = async function getEmployee(client, id) {
    var fixID = ObjectID(id);
    const query = { _id: fixID }
    var result = await client.db("AFRMS").collection("Employee").findOne(query);
    return(result);
}

exports.updateEmployee = async function updateEmployee(client, id, username, pass, name, role, availability) {

    // check if employee has a corresponding user
    result = await exports.findUser(client, username, pass);
    if (result == null) {
        console.log("[updateEmployee] User does not exist! Adding it");
        result = await exports.addUser(client, username, pass, name, role);
    } else {

        // update that user
        var doc = {
            _id: result,
            username: username,
            password: pass,
            name: name,
            role: role
        }
        console.log("[updateEmployee] User does exist! Updating it");
        console.log(doc)
        await client.db("AFRMS").collection("Users").updateOne({_id: result}, {$set: doc});
    }
    // now result should be the userID

    var collection = client.db("AFRMS").collection("Employee");
    var doc = {
        userID: result,
        username: username,
        password: pass,
        name: name,
        role: role,
        availability: availability
    };
    result = await collection.updateOne( {userID: result}, {$set: doc});
    console.log("[updateEmployee] updating Employee in Employee collection")
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);

    doc._id = result.insertedId;

    // find which teams need to be updated
    var team = await exports.findTeamFromEmployee(client, doc);
    if (team != null) {
        console.log("[updateEmployee] updating Employee in Team")
        var members = team.members;
        for (var i of members) {
            if (i._id == doc._id) {
                // update the employee doc in the team
                i = doc;
            }
        }
        team.members = members;
        // update them in team and mission collection
        await updateTeam(client, team);
    }
}

exports.getAllEmployees = async function getAllEmployees(client) {

    var result = await client.db("AFRMS").collection("Employee").find().toArray();
    return(result);
}

// takes client and a document with PIN data in it
// doc must have name, pass
// doc can have phone, age, gender, ip/mac
exports.addPIN = async function addPIN(client, doc) {

    var username = doc.username;
    var password = doc.password;
    var name = doc.name;
    var role = "PIN";
    if (username == null | password == null) {
        console.log("[addPIN] Name or password not provided!");
        return;
    }

    console.log("[addPIN] Checking if PIN already exists");
    var query = {username: username, password: password};
    var exists = await client.db("AFRMS").collection("Person in Need").findOne(query);
    if (exists != null) {
        console.log("[addPIN] This PIN already exists!");
        return;
    }

    console.log("[addPIN] Checking if User already exists");
    exists = await client.db("AFRMS").collection("Users").findOne(query);
    if (exists == null) {
        console.log("[addPIN] User does not exist yet. adding it");
        var result = await exports.addUser(client, username, password, name, role);
        if (result == null) {
            console.log("[addPIN] failed to add user");
            return;
        } else {
            doc.userID = result;
        }
    } else {
        doc.userID = exists._id;
    }



    console.log("[addPIN] adding PIN to database");
    var collection = client.db("AFRMS").collection("Person in Need");
    var result = await collection.insertOne(doc);
    console.log("[addPIN] added PIN!");
    return(result.insertedId);
}


exports.addEvent = async function addEvent(client, doc) {

    console.log("[addEvent] adding event");
    
    var PIN = doc.PIN;
    var Employee = doc.Employee;

    //if (PIN == null & Employee == null) {
    //    console.log("[addEvent] PIN or Employee ID missing!");
    //    return;
    //}

    var collection = client.db("AFRMS").collection("Events");
    var result = await collection.insertOne(doc);
    console.log("[addEvent] added event!");
    return(result.insertedId);
}

exports.updateEvent = async function updateEvent(client, event) {

    console.log("[updateEvent] updating Events in Events collection")
    result = await client.db("AFRMS").collection("Events").updateOne({ _id: event._id }, 
        {$set: event});
    console.log("[updateEvent]:")
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);

    console.log("[updateEvent] updating Events in Missions collection")
    // search array of events in mission for events with the same id
    var query = {events: {$elemMatch: {_id: event._id}}};
    var test = await client.db("AFRMS").collection("Missions").find(query).toArray();
    console.log(test)
    result = await client.db("AFRMS").collection("Missions").updateMany(query, {$set: {"events.$": event}});
    console.log("[updateEvent]:")
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);

}

exports.getEvent = async function getEvent(client, id) {

    var fixID = ObjectID(id);
    const query = { _id: fixID }
    var result = await client.db("AFRMS").collection("Events").findOne(query);
    if (result == null) {
        console.log("result is null");
        console.log(id);
    }
    return (result);
}

// add team
// team doc should be of the format {createdBy: employee, members: [employee(s)]}
exports.addTeam = async function addTeam(client, team) {

    console.log("[addTeam] adding team");
    result = await client.db("AFRMS").collection("Teams").insertOne(team);
    console.log("[addTeam] team added!");
    return(result.insertedId);

}

exports.updateTeam = async function updateTeam(client, team) {

    console.log("[updateTeam] updating Team in the Teams collection");
    result = await client.db("AFRMS").collection("Events").updateOne({ _id: team._id }, 
        {$set: team});
    console.log("[updateEvent]:")
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);

    // update team in missions
    var query = {"team._id": team};
    result = await client.db("AFRMS").collection("Missions").updateMany(query, {$set: {team: team}});
    console.log("[updateTeam]:")
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);

}

exports.getTeam = async function getTeam(client, teamID, teamName) {

    console.log("[getTeam] finding Team");
    console.log(teamID)
    if (teamID != null) {
        var exists = await client.db("AFRMS").collection("Teams").findOne({ _id: teamID });
        if (exists == null) {
            console.log("[getTeam] there is no Team with this id!");
            return;
        }
    }
    else {
        console.log(teamName);
        var exists = await client.db("AFRMS").collection("Teams").findOne({ name: teamName });
        if (exists == null) {
            console.log("[getTeam] there is no Team with this name!");
            return;
        }
    }
    return(exists);
}

exports.findTeamFromEmployee = async function findTeamFromEmployee(client, employeeID) {

    console.log("[findTeamFromEmployee] finding Team");

    var query = {members: {$eq: {_id: employeeID}}};
    var exists = await client.db("AFRMS").collection("Teams").findOne(query);
    if (exists == null) {
        console.log("[findTeamFromEmployee] Employee not found on any Team!");
        return;
    }
    return exists;
}

exports.notOnTeam = async function notOnTeam(client) {

    console.log("[notOnTeam] finding employees not on any team");

    var teams = await client.db("AFRMS").collection("Teams").find().toArray();
    var employeesInTeams = [];

    for (var team of teams) {
        members = team.members();
        for (var member of members) {
            employeesInTeams.push(member);
        }
    }

    var allEmployees = await exports.getAllEmployees(client);

    for (member of employeesInTeams) {
        if (allEmployees.includes(member)) {
            // remove stuff
        }
    }

} 

// add mission
// mission doc should be of the format {team: team, author: employee, events: [event(s)], status: int}
exports.addMission = async function addMission(client, mission) {

    console.log("[addMission] adding Mission");
    result = await client.db("AFRMS").collection("Missions").insertOne(mission);
    return(result.insertedId);

}

exports.getMission = async function getMission(client, missionID) {
    
    console.log("[getMission] finding Mission");
    var exists = await client.db("AFRMS").collection("Missions").findOne({_id: missionID});
    if (exists == null) {
        console.log("[getMission] there is no Mission with this id!");
        return;
    }
    return(exists);
}

exports.updateMission = async function updateMission(client, mission) {
    
    result = await collection.updateOne( {_id: mission.id}, 
        {$set: mission});
    console.log("[updateMission]:")
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

exports.findMissionFromTeam = async function findMissionFromTeam(client, teamID) {

    console.log("[findMissionFromTeam] finding Mission");

    var query = {teamID: teamID};
    var exists = await client.db("AFRMS").collection("Missions").findOne(query);
    if (exists == null) {
        console.log("[findMissionFromTeam] Employee not found on any Team!");
        return;
    }
    return exists;
}

exports.findMissionFromEmployee = async function findMissionFromEmployee(client, employeeID) {

    console.log("[findMissionFromEmployee] finding Mission");

    var teamID = await exports.findTeamFromEmployee(client, employeeID);
    if (teamID == null) {
        console.log("[findMissionFromEmployee] Employee is not valid or not on any teams!");
        return;
    }

    var result = await exports.findMissionFromTeam(client, teamID);
    if (result == null) {
        console.log("[findMissionFromEmployee] Employee Team is not in any Missions!");
        return;
    }

    return result;

}