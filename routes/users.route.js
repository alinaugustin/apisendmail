/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
const express = require("express");
//const app = express()
const userRoutes = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config;
const configbcr = process.env.secret;
const tokenapiport = process.env.tokenapiport;
//console.log('configbcr: ',configbcr)
const genRandomNumbers = require("../config//utils.js");
const axios = require("axios");
//const fetch = require("node-fetch")
//const verifyToken = require('../config/verifyToken')
//route login
//verify if token
// userRoutes.route("/me").post(function(req, res) {
//   //console.log("usertoken: ", req.headers["user"]);
//   //var usertoken = req.headers["user"];
//   var usertoken = req.params.id;
//   console.log("usertoken: ", usertoken);
//   if (!usertoken)
//     return res.status(401).send({ auth: false, message: "No token provided." });
//   jwt.verify(token, configbcr.secret, function(err, decoded) {
//     if (err)
//       return res
//         .status(500)
//         .send({ auth: false, message: "Failed to authenticate token." });
//     console.log("decoded me: ", decoded);
//     res.status(200).send(decoded);
//   });
// });
//send mail: for all servers
userRoutes.route("/sendmail").post(function(req, res) {
  var postbody = req.body;
  console.log("postbody: ", postbody);
  //var token = postbody.tokenapimail;
  var subject = postbody.subject;
  var email = postbody.email;
  var message = postbody.message;
  console.log("all received: ", subject + " " + email + " " + message);
  //const nodemailer = require("nodemailer");
  // async..await is not allowed in global scope, must use a wrapper
  async function main() {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    //let testAccount = await nodemailer.createTestAccount();
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.stsmail.ro",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "alin.neaga@rocnee.eu", // generated ethereal user
        pass: "Cristianame@123" // generated ethereal password
      }
    });
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: "alin.neaga@rocnee.eu", // sender address
      to: email, // list of receivers
      subject: subject, // Subject line
      text: message // plain text body
      //html: "<b>Hello world?</b>" // html body
    });
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  }
  main().catch(console.error);
});
//end send mail
userRoutes.route("/login").post(function(req, res) {
  var post = req.body;
  var name = post.username;
  //console.log(name)
  //var pass = post.password
  //console.log(pass)
  //var bcrypt = require('bcrypt')
  var hash =
    "SELECT password,id,valid,email FROM users WHERE username = '" +
    name +
    "' ";
  db.query(hash, function(error, results) {
    if (error) {
      console.log("err2_new:", error);
      return res.status(500).send("Error on the server.");
    }
    if (!results) {
      return res.status(404).send("No user found.");
      //console.log('email3:', name)
    }
    //console.log('results[0]:', results)
    var valid = results[0].valid;
    var username = name;
    var email = results[0].email;
    if (valid != "da") {
      //console.log('results[0].valid:', valid)
      return res.status(404).send("Unitatea este invalida.");
    }
    //console.log('results[0]: ', results[0].password)
    //console.log('results[0]: ', results[0].id)
    // check if the password is valid
    var passwordIsValid = bcrypt.compareSync(
      req.body.password,
      results[0].password
    );
    if (!passwordIsValid)
      return res.status(401).send({ auth: false, token: null });
    // if user is found and password is valid
    // create a token
    if (results[0].id == 0 || results[0].id == "") {
      results[0].id = genRandomNumbers();
      //console.log(results[0].id)
      var token = jwt.sign({ id: results[0].id }, configbcr, {
        expiresIn: 2678400 // expires in 1 month
      });
      var queryid =
        "UPDATE users set id = '" +
        token +
        "' WHERE username = '" +
        name +
        "' ";
      db.query(queryid, function(error) {
        if (error) {
          console.log("err3_new:", error);
          return res.status(500).send("Error on the server.");
        }
      });
      // return the information including token as JSON
      //console.log('token login1: ', token)
      res.cookie("user", token, { httpOnly: true, secure: true });
      res
        .status(200)
        .send({ auth: true, user: token, username: username, email: email });
    } else {
      //check if token expired
      //res.cookie('user', token, { httpOnly: true, secure: true })
      //console.log('username2: ',username)
      //console.log('email2: ',email)
      res.status(200).send({
        auth: true,
        user: results[0].id,
        username: username,
        email: email
      });
    }
  });
});
//logouy
userRoutes.route("/logout").post(function(req, res) {
  res.status(200).send({ auth: false, user: null });
});
//dashboard data
userRoutes.route("/api/userid/:id").get(function(req, res) {
  //console.log('req.params.id:', req.params.id)
  let id = req.params.id;
  //console.log("req.params.id:", id);
  //testStart
  //testStop
  var queryuser =
    "SELECT firstName,lastName,email,nr,username,tel,judet,rol,valid FROM users WHERE id = '" +
    id +
    "' ";
  db.query(queryuser, function(error, response) {
    if (error) {
      console.log("error_select_api_userid:", error);
      return res.status(500).send(error);
      //alert("There was a problem finding the user.")
    }
    return res.status(200).send(response);
  });
});
//get user data
userRoutes.route("/api/userStatus/:userToken").get(function(req, res) {
  let userToken = req.params.userToken;
  console.log("req.params.id:", userToken);
  //testStart
  //testStop
  var queryuser =
    "SELECT firstName,lastName,email,nr,username,tel,judet,rol,valid FROM users WHERE id = '" +
    userToken +
    "' ";
  db.query(queryuser, function(error, response) {
    if (error) {
      console.log("error_select_api_userid:", error);
      return res.status(500).send(error);
      //alert("There was a problem finding the user.")
    }
    return res.status(200).send(response);
  });
});

