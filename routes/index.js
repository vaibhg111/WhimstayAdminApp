var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var session = require("express-session");
var cookieParser = require("cookie-parser");
var flash = require("connect-flash");
var multer = require('multer');
var Request = require("request");
var JSAlert = require("js-alert");
redirect = require("express-redirect");
var expressValidator = require('express-validator');
var cors = require('cors');
var globalUrl = require('./global');
var logger = require('./winston');


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(expressValidator());
router.use(flash());
router.use(cors())
router.use(cookieParser());
router.use(session({
  secret: '78fhfhf88dkdjd8d7dldheye',
  saveUninitialized: true,
  resave: false,
  cookie: {
    path: '/',
    maxAge: 10800000  //60 mins
  }
}));

var urlencodedParser = bodyParser.urlencoded({ extended: false })

router.get('/', function (req, res, next) {
  if (req.session.userId == 0 || req.session.userId == 'null' || req.session.userId == undefined) {
    req.session.user = 1;
    res.render('index', { title: 'Express' });
    logger.error({
      level: 'error',
      message: 'userId not found'
    });
  } else {
    res.redirect('/dashboard');
  }
});

router.get('/dashboard', function (req, res, next) {
  var userId = req.session.userId;
  var pmcId = req.session.pmcId;
  var firstName = req.session.firstName;

  if (req.session.userId == 0 || req.session.userId == 'null' || req.session.userId == undefined) {
    res.redirect('/');
  } else {
    res.render('dashboard', { data: userId,pmcId: pmcId, firstName: firstName, isAdmin: req.session.isAdmin });
  }
});

router.post('/dashboard', urlencodedParser, function (req, res, next) {
  //console.log(JSON.stringify(req.body))
  Request.post({
    "headers": {
      app: 'admin',
      "content-type": "application/json",
    },
    "url": global.globalUrl + "user/login/mobile/verify",
    "body": JSON.stringify(req.body)
  }, (error, response, body) => {
    if (error) {
      // return console.dir(error);
      logger.error({
        level: 'error',
        message: 'sign in error',
      });
    } else {
      var r = JSON.parse(body);
      // console.log("-------------------------------");
      // console.log(r);
      // console.log("-------------------------------");

      // console.log(r);
      if (r.status == 200) {
        // console.log(req.session.userId);
        req.session.userId = r.userId;
        req.session.pmcId = r.pmcId;
        // req.session.firstName = r.userInfo.firstName;
        // req.session.isAdmin = r.userInfo.isAdmin;
        // req.session.isAdmin = r.userInfo.isAdmin;

        // console.log("---------------------------");
        // console.log(req.session.userId);
        // console.log("---------------------------");
        if (!req.session.userId) {
          logger.info({
            level: 'error',
            message: 'SignIn Error',
          });
          res.redirect("/")
        } else {
          logger.info({
            level: 'info',
            message: 'SignIn Successfully',
          });
          res.render('dashboard', { data: req.session.userId, pmcId: req.session.pmcId });
        }
      } else {
        // console.log(req.body);
        // console.log("please check your otp");
        res.redirect('/');
      }
    }
  });
});

router.post('/dashboardUser', function (req, res, next) {
  //console.log(req.body);
  var dataInput = req.body.mobileno1;
  var countryCode = req.body.dialerCode;
  var concat = countryCode + dataInput
  var data = new Object();
  data.mobileno = concat;
  data.otpCode = req.body.otpCode;
  Request.post({
    "headers": { "content-type": "application/json" },
    "url": global.globalUrl + 'v1/user/login/mobile/otp/varify',
    "body": JSON.stringify(data)
  }, (error, response, body) => {
    if (error) {
      console.log("OTP check");
    } else {
      console.log("Success");
    }
  });


  console.log(JSON.stringify(req.body));
  Request.post({
    "headers": {
      "content-type": "application/json",
    },
    "url": global.globalUrl + "user",
    "body": JSON.stringify(req.body)
  }, (error, response, body) => {
    if (error) {
      // return console.dir(error);
      logger.info({
        level: 'error',
        message: "failed to Login"
      });
    } else {
      var r = JSON.parse(body);
      console.log("----------------------");
      console.log(body);
      req.session.userId = r.userId;
      req.session.pmcId = r.pmcId;
      req.session.firstName = r.firstName;
      req.session.isAdmin = r.isAdmin;
      console.log("----------------------");
      console.log(req.session.userId);
      logger.info({
        level: 'info',
        message: "Logged in user id " + req.session.userId,
      });
      console.log("----------------------");
      res.render('dashboard', { data: req.session.userId,pmcId: req.session.pmcId, firstName: req.session.firstName, isAdmin: req.session.isAdmin });
    }
  });

});

