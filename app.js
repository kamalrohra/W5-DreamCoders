const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require("lodash");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const app = express();
app.set('view engine','ejs');
app.use(express.static("public"));
app.set('trust proxy', 1) // trust first proxy
app.use(bodyParser.urlencoded({
  extended : true
}));

app.use(session({
  secret: 'our first website',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/ApScriptDB', {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema =new mongoose.Schema({
  password : String,
  username : String,
	email: String,
	// profession: String,
  points : Number,
	rank : String
});
userSchema.plugin(passportLocalMongoose);

const answerSchema = new mongoose.Schema({
  Solution : String,
	A_Author : String,
	Votes : Number

})

const forumSchema = new mongoose.Schema({
  Question : String,
	Answer : [answerSchema],
  Q_author : String
});

const Answers = mongoose.model("Answer",answerSchema);

const Forum = mongoose.model("forum",forumSchema);

const User = mongoose.model("user",userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


sampleAnswers1 = new Answers({
    Solution :"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Eu ultrices vitae auctor eu augue. Adipiscing enim eu turpis egestas pretium aenean pharetra",
    A_Author : "kamal",
    Votes : 10
})
sampleAnswers2 = new Answers({
    Solution :"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Eu ultrices vitae auctor eu augue. Adipiscing enim eu turpis egestas pretium aenean pharetra",
    A_Author : "satya",
    Votes : 11
})

answers = [sampleAnswers1,sampleAnswers2]

sampleQuestion = new Forum({
  Question : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Eu ultrices vitae auctor eu augue. Adipiscing enim eu turpis egestas pretium aenean pharetra",
  Answer : answers,
  Q_author : "kamal"

});

sampleQuestion.save();


app.get("/",function(req,res){
  res.render("index");
});

app.get("/login",function(req,res){

  res.render("signin");
});

app.get("/signup",function(req,res){
  res.render("signup");
});

app.post("/login",function(req,res){
  const user = new User({
    username : req.body.username,
    password : req.body.password
  })
;

  req.login(user,function(err){

    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req,res,function(){
        console.log(req.user)
        res.redirect("/");
      })
    }
  })


});

app.get("/incPoint",function(req,res){
  if(req.isAuthenticated()){
    let points = req.user.points;
    points++;
    User.findOneAndUpdate({username:req.user.username},{ points: points},function(err){
      if(err){
        console.log(err);
      }
    })
    console.log(req.user);
    res.redirect("/")

}else{
  res.redirect("/login")
}
})

app.post("/signup",function(req,res){
  User.register({username: req.body.username},req.body.password,function(err,user){
    if(err){
      console.log(err);
      res.redirect("/signup");
    }else{
      passport.authenticate("local")(req,res,function(){
        User.findOneAndUpdate({username:user.username},{$set:{points : 0 , rank : "AMATURE" , email : req.body.email}},function(err){
          if(err){
            console.log(err);
          }
        });
        res.redirect("/");
      })
    }
  });
});


app.listen(3000,function(){
  console.log("server started at port 3000");
});