//modify data ChangeData
userRoutes.route("/api/changedata/").post(function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;
  console.log("username:", req.body.username);
  console.log("email:", req.body.email);
  console.log("password:", req.body.password);
  var bcrypt = require("bcrypt");
  var passcrypt = bcrypt.hashSync(password, 10);
  var queryupdatedata =
    "UPDATE users set email = '" +
    email +
    "', password = '" +
    passcrypt +
    "'  WHERE username = '" +
    username +
    "' ";
  db.query(queryupdatedata, function(error) {
    if (error) {
      console.log(error);
      return res.status(500).send(error);
      //alert("There was a problem finding the user.")
    }
    return res.status(200).send("Date schimbate cu succes!");
  });
});
// //get elevi
// userRoutes.route("/api/changedata/").post(function(req, res) {
//   var username = req.body.username;
//   var password = req.body.password;
//   var email = req.body.email;
//   console.log("username:", req.body.username);
//   console.log("email:", req.body.email);
//   console.log("password:", req.body.password);
//   var bcrypt = require("bcrypt");
//   var passcrypt = bcrypt.hashSync(password, 10);
//   var queryupdatedata =
//     "UPDATE users set email = '" +
//     email +
//     "', password = '" +
//     passcrypt +
//     "'  WHERE username = '" +
//     username +
//     "' ";
//   db.query(queryupdatedata, function(error) {
//     if (error) {
//       console.log(error);
//       return res.status(500).send(error);
//       //alert("There was a problem finding the user.")
//     }
//     return res.status(200).send("Date schimbate cu succes!");
//   });
// });
//get elevi in Dashboard - working progress ...
userRoutes.route("/api/elevi/").post(function(req, res) {
  var username = req.body.username;
  console.log("username_elevi: ", username);
  var queryjudet =
    "SELECT judet FROM users WHERE username = '" + username + "' ";
  db.query(queryjudet, function(error, response) {
    if (error) {
      console.log(error);
      //return res.status(500).send(error)
      //alert("There was a problem finding the user.")
    }
    if (response[0].judet.length) {
      //console.log('response_elevi_CLS_PREG: ',response)
      var judet = response[0].judet;
      var bazaelevi = judet;
      console.log("bazaelevi: ", bazaelevi);
      console.log("judet: ", judet);
      var sqlData =
        "CREATE table IF NOT EXISTS  " +
        bazaelevi +
        " (student_id VARCHAR(11) PRIMARY KEY, study_formation_id TEXT(11), unitate TEXT(11), description VARCHAR(255), numesiprenume VARCHAR(255), judet TEXT(21), clr11 TEXT(255), clr12 TEXT(255), clr13 TEXT(255), clr14 TEXT(255), clr21 TEXT(255), clr22 TEXT(255), clr23 TEXT(255), clr24 TEXT(255), clr31 TEXT(255), clr32 TEXT(255), clr33 TEXT(255), clr34 TEXT(255), clr41 TEXT(255), clr42 TEXT(255), clr43 TEXT(255), clm11 TEXT(255), clm12 TEXT(255), clm13 TEXT(255), clm21 TEXT(255), clm22 TEXT(255), clm23 TEXT(255), clm31 TEXT(255), clm41 TEXT(255), mem11 TEXT(255), mem12 TEXT(255), mem13 TEXT(255), mem14 TEXT(255), mem15 TEXT(255), mem16 TEXT(255), mem21 TEXT(255), mem22 TEXT(255), mem31 TEXT(255), mem32 TEXT(255), mem41 TEXT(255), mem42 TEXT(255), mem51 TEXT(255), mem52 TEXT(255), mem61 TEXT(255), mem62 TEXT(255), mem63 TEXT(255), r11 TEXT(255), r12 TEXT(255), r13 TEXT(255), r21 TEXT(255), r22 TEXT(255), r31 TEXT(255), r32 TEXT(255), avap11 TEXT(255), avap12 TEXT(255), avap13 TEXT(255), avap21 TEXT(255), avap22 TEXT(255), avap23 TEXT(255), avap24 TEXT(255), avap25 TEXT(255), avap26 TEXT(255), mm11 TEXT(255), mm12 TEXT(255), mm13 TEXT(255), mm14 TEXT(255), mm21 TEXT(255), mm22 TEXT(255), mm23 TEXT(255), mm31 TEXT(255), mm32 TEXT(255), mm33 TEXT(255), mm34 TEXT(255), ef11 TEXT(255), ef12 TEXT(255), ef13 TEXT(255), ef14 TEXT(255), ef21 TEXT(255), ef22 TEXT(255), ef23 TEXT(255), ef31 TEXT(255), ef32 TEXT(255), ef33 TEXT(255), dp11 TEXT(255), dp12 TEXT(255),  dp21 TEXT(255),  dp22 TEXT(255),  dp23 TEXT(255), dp31 TEXT(255), dp32 TEXT(255), dp33 TEXT(255), aprecieri TEXT(1024), evaluat VARCHAR(5)) character set utf8mb4  DEFAULT COLLATE utf8mb4_unicode_ci";
      db.query(sqlData, function(err) {
        if (err) {
          console.log("Eroare create tabela: ", err);
        } else {
          console.log("Table created");
        }
      });

      //finish create database
      var config = {
        Authorization: { token: tokenapiport },
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json"
      };
      var bodyParameters = {
        study_year: "CL_PREG",
        siiir_code: username,
        school_year: 21,
        token: tokenapiport
      };
      //console.log("config: ", config)
      //console.log("bodyParameters: ", bodyParameters)
      qs = require("qs");
      axios
        .post(
          "https://apiport.edu.ro/api/getStudyFormations.php",
          qs.stringify(bodyParameters),
          config
        )
        .then(response => {
          if (response.data.found != "true") res.json(response.data.found);
          console.log("response.data.list.description: ", response.data);
          var study_formation_id = [];
          var descriere = [];
          for (let i = 0; i < response.data.total; i++) {
            console.log(i, response.data.list[i].study_formation_id);
            study_formation_id[i] = response.data.list[i].study_formation_id;
            var description = response.data.list[i].description;
            var descriptionx = description.split("/", 3);
            var intermdescr = descriptionx[1];
            descriere.push(intermdescr);
            console.log("studyformationid[i]: ", study_formation_id[i]);
            console.log("descriere: ", descriere);
          }
          for (let i = 0; i < response.data.total; i++) {
            console.log(study_formation_id[i]);
            var configPupil = {
              Authorization: { token: tokenapiport },
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/json"
            };
            var bodyParametersPupil = {
              study_formation_id: study_formation_id[i],
              token: tokenapiport
            };
            //console.log("configPupil: ", configPupil)
            //console.log("bodyParametersPupil: ", bodyParametersPupil)
            axios
              .post(
                "https://apiport.edu.ro/api/getPupilsInStudyFormation.php",
                qs.stringify(bodyParametersPupil),
                configPupil
              )
              .then(responsePupil => {
                // if (responsePupil.data.found != "true")
                //   res.send,(responsePupil.data.found)
                console.log("responsePupil.data: ", responsePupil.data.total);
                //insert elevi in bazaelevi
                var dataelevi = responsePupil.data.list;
                console.log("dataelevi.total: ", dataelevi.length);
                for (i = 0; i < dataelevi.length; i++) {
                  //console.log('dataelevi['+ i +'].study_formation_id: ',dataelevi[i].study_formation_id)
                  var numesiprenume =
                    dataelevi[i].last_name + " " + dataelevi[i].first_name;
                  //console.log('dataelevi['+ i +'].student_id: ',dataelevi[i].student_id)
                  //console.log('dataelevi['+ i +'].description: ', descriere[0])
                  var simpleQuery =
                    "SELECT * FROM " +
                    bazaelevi +
                    " WHERE unitate = '" +
                    username +
                    "' AND  student_id = '" +
                    dataelevi[i].student_id +
                    "'  ";
                  db.query(simpleQuery, function(err) {
                    if (err) {
                      console.log("Eroare simple query date: ", err);
                    }
                    //console.log('rezult: ',rezult)
                  });
                  //query insert data elevi to bazaelevi
                  var sqlDataQuery =
                    "INSERT INTO  " +
                    bazaelevi +
                    " (judet, unitate, study_formation_id, student_id, description, numesiprenume) \
                  VALUES ('" +
                    judet +
                    "', \
                  '" +
                    username +
                    "', \
                  '" +
                    dataelevi[i].study_formation_id +
                    "', \
                  '" +
                    dataelevi[i].student_id +
                    "', \
                  '" +
                    descriere[0] +
                    "', \
                  '" +
                    numesiprenume +
                    "') \
                  ON DUPLICATE KEY UPDATE numesiprenume = '" +
                    numesiprenume +
                    "', \
                  description = '" +
                    descriere[0] +
                    "' \
                  ";
                  db.query(sqlDataQuery, function(err) {
                    if (err) {
                      console.log("Eroare inserare date: ", err);
                    }
                  });
                  //end simple query
                }
                //finish insert elevi
                //send data to page
              })
              .catch(error => {
                console.log("ERROR2: ", error, responsePupil.errno);
                res.status(503).send(error);
              });
          }
        })
        .catch(error => {
          console.log("ERROR1: ", error, response.errno);
          res.status(503).send(error);
        })
    }
    console.log("response for apiport: ",response.length)
    res.status(200).send(response);
  });
});
//search elev by id
// trage date pentru Listelevi direct din baza
userRoutes.route("/api/getelevi/").post(function(req, res) {
  let username = req.body.username;
  console.log("username_elevi_listelevi: ", username);
  var simpleQueryJudet =
    "SELECT judet FROM users WHERE username LIKE '" + username + "'  ";
  db.query(simpleQueryJudet, function(err, respJudet) {
    if (err) {
      console.log("Eroare query date elev: ", err);
      res.status(400).send(err);
    }
    var sqlEleviQuery =
      "SELECT unitate, description, study_formation_id, student_id, numesiprenume, evaluat FROM " +
      respJudet[0].judet +
      " WHERE unitate = '" +
      username +
      "' ";
    db.query(sqlEleviQuery, function(err, respgetelevi) {
      if (err) {
        console.log("Eroare query date elevi: ", err);
      }
      res.status(200).send(respgetelevi);
    });
  });
});
//final date elevi Listelevi

