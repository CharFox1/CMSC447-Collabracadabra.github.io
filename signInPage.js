function hidePassword() {//function hides password if checkbox toggled 
    var x = document.getElementById("pass");

    if (x.type === "password") {
        x.type = "text";
    }
    
    else {
        x.type = "password";
    }
}

/* w3 tutorial for findOne
//Placeholder for MongoDB
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    dbo.collection("userNames").findOne({}, function (err, result) {
        if (err) throw err;
        console.log(result.name);
        db.close();
    });
});
*/


var mongoose = require(mongoose),
    User = require(./user-model);

var connStr = mongodb://localhost:27017/mongoose-bcrypt-test;
    mongoose.connect(connStr, function (err) {
        if (err) throw err;
        console.log(Successfully connected to MongoDB);
    });

// create a user
//var testUser = new User({
//    username: jmar777,
//    password: Password;
//});


//assumes username textfield has ID of 'user' and
//password texfield has ID of 'pass'
//if successful signin occurs, current user is passed
//to local storage key "currentUser"
function signInButton() {
    var userInput = document.getElementById("user").value;
    var passInput = document.getElementById("pass").value;

    // fetch user and test password verification
    User.findOne({ username: userInput }, function (err, user) {
        if (err) throw err;

        // test a matching password
        user.comparePassword(passInput, function (err, isMatch) {
            if (err) throw err;
            console.log(passInput, isMatch); // -> Password: true
            //Go to next page
        });
    });

}


/* user-model.js
 * var mongoose = require(&#8216;mongoose&#8217;),
    Schema = mongoose.Schema,
    bcrypt = require(&#8216;bcrypt&#8217;),
    SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true }
});

UserSchema.pre(save, function(next) {
    var user = this;

// only hash the password if it has been modified (or is new)
if (!user.isModified('password')) return next();

// generate a salt
bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) return next(err);

        // override the cleartext password with the hashed one
        user.password = hash;
        next();
    });
});


});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model(User, UserSchema);
*/