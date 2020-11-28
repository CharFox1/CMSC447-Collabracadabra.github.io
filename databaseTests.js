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

        console.log("\n[[dbTest]] listing databases");
        await db.listDatabases(client);

        //console.log("\n[[dbTest]] cleaning database");
        //await db.cleanDatabase(client);

        console.log("\n[[dbTest]] adding users");
        await db.addUser(client, null, null, "Mr. null", "default");
        await db.addUser(client, "test1", "test1", "Mr. 1", "default");
        await db.addUser(client, "test1", "test1", "Mr. 1", "default");
        await db.addUser(client, "test1", "something different", "Mr. 1", "default");

        console.log("\n[[dbTest]] adding employees");
        await db.addEmployee(client, "test2", "test2", "Harold", "Operations Chief", true);
        await db.addEmployee(client, "test3", "test2", "Barold", "Operations Chief", true);

        console.log("\n[[dbTest]] adding PIN")
        await db.addPIN(client, {
            username: "test4",
            password: "test4",
            name: "grandma",
            phone: 1234567890,
            age: "old"
        });

        var userID = await db.findUser(client, "test3", "test2");
        console.log("\n[[dbTest]] UserID to be used in updateEmployee test:", userID);
        await db.updateEmployee(client, userID, "test3", "test2", "update", "some role", false);

        var event = {
            PIN: 123,
            Employee: 456,
            timestamp: time,
            location: "my house",
            description: "not enough pizza",
            severity: 5,
        };
        var eventID = await db.addEvent(client, event)
        event._id = eventID;
        //event.location = "NEW";

        // returns list of employee docs 
        var employees = await db.getAllEmployees(client); 
        var team = {
            name: "cool team",
            author: employees[0],
            members: employees,
            availability: true
        }
        var teamID = await db.addTeam(client, team);

        var mission = {
            teamName: team.name,
            team: team,
            author: employees[0],
            events: [event],
            status: "Urgent"
        }
        var missionID = await db.addMission(client, mission);

        mission.status = "Updated!";
        mission._id = missionID;

        await db.updateMission(client, mission);

        //event.location = "NEW";
        //await db.updateEvent(client, event);
        
        console.log("[[dbTest]] testing findTeamFromEmployee");
        var employee = employees[0];
        console.log("[[dbTest]] employee to be found:");
        console.log(employee);
        result = await db.findTeamFromEmployee(client, employee);
        console.log("[[dbTest]] team found:");
        console.log(result);


    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

}

main().catch(console.error);