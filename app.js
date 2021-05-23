//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
 
app.use(session({
    secret : "whatever this is.",
    reset : false,
    saveUninitialized : false
}));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    email : String,
    password : String
});

app.use(passport.initialize());
app.use(passport.session());
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
   
  passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

app.get("/secrets", function(req, res){
    if (req.isAuthenticated()){
        res.redirect("/secret");
    } else{
        res.redirect("/login");
    }
});

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){

    User.register({username: req.body.username}, req.body.password, function(err, user){
        if (err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets")
            })
        }
    })
    
});

app.post("/login", function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email : username}, function(err, result){
        if (err){ 
            console.log(err);
        }else { 
          if (result){
              bcrypt.compare(password, result.password, function(err, val){
                if (val == true){
                    res.render("secrets");
                }
                else {
                    console.log(err);
                }
              });
          }
        }
    });
});

app.listen(3000,function(){
    console.log("Server running on port 3000");
});