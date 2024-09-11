const jwt = require('jsonwebtoken');
const db = require("../models");
const authConfig = require("../config/auth");

const verifyToken = (req, res, next) => {
  // do something
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    req.userId = decoded.id;
    next();
  });
};

const checkRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const query = `
        SELECT "workType" FROM users WHERE id = $1;
      `;
      const [results] = await db.sequelize.query(query, {
        bind: [req.userId]
      });
      console.log(req.userId)
      console.log(results)
      if (results.length > 0 && results[0].workType === requiredRole) {
        next();
      } else {
        res.status(403).send({
          message: "Require " + requiredRole + " Role!"
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({
        message: "Unable to validate User role!"
      });
    }
  };
};

module.exports = {
  verifyToken,
  checkRole
};
