// This file has all the functions for creating and interacting with the tables in mongodb

const tables = ["Users", "Employee", "PersonInNeed", "Teams", "Events", "Missions"]

async function listDatabases(client) {
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

// check if each table exists and add it if not
// don't need to do this.  Mongo automatically creates collections as needed

async function addUser(client, name, pass) {
    var collection = client.db("AFRMS").collection("Users")
    var doc = {
        name: name,
        password: pass
    }
    collection.insertOne(doc)
}

async function main(){

    // attempt to connect to the database
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb+srv://Admin:Password@cluster0.ejcge.mongodb.net/AFRMS?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true });

    try {
        // connect to the cluster
        await client.connect();

        // print databases in cluster
        await listDatabases(client);

    } catch (e) {
        console.error(e);
    }

    addUser(client, "test", "test")

}

main().catch(console.error);