router.get('/Sign_out', function (req, res, next) {
  if (req.session.userId) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        logger.info({
          level: 'info',
          message: 'SignOut Successfull'
        });
        console.log("logout Successfully");
        return res.redirect('/');
      }
    });
  }
});

router.get('/propertyUserDetails', function (req, res, next) {
  var userId = req.session.userId;
  var pmcId = req.session.pmcId;
  var firstName = req.session.firstName;
  res.render('propertyUserDetails', { data: userId,pmcId: pmcId, firstName: firstName, isAdmin: req.session.isAdmin });
});

router.get('/Profile', function (req, res, next) {
  var firstName = req.session.firstName;
  if (req.session.userId == 0 || req.session.userId == 'null' || req.session.userId == undefined) {
    res.redirect('/');
  } else {
    res.render('profile', { data: req.session.userId,pmcId: req.session.pmcId, firstName: firstName, isAdmin: req.session.isAdmin });
  }
});

router.get('/FAQ', function (req, res, next) {
  var firstName = req.session.firstName;
  if (req.session.userId == 0 || req.session.userId == 'null' || req.session.userId == undefined) {
    res.redirect('/');
  } else {
    res.render('faq', { data: req.session.userId,pmcId: req.session.pmcId, firstName: firstName, isAdmin: req.session.isAdmin });
  }
});

router.get('/shareMesssage', function (req, res, next) {
  var firstName = req.session.firstName;
  if (req.session.userId == 0 || req.session.userId == 'null' || req.session.userId == undefined) {
    res.redirect('/');
  } else {
    res.render('shareMesssage', { data: req.session.userId,pmcId: req.session.pmcId, firstName: firstName, isAdmin: req.session.isAdmin });
  }
});

router.get('/sidenav', function (req, res, next) {
  if (req.session.userId == 0 || req.session.userId == 'null' || req.session.userId == undefined) {
    res.redirect('/');
  } else {
    res.render('sidenav', { data: req.session.userId,pmcId: req.session.pmcId, isAdmin: req.session.isAdmin });
  }
});


router.get('/termsAndCondition', function (req, res, next) {
  var firstName = req.session.firstName;
  if (req.session.userId == 0 || req.session.userId == 'null' || req.session.userId == undefined) {
    res.redirect('/');
  } else {
    res.render('termsAndCondition', { data: req.session.userId,pmcId: req.session.pmcId, firstName: firstName, isAdmin: req.session.isAdmin });
  }
});

router.get('/contactUs', function (req, res, next) {
  var firstName = req.session.firstName;
  if (req.session.userId == 0 || req.session.userId == 'null' || req.session.userId == undefined) {
    res.redirect('/');
  } else {
    res.render('contactUs', { data: req.session.userId,pmcId: req.session.pmcId, firstName: firstName, isAdmin: req.session.isAdmin });
  }
});

router.get('/reports', function (req, res, next) {
  var firstName = req.session.firstName;
  if (req.session.userId == 0 || req.session.userId == 'null' || req.session.userId == undefined) {
    res.redirect('/');
  } else {
    res.render('reports', { data: req.session.userId,pmcId: req.session.pmcId, firstName: firstName, isAdmin: req.session.isAdmin });
  }
});

router.get('/serviceFee', function (req, res, next) {
  var firstName = req.session.firstName;
  if (req.session.userId == 0 || req.session.userId == 'null' || req.session.userId == undefined) {
    res.redirect('/');
  } else {
    res.render('serviceFee', { data: req.session.userId,pmcId: req.session.pmcId, firstName: firstName, isAdmin: req.session.isAdmin });
  }
});

router.get('/bookingRefund', function (req, res, next) {
  var firstName = req.session.firstName;
  if (req.session.userId == 0 || req.session.userId == 'null' || req.session.userId == undefined) {
    res.redirect('/');
  } else {
    res.render('bookingRefund', { data: req.session.userId,pmcId: req.session.pmcId, firstName: firstName, isAdmin: req.session.isAdmin });
  }
});

router.get('/bookingList', function (req, res, next) {
  var firstName = req.session.firstName;
  if (req.session.userId == 0 || req.session.userId == 'null' || req.session.userId == undefined) {
    res.redirect('/');
  } else {
    res.render('bookingList', { data: req.session.userId,pmcId: req.session.pmcId, firstName: firstName, isAdmin: req.session.isAdmin });
  }
});

router.get('/callerVerification', function (req, res, next) {
  var firstName = req.session.firstName;
  if (req.session.userId == 0 || req.session.userId == 'null' || req.session.userId == undefined) {
    res.redirect('/');
  } else {
    res.render('callerVerification', { data: req.session.userId,pmcId: req.session.pmcId, firstName: firstName, isAdmin: req.session.isAdmin });
  }
});

