// JavaScript source code
// CreateUser Function:
// This page will be accessed by the administrator where they will be able to assign a users username, password, and role within the database.
// The first thing the admin will do is insert a users username and password into text boxes. The role will then be selected by a scroll down wheel of the
// different options available to users (OC, DISPATCHER, FR, ADMIN?)


//Establishes connection to the mongo database
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://Admin:Password@cluster0.ejcge.mongodb.net/AFRMS?retryWrites=true&w=majority";
MongooClient.connect(url, function (err, db) {
    if (err) throw err;
    console.log("Successfully connected to MongoDB");
});


// After selecting the create user button it will then need to search through the database to see if that user is already taken and if so tell them to change the
// username value. Passwords can probably be the same.
function createUserButton() {
    //Get the values that the admin insertted to be stored in the database.
    var usernameInput = document.getElementById("username").value;
    var passwordInput = document.getElementById("password").value;
    var roleInput = document.getElementById("role").value;

    //Search through the database to see if the username is already taken.
    var dbo = db.db("databaseFunctions");
    dbo.collection("Users").findOne({ name: userInput }, function (err, user) {
        //If it is able to find a user with the same username already in the system then it will arrive here.
        alert("Username already exists; try again.");
        return;
    }
    //Create the new user and add it to the database
    var newUser = { name: usernameInput, password: passwordInput, role: roleInput };
    dbo.collection("Users").insertOne(newUser, function (err, res) {
        if (err) throw err;
        console.log("New user inserted");
        db.close();
    });
});
