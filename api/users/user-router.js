const router = require("express").Router();
const Users = require("../users/users-model");
const {
  logger,
  checkUsernameExists,
  validateUserExist,
} = require("./users-middleware");
const { restricted } = require("../auth/auth-middleware");

//Update User//
router.post("/update", logger, validateUserExist, async (req, res, next) => {
  res.json("Yup");
  //See if user exist
  //Check for changes
  //Apply changes
  //Send new user info
});

module.exports = router;
