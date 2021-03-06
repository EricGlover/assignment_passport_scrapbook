const app = require("express")();
const request = require("request");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const expressSession = require("express-session");
const flash = require("express-flash");
//storage
var userFacebook;
var userAccessTokenFacebook;
var userTumblr;
var newLikes;
var userAccessTokenTumblr;
var tumblrLikes;
var redditUser;

const passport = require("./services/passport");
app.use(passport.initialize());
app.use(passport.session());

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(flash());
app.use(
  expressSession({
    secret: process.env.secret || "keyboard cat",
    saveUninitialized: false,
    resave: false
  })
);

let handlebars = require("express-handlebars");
var hbs = handlebars.create({ defaultLayout: "main" });
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
var ourTumblr = require("./services/passport/tumblr");
var ourReddit = require("./services/passport/reddit");
///suggested strat for tumblr

// fb secret id
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
//
// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FB_ID,
//       clientSecret: process.env.FB_SECRET,
//       callbackURL: "http://localhost:3000/auth/facebook/callback"
//     },
//     function(accessToken, refreshToken, profile, done) {
//       const facebookId = profile.id;
//       const displayName = profile.displayName;
//
//       console.log(accessToken);
//       // User.findOne({ facebookId }, function(err, user) {
//       //   if (err) return done(err);
//       //
//       //   if (!user) {
//       //     // Create a new account if one doesn't exist
//       //     user = new User({ facebookId, displayName });
//       //     user.save((err, user) => {
//       //       if (err) return done(err);
//       //       done(null, user);
//       //     });
//       //   } else {
//       //     // Otherwise, return the extant user.
//       //     done(null, user);
//       //   }
//       // });
//       /* make the API call */
//       // FB.api("/{user-id}/friends", function(response) {
//       //   if (response && !response.error) {
//       //     /* handle the result */
//       //   }
//       // });
//
//       userAccessTokenFacebook = accessToken;
//       userFacebook = profile;
//       done(null);
//     }
//   )
// );
//tumblr route
app.get("/auth/tumblr", passport.authenticate("tumblr"));
app.get(
  "/auth/tumblr/callback",
  passport.authenticate("tumblr", {
    successRedirect: "/tumblrlikes",
    failureRedirect: "/login"
  })
);

//reddit route
// app.get("/auth/reddit", passport.authenticate("reddit"));
// app.get(
//   "/auth/reddit/callback",
//   passport.authenticate("reddit", {
//     successRedirect: "/reddit",
//     failureRedirect: "/login" //add flash message later
//   })
// );
app.get(
  "/auth/reddit",
  passport.authenticate("reddit", {
    state: "random",
    duration: "permanent"
  })
);
app.get(
  "/auth/reddit/callback",
  // Check for origin via state token

  passport.authenticate("reddit", {
    successRedirect: "/reddit",
    failureRedirect: "/login"
  })
  //res.redirect("/reddit");
);
app.get("/reddit", (req, res) => {
  // console.log(`user = `, req.session.passport.user);
  redditUser = req.session.passport.user;
  return res.redirect("/");
});
app.get("/auth/facebook", passport.authenticate("facebook"));

app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/",
    failureRedirect: "/login"
  })
);

app.get("/", (req, res) => {
  return res.render("login", {
    redditUser: redditUser,
    tumblrUser: tumblrLikes
  });
});
app.get("/tumblrlikes", (req, res) => {
  console.log(req.session.passport.user);
  tumblrLikes = req.session.passport.user;
  //this is calling tumblr likes
  return res.redirect("/");
});
app.get("/login", (req, res) => {
  return res.render("index");
});

//catch all for testing purposes
app.all("/", (req, res) => {
  console.log("things");
  return res.render("index");
});

//
let port = 3000;
app.listen(port, (res, req) => {
  console.log(`running on ${port}`);
});

////
