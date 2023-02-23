require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize()); 
app.use(passport.session());

mongoose.connect("mongodb+srv://admin-priyajeet:Netid!6081@cluster0.tapae8e.mongodb.net/secrets", { useNewUrlParser: true, useUnifiedTopology: true });
// mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId: String,
  secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user,done){
    done(null,user.id)
});

passport.deserializeUser(function(id,done){
    User.findById(id, function(err,user){
        done(err,user);
    });
});





passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID ,
    clientSecret:process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/", function(req, res){
  res.render("home");
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ["profile"] }));


  app.get("/auth/google/secrets", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect('/secrets');
  });

app.get("/login", function(req, res){
  res.render("login");
}); 

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/secrets", function(req, res){
User.find({"secret":{$ne: null}},function(err,foundUsers){
    if(err){
        console.log(err);
    }else{
        if(foundUsers){
            res.render("secrets",{usersWithSecrets: foundUsers});
        }
    }
});
});

app.get("/logout", function(req, res) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });


app.get("/submit",function(req,res){
    if (req.isAuthenticated()){
        res.render("submit");
      } else {
        res.redirect("/login");
      }
});

app.post("/submit",function(req,res){
    const submittedSecret = req.body.secret;
    // console.log(req.user.id);
    User.findById(req.user.id, function(err,foundUser){
        if(err) {
            console.log(err)
        } else{
            if (foundUser){
                foundUser.secret = submittedSecret
                foundUser.save(function(){
                    res.redirect("/secrets");
                });
            }
        }
    }); 
});



app.post("/register", function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});

app.post("/login", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});







app.listen(3000, function() {
  console.log("Server started on port 3000.");
});






 


/////////////////////////////   ---my code---   //////////////////////////////////////////////////////////////

// // requiring all the packages
// require('dotenv').config();
// const express = require("express");
// const bodyParser = require("body-parser");
// const ejs = require("ejs")
// const mongoose = require("mongoose")
// const encrypt = require("mongoose-encryption");
// const bcrypt = require('bcrypt');
// const saltRounds = 10;


// // initialising app
// const app = express();

// // putting the public as static for css styles
// app.use(express.static("public"));

// // seting view engine as ejs for templating 
// app.set('view engine','ejs');

// // body parser changing true to get value as json format 
// app.use (bodyParser.urlencoded({
//     extended:true
// }));

// // conecting to local mongoDB
// mongoose.connect("mongodb://127.0.0.1:27017/userDB");

// // building a schema
// const userSchema = new mongoose.Schema ({
//     email: String,
//     password:String
// });

// const secret = process.env.SECRET

// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

// // creating a model 
// const User = new mongoose.model("User",userSchema)







// app.get("/",function(req,res){
//     res.render("home");
// });

// app.get("/login",function(req,res){
//     res.render("login");
// });

// app.get("/register",function(req,res){
//     res.render("register");
// });


// app.post("/register",function(req,res){
//     bcrypt.hash(req.body.password, saltRounds).then(function(hash) {
//         const NewUser = new User({
//             email: req.body.username,
//             password: hash
//         });
    
//         NewUser.save(function(err){
//             if(err){
//                 console.log(err);
//             }else{
//                 res.render("secrets");
//             }
//         });
//     });
   
// });

// app.post("/login",function(req,res){
//     const username = req.body.username;
//     const password = req.body.password;
//     User.findOne({email: username},function(err,foundUser){
//         if(err){
//             console.log(err)
//         } else{
//             if(foundUser){
//                 if(foundUser.password == password){
//                     res.render("secrets");
//                 }
//             }
//         }

//     });

//     });

    
// app.listen(3000, function(){
//     console.log("server started on port 3000.")
// });

