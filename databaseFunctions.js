// This file has all the functions for creating and interacting with the tables in mongodb

const { time } = require("console");

const tables = ["Users", "Employee", "PIN", "Teams", "Events", "Missions"]

exports.listDatabases = async function listDatabases(client) {
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
}

// check if each table exists and add it if not
// don't need to do this.  Mongo automatically creates collections as needed

exports.addUser = async function addUser(client, name, pass, role) {

    console.log("[addUser] Checking if User already exists");
    const query = {name: name};
    var exists = await client.db("AFRMS").collection("Users").findOne(query);
    if (exists != null) {
        console.log("[addUser] This User already exists!");
        return;
    }

    var collection = client.db("AFRMS").collection("Users");
    var doc = {
        name: name,
        password: pass,
        role: role
    };
    result = await collection.insertOne(doc);
    console.log("[addUser] added User!");
    return (result.insertedId);
    
}

exports.updateRole = async function updateRole(client, id, role) {

    console.log("[updateRole] Checking if User already exists");
    const query = {_id: id};
    var collection = client.db("AFRMS").collection("Users");
    var exists = await collection.findOne(query);
    if (exists == null) {
        console.log("[updateRole] This User does not exist!");
        return;
    }

    result = await collection.updateOne(query, {$set: {role: role}});

}

exports.updateEmployee = async function updateEmployee(client, id, name, pass, role, availability) {

    var collection = client.db("AFRMS").collection("Employee");
    var doc = {
        name: name,
        password: pass,
        role: role
    };
    result = await collection.updateOne( {_id: id}, 
            {$set: {"_id": id, "name": name, "password":pass, "role":role}});
    console.log("[updateEmployee]:")
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

exports.findUser = async function findUser(client, name, pass) {

    console.log("[findUser] Checking if employee exists");
    const query = { name: name, password: pass };
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

exports.addEmployee = async function addEmployee(client, name, pass, role, availability) {

    console.log("[addEmployee] Checking if Employee already exists");
    const query = {name: name, password: pass, role: role};
    var exists = await client.db("AFRMS").collection("Employee").findOne(query);
    if (exists != null) {
        console.log("[addEmployee] This employee already exists!");
        return;
    }
    
    console.log("[addEmployee] Checking if User already exists");
    var exists = await client.db("AFRMS").collection("Users").findOne(query);
    if (exists == null) {
        console.log("[addEmployee] User does not exist yet. adding it");
        var collection = client.db("AFRMS").collection("Users");
        var doc = {
            name: name,
            password: pass,
            role: role
        };
    await collection.insertOne(doc);
    }

    const user = await client.db("AFRMS").collection("Users").findOne(query);
    console.log(user);
    var userID = user._id;
    console.log(userID);

    var collection = client.db("AFRMS").collection("Employee");
    var doc = {
        userID: userID,
        name: name,
        password: pass,
        role: role,
        availability: availability,
    };
    var result = await collection.insertOne(doc);
    console.log("[addEmployee] Added employee!");
    return(result.insertedId);
}

exports.getEmployee = async function getEmployee(client, id) {
    
    const query = {_id: id}
    var result = await client.db("AFRMS").collection("Employee").findOne(query);
    return(result);
}

exports.getAllEmployees = async function getAllEmployees(client) {

    var result = await client.db("AFRMS").collection("Employee").find();
    return(result);
}

// takes client and a document with PIN data in it
// doc must have name, pass
// doc can have phone, age, gender, ip/mac
exports.addPIN = async function addPIN(client, doc) {

    var name = doc.name;
    var password = doc.password;
    var role = "PIN";
    if (name == null | password == null) {
        console.log("[addPIN] Name or password not provided!");
        return;
    }

    console.log("[addPIN] Checking if PIN already exists");
    var query = {name: name, password: password};
    var exists = await client.db("AFRMS").collection("Person in Need").findOne(query);
    if (exists != null) {
        console.log("[addPIN] This PIN already exists!");
        return;
    }

    console.log("[addPIN] Checking if User already exists");
    exists = await client.db("AFRMS").collection("Users").findOne(query);
    if (exists == null) {
        console.log("[addPIN] User does not exist yet. adding it");
        var collection = client.db("AFRMS").collection("Users");
        var userDoc = {
            name: name,
            password: password,
            role: role
        };
    } 

    var userID = await client.db("AFRMS").collection("Users").insertOne(userDoc).insertedId;
    doc.userID = userID;

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

    if (PIN == null | Employee == null) {
        console.log("[addEvent] PIN or Employee ID missing!");
        return;
    }

    var collection = client.db("AFRMS").collection("Events");
    var result = await collection.insertOne(doc);
    console.log("[addEvent] added event!");
    return(result.insertedId);
}

exports.updateEvent = async function updateEvent(client, event) {

    result = await collection.updateOne( {_id: event.id}, 
        {$set: event});
    console.log("[updateEvent]:")
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

// add team
// team doc should be of the format {createdBy: employee, members: [employee(s)]}
exports.addTeam = async function addTeam(client, team) {

    console.log("[addTeam] adding team");
    result = await client.db("AFRMS").collection("Teams").insertOne(team);
    return(result.insertedId);

}

// add mission
// mission doc should be of the format {team: team, author: employee, events: [event(s)], status: int}
exports.addMission = async function addMission(client, mission) {

    console.log("[addMission] adding Mission");
    result = await client.db("AFRMS").collection("Missions").insertOne(mission);
    return(result.insertedId);

}