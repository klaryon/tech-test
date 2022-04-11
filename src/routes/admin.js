var express = require('express');
var router = express.Router();
const { User, KYC } = require("../models/user");
const { Vault, VaultState, VaultParticipant } = require("../models/vault");
const VaultTransaction = require("../models/vaultTransaction");
const Transactions = require("../models/transaction");
const Notifications = require("../models/notification");
const { sendPushNotification } = require("../utils/notifications");

const Logger = require("../utils/logger");

var ObjectId = require('mongoose').Types.ObjectId; 
const userProperties = ["_id", "firstName", "lastName", "email", "address", "city", "postalCode", "publiAddress", "createdAt", "role"];

/* GET User Details {id} */
router.get('/users/:id?', async (req, res, next) => {
  try {
    if(req.params.id) {
      const user = await User.findById(req.params.id, userProperties) || {}
      res.send(user);
    } else {
      const users = await User.find({}, userProperties) || {}
      res.send(users);
    }
  } catch (error) {
    res.send({error, message: 'Not found'});
  }
});

/* GET Vaults Details {id} */
router.get('/vaults/:id?', async (req, res, next) => {
  const vaultDetails = (req.params.id) ? 
    await Vault.findById(req.params.id) : 
    await Vault.find(req.body);
    
  res.send(vaultDetails);
});

/* GET Balance Transactions Details {id} */
router.get('/transactions/balance/:id?', async (req, res, next) => {
  if(req.params.id) {
    const transactionDetails = await Transactions.findById(req.params.id)
    res.send(transactionDetails);
  } else {
    // Query to filter
    const transactionDetails = await Transactions.find(req.body)
    res.send(transactionDetails);
  }
});

/* GET Vault Transactions Details {id} */
router.get('/transactions/vaults/:id?', async (req, res, next) => {
  if(req.params.id) {
    const vaultTransactionDetails = await VaultTransaction.findById(req.params.id)
    res.send(vaultTransactionDetails);
  } else {
    // Query to filter
    const vaultTransactionDetails = await VaultTransaction.find(req.body)
    res.send(vaultTransactionDetails);
  }
});

/* GET Vault Transactions Details {id} */
router.get('/transactions/balance/withdrawall/pending', async (req, res, next) => {
  let sorting = req.query.sort_order;

  try {
    const pendingTransactions = await Transactions.find({ status: 'pending', amount: { $lt: 0 } })
    res.send(pendingTransactions);
  } catch (error) {
    Logger.error({ message: error });
    next({
        statusCode: 500,
        message: 'Error retrieving pending withdraw transactions',
    });
  }
});

/* POST Validate crypto withdrawall transaction */
router.post('/transactions/balance/withdrawall/approve/:id', async (req, res, next) => {
  await Transactions.findByIdAndUpdate(req.params.id, { status: 'approved'}, { new: true })
  .then((transaction) => {
    res.send(transaction);
  })
  .catch((error)=> {
    Logger.debug({ message: error })
    return next({
      statusCode: 500,
      message: `No transaction computed.`,
    });
  })
});


/* PUT User update */
router.put('/users/:id', async (req, res, next) => {
  try {
    await User.findOneAndUpdate({ _id: req.params.id }, req.body, { runValidators: true });
    res.send({success: true})
  } catch (error) {
    Logger.error({ message: error });
    next({
        statusCode: 500,
        message: 'Error updating user',
    });
  }
});

// ----------------APP-PROVISIONAL----------

/* POST Create/send notification to specific user */
router.post("/notification", async (req, res, next) => {

  try {

    await Notifications.create(req.body);
    // Send push if necessarys

    sendPushNotification(
      ['a062eb98-76c8-11ec-a2e3-de8b1fc37a91'],
      "Welcome to the amazing Rand Network!"
    ).catch((error) => Logger.error({ message: error }));

    res.send({
      success: true,
      message: `Notification sent`,
    });
  } catch (error) {
    Logger.error({ message: error });
    res.send({
      success: false,
      message: `Notification failed.`,
    });
  }
});

// /* POST Vault participant creation */
// router.post('/vaults/:id/particiant', async (req, res, next) => 
//   VaultParticipant.create({ vaultId: req.params.id, userId: req.body?.id || req.user._id, state: 'active' })
//   .then(async (participant) => {
//     res.send({success: true, participant})
//   })
//   .catch((error) => {
//     console.log(error);
//       next({
//         statusCode: 404,
//         message: 'Not able to create vault',
//         })
//     }
//   ));

/* POST Vault creation */
router.put('/vaults/:id', async (req, res, next) => 
  Vault.findOneAndUpdate({}, req.body)
  .then(async (vault) => {
    Logger.debug(vault);
    const state = await VaultState.create({ vaultId: vault._id });
    Logger.debug(state);
    res.send({success: true, id: vault._id})
  })
  .catch((error) => {
    Logger.error({ message: error });
      next({
        statusCode: 404,
        message: 'Not able to create vault',
        })
    }
  ));

router.use((req, res, next) => {
  next({
      statusCode: 404,
      message: 'Not found',
  });
});

module.exports = router;