// edit elevi
userRoutes.route("/api/listelevi/getelev/").post(function(req, res) {
  var elevId = req.body.id;
  var judet = req.body.judet;
  console.log("elevId: ", elevId);
  console.log("username: ", judet);
  //get judet
  var simpleQuery =
    "SELECT * FROM " + judet + " WHERE student_id LIKE '" + elevId + "'  ";
  db.query(simpleQuery, function(err, respfinal) {
    if (err) {
      console.log("Eroare query date elevi: ", err);
      res.status(400).send(err);
    }
    console.log("getelev date elev: ", respfinal);
    res.status(200).send(respfinal);
  });
});
// finish edit elevi
// edit elevi
userRoutes.route("/api/listelevi/getelevmin/").post(function(req, res) {
  var elevId = req.body.id;
  var judet = req.body.judet;
  console.log("elevId: ", elevId);
  console.log("username: ", judet);
  //get judet
  var simpleQuery =
    "SELECT * FROM " + judet + " WHERE student_id LIKE '" + elevId + "'  ";
  db.query(simpleQuery, function(err, respfinal) {
    if (err) {
      console.log("Eroare query date elevi: ", err);
      res.status(400).send(err);
    }
    console.log("getelevmin date elev: ", respfinal);
    //console.log("date elev: ", respfinal[0].numesiprenume);
    //res.status(200).send(respfinal);
    var sqlData =
      "create table if not exists bazaelevimin(student_id VARCHAR(11) PRIMARY KEY, study_formation_id TEXT(11), unitate TEXT(11), description VARCHAR(255), numesiprenume VARCHAR(255), judet TEXT(21), clr11 TEXT(255), clr12 TEXT(255), clr13 TEXT(255), clr14 TEXT(255), clr21 TEXT(255), clr22 TEXT(255), clr23 TEXT(255), clr24 TEXT(255), clr31 TEXT(255), clr32 TEXT(255), clr33 TEXT(255), clr34 TEXT(255), clr41 TEXT(255), clr42 TEXT(255), clr43 TEXT(255), clm11 TEXT(255), clm12 TEXT(255), clm13 TEXT(255), clm21 TEXT(255), clm22 TEXT(255), clm23 TEXT(255), clm31 TEXT(255), clm41 TEXT(255), mem11 TEXT(255), mem12 TEXT(255), mem13 TEXT(255), mem14 TEXT(255), mem15 TEXT(255), mem16 TEXT(255), mem21 TEXT(255), mem22 TEXT(255), mem31 TEXT(255), mem32 TEXT(255), mem41 TEXT(255), mem42 TEXT(255), mem51 TEXT(255), mem52 TEXT(255), mem61 TEXT(255), mem62 TEXT(255), mem63 TEXT(255), r11 TEXT(255), r12 TEXT(255), r13 TEXT(255), r21 TEXT(255), r22 TEXT(255), r31 TEXT(255), r32 TEXT(255), avap11 TEXT(255), avap12 TEXT(255), avap13 TEXT(255), avap21 TEXT(255), avap22 TEXT(255), avap23 TEXT(255), avap24 TEXT(255), avap25 TEXT(255), avap26 TEXT(255), mm11 TEXT(255), mm12 TEXT(255), mm13 TEXT(255), mm14 TEXT(255), mm21 TEXT(255), mm22 TEXT(255), mm23 TEXT(255), mm31 TEXT(255), mm32 TEXT(255), mm33 TEXT(255), mm34 TEXT(255), ef11 TEXT(255), ef12 TEXT(255), ef13 TEXT(255), ef14 TEXT(255), ef21 TEXT(255), ef22 TEXT(255), ef23 TEXT(255), ef31 TEXT(255), ef32 TEXT(255), ef33 TEXT(255), dp11 TEXT(255), dp12 TEXT(255),  dp21 TEXT(255),  dp22 TEXT(255),  dp23 TEXT(255), dp31 TEXT(255), dp32 TEXT(255), dp33 TEXT(255), aprecierimin VARCHAR(1024), evaluatmin VARCHAR(5)) character set utf8mb4  DEFAULT COLLATE utf8mb4_unicode_ci";
    db.query(sqlData, function(err) {
      if (err) {
        console.log("Eroare create tabela bazaelevimin: ", err);
      } else {
        console.log("Table bazaelevimin created");
      }
    });
    var sqlDatamin =
      "create table if not exists itemimin(student_id VARCHAR(11) PRIMARY KEY, clr11min TEXT(255), clr12min TEXT(255), clr13min TEXT(255), clr14min TEXT(255), clr21min TEXT(255), clr22min TEXT(255), clr23min TEXT(255), clr24min TEXT(255), clr31min TEXT(255), clr32min TEXT(255), clr33min TEXT(255), clr34min TEXT(255), clr41min TEXT(255), clr42min TEXT(255), clr43min TEXT(255), clm11min TEXT(255), clm12min TEXT(255), clm13min TEXT(255), clm21min TEXT(255), clm22min TEXT(255), clm23min TEXT(255), clm31min TEXT(255), clm41min TEXT(255), mem11min TEXT(255), mem12min TEXT(255), mem13min TEXT(255), mem14min TEXT(255), mem15min TEXT(255), mem16min TEXT(255), mem21min TEXT(255), mem22min TEXT(255), mem31min TEXT(255), mem32min TEXT(255), mem41min TEXT(255), mem42min TEXT(255), mem51min TEXT(255), mem52min TEXT(255), mem61min TEXT(255), mem62min TEXT(255), mem63min TEXT(255), r11min TEXT(255), r12min TEXT(255), r13min TEXT(255), r21min TEXT(255), r22min TEXT(255), r31min TEXT(255), r32min TEXT(255), avap11min TEXT(255), avap12min TEXT(255), avap13min TEXT(255), avap21min TEXT(255), avap22min TEXT(255), avap23min TEXT(255), avap24min TEXT(255), avap25min TEXT(255), avap26min TEXT(255), mm11min TEXT(255), mm12min TEXT(255), mm13min TEXT(255), mm14min TEXT(255), mm21min TEXT(255), mm22min TEXT(255), mm23min TEXT(255), mm31min TEXT(255), mm32min TEXT(255), mm33min TEXT(255), mm34min TEXT(255), ef11min TEXT(255), ef12min TEXT(255), ef13min TEXT(255), ef14min TEXT(255), ef21min TEXT(255), ef22min TEXT(255), ef23min TEXT(255), ef31min TEXT(255), ef32min TEXT(255), ef33min TEXT(255), dp11min TEXT(255), dp12min TEXT(255),  dp21min TEXT(255),  dp22min TEXT(255),  dp23min TEXT(255), dp31min TEXT(255), dp32min TEXT(255), dp33min TEXT(255), evaluatmin VARCHAR(5)) character set utf8mb4  DEFAULT COLLATE utf8mb4_unicode_ci";
    db.query(sqlDatamin, function(err) {
      if (err) {
        console.log("Eroare create tabela itemi minoritati: ", err);
      } else {
        console.log("Table itemimin created");
      }
    });
    //inceput input elev in bazamin
    var sqlDataQuery =
      "INSERT INTO  bazaelevimin (judet, unitate, study_formation_id, student_id, description, numesiprenume) \
    VALUES ('" +
      respfinal[0].judet +
      "', \
    '" +
      respfinal[0].unitate +
      "', \
    '" +
      respfinal[0].study_formation_id +
      "', \
    '" +
      respfinal[0].student_id +
      "', \
    '" +
      respfinal[0].description +
      "', \
    '" +
      respfinal[0].numesiprenume +
      "') \
    ON DUPLICATE KEY UPDATE numesiprenume = '" +
      respfinal[0].numesiprenume +
      "', \
    description = '" +
      respfinal[0].description +
      "' \
    ";
    db.query(sqlDataQuery, function(err) {
      if (err) {
        console.log("Eroare inserare date: ", err);
      }
    });
    var cautaElevdupaID =
      "SELECT evaluatmin from itemimin WHERE student_id = '" +
      respfinal[0].student_id +
      "' ";
    db.query(cautaElevdupaID, function(err, rescautaElevdupaID) {
      if (err) {
        console.log("Eroare cautare date in itemimin: ", err);
      }
      var sqlDataQuerymin =
        "INSERT IGNORE INTO  itemimin (student_id) \
    VALUES ('" +
        respfinal[0].student_id +
        "') ";
      db.query(sqlDataQuerymin, function(err) {
        if (err) {
          console.log("Eroare inserare date in itemimin: ", err);
        } else {
          console.log("Data inserted in itemimin");
        }
      });

      console.log("rescautaElevdupaID: ", rescautaElevdupaID);
      //inseram date
    });
    //end simple query
    //finish insert elevi
    //end input elev in bazamin
    var simpleQuerybazamin =
      "SELECT * FROM bazaelevimin WHERE student_id = '" + elevId + "'  ";
    //var resfinalbazasiitemi = [];
    db.query(simpleQuerybazamin, function(err, respfinalbazamin) {
      if (err) {
        console.log("Eroare query date elevi: ", err);
        res.status(400).send(err);
      }
      console.log("respfinalbazamin", respfinalbazamin[0].student_id);
      //res.status(200).send(respfinalbazamin);
      var simpleQueryitemimin =
        "SELECT * FROM itemimin WHERE student_id = '" + elevId + "'  ";
      db.query(simpleQueryitemimin, function(err, respfinalitemimin) {
        if (err) {
          console.log("Eroare query date elevi: ", err);
          res.status(400).send(err);
        }
        console.log("respfinalitemimin", respfinalitemimin[0].student_id);
        const respfinall = respfinalitemimin.concat(respfinalbazamin);
        console.log("respfinall: ", respfinall[1].student_id);
        res.status(200).send(respfinall);
      });
    });
  });
});

