const phone = require("libphonenumber");
const schema = require("./userPayloadSchema");
const { findBy } = require("./users-model");

async function validatePayload(req, res, next) {
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
}

function validateLoginPayload(req, res, next) {
  const { username, password } = req.body;
  if (username && password) {
    console.log("validateLoginPayload: passed");
    next();
  } else {
    console.log("validateLoginPayload: failed");
    next({ status: 400, message: "username and password are required" });
  }
}

async function checkUsernameAvailable(req, res, next) {
  const [user] = await findBy({ username: req.body.username });
  if (user) {
    console.log("checkUsernameAvailable: passed");
    next({ status: 409, message: "username taken" });
  } else {
    console.log("checkUsernameAvailable: failed");
    next();
  }
}

async function checkPhoneAvailable(req, res, next) {
  const [user] = await findBy({ phone_number: req.phone_number });
  if (user) {
    console.log("checkPhoneAvailable: failed");
    next({ status: 409, message: "phone number taken" });
  } else {
    console.log("checkPhoneAvailable: passed");
    next();
  }
}

async function checkUsernameExists(req, res, next) {
  const [user] = await findBy({ username: req.body.username });
  if (user) {
    console.log("checkUsernameExists: passed");
    req.user = user;
    next();
  } else {
    console.log("checkUsernameExists: failed");
    next({ status: 401, message: "username or password invalid" });
  }
}

module.exports = {
  validatePayload,
  checkUsernameAvailable,
  checkPhoneAvailable,
  validateLoginPayload,
  checkUsernameExists,
};
