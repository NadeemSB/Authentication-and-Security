//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const saltrounds = 10;

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
  
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email : String,
    password : String
});

const User = new mongoose.model("User", userSchema);

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

    bcrypt.hash(req.body.password, saltrounds, function(err, hash){
        const newUser = new User({
            email : req.body.username,
            password : hash
        });
        newUser.save(function(err){
            if (!err){res.render("secrets");}
            else{console.log(err);}
        });    
    });
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