// finish edit elevi

// search by username
userRoutes.route("/api/listelevi/search/").post(function(req, res) {
  var post = req.body;
  console.log("post: ", post);
  var elevId = post.id;
  var unitate = post.username;
  console.log("elevId: ", elevId);
  console.log("unitate: ", unitate);
  var simpleQueryJudet =
    "SELECT judet FROM users WHERE username LIKE '" + unitate + "'  ";
  db.query(simpleQueryJudet, function(err, respJudet) {
    if (err) {
      console.log("Eroare query date elev: ", err);
      res.status(400).send(err);
    }
    //res.status(200).send(respfinal);

    var simpleQuery =
      "SELECT * FROM " +
      respJudet[0].judet +
      "  WHERE unitate LIKE '" +
      unitate +
      "' AND numesiprenume  LIKE '%" +
      elevId +
      "%' ";
    db.query(simpleQuery, function(err, respfinal) {
      if (err) {
        console.log("Eroare query date elev: ", err);
        res.status(400).send(err);
      }
      res.status(200).send(respfinal);
    });
  });
});

//

// salveaza date elev evaluare
userRoutes.route("/api/listelevi/elev/save/").post(function(req, res) {
  var post = req.body;
  console.log("post: ", post);
  var elevId = post.id;
  var items = post.items;
  const judet = items.judet;
  console.log("judet elev/save: ", judet);
  var itemsmin = post.itemsmin;
  console.log("elevId: ", elevId);
  //console.log("unitate: ", unitate);
  console.log("items: ", items.clr11);
  var clr11 = items.clr11 ? items.clr11 : "Realizată";
  var clr12 = items.clr12 ? items.clr12 : "Realizată";
  var clr13 = items.clr13 ? items.clr13 : "Realizată";
  var clr14 = items.clr14 ? items.clr14 : "Realizată";

  var clr21 = items.clr21 ? items.clr21 : "Realizată";
  var clr22 = items.clr22 ? items.clr22 : "Realizată";
  var clr23 = items.clr23 ? items.clr23 : "Realizată";
  var clr24 = items.clr24 ? items.clr24 : "Realizată";

  var clr31 = items.clr31 ? items.clr31 : "Realizată";
  var clr32 = items.clr32 ? items.clr32 : "Realizată";
  var clr33 = items.clr33 ? items.clr32 : "Realizată";
  var clr34 = items.clr34 ? items.clr34 : "Realizată";

  var clr41 = items.clr41 ? items.clr41 : "Realizată";
  var clr42 = items.clr42 ? items.clr42 : "Realizată";
  var clr43 = items.clr43 ? items.clr43 : "Realizată";

  var clm11 = items.clm11 ? items.clm11 : "Realizată";
  var clm12 = items.clm12 ? items.clm12 : "Realizată";
  var clm13 = items.clm13 ? items.clm13 : "Realizată";

  var clm21 = items.clm21 ? items.clm21 : "Realizată";
  var clm22 = items.clm22 ? items.clm22 : "Realizată";
  var clm23 = items.clm23 ? items.clm23 : "Realizată";

  var clm31 = items.clm31 ? items.clm31 : "Realizată";

  var clm41 = items.clm41 ? items.clm41 : "Realizată";

  var mem11 = items.mem11 ? items.mem11 : "Realizată";
  var mem12 = items.mem12 ? items.mem12 : "Realizată";
  var mem13 = items.mem13 ? items.mem13 : "Realizată";
  var mem14 = items.mem14 ? items.mem14 : "Realizată";
  var mem15 = items.mem15 ? items.mem15 : "Realizată";
  var mem16 = items.mem16 ? items.mem16 : "Realizată";

  var mem21 = items.mem21 ? items.mem21 : "Realizată";
  var mem22 = items.mem22 ? items.mem22 : "Realizată";

  var mem31 = items.mem31 ? items.mem31 : "Realizată";
  var mem32 = items.mem32 ? items.mem32 : "Realizată";

  var mem41 = items.mem41 ? items.mem41 : "Realizată";
  var mem42 = items.mem42 ? items.mem42 : "Realizată";

  var mem51 = items.mem51 ? items.mem51 : "Realizată";
  var mem52 = items.mem52 ? items.mem52 : "Realizată";

  var mem61 = items.mem61 ? items.mem61 : "Realizată";
  var mem62 = items.mem62 ? items.mem62 : "Realizată";
  var mem63 = items.mem63 ? items.mem63 : "Realizată";

  var r11 = items.r11 ? items.r11 : "Realizată";
  var r12 = items.r12 ? items.r12 : "Realizată";
  var r13 = items.r13 ? items.r13 : "Realizată";

  var r21 = items.r21 ? items.r21 : "Realizată";
  var r22 = items.r22 ? items.r22 : "Realizată";

  var r31 = items.r31 ? items.r31 : "Realizată";
  var r32 = items.r32 ? items.r32 : "Realizată";

  var avap11 = items.avap11 ? items.avap11 : "Realizată";
  var avap12 = items.avap12 ? items.avap12 : "Realizată";
  var avap13 = items.avap11 ? items.avap11 : "Realizată";

  var avap21 = items.avap21 ? items.avap21 : "Realizată";
  var avap22 = items.avap22 ? items.avap22 : "Realizată";
  var avap23 = items.avap23 ? items.avap23 : "Realizată";
  var avap24 = items.avap24 ? items.avap24 : "Realizată";
  var avap25 = items.avap25 ? items.avap25 : "Realizată";
  var avap26 = items.avap26 ? items.avap26 : "Realizată";

  var mm11 = items.mm11 ? items.mm11 : "Realizată";
  var mm12 = items.mm12 ? items.mm12 : "Realizată";
  var mm13 = items.mm13 ? items.mm13 : "Realizată";
  var mm14 = items.mm14 ? items.mm14 : "Realizată";

  var mm21 = items.mm21 ? items.mm21 : "Realizată";
  var mm22 = items.mm22 ? items.mm22 : "Realizată";
  var mm23 = items.mm23 ? items.mm23 : "Realizată";

  var mm31 = items.mm31 ? items.mm31 : "Realizată";
  var mm32 = items.mm32 ? items.mm32 : "Realizată";
  var mm33 = items.mm33 ? items.mm33 : "Realizată";
  var mm34 = items.mm34 ? items.mm34 : "Realizată";

  var ef11 = items.ef11 ? items.ef11 : "Realizată";
  var ef12 = items.ef12 ? items.ef12 : "Realizată";
  var ef13 = items.ef13 ? items.ef13 : "Realizată";
  var ef14 = items.ef14 ? items.ef14 : "Realizată";

  var ef21 = items.ef21 ? items.ef21 : "Realizată";
  var ef22 = items.ef22 ? items.ef22 : "Realizată";
  var ef23 = items.ef23 ? items.ef23 : "Realizată";

  var ef31 = items.ef31 ? items.ef31 : "Realizată";
  var ef32 = items.ef32 ? items.ef32 : "Realizată";
  var ef33 = items.ef33 ? items.ef33 : "Realizată";

  var dp11 = items.dp11 ? items.dp11 : "Realizată";
  var dp12 = items.dp12 ? items.dp12 : "Realizată";

  var dp21 = items.dp21 ? items.dp21 : "Realizată";
  var dp22 = items.dp22 ? items.dp22 : "Realizată";
  var dp23 = items.dp23 ? items.dp23 : "Realizată";

  var dp31 = items.dp31 ? items.dp31 : "Realizată";
  var dp32 = items.dp32 ? items.dp32 : "Realizată";
  var dp33 = items.dp33 ? items.dp33 : "Realizată";

  var aprecieri = items.aprecieri;

  var simpleQuery =
    "UPDATE " +
    judet +
    " set judet = '" +
    judet +
    "', clr11  =  COALESCE('" +
    clr11 +
    "', clr11), clr12  =  COALESCE('" +
    clr12 +
    "', clr12), clr13  =  COALESCE('" +
    clr13 +
    "', clr13), clr14  =  COALESCE('" +
    clr14 +
    "', clr14), clr21  =  COALESCE('" +
    clr21 +
    "', clr21), clr22  =  COALESCE('" +
    clr22 +
    "', clr22), clr23  =  COALESCE('" +
    clr23 +
    "', clr23), clr24  =  COALESCE('" +
    clr24 +
    "', clr24), clr31  =  COALESCE('" +
    clr31 +
    "', clr31), clr32  =  COALESCE('" +
    clr32 +
    "', clr32), clr33  =  COALESCE('" +
    clr33 +
    "', clr33), clr34  =  COALESCE('" +
    clr34 +
    "', clr34), clr41  =  COALESCE('" +
    clr41 +
    "', clr41), clr42  =  COALESCE('" +
    clr42 +
    "', clr42), clr43  =  COALESCE('" +
    clr43 +
    "', clr43), clm11  =  COALESCE('" +
    clm11 +
    "', clm11), clm12  =  COALESCE('" +
    clm21 +
    "', clm12), clm13  =  COALESCE('" +
    clm13 +
    "', clm13), clm21  =  COALESCE('" +
    clm21 +
    "', clm21), clm22  =  COALESCE('" +
    clm22 +
    "', clm22), clm23  =  COALESCE('" +
    clm23 +
    "', clm23), clm31  =  COALESCE('" +
    clm31 +
    "', clm31), clm41  =  COALESCE('" +
    clm41 +
    "', clm41), mem11  =  COALESCE('" +
    mem11 +
    "', mem11), mem12  =  COALESCE('" +
    mem12 +
    "', mem12), mem13  =  COALESCE('" +
    mem13 +
    "', mem13), mem14  =  COALESCE('" +
    mem14 +
    "', mem14), mem15  =  COALESCE('" +
    mem15 +
    "', mem15), mem16  =  COALESCE('" +
    mem16 +
    "', mem16), mem21  =  COALESCE('" +
    mem21 +
    "', mem21), mem22  =  COALESCE('" +
    mem22 +
    "', mem22), mem31  =  COALESCE('" +
    mem31 +
    "', mem31), mem32  =  COALESCE('" +
    mem32 +
    "', mem32), mem41  =  COALESCE('" +
    mem41 +
    "', mem41), mem42  =  COALESCE('" +
    mem42 +
    "', mem42),  mem51  =  COALESCE('" +
    mem51 +
    "', mem51), mem52  =  COALESCE('" +
    mem52 +
    "', mem52),  mem61  =  COALESCE('" +
    mem61 +
    "', mem61), mem62  =  COALESCE('" +
    mem62 +
    "', mem62), mem63  =  COALESCE('" +
    mem63 +
    "', mem63), r11  =  COALESCE('" +
    r11 +
    "', r11), r12  =  COALESCE('" +
    r12 +
    "', r12), r13  =  COALESCE('" +
    r13 +
    "', r13), r21  =  COALESCE('" +
    r21 +
    "', r21), r22  =  COALESCE('" +
    r22 +
    "', r22), r31  =  COALESCE('" +
    r31 +
    "', r31), r32  =  COALESCE('" +
    r32 +
    "', r32), avap11  =  COALESCE('" +
    avap11 +
    "', avap11), avap12  =  COALESCE('" +
    avap12 +
    "', avap12), avap13  =  COALESCE('" +
    avap13 +
    "', avap13), avap21  =  COALESCE('" +
    avap21 +
    "', avap21), avap22  =  COALESCE('" +
    avap22 +
    "', avap22), avap23  =  COALESCE('" +
    avap23 +
    "', avap23), avap24  =  COALESCE('" +
    avap24 +
    "', avap24), avap25  =  COALESCE('" +
    avap25 +
    "', avap25), avap26  =  COALESCE('" +
    avap26 +
    "', avap26), mm11  =  COALESCE('" +
    mm11 +
    "', mm11), mm12  =  COALESCE('" +
    mm12 +
    "', mm12), mm13  =  COALESCE('" +
    mm13 +
    "', mm13), mm14  =  COALESCE('" +
    mm14 +
    "', mm14), mm21  =  COALESCE('" +
    mm21 +
    "', mm21), mm22  =  COALESCE('" +
    mm22 +
    "', mm22), mm23  =  COALESCE('" +
    mm23 +
    "', mm23), mm31  =  COALESCE('" +
    mm31 +
    "', mm31), mm32  =  COALESCE('" +
    mm32 +
    "', mm32), mm33  =  COALESCE('" +
    mm33 +
    "', mm33), mm34  =  COALESCE('" +
    mm34 +
    "', mm34), ef11  =  COALESCE('" +
    ef11 +
    "', ef11), ef12  =  COALESCE('" +
    ef12 +
    "', ef12), ef13  =  COALESCE('" +
    ef13 +
    "', ef13), ef14  =  COALESCE('" +
    ef14 +
    "', ef14), ef21  =  COALESCE('" +
    ef21 +
    "', ef21), ef22  =  COALESCE('" +
    ef22 +
    "', ef22), ef23  =  COALESCE('" +
    ef23 +
    "', ef23), ef31  =  COALESCE('" +
    ef31 +
    "', ef31), ef32  =  COALESCE('" +
    ef32 +
    "', ef32), ef33  =  COALESCE('" +
    ef33 +
    "', ef33), dp11  =  COALESCE('" +
    dp11 +
    "', dp11), dp12  =  COALESCE('" +
    dp12 +
    "', dp12), dp21  =  COALESCE('" +
    dp21 +
    "', dp21), dp22  =  COALESCE('" +
    dp22 +
    "', dp22), dp23  =  COALESCE('" +
    dp23 +
    "', dp23), dp31  =  COALESCE('" +
    dp31 +
    "', dp31), dp32  =  COALESCE('" +
    dp32 +
    "', dp32), dp33  =  COALESCE('" +
    dp33 +
    "', dp33), aprecieri ='" +
    aprecieri +
    "', evaluat = 'Da' WHERE student_id  LIKE '%" +
    elevId +
    "%' ";
  db.query(simpleQuery, function(err, respfinal) {
    if (err) {
      console.log("Eroare query date elev: ", err);
      res.status(400).send(err);
    }
    console.log("status: ", respfinal);
    res.status(200).send(respfinal);
  });
});
// end salvare date elev evaluare

