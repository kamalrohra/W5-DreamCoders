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
  Question_title: String,
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
const answer1 = new Answers({
  Solution : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Et leo duis ut diam quam nulla porttitor massa. Id diam vel quam elementum pulvinar etiam non. Adipiscing commodo elit at imperdiet dui. Proin gravida hendrerit lectus a. Orci eu lobortis elementum nibh tellus molestie nunc non blandit. Venenatis cras sed felis eget velit aliquet sagittis id consectetur. Tellus rutrum tellus pellentesque eu tincidunt tortor aliquam. Habitant morbi tristique senectus et. Orci dapibus ultrices in iaculis nunc sed augue.",
  A_Author : "kamal",
  Votes: 5
});

const answer2 = new Answers({
  Solution : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Et leo duis ut diam quam nulla porttitor massa. Id diam vel quam elementum pulvinar etiam non. Adipiscing commodo elit at imperdiet dui. Proin gravida hendrerit lectus a. Orci eu lobortis elementum nibh tellus molestie nunc non blandit. Venenatis cras sed felis eget velit aliquet sagittis id consectetur. Tellus rutrum tellus pellentesque eu tincidunt tortor aliquam. Habitant morbi tristique senectus et. Orci dapibus ultrices in iaculis nunc sed augue.",
  A_Author : "satya",
  Votes: 5
});

const answer3 = new Answers({
  Solution : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Et leo duis ut diam quam nulla porttitor massa. Id diam vel quam elementum pulvinar etiam non. Adipiscing commodo elit at imperdiet dui. Proin gravida hendrerit lectus a. Orci eu lobortis elementum nibh tellus molestie nunc non blandit. Venenatis cras sed felis eget velit aliquet sagittis id consectetur. Tellus rutrum tellus pellentesque eu tincidunt tortor aliquam. Habitant morbi tristique senectus et. Orci dapibus ultrices in iaculis nunc sed augue.",
  A_Author : "sam",
  Votes: 6
});

const answers = [answer1,answer2,answer3]

app.get("/",function(req,res){
  res.render("index");
});

app.get("/login",function(req,res){
  res.render("signin");
});

app.get("/signup",function(req,res){
  res.render("signup");
});


app.get("/discussions",function(req,res){
  Forum.find({},function(err,founditems){
    if(err){
      console.log(err);
    }else{
      res.render("doubts",{questions:founditems})
    }
  });
})


app.get("/projectHelp",function(req,res){
  res.send("project help section");
})


app.get("/compose",function(req,res){
    res.render("compose")
})


app.post("/login",function(req,res){
  const user = new User({
    username : req.body.username,
    password : req.body.password
  });



  req.login(user,function(err){

    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req,res,function(){

        res.redirect("/");
      })
    }
  })


});

app.post("/compose",function(req,res){
  if(req.isAuthenticated()){
    const title = req.body.postTitle;
    const content = req.body.postBody;
    const question = new Forum({
      Question_title : title,
      Question: content,
      Q_author: req.user.username
  })
  question.save()
  res.redirect("/discussions")
  }else{
    res.redirect("/login")
  }

  })





app.get("/incPoint",function(req,res){
  if(req.isAuthenticated()){
    let points = req.user.points;
    points++;
    User.findOneAndUpdate({username:req.user.username},{ points: points},function(err){
      if(err){
        console.log(err);
      }
    })

    res.redirect("/")

}else{
  res.redirect("/login")
}
})

app.get("/:questionName", function(req, res){
  const requestedTitle = _.lowerCase(req.params.questionName);
  Forum.find({},function(err,founditem){
    founditem.forEach(function(forum){
      const storedTitle = _.lowerCase(forum.Question);

      if (storedTitle === requestedTitle) {

        res.render("doubtsqa", {
          question: forum.Question,
          answers:forum.Answer,
          id: forum._id
        });

      }
    });
  })


});

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

app.post("/submitans",function(req,res){
  const ans= new Answers({
    Solution : req.body.answer,
    A_Author : req.user,
    Votes : 0
  })
  Forum.findOne({_id:req.body.questionid},function(err,founditem){
    if(err){
      console.log(err);
    }else{
      founditem.Answer.push(ans)
      founditem.save()
      res.redirect("/"+founditem.Question)
    }
  })
});

app.post("/vote",function(req,res){
  Forum.findOne({_id:req.body.forumid},function(err,founditem){
    if(err){
      console.log(err);
    }else{
      founditem.Answer.forEach(function(answer){
        if(String(answer._id)===req.body.answerid){
          console.log(answer.Votes);
          answer.Votes++;
          console.log(answer.Votes);
          founditem.save()
        }

        })
      }
})


})

// app.get("/check",function(req,res){
//   res.render("doubtsqa")
// })

app.listen(3000,function(){
  console.log("server started at port 3000");
});
