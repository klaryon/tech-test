var express = require("express");
var router = express.Router();

const { User } = require("../models/user");
const Logger = require("../utils/logger");
const middlewares = require("../middlewares");

var ObjectId = require('mongoose').Types.ObjectId; 

/* GET User profile */
router.get("/", async (req, res, next) => {
  const userId = new ObjectId(req.body.userId);
  
  try {

    const user = await User.findOne({ _id: userId })

    res.send({
      user
    });

  } catch (error) {
    next({
      statusCode: 500,
      message: "Get user profile failed.",
    });
  }
});



router.post("/", async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);
    res.send({
      newUser
    });

  } catch (error) {
    console.log(error)
    next({
      statusCode: 500,
      message: "Get user profile failed.",
    });
  }
});



/* PUT Update user profile */
router.put("/update-profile", middlewares.userAuthentication, async (req, res, next) => {
  const userId = new ObjectId(req.user._id);
  const { firstName, lastName, birthDate, email } = req.body
  try {
    const user = await User.findOneAndUpdate({ _id: userId }, {firstName, lastName, birthDate, email}, { runValidators: true, returnDocument: 'after' }).populate('kyc').lean();
    res.send({
      success: true,
      message: `Profile updated`,
      user: { ...user, kyc: user.kyc?.sort((x,y) => x.createdAt - y.createdAt).shift()},
    });
  } catch (error) {
    Logger.error({ message: error });
    next({
      statusCode: 500,
      message: "Update profile failed.",
    });
  }
});


router.use((req, res, next) => {
  next({
    statusCode: 404,
    message: "Not found",
  });
});

module.exports = router;