// get the elev data by ID
// userRoutes.route("/api/listelevi/elev/savepdf/").get(function(req, res) {
//   var elevId = req.params.id;
//   console.log("elevId: ", elevId);
//   var simpleQuery =
//     "SELECT * FROM bazaelevi WHERE student_id = '" + elevId + "'  ";
//   db.query(simpleQuery, function(err, respfinal) {
//     if (err) {
//       console.log("Eroare query date elevi: ", err);
//       res.status(400).send(err);
//     }
//     res.status(200).send(respfinal);
//   });
// });
// end save elev data
//get data itemi
userRoutes.route("/api/listelevi/elev/itemi/").get(function(req, res) {
  var simpleQuery = "SELECT * FROM itemi";
  db.query(simpleQuery, function(err, response) {
    if (err) {
      console.log("Eroare query date elev: ", err);
      res.status(400).send(err);
    }
    console.log(response);
    res.status(200).send(response);
  });
});
//get data itemi anexa min
userRoutes.route("/api/listelevi/anexamin/itemimin/").get(function(req, res) {
  var simpleQuery = "SELECT * FROM itemimin";
  db.query(simpleQuery, function(err, response) {
    if (err) {
      console.log("Eroare query date elev: ", err);
      res.status(400).send(err);
    }
    console.log(response);
    res.status(200).send(response);
  });
});

