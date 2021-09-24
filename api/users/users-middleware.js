const phone = require("libphonenumber");
const schema = require("./userPayloadSchema");
const { findBy } = require("./users-model");
const Users = require("../users/users-model");

exports.logger = (req, res, next) => {
  console.log("METHOD: ", req.method);
  console.log("REQUEST_BODY: ", req.body);
  next();
};
exports.validateUserExist = async (req, res, next) => {
  try {
    const { username } = req.body;
    const data = await Users.findBy(username).first();
    data
      .then((user) => {
        next();
      })
      .catch((err) => {
        res.status(400);
      });
  } catch (err) {
    next(err);
  }
};
exports.validatePayload = async (req, res, next) => {
  try {
    //If doing 10-digit US numbers only:
    //req.body.phone = ['+1', req.body.phone].join('')
    await schema.validate(req.body);
    req.phone_number = await phone.e164(req.body.phone);
    console.log("validatePayload: passed");
    next();
  } catch (err) {
    console.log("validatePayload: failed");
    if (err.errors) {
      next({ status: 400, message: err.errors[0] });
    } else {
      next({ status: 400, message: err });
    }
  }
};

exports.validateLoginPayload = async (req, res, next) => {
  const { username, password } = req.body;
  if (username && password) {
    console.log("validateLoginPayload: passed");
    next();
  } else {
    console.log("validateLoginPayload: failed");
    next({ status: 400, message: "username and password are required" });
  }
};

exports.checkUsernameAvailable = async (req, res, next) => {
  const [user] = await findBy({ username: req.body.username });
  if (user) {
    console.log("checkUsernameAvailable: passed");
    next({ status: 409, message: "username taken" });
  } else {
    console.log("checkUsernameAvailable: failed");
    next();
  }
};

exports.checkPhoneAvailable = async (req, res, next) => {
  const [user] = await findBy({ phone_number: req.phone_number });
  if (user) {
    console.log("checkPhoneAvailable: failed");
    next({ status: 409, message: "phone number taken" });
  } else {
    console.log("checkPhoneAvailable: passed");
    next();
  }
};

exports.checkUsernameExists = async (req, res, next) => {
  const [user] = await findBy({ username: req.body.username });
  if (user) {
    console.log("checkUsernameExists: passed");
    req.user = user;
    next();
  } else {
    console.log("checkUsernameExists: failed");
    next({ status: 401, message: "username or password invalid" });
  }
};
