// some tests for database functions

async function main() {

    var db = require("./databaseFunctions.js");

    // setup connection to the cluster
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb+srv://Admin:Password@cluster0.ejcge.mongodb.net/AFRMS?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true }, { useUnifiedTopology: true });

    try {
        // connect to the cluster
        await client.connect();

        var time = new Date();
        
        // await function calls
        await db.addEmployee(client, "test2", "test2", "Operations Chief", true);
        await db.addEmployee(client, "test3", "test2", "Operations Chief", true);

        await db.addPIN(client, {
            name: "test4",
            password: "test4",
            phone: 1234567890,
            age: "old"
        });

        var userID = await db.findUser(client, "test3", "test2");
        console.log("[dbTest] UserID to be used in updateEmployee test:", userID);
        await db.updateEmployee(client, userID, "test3", "test2", "some role", false);

        await db.addEvent(client, {
            PIN: 123,
            Employee: 456,
            timestamp: time
        })

        //await db.addEvent(client, 123, 456, time, "my house", "its lit", 69);

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

}

main().catch(console.error);