//anexa minoritati
userRoutes.route("/api/listelevi/anexamin/save/").post(function(req, res) {
  var post = req.body;
  console.log("post: ", post);
  var elevId = post.id;
  var items = post.items;
  const judet = items.judet;
  console.log("judet elev/save: ", judet);
  var itemsmin = post.itemsmin;
  console.log("itemsmin: ", itemsmin);
  console.log("elevId: ", elevId);
  //console.log("unitate: ", unitate);
  console.log("items: ", items.clr11);
  var clr11 = items.clr11 ? items.clr11 : "Realizată";
  var clr12 = items.clr12 ? items.clr12 : "Realizată";
  var clr13 = items.clr13 ? items.clr13 : "Realizată";
  var clr14 = items.clr14 ? items.clr14 : "Realizată";

  var clr21 = items.clr21 ? items.clr21 : "Realizată";
  var clr22 = items.clr22 ? items.clr22 : "Realizată";
  var clr23 = items.clr23 ? items.clr23 : "Realizată";
  var clr24 = items.clr24 ? items.clr24 : "Realizată";

  var clr31 = items.clr31 ? items.clr31 : "Realizată";
  var clr32 = items.clr32 ? items.clr32 : "Realizată";
  var clr33 = items.clr33 ? items.clr32 : "Realizată";
  var clr34 = items.clr34 ? items.clr34 : "Realizată";

  var clr41 = items.clr41 ? items.clr41 : "Realizată";
  var clr42 = items.clr42 ? items.clr42 : "Realizată";
  var clr43 = items.clr43 ? items.clr43 : "Realizată";

  var clm11 = items.clm11 ? items.clm11 : "Realizată";
  var clm12 = items.clm12 ? items.clm12 : "Realizată";
  var clm13 = items.clm13 ? items.clm13 : "Realizată";

  var clm21 = items.clm21 ? items.clm21 : "Realizată";
  var clm22 = items.clm22 ? items.clm22 : "Realizată";
  var clm23 = items.clm23 ? items.clm23 : "Realizată";

  var clm31 = items.clm31 ? items.clm31 : "Realizată";

  var clm41 = items.clm41 ? items.clm41 : "Realizată";

  var mem11 = items.mem11 ? items.mem11 : "Realizată";
  var mem12 = items.mem12 ? items.mem12 : "Realizată";
  var mem13 = items.mem13 ? items.mem13 : "Realizată";
  var mem14 = items.mem14 ? items.mem14 : "Realizată";
  var mem15 = items.mem15 ? items.mem15 : "Realizată";
  var mem16 = items.mem16 ? items.mem16 : "Realizată";

  var mem21 = items.mem21 ? items.mem21 : "Realizată";
  var mem22 = items.mem22 ? items.mem22 : "Realizată";

  var mem31 = items.mem31 ? items.mem31 : "Realizată";
  var mem32 = items.mem32 ? items.mem32 : "Realizată";

  var mem41 = items.mem41 ? items.mem41 : "Realizată";
  var mem42 = items.mem42 ? items.mem42 : "Realizată";

  var mem51 = items.mem51 ? items.mem51 : "Realizată";
  var mem52 = items.mem52 ? items.mem52 : "Realizată";

  var mem61 = items.mem61 ? items.mem61 : "Realizată";
  var mem62 = items.mem62 ? items.mem62 : "Realizată";
  var mem63 = items.mem63 ? items.mem63 : "Realizată";

  var r11 = items.r11 ? items.r11 : "Realizată";
  var r12 = items.r12 ? items.r12 : "Realizată";
  var r13 = items.r13 ? items.r13 : "Realizată";

  var r21 = items.r21 ? items.r21 : "Realizată";
  var r22 = items.r22 ? items.r22 : "Realizată";

  var r31 = items.r31 ? items.r31 : "Realizată";
  var r32 = items.r32 ? items.r32 : "Realizată";

  var avap11 = items.avap11 ? items.avap11 : "Realizată";
  var avap12 = items.avap12 ? items.avap12 : "Realizată";
  var avap13 = items.avap11 ? items.avap11 : "Realizată";

  var avap21 = items.avap21 ? items.avap21 : "Realizată";
  var avap22 = items.avap22 ? items.avap22 : "Realizată";
  var avap23 = items.avap23 ? items.avap23 : "Realizată";
  var avap24 = items.avap24 ? items.avap24 : "Realizată";
  var avap25 = items.avap25 ? items.avap25 : "Realizată";
  var avap26 = items.avap26 ? items.avap26 : "Realizată";

  var mm11 = items.mm11 ? items.mm11 : "Realizată";
  var mm12 = items.mm12 ? items.mm12 : "Realizată";
  var mm13 = items.mm13 ? items.mm13 : "Realizată";
  var mm14 = items.mm14 ? items.mm14 : "Realizată";

  var mm21 = items.mm21 ? items.mm21 : "Realizată";
  var mm22 = items.mm22 ? items.mm22 : "Realizată";
  var mm23 = items.mm23 ? items.mm23 : "Realizată";

  var mm31 = items.mm31 ? items.mm31 : "Realizată";
  var mm32 = items.mm32 ? items.mm32 : "Realizată";
  var mm33 = items.mm33 ? items.mm33 : "Realizată";
  var mm34 = items.mm34 ? items.mm34 : "Realizată";

  var ef11 = items.ef11 ? items.ef11 : "Realizată";
  var ef12 = items.ef12 ? items.ef12 : "Realizată";
  var ef13 = items.ef13 ? items.ef13 : "Realizată";
  var ef14 = items.ef14 ? items.ef14 : "Realizată";

  var ef21 = items.ef21 ? items.ef21 : "Realizată";
  var ef22 = items.ef22 ? items.ef22 : "Realizată";
  var ef23 = items.ef23 ? items.ef23 : "Realizată";

  var ef31 = items.ef31 ? items.ef31 : "Realizată";
  var ef32 = items.ef32 ? items.ef32 : "Realizată";
  var ef33 = items.ef33 ? items.ef33 : "Realizată";

  var dp11 = items.dp11 ? items.dp11 : "Realizată";
  var dp12 = items.dp12 ? items.dp12 : "Realizată";

  var dp21 = items.dp21 ? items.dp21 : "Realizată";
  var dp22 = items.dp22 ? items.dp22 : "Realizată";
  var dp23 = items.dp23 ? items.dp23 : "Realizată";

  var dp31 = items.dp31 ? items.dp31 : "Realizată";
  var dp32 = items.dp32 ? items.dp32 : "Realizată";
  var dp33 = items.dp33 ? items.dp33 : "Realizată";

  var aprecierimin = items.aprecierimin;

  var simpleQuery =
    "UPDATE bazaelevimin set judet = '" +
    judet +
    "', clr11  =  COALESCE('" +
    clr11 +
    "', clr11), clr12  =  COALESCE('" +
    clr12 +
    "', clr12), clr13  =  COALESCE('" +
    clr13 +
    "', clr13), clr14  =  COALESCE('" +
    clr14 +
    "', clr14), clr21  =  COALESCE('" +
    clr21 +
    "', clr21), clr22  =  COALESCE('" +
    clr22 +
    "', clr22), clr23  =  COALESCE('" +
    clr23 +
    "', clr23), clr24  =  COALESCE('" +
    clr24 +
    "', clr24), clr31  =  COALESCE('" +
    clr31 +
    "', clr31), clr32  =  COALESCE('" +
    clr32 +
    "', clr32), clr33  =  COALESCE('" +
    clr33 +
    "', clr33), clr34  =  COALESCE('" +
    clr34 +
    "', clr34), clr41  =  COALESCE('" +
    clr41 +
    "', clr41), clr42  =  COALESCE('" +
    clr42 +
    "', clr42), clr43  =  COALESCE('" +
    clr43 +
    "', clr43), clm11  =  COALESCE('" +
    clm11 +
    "', clm11), clm12  =  COALESCE('" +
    clm12 +
    "', clm12), clm13  =  COALESCE('" +
    clm13 +
    "', clm13), clm21  =  COALESCE('" +
    clm21 +
    "', clm21), clm22  =  COALESCE('" +
    clm22 +
    "', clm22), clm23  =  COALESCE('" +
    clm23 +
    "', clm23), clm31  =  COALESCE('" +
    clm31 +
    "', clm31), clm41  =  COALESCE('" +
    clm41 +
    "', clm41), mem11  =  COALESCE('" +
    mem11 +
    "', mem11), mem12  =  COALESCE('" +
    mem12 +
    "', mem12), mem13  =  COALESCE('" +
    mem13 +
    "', mem13), mem14  =  COALESCE('" +
    mem14 +
    "', mem14), mem15  =  COALESCE('" +
    mem15 +
    "', mem15), mem16  =  COALESCE('" +
    mem16 +
    "', mem16), mem21  =  COALESCE('" +
    mem21 +
    "', mem21), mem22  =  COALESCE('" +
    mem22 +
    "', mem22), mem31  =  COALESCE('" +
    mem31 +
    "', mem31), mem32  =  COALESCE('" +
    mem32 +
    "', mem32), mem41  =  COALESCE('" +
    mem41 +
    "', mem41), mem42  =  COALESCE('" +
    mem42 +
    "', mem42),  mem51  =  COALESCE('" +
    mem51 +
    "', mem51), mem52  =  COALESCE('" +
    mem52 +
    "', mem52),  mem61  =  COALESCE('" +
    mem61 +
    "', mem61), mem62  =  COALESCE('" +
    mem62 +
    "', mem62), mem63  =  COALESCE('" +
    mem63 +
    "', mem63), r11  =  COALESCE('" +
    r11 +
    "', r11), r12  =  COALESCE('" +
    r12 +
    "', r12), r13  =  COALESCE('" +
    r13 +
    "', r13), r21  =  COALESCE('" +
    r21 +
    "', r21), r22  =  COALESCE('" +
    r22 +
    "', r22), r31  =  COALESCE('" +
    r31 +
    "', r31), r32  =  COALESCE('" +
    r32 +
    "', r32), avap11  =  COALESCE('" +
    avap11 +
    "', avap11), avap12  =  COALESCE('" +
    avap12 +
    "', avap12), avap13  =  COALESCE('" +
    avap13 +
    "', avap13), avap21  =  COALESCE('" +
    avap21 +
    "', avap21), avap22  =  COALESCE('" +
    avap22 +
    "', avap22), avap23  =  COALESCE('" +
    avap23 +
    "', avap23), avap24  =  COALESCE('" +
    avap24 +
    "', avap24), avap25  =  COALESCE('" +
    avap25 +
    "', avap25), avap26  =  COALESCE('" +
    avap26 +
    "', avap26), mm11  =  COALESCE('" +
    mm11 +
    "', mm11), mm12  =  COALESCE('" +
    mm12 +
    "', mm12), mm13  =  COALESCE('" +
    mm13 +
    "', mm13), mm14  =  COALESCE('" +
    mm14 +
    "', mm14), mm21  =  COALESCE('" +
    mm21 +
    "', mm21), mm22  =  COALESCE('" +
    mm22 +
    "', mm22), mm23  =  COALESCE('" +
    mm23 +
    "', mm23), mm31  =  COALESCE('" +
    mm31 +
    "', mm31), mm32  =  COALESCE('" +
    mm32 +
    "', mm32), mm33  =  COALESCE('" +
    mm33 +
    "', mm33), mm34  =  COALESCE('" +
    mm34 +
    "', mm34), ef11  =  COALESCE('" +
    ef11 +
    "', ef11), ef12  =  COALESCE('" +
    ef12 +
    "', ef12), ef13  =  COALESCE('" +
    ef13 +
    "', ef13), ef14  =  COALESCE('" +
    ef14 +
    "', ef14), ef21  =  COALESCE('" +
    ef21 +
    "', ef21), ef22  =  COALESCE('" +
    ef22 +
    "', ef22), ef23  =  COALESCE('" +
    ef23 +
    "', ef23), ef31  =  COALESCE('" +
    ef31 +
    "', ef31), ef32  =  COALESCE('" +
    ef32 +
    "', ef32), ef33  =  COALESCE('" +
    ef33 +
    "', ef33), dp11  =  COALESCE('" +
    dp11 +
    "', dp11), dp12  =  COALESCE('" +
    dp12 +
    "', dp12), dp21  =  COALESCE('" +
    dp21 +
    "', dp21), dp22  =  COALESCE('" +
    dp22 +
    "', dp22), dp23  =  COALESCE('" +
    dp23 +
    "', dp23), dp31  =  COALESCE('" +
    dp31 +
    "', dp31), dp32  =  COALESCE('" +
    dp32 +
    "', dp32), dp33  =  COALESCE('" +
    dp33 +
    "', dp33), aprecierimin ='" +
    aprecierimin +
    "', evaluatmin = 'Da' WHERE student_id  LIKE '%" +
    elevId +
    "%' ";
  db.query(simpleQuery, function(err, respfinal) {
    if (err) {
      console.log("Eroare query date elev: ", err);
      res.status(400).send(err);
    }
    console.log("status: ", respfinal);
    //res.status(200).send(respfinal);
  });

  var clr11min = itemsmin.clr11min ? itemsmin.clr11min : "";
  var clr12min = itemsmin.clr12min ? itemsmin.clr12min : "";
  var clr13min = itemsmin.clr13min ? itemsmin.clr13min : "";
  var clr14min = itemsmin.clr14min ? itemsmin.clr14min : "";

  var clr21min = itemsmin.clr21min ? itemsmin.clr21min : "";
  var clr22min = itemsmin.clr22min ? itemsmin.clr22min : "";
  var clr23min = itemsmin.clr23min ? itemsmin.clr23min : "";
  var clr24min = itemsmin.clr24min ? itemsmin.clr24min : "";

  var clr31min = itemsmin.clr31min ? itemsmin.clr31min : "";
  var clr32min = itemsmin.clr32min ? itemsmin.clr32min : "";
  var clr33min = itemsmin.clr33min ? itemsmin.clr32min : "";
  var clr34min = itemsmin.clr34min ? itemsmin.clr34min : "";

  var clr41min = itemsmin.clr41min ? itemsmin.clr41min : "";
  var clr42min = itemsmin.clr42min ? itemsmin.clr42min : "";
  var clr43min = itemsmin.clr43min ? itemsmin.clr43min : "";

  var clm11min = itemsmin.clm11min ? itemsmin.clm11min : "";
  var clm12min = itemsmin.clm12min ? itemsmin.clm12min : "";
  var clm13min = itemsmin.clm13min ? itemsmin.clm13min : "";

  var clm21min = itemsmin.clm21min ? itemsmin.clm21min : "";
  var clm22min = itemsmin.clm22min ? itemsmin.clm22min : "";
  var clm23min = itemsmin.clm23min ? itemsmin.clm23min : "";

  var clm31min = itemsmin.clm31min ? itemsmin.clm31min : "";

  var clm41min = itemsmin.clm41min ? itemsmin.clm41min : "";

  var mem11min = itemsmin.mem11min ? itemsmin.mem11min : "";
  var mem12min = itemsmin.mem12min ? itemsmin.mem12min : "";
  var mem13min = itemsmin.mem13min ? itemsmin.mem13min : "";
  var mem14min = itemsmin.mem14min ? itemsmin.mem14min : "";
  var mem15min = itemsmin.mem15min ? itemsmin.mem15min : "";
  var mem16min = itemsmin.mem16min ? itemsmin.mem16min : "";

  var mem21min = itemsmin.mem2min1 ? itemsmin.mem21min : "";
  var mem22min = itemsmin.mem22min ? itemsmin.mem22min : "";

  var mem31min = itemsmin.mem31min ? itemsmin.mem31min : "";
  var mem32min = itemsmin.mem32min ? itemsmin.mem32min : "";

  var mem41min = itemsmin.mem41min ? itemsmin.mem41min : "";
  var mem42min = itemsmin.mem42min ? itemsmin.mem42min : "";

  var mem51min = itemsmin.mem51min ? itemsmin.mem51min : "";
  var mem52min = itemsmin.mem52min ? itemsmin.mem52min : "";

  var mem61min = itemsmin.mem61min ? itemsmin.mem61min : "";
  var mem62min = itemsmin.mem62min ? itemsmin.mem62min : "";
  var mem63min = itemsmin.mem63min ? itemsmin.mem63min : "";

  var r11min = itemsmin.r11min ? itemsmin.r11min : "";
  var r12min = itemsmin.r12min ? itemsmin.r12min : "";
  var r13min = itemsmin.r13min ? itemsmin.r13min : "";

  var r21min = itemsmin.r21min ? itemsmin.r21min : "";
  var r22min = itemsmin.r22min ? itemsmin.r22min : "";

  var r31min = itemsmin.r31min ? itemsmin.r31min : "";
  var r32min = itemsmin.r32min ? itemsmin.r32min : "";

  var avap11min = itemsmin.avap11min ? itemsmin.avap11min : "";
  var avap12min = itemsmin.avap12min ? itemsmin.avap12min : "";
  var avap13min = itemsmin.avap11min ? itemsmin.avap11min : "";

  var avap21min = itemsmin.avap21min ? itemsmin.avap21min : "";
  var avap22min = itemsmin.avap22min ? itemsmin.avap22min : "";
  var avap23min = itemsmin.avap23min ? itemsmin.avap23min : "";
  var avap24min = itemsmin.avap24min ? itemsmin.avap24min : "";
  var avap25min = itemsmin.avap25min ? itemsmin.avap25min : "";
  var avap26min = itemsmin.avap26min ? itemsmin.avap26min : "";

  var mm11min = itemsmin.mm11min ? itemsmin.mm11min : "";
  var mm12min = itemsmin.mm12min ? itemsmin.mm12min : "";
  var mm13min = itemsmin.mm13min ? itemsmin.mm13min : "";
  var mm14min = itemsmin.mm14min ? itemsmin.mm14min : "";

  var mm21min = itemsmin.mm21min ? itemsmin.mm21min : "";
  var mm22min = itemsmin.mm22min ? itemsmin.mm22min : "";
  var mm23min = itemsmin.mm23min ? itemsmin.mm23min : "";

  var mm31min = itemsmin.mm31min ? itemsmin.mm31min : "";
  var mm32min = itemsmin.mm32min ? itemsmin.mm32min : "";
  var mm33min = itemsmin.mm33min ? itemsmin.mm33min : "";
  var mm34min = itemsmin.mm34min ? itemsmin.mm34min : "";

  var ef11min = itemsmin.ef11min ? itemsmin.ef11min : "";
  var ef12min = itemsmin.ef12min ? itemsmin.ef12min : "";
  var ef13min = itemsmin.ef13min ? itemsmin.ef13min : "";
  var ef14min = itemsmin.ef14min ? itemsmin.ef14min : "";

  var ef21min = itemsmin.ef21min ? itemsmin.ef21min : "";
  var ef22min = itemsmin.ef22min ? itemsmin.ef22min : "";
  var ef23min = itemsmin.ef23min ? itemsmin.ef23min : "";

  var ef31min = itemsmin.ef31min ? itemsmin.ef31min : "";
  var ef32min = itemsmin.ef32min ? itemsmin.ef32min : "";
  var ef33min = itemsmin.ef33min ? itemsmin.ef33min : "";

  var dp11min = itemsmin.dp11min ? itemsmin.dp11min : "";
  var dp12min = itemsmin.dp12min ? itemsmin.dp12min : "";

  var dp21min = itemsmin.dp21min ? itemsmin.dp21min : "";
  var dp22min = itemsmin.dp22min ? itemsmin.dp22min : "";
  var dp23min = itemsmin.dp23min ? itemsmin.dp23min : "";

  var dp31min = itemsmin.dp31min ? itemsmin.dp31min : "";
  var dp32min = itemsmin.dp32min ? itemsmin.dp32min : "";
  var dp33min = itemsmin.dp33min ? itemsmin.dp33min : "";
  //insert cerinte
  var simpleQuerymin =
    "UPDATE itemimin set clr11min  =  COALESCE('" +
    clr11min +
    "', clr11min), clr12min  =  COALESCE('" +
    clr12min +
    "', clr12min), clr13min  =  COALESCE('" +
    clr13min +
    "', clr13min), clr14min  =  COALESCE('" +
    clr14min +
    "', clr14min), clr21min =   COALESCE('" +
    clr21min +
    "', clr21min), clr22min  =  COALESCE('" +
    clr22min +
    "', clr22min), clr23min  =  COALESCE('" +
    clr23min +
    "', clr23min), clr24min  =  COALESCE('" +
    clr24min +
    "', clr24min), clr31min  =  COALESCE('" +
    clr31min +
    "', clr31min), clr32min  =  COALESCE('" +
    clr32min +
    "', clr32min), clr33min  =  COALESCE('" +
    clr33min +
    "', clr33min), clr34min  =  COALESCE('" +
    clr34min +
    "', clr34min), clr41min  =  COALESCE('" +
    clr41min +
    "', clr41min), clr42min  =  COALESCE('" +
    clr42min +
    "', clr42min), clr43min  =  COALESCE('" +
    clr43min +
    "', clr43min), clm11min  =  COALESCE('" +
    clm11min +
    "', clm11min), clm12min  =  COALESCE('" +
    clm12min +
    "', clm12min), clm13min  =  COALESCE('" +
    clm13min +
    "', clm13min), clm21min  =  COALESCE('" +
    clm21min +
    "', clm21min), clm22min  =  COALESCE('" +
    clm22min +
    "', clm22min), clm23min  =  COALESCE('" +
    clm23min +
    "', clm23min), clm31min  =  COALESCE('" +
    clm31min +
    "', clm31min), clm41min  =  COALESCE('" +
    clm41min +
    "', clm41min), mem11min  =  COALESCE('" +
    mem11min +
    "', mem11min), mem12min  =  COALESCE('" +
    mem12min +
    "', mem12min), mem13min  =  COALESCE('" +
    mem13min +
    "', mem13min), mem14min  =  COALESCE('" +
    mem14min +
    "', mem14min), mem15min  =  COALESCE('" +
    mem15min +
    "', mem15min), mem16min  =  COALESCE('" +
    mem16min +
    "', mem16min), mem21min  =  COALESCE('" +
    mem21min +
    "', mem21min), mem22min  =  COALESCE('" +
    mem22min +
    "', mem22min), mem31min  =  COALESCE('" +
    mem31min +
    "', mem31min), mem32min  =  COALESCE('" +
    mem32min +
    "', mem32min), mem41min  =  COALESCE('" +
    mem41min +
    "', mem41min), mem42min  =  COALESCE('" +
    mem42min +
    "', mem42min), mem51min  =  COALESCE('" +
    mem51min +
    "', mem51min), mem52min  =  COALESCE('" +
    mem52min +
    "', mem52min), mem61min  =  COALESCE('" +
    mem61min +
    "', mem61min), mem62min  =  COALESCE('" +
    mem62min +
    "', mem62min), mem63min  =  COALESCE('" +
    mem63min +
    "', mem63min), r11min  =  COALESCE('" +
    r11min +
    "', r11min), r12min  =  COALESCE('" +
    r12min +
    "', r12min), r13min  =  COALESCE('" +
    r13min +
    "', r13min), r21min  =  COALESCE('" +
    r21min +
    "', r21min), r22min  =  COALESCE('" +
    r22min +
    "', r22min), r31min  =  COALESCE('" +
    r31min +
    "', r31min), r32min  =  COALESCE('" +
    r32min +
    "', r32min), avap11min  =  COALESCE('" +
    avap11min +
    "', avap11min), avap12min  =  COALESCE('" +
    avap12min +
    "', avap12min), avap13min  =  COALESCE('" +
    avap13min +
    "', avap13min), avap21min  =  COALESCE('" +
    avap21min +
    "', avap21min), avap22min  =  COALESCE('" +
    avap22min +
    "', avap22min), avap23min  =  COALESCE('" +
    avap23min +
    "', avap23min), avap24min  =  COALESCE('" +
    avap24min +
    "', avap24min), avap25min  =  COALESCE('" +
    avap25min +
    "', avap25min), avap26min  =  COALESCE('" +
    avap26min +
    "', avap26min), mm11min  =  COALESCE('" +
    mm11min +
    "', mm11min), mm12min  =  COALESCE('" +
    mm12min +
    "', mm12min), mm13min  =  COALESCE('" +
    mm13min +
    "', mm13min), mm14min  =  COALESCE('" +
    mm14min +
    "', mm14min), mm21min  =  COALESCE('" +
    mm21min +
    "', mm21min), mm22min  =  COALESCE('" +
    mm22min +
    "', mm22min), mm23min  =  COALESCE('" +
    mm23min +
    "', mm23min), mm31min  =  COALESCE('" +
    mm31min +
    "', mm31min), mm32min  =  COALESCE('" +
    mm32min +
    "', mm32min), mm33min  =  COALESCE('" +
    mm33min +
    "', mm33min), mm34min  =  COALESCE('" +
    mm34min +
    "', mm34min), ef11min =  COALESCE('" +
    ef11min +
    "', ef11min), ef12min  =  COALESCE('" +
    ef12min +
    "', ef12min), ef13min  =  COALESCE('" +
    ef13min +
    "', ef13min), ef14min  =  COALESCE('" +
    ef14min +
    "', ef14min), ef21min  =  COALESCE('" +
    ef21min +
    "', ef21min), ef22min  =  COALESCE('" +
    ef22min +
    "', ef22min), ef23min  =  COALESCE('" +
    ef23min +
    "', ef23min), ef31min  =  COALESCE('" +
    ef31min +
    "', ef31min), ef32min  =  COALESCE('" +
    ef32min +
    "', ef32min), ef33min  =  COALESCE('" +
    ef33min +
    "', ef33min), dp11min  =  COALESCE('" +
    dp11min +
    "', dp11min), dp12min  =  COALESCE('" +
    dp12min +
    "', dp12min), dp21min =  COALESCE('" +
    dp21min +
    "', dp21min), dp22min  =  COALESCE('" +
    dp22min +
    "', dp22min), dp23min  =  COALESCE('" +
    dp23min +
    "', dp23min), dp31min  =  COALESCE('" +
    dp31min +
    "', dp31min), dp32min  =  COALESCE('" +
    dp32min +
    "', dp32min), dp33min  =  COALESCE('" +
    dp33min +
    "', dp33min), evaluatmin = 'Da' WHERE student_id  LIKE '%" +
    elevId +
    "%' ";
  db.query(simpleQuerymin, function(err, respfinalmin) {
    if (err) {
      console.log("Eroare query date elev: ", err);
      res.status(400).send(err);
    }
    console.log("statusmin: ", respfinalmin);
    res.status(200).send(respfinalmin);
  });
});
// end salvare date elev evaluare
//end get data itemi

module.exports = userRoutes;
