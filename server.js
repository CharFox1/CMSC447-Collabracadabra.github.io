const express = require('express');
const bodyParser = require('body-parser');
const { request } = require('express');
const app = express();

//const MongoClient = require('mongodb').MongoClient
//MongoClient.connect('mongodb + srv://Admin:password@cluster0.ejcge.mongodb.net/<dbname>?retryWrites=true&w=majority', (err, database) => {
//    if (err) {
//        return console.log(err);
//    }
//    db = database;
//    app.listen(3000, function () { console.log('listing on 3000') });

//});

function main() {
    const MongoClient = require('mongodb').MongoClient;
    MongoClient.connect('mongodb+srv://Admin:Password@cluster0.ejcge.mongodb.net/<dbname>?retryWrites=true&w=majority', (err, client) => {
        console.log('Connected to the server');
        if (err) return console.log(err);
 //       var db = client.db('AFRMS');
        var client = client;
        app.listen(3000, () => { console.log('listening on 3000') });

        app.use(bodyParser.urlencoded({ extended: true }))
        var employeeID = signIn(client);

        /*
        app.get('/', (req, res) => { res.sendFile(__dirname + '/signInPage.html') });  // Note: __dirname is the path to your current working directory. Try logging it and see what you get!
        app.post('/User', (req, res) => {
            var username = req.body.username;
            var pass = req.body.password;
            console.log("Checking if the user exists");
            //const query = { name: username, password: pass };
    
            
    
            db.collection('Users').findOne(query, function (findErr, result) {
                if (findErr) throw findErr;
                console.log(result.role);
                //         client.close();
            });
        });
        */

    });
}
main();

function signIn(client) {
    app.get('/', (req, res) => { res.sendFile(__dirname + '/signInPage.html') });  // Note: __dirname is the path to your current working directory. Try logging it and see what you get!
    app.post('/Userlogin', async (req, res) => {
        var username = req.body.username;
        var pass = req.body.password;
    

        var dataFunc = require("./databaseFunctions");
        var employeeID = await dataFunc.findUser(client, username, pass);

        //If employeeID is null that means that either the username or password were incorrect
        console.log(employeeID);
        if (employeeID == null) {
            console.log("Did not find an employee");
            app.put('/Userlogin', (req, res) => {
                req.body.errMsg = "Insert a Valid Username and Password"
            });
            return null;
        }
        else {
            console.log("Found Employee!");
            return employeeID;
        }
    });
}