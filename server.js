const express = require('express');
const bodyParser = require('body-parser');
const { request } = require('express');
const app = express();

app.use(express.urlencoded({
    extended: true
}));

function main() {
    const MongoClient = require('mongodb').MongoClient;
    MongoClient.connect('mongodb+srv://Admin:Password@cluster0.ejcge.mongodb.net/<dbname>?retryWrites=true&w=majority', (err, client) => {
        console.log('Connected to the server');
        if (err) return console.log(err);
 //       var db = client.db('AFRMS');
        var client = client;
        app.listen(3000, () => { console.log('listening on 3000') });

//        app.get('/', function (req, res) { res.render(__dirname + '/views/pages/signInPage.html'); });  // Note: __dirname is the path to your current working directory. Try logging it and see what you get!
//        app.get('/createUser', function (req, res) { res.render(__dirname + '/views/pages/createUser.html'); });

        app.use(bodyParser.urlencoded({ extended: true }))
        var employeeID = signIn(client);

    });
}


function signIn(client) {
    console.log("In sign in function");
    var createUser = false;
//    app.get('/', function (req, res) { res.sendFile(__dirname + '/views/pages/signInPage.html'); });  // Note: __dirname is the path to your current working directory. Try logging it and see what you get!
    app.get('/', (req, res) => { res.sendFile(__dirname + '/signinPage.html') });
    app.post('/Userlogin', async (req, res) => {
        var username = req.body.username;
        var pass = req.body.password;
        console.log("username and pass are set");
//        if (document.getElementById('createUser').clicked == true) {
//            var userID = createUser();
//        }

        console.log("Searching for user: ");
        console.log(username);
        console.log(pass);
        var dataFunc = require("./databaseFunctions");
        var userID = await dataFunc.findUser(client, username, pass);

        //If employeeID is null that means that either the username or password were incorrect
        console.log(userID);
        if (userID == null) {
            console.log("Did not find an employee");
            //app.put('/Userlogin', (req, res) => {
            //    req.body.errMsg = "Insert a Valid Username and Password"
            //});
            return null;
        }
        else {
            console.log("Found Employee!");
            return userID;
        }
        res.end();
    });

    app.post('/createUser', async (req, res) => {
        console.log("In create user post");
        //app.get('/createUser', (req, res) => { res.sendFile(__dirname + '/createUser.html') });
        //res.redirect('/createUser');
        //var userID = await createUserFunc(client);

        var username = req.body.username;
        var pass = req.body.password;

        app.get('/createUser', (req, res) => { res.sendFile(__dirname + '/createUser.html') });
        res.redirect('/createUser');

        var dataFunc = require("./databaseFunctions");
        var userID = await dataFunc.addUser(client, username, pass, "PIN");

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
            //app.put('/Userlogin', (req, res) => {
            //    req.body.errMsg = "Insert a Valid Username and Password"
            //});
            return null;
        }
        else {
            console.log("User created successfully");
            return userID;
        }
        res.end();
    });
}
/*
function createUserFunc(client, req, res) {
    console.log("In createUserFunc");
//    app.get('/', (req, res) => { res.redirect(__dirname + '/createUser.html') });  // Note: __dirname is the path to your current working directory. Try logging it and see what you get!
//    res.redirect('public/createUser.html');
//    app.get('/createUser', function (req, res) { res.sendFile(__dirname + '/views/pages/createUser.html'); });
    app.get('/createUser', (req, res) => { res.sendFile(__dirname + '/createUser.html') });
//    app.get('/', function (req, res) { res.redirect('/createUser.html'); }); 
    res.redirect('/createUser');
    console.log("Before post");
    app.post('/CreateUser', async function (req, res) {
        console.log("In create user post2");
        var username = req.body.username;
        var pass = req.body.password;

        console.log(username);
        console.log(pass);
        var dataFunc = require("./databaseFunctions");
        var userID = await dataFunc.addUser(client, username, pass, "PIN");

        if (userID == null) {
            console.log("Username unavailable");
            return null;
        }
        else {
            console.log("Successfully created a new user");
            signIn(client);
        }
        res.end();
    });
    console.log("After post");
}
*/
main();