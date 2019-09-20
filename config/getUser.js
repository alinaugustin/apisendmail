var jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens
const dotenv = require("dotenv").config;
const configsecret = process.env.secret;
//console.log('configsecret getUser: ',configsecret)
//var config = require('../config') // get our config file

function getUser(req, res, next) {
  // check header or url parameters or post parameters for token
  var id = req.headers.authorization;
  //console.log('id_getUser = ', id)
  if (!id)
    return res.status(403).send({ auth: false, message: "No token provided." });
  var queryusername = "SELECT username FROM users WHERE id = '" + id + "' ";
  db.query(queryusername, function(error) {
    if (error) {
      console.log("err_getUser1: ", error);
      return res
        .status(500)
        .send("Utilizatorul nu exista sau nu are drepturi.");
    }
    // verifies secret and checks exp
    jwt.verify(id, configsecret, function(err, decoded) {
      if (err) {
        console.log("err verify getUser: ", err);
        if (err.name == "TokenExpiredError") {
          console.log("TOKEN EXPIRED!");
          // var queryid = "UPDATE users set id = '' WHERE username = '" + username + "' "
          // db.query(queryid, function (error) {
          //   if (error) {
          //     console.log('err_getUser2: ', error)

          //   }
          // })
        }
        //console.log('decoded1: ',decoded)
        return res.status(500).send({ auth: false, message: "TOKEN EXPIRED!" });
      }
      // if everything is good, save to request for use in other routes
      //req.userId = decoded.id
      //console.log('decoded2: ',decoded.id)
      //res.json(req.userId)
      //next(res.status(200).send({ auth: true, id: req.userId}))
      next();
    });
  });
}

module.exports = getUser;
