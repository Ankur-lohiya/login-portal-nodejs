var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator');
const{check,body,validationResult}=require('express-validator')
var multer = require('multer');
var upload=(multer({dest:'./uploads'}));
var User=require('../models/user');
var passport =require('passport');
var LocalStrategy = require('passport-local').Strategy;
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/register', function(req, res, next) {
  res.render('register',{title:'Register'});
});
router.get('/login', function(req, res, next) {
  res.render('login',{title:'Login'});
});
router.post('/login',
  passport.authenticate('local',{failureRedirect:'/users/login',failureFlash:'Invalid Credentials'}),
  function(req,res){
    req.flash('success','You are now logged in');
    res.redirect('/');
});

passport.serializeUser(function(user,done){
  done(null,user.id);
});
passport.deserializeUser(function(id,done){
  User.getUserById(id,function(err,user){
    done(err,user);
  });
}); 
passport.use(new LocalStrategy(function(username,password,done){
  User.getUserByUsername(username,function(err,user){
    if(err) throw err;
    if(!user){
      return done(null,false,{message:'unknown user'});
    }
    User.comparePassword(password,user.password,function(err,isMatch){
      if(err) return done(err);
      if(isMatch){
        return done(null,user);
      }
      else{
        return done(null,false,{message:'Invalid Password'});
      }
    });
  });
}));

router.post('/register',upload.single('profile'),function(req,res,next){
  var name=req.body.name;
  var email=req.body.email;
  var uname=req.body.username;
  var password=req.body.password;
  var cpassword=req.body.cpassword;
  if(req.file){
    var profileimage=req.file.filename;
  }
  else{
    var profileimage='noimage.jpg';
  }
  var newUser=new User({
    name:name,
    email:email,
    password:password,
    profileimage:profileimage,
    uname:uname
  });
  User.createUser(newUser,function(){
    console.log(newUser);
  });
  res.location('/');
  res.redirect('./login');
});
router.get('/logout',function(req,res){
  req.logout();
  req.flash('success','You are now logged out');
  res.redirect('/users/login');
});
module.exports = router;