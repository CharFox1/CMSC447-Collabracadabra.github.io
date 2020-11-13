// This file has all the functions for creating and interacting with the tables in mongodb

const { time } = require("console");

const tables = ["Users", "Employee", "PersonInNeed", "Teams", "Events", "Missions"]

exports.listDatabases = async function listDatabases(client) {
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
}

// check if each table exists and add it if not
// don't need to do this.  Mongo automatically creates collections as needed

exports.addUser =  async function addUser(client, name, pass, role) {

    var collection = client.db("AFRMS").collection("Users");
    var doc = {
        name: name,
        password: pass,
        role: role
    };
    await collection.insertOne(doc);
    
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
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

exports.findUser = async function findUser(client, name, pass) {

    console.log("Checking if employee exists");
    const query = { name: name, password: pass };
    var exists = await client.db("AFRMS").collection("Employee").findOne(query)
    console.log(exists);
    if (exists == null) {
        console.log("The employee was not found");
        return;
    }
    else {
        //GO TO NEXT PAGE
        return exists._id;
    }
}

exports.addEmployee = async function addEmployee(client, name, pass, role, availability) {

    console.log("Checking if employee already exists");
    const query = {name: name, password: pass, role: role};
    var exists = await client.db("AFRMS").collection("Employee").findOne(query)
    console.log(exists);
    if (exists != null) {
        console.log("This employee already exists!");
        return;
    }
    
    console.log("Checking if employee user already exists");
    var exists = await client.db("AFRMS").collection("Users").findOne(query)
    console.log(exists)
    if (exists == null) {
        console.log("User does not exist yet. adding it");
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
    await collection.insertOne(doc);
    console.log("added employee");
}

// takes client and a document with PIN data in it
// doc must have name, pass
// doc can have phone, age, gender, ip/mac
exports.addPIN = async function addPIN(client, doc) {

    var name = doc.name;
    var password = doc.password;
    var role = "PIN";
    if (name == null | password == null) {
        console.log("Name or password not provided! Cannot add PIN");
        return;
    }

    console.log("Checking if PIN already exists");
    var query = {name: name, password: password};
    var exists = await client.db("AFRMS").collection("Person in Need").findOne(query);
    if (exists != null) {
        console.log("This PIN already exists!");
        return;
    }

    console.log("Checking if User already exists");
    exists = await client.db("AFRMS").collection("Users").findOne(query);
    if (exists == null) {
        console.log("User does not exist yet. adding it");
        var collection = client.db("AFRMS").collection("Users");
        var userDoc = {
            name: name,
            password: password,
            role: role
        };
    } 

    var userID = await client.db("AFRMS").collection("Users").findOne(query)._id;
    doc.userID = userID;

    await collection.insertOne(userDoc);

    console.log("adding PIN to database");
    var collection = client.db("AFRMS").collection("Person in Need");
    await collection.insertOne(doc);
}


exports.addEvent = async function addEvent(client, PIN, Employee, timestamp = 0, location = null, 
                                            desc = "", severity = 0, mission = null) {
    
    var doc = {
        PIN: PIN,
        Employee: Employee,
        timestamp: timestamp,
        location: location,
        desc: desc,
        severity: severity,
        mission: mission
    }

    var collection = client.db("AFRMS").collection("Events");
    await collection.insertOne(doc);
    console.log("added event")

}