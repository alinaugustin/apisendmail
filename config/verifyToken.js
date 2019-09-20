var jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens
// eslint-disable-next-line no-unused-vars
const dotenv = require("dotenv").config;
const configsecret = process.env.secret;
//console.log('configsecret verify: ',configsecret)
//var config = require('../config') // get our config file
function verifyToken(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.headers.authorization;
  //console.log('token_verifyToken = ', token)
  if (!token)
    return res.status(403).send({ auth: false, message: "No token provided." });
  // verifies secret and checks exp
  jwt.verify(token, configsecret, function(err, decoded) {
    if (err) {
      // eslint-disable-next-line no-console
      console.log("err verify: ", err);
      return res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate token." });
    }
    // if everything is good, save to request for use in other routes
    req.userId = decoded.id;
    //console.log("decoded.id: ", req.userId);
    //res.json(decoded.id)
    //next(res.status(200).send({ auth: true, userId: req.userId}))
    next();
  });
}

module.exports = verifyToken;
