/* eslint-disable no-unused-vars */
const https = require("https");
const fs = require("fs");
const express = require("express");
var session = require("express-session");
var helmet = require("helmet");
//const  path =         require('path')
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv").config();
const mysql = require("mysql");
const getUser = require("./config/getUser");
//const jwt = require('jsonwebtoken')
//const  config =       require('./config/config')
//const configbcr = require('./config/config')
//const  config2 =       require('./config/config')
const userRoutes = require("./routes/users.route");
//const meRoutes = require("./default/me.route");
//const argsRoutes    =   require('./routes/argsopts.route')
//const router   =   require('./routes/passportLoginRegister')
//const verifyToken = require('./config/verifyToken')
// const AuthController = require('./user/AuthController')
// const AuthController = require('./user/AuthController')
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
//protect routes
//const passport = require('./routes/')
const app = express();
app.use(helmet());
//const configbcr = process.env.seceret
//console.log(configbcr)
const expiryDate = process.env.expiryDate;
app.use(
  session({
    secret: "!!!alabala&_portocala$_sau @un spatiu verde-albastrucur si la vara!",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  })
);
const hostmysql = process.env.hostmysql;
const usermysql = process.env.usermysql;
const passwdmysql = process.env.passwdmysql;
const databasemysql = process.env.databasemysql;
//console.log('database: ',databasemysql)
var connection = mysql.createConnection({
  host: hostmysql,
  user: usermysql,
  password: passwdmysql,
  database: databasemysql
});
global.db = connection;

// db.connect( function(error) {
//   if(error) {
//     throw error
//     console.log("Error connecting database ... ")
//   }
//   db.query("SELECT * from app3cls0", function (err, result) {
//     if (err) throw err
//       console.log("Database created")
//     })
//   })

//const app = express()
//protect routes
//app.set('Secret', config.secret)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// CORS middleware
// const enableCrossDomain = function (req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*')
//   res.header('Access-Control-Allow-Methods', '*')
//   res.header('Access-Control-Allow-Headers', '*')
//   res.header("Content-Type", "application/x-www-form-urlencoded")
//   res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers")

//   next()
// }
// app.use(enableCrossDomain)

// app.use(bodyParser.json())
app.use(cors());
//https://enable-cors.org/server_expressjs.html
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
//me
// app.get("/me", function(req, res, next) {
//   // Handle the get for this route
// });
// app.post("/me", function(req, res, next) {
//   // Handle the post for this route
// });
// app.get("/me", getUser, meRoutes);
// app.post("/me", getUser, meRoutes);
//end me
app.get("/api", function(req, res, next) {
  // Handle the get for this route
});
app.post("/api", function(req, res, next) {
  // Handle the post for this route
});
//app.get('/users', userRoutes)
//app.get('/users/:nr', userRoutes)
app.post("/sendmail", userRoutes);
app.post("/login", userRoutes);
//app.get('/login', userRoutes)

//app.post('/register', verifyToken, userRoutes)

//app.get('protected', router)

//protect routes
//const  userRoutes = express.Router()
//app.use(cors({allowedHeaders: 'Authorization', origin: 'http://localhost:8080'}));

//app.use('/api', verifyToken, userRoutes)
//app.get("/me", getUser, userRoutes);
app.get("/api/userid/:id", getUser, userRoutes);
app.post("/api/userid/:id", getUser, userRoutes);
//get user data
app.get("/api/userStatus/:userToken", userRoutes);
app.post("/api/userStatus/:userToken", userRoutes);
//
app.get("/api/changedata/", getUser, userRoutes);
app.post("/api/changedata/", getUser, userRoutes);
//get elevi Dashboard
app.get("/api/elevi/", getUser, userRoutes);
app.post("/api/elevi/", getUser, userRoutes);
//get elevi Listelevi
//app.get('/api/getelevi/', getUser, userRoutes)
app.post("/api/getelevi/", getUser, userRoutes);
//user by name
app.get("/api/elevi/searchbyid/", getUser, userRoutes);
app.post("/api/elevi/searchbyid/", getUser, userRoutes);
// app.get('/search/:username', verifyToken, userRoutes)
// app.post('/search/:username', verifyToken, userRoutes)
// get elev petru evaluare
app.get("/api/listelevi/getelev/", getUser, userRoutes);
app.post("/api/listelevi/getelev/", getUser, userRoutes);
//get elev pentru evaluare anexa min
app.get("/api/listelevi/getelevmin/", getUser, userRoutes);
app.post("/api/listelevi/getelevmin/", getUser, userRoutes);
//app.post('/api/listelevi/getelev/:id', getUser, userRoutes)
//save data elev evaluare
app.post("/api/listelevi/elev/save/", getUser, userRoutes);
app.post("/api/listelevi/anexamin/save/", getUser, userRoutes);
// get elev data to generate pdf
//app.get("/api/listelevi/elev/savepdf/:id", getUser, userRoutes);
//search elev in listelevi
app.post("/api/listelevi/search/", getUser, userRoutes);
//get itemi data
app.get("/api/listelevi/elev/itemi/", getUser, userRoutes);
// app.get('/api/token/:token', verifyToken, userRoutes)
// app.post('/api/token/:token', verifyToken, userRoutes)

// app.get('/api/users/:nr', verifyToken, userRoutes)
// app.get('/api/users/delete/:nr', verifyToken, userRoutes)
// //editusers and update
// app.post('/api/users/update/:nr', verifyToken, userRoutes)
// app.get('/api/edit/:username', verifyToken, userRoutes)
// //arguments and options routes
// app.use('/apiargs', verifyToken, argsRoutes)
// app.get('/apiargs/argsopts', verifyToken, argsRoutes)
// app.post('/apiargs/insertargsopts', verifyToken, argsRoutes)

// //pdfmake
// app.get('/savetopdf', verifyToken, userRoutes)

var port = process.env.PORT || 4000;
app.get("/", (req, res) => {
  res.send("api running...");
});
//https
//  .createServer(
 //   {
 //     key: fs.readFileSync("cert/localhost.key"),
  //    cert: fs.readFileSync("cert/localhost.cert")
 //   },
 //   app
 // )
 // .listen(port, () => {
    // eslint-disable-next-line no-console
  //  console.log("Listening... " + port);
 // });
app.listen(port)
console.log("Listening... " + port);
module.exports = app;
