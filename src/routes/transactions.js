var express = require('express');

var router = express.Router();

var ObjectId = require('mongoose').Types.ObjectId; 

const Transactions = require("../models/transaction");

const Logger = require("../utils/logger");


router.put('/', async (req, res, next) => {

  const userId = new ObjectId(req.body.userId);

  try {
    Transactions.updateMany({ userId }, { $set: {txId: 'id1', status: 'confirmed'} }, { new: true, runValidators: true })
    .then((tx) => {
      res.send({ success: true, tx });
    })
  } catch(error) {
    Logger.error({ message: error });
    next({
      statusCode: 500,
      message: 'Not able to update transactions',
    })
  }
});


/* GET Transactions Details for the authenticated user {id} */
router.get('/', async (req, res, next) => {
  const userId = req.user._id;
  if (!userId)
    throw new Error('Need user authenticated');
  
  try {
    const transactionDetails = await Transactions.find({ userId: new ObjectId(userId), status: { $ne: 'initiated' } });
      
  } catch {
    Logger.error({ message: error });
    next({
      statusCode: 500,
      message: 'Not able to get transactions',
    })
  }
});

router.post("/", async (req, res, next) => {
  try {
    const newTx = await Transactions.create(req.body);
    res.send({
      newTx
    });

  } catch (error) {
    console.log(error)
    next({
      statusCode: 500,
      message: "Create tx failed.",
    });
  }
});


router.use((req, res, next) => {
  next({
      statusCode: 404,
      message: 'Not found',
  });
});

module.exports = router;