router.get('/booking', function (req, res, next) {
  var firstName = req.session.firstName;
  if (req.session.userId == 0 || req.session.userId == 'null' || req.session.userId == undefined) {
    res.redirect('/');
  } else {
    res.render('booking', { data: req.session.userId,pmcId: req.session.pmcId, firstName: firstName, isAdmin: req.session.isAdmin });
  }
});

router.get('/hostServiceFee', function (req, res, next) {
  var firstName = req.session.firstName;
  if (req.session.userId == 0 || req.session.userId == 'null' || req.session.userId == undefined) {
    res.redirect('/');
  } else {
    res.render('hostServiceFee', { data: req.session.userId,pmcId: req.session.pmcId, firstName: firstName, isAdmin: req.session.isAdmin });
  }
});

router.get('/approveReview', function (req, res, next) {
  var firstName = req.session.firstName;
  if (req.session.userId == 0 || req.session.userId == 'null' || req.session.userId == undefined) {
    res.redirect('/');
  } else {
    res.render('approveReview', { data: req.session.userId,pmcId: req.session.pmcId, firstName: firstName, isAdmin: req.session.isAdmin });
  }
});

router.get('/approvePropertyReview', function (req, res, next) {
  var firstName = req.session.firstName;
  if (req.session.userId == 0 || req.session.userId == 'null' || req.session.userId == undefined) {
    res.redirect('/');
  } else {
    res.render('approvePropertyReview', { data: req.session.userId,pmcId: req.session.pmcId, firstName: firstName, isAdmin: req.session.isAdmin });
  }
});

router.get('/claimBooking', function (req, res, next) {
  var firstName = req.session.firstName;
  if (req.session.userId == 0 || req.session.userId == 'null' || req.session.userId == undefined) {
    res.redirect('/');
  } else {
    res.render('claimBooking', { data: req.session.userId,pmcId: req.session.pmcId, firstName: firstName, isAdmin: req.session.isAdmin });
  }
});

router.get('/claimView', function (req, res, next) {
  var firstName = req.session.firstName;
  if (req.session.userId == 0 || req.session.userId == 'null' || req.session.userId == undefined) {
    res.redirect('/');
  } else {
    res.render('claimView', { data: req.session.userId,pmcId: req.session.pmcId, firstName: firstName, isAdmin: req.session.isAdmin });
  }
});

router.get('/depositRefund', function (req, res, next) {
  var firstName = req.session.firstName;
  if (req.session.userId == 0 || req.session.userId == 'null' || req.session.userId == undefined) {
    res.redirect('/');
  } else {
    res.render('depositRefund', { data: req.session.userId,pmcId: req.session.pmcId, firstName: firstName, isAdmin: req.session.isAdmin });
  }
});


router.get('/welcome', function (req, res, next) {
  var firstName = req.session.firstName;
  if (req.session.userId == 0 || req.session.userId == 'null' || req.session.userId == undefined) {
    res.redirect('/');
  } else {
    res.render('welcome', { data: req.session.userId,pmcId: req.session.pmcId, firstName: firstName, isAdmin: req.session.isAdmin });
  }
});

router.post('/updateUserProfile', function (req, res, next) {
  //------Data Parsing start---------

  var inputData = req.body;
  //user model data parseing
  var tempUser = new Object();
  tempUser.fullName = inputData.fullName;
  tempUser.emailId = inputData.emailId;
  tempUser.userId = inputData.userId;
  tempUser.otpCode = inputData.otpCode;
  tempUser.dobDt = inputData.dobDt;
  tempUser.mobileno1 = inputData.mobileno1;
  tempUser.gender = inputData.gender;
  //userProfile model data parseing
  var tempUserProfile = new Object();
  tempUserProfile.userProfileId = req.session.user.userProfile.userProfileId;
  tempUserProfile.street = inputData.street;
  tempUserProfile.identification_id = inputData.identification_id;
  tempUserProfile.language = inputData.language;
  tempUserProfile.about = inputData.about;

  //add user to userprofile
  tempUserProfile.user = tempUser;
  console.log("tempUserProfile-----------");
  console.log(tempUserProfile);
  //------Data Parsing End-----

  var Request = require("request");
  Request.put({
    "type": 'PUT',
    "headers": { "content-type": "application/json" },
    "url": global.globalUrl + "/v1/user/" + req.session.user.userId + "/profile",
    "body": JSON.stringify(tempUserProfile)
  }, (error, response, body) => {

    if (error) {
      console.log(error);
      // return console.dir(error);
    } else {

      var r = JSON.parse(body);

      console.log("output : " + response.body);
      res.redirect('/profile');
    }

  });
});

module.exports = router;