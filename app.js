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
	rank : String,
  voteupid:[String],
  votedownid:[String]
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
const projectanswerSchema = new mongoose.Schema({
  Solution : String,
	A_Author : String,
	Votes : Number

})

const projectSchema = new mongoose.Schema({
  project_title: String,
  project : String,
	Answer : [projectanswerSchema],
  project_author : String
});

const Project = mongoose.model("project",projectSchema)

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

app.get("/newresources",function(req,res){
  res.send("resource section");
})
app.get("/projecthelp",function(req,res){
  Project.find({},function(err,founditems){
    if(err){
      console.log(err);
    }else{
      console.log("wathsup");
      res.render("projecthelp",{questions:founditems})
    }
  });
})
app.get('/logout', async (req, res) => {
  req.logout()
  res.redirect("/")
})
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
app.get("/compose",function(req,res){
    res.render("compose")
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
app.get("/composeproject",function(req,res){
    res.render("composeproject")
})
app.get("/:projectName", function(req, res){
  const requestedTitle = _.lowerCase(req.params.projectName);
  Project.find({},function(err,founditem){
    founditem.forEach(function(project){
      const storedTitle = _.lowerCase(forum.Question);

      if (storedTitle === requestedTitle) {

        res.render("doubtsqa", {
          question: project.project,
          answers:project.Answer,
          id: project._id
        });

      }
    });
  })


});

app.post("/check",function(req,res){


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

        res.redirect("/discussions");
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





// app.get("/incPoint",function(req,res){
//   if(req.isAuthenticated()){
//     let points = req.user.points;
//     points++;
//     User.findOneAndUpdate({username:req.user.username},{ points: points},function(err){
//       if(err){
//         console.log(err);
//       }
//     })
//
//     res.redirect("/")
//
// }else{
//   res.redirect("/login")
// }
// })



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
        res.redirect("/discussions");
      })
    }
  });
});

app.post("/submitans",function(req,res){
  if(req.isAuthenticated()){
  const ans= new Answers({
    Solution : req.body.answer,
    A_Author : req.user.username,
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
}});



app.post("/vote",function(req,res){
  if(req.isAuthenticated()){
  Forum.findOne({_id:req.body.forumid},function(err,founditem){
    if(err){
      console.log(err);
    }else{


      founditem.Answer.forEach(function(answer){
        let count = 0
        req.user.voteupid.forEach(function(id){
          if(String(answer._id)===id && count===0){
            count++;
            User.findOneAndUpdate({username: req.user.username},{$pull: {voteupid: answer._id}},function(err,foundItem){
              if(!err){
                console.log(err);
                answer.Votes--;
                founditem.save();
              }
            })
            User.findOne({username:answer.A_Author},function(err,rewarduser){
              if(!err){
                rewarduser.points--;
                rewarduser.save()
               }
            })
        }})
        if(String(answer._id)===req.body.answerid && count==0) {

          answer.Votes++;


          User.findOne({username : req.user.username},function(err,founduser){
            if(err){
              console.log(err);
            }else{

              founduser.voteupid.push(String(answer._id));
              console.log(answer.A_Author);



              founduser.save()
              founditem.save()

            }
          })
          User.findOne({username:answer.A_Author},function(err,rewarduser){
            if(!err){
              rewarduser.points++;
              rewarduser.save()
             }
          })


          console.log("executed");

        }else if(count>0) {
          console.log("already voted");


        }


        })
      }
      Forum.update({_id:req.body.questionid},{$sort:{"Answer.answer.": -1}},function(err){
        if(err){
          console.log(err);
        }
      })
        res.redirect("/"+founditem.Question)
  })}



})


app.post("/votedown",function(req,res){
  if(req.isAuthenticated()){
  Forum.findOne({_id:req.body.forumid},function(err,founditem){
    if(err){
      console.log(err);
    }else{


      founditem.Answer.forEach(function(answer){
          let count = 0
        req.user.votedownid.forEach(function(id){
          if(String(answer._id)===id && count===0){
            count++;
            User.findOneAndUpdate({username: req.user.username},{$pull: {votedownid: answer._id}},function(err,foundItem){
              if(!err){
                console.log(err);
                answer.Votes++;
                founditem.save();
              }
            })
        }})
        if(String(answer._id)===req.body.answerid && count==0) {

          answer.Votes--;


          User.findOne({username : req.user.username},function(err,founduser){
            if(err){
              console.log(err);
            }else{

              founduser.votedownid.push(String(answer._id));
              founduser.save()
              founditem.save()
            }
          })


          console.log("executed");

        }else if(count>0) {
          console.log("already voted");


        }


        })
      }

      res.redirect("/"+founditem.Question)

})}
// projecthelpsetup







app.post("/composeProject",function(req,res){
  if(req.isAuthenticated()){
    const title = req.body.postTitle;
    const content = req.body.postBody;
    const question = new Project({
      project_title : title,
      project: content,
      project_author: req.user.username
  })
  question.save()
  res.redirect("/discussions")
  }else{
    res.redirect("/login")
  }

  })



})


app.listen(3000,function(){
  console.log("server started at port 3000");
});
