// This file has all the functions for creating and interacting with the tables in mongodb

const tables = ["Users", "Employee", "PersonInNeed", "Teams", "Events", "Missions"]

export async function listDatabases(client) {
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

// check if each table exists and add it if not
// don't need to do this.  Mongo automatically creates collections as needed

export async function addUser(client, name, pass, role) {

    var collection = client.db("AFRMS").collection("Users");
    var doc = {
        name: name,
        password: pass,
        role: role
    };
    collection.insertOne(doc);
    
}

export async function addEmployee(client, name, pass, role, availability) {

    console.log("Checking if employee already exists");
    const query = {name: name, password: pass, role: role};
    var exists = await client.db("AFRMS").collection("Users").findOne(query)
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
    collection.insertOne(doc);
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
    collection.insertOne(doc);
    console.log("added employee");
}

async function main() {

    // setup connection to the cluster
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb+srv://Admin:Password@cluster0.ejcge.mongodb.net/AFRMS?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true }, { useUnifiedTopology: true });

    try {
        // connect to the cluster
        await client.connect();

        // await function calls
        await addEmployee(client, "test2", "test2", "Operations Chief", true);

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

}

main().catch(console.error);