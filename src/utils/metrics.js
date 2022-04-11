const mongoose = require('mongoose');

const { Vault } = require("../models/vault");
const VaultTransaction = require("../models/vaultTransaction");
const Transaction = require("../models/transaction");

const PUBLIC_VAULT = process.env.PUBLIC_VAULT || 'PUBLIC';

const getFundsVaultsMetrics = async ({ isPrivate, start, end }) => {
  const vaults = await Vault.find({ isPublic: !isPrivate });
  return VaultTransaction.aggregate([
    // { $match: { vaultId: isPrivate ? { $nin: [ null, PUBLIC_PARTY ] } : PUBLIC_PARTY, updatedAt: { "$gte": new Date(start), "$lte": new Date(end) } } }, // Not public or other transaction
    { $match: { vaultId: { $in: vaults.map((vault) => vault._id) }, updatedAt: { "$gte": new Date(start), "$lte": new Date(end) } } }, // Not public or other transaction
    {
      $group: {          
          _id: "$vaultId",
          amount: { $sum: "$amount" },
          // userIds: { $addToSet: '$user'},
          // userIds: { $set: { $user: $userIds.$user + $amount}},
          // userTransactions: { $push: { user: '$user', transaction: "$amount" }},
          userTransactions: { $addToSet: { "userId": "$userId", "vaultId": "$vaultId", "balance": "$amount"}},
      }
    }])
    .then((funds) => {
      const totalVaultsFunded = funds.length;
      // const totalAmount = funds.reduce((a, b) => a + b.amount, 0);
      // const totalUsersInParties = funds.reduce((a, b) => a + b.userIds.length, 0);
      // const totalUsersInParties = funds.reduce((a, b) => a + b.userIds.filter((v, i, a) => a.indexOf(v) === i).length, 0);
      // const avgPartiesJoinedUser = funds.reduce((a, b) => {
      //   b.userIds.map((id) => {
      //   // b.userTransactions.map((id) => {
      //   //   a[id] = { totalParties: 1, totalAmount: transaction}
      //     a[id] = a[id] ? a[id] + 1 : 1;
      //   });
      //   return a;
      // }, {});
      // const countPartiesNoAmount = funds.filter((value) => value.amount === 0).length;
      // const countPartiesSmallAmount = funds.filter((value) => value.amount > 0 && value.amount <= 100).length;
      // const countPartiesMediumAmount = funds.filter((value) => value.amount > 100 && value.amount <= 500).length;
      // const countPartiesBigAmount = funds.filter((value) => value.amount > 500).length;
      
      
      const { totalFunds, userUpdatedInVaults, vaultsFundedUser, ...restMetrics} = funds.reduce((a, b) => {
  
        b.userTransactions.map((transaction) => {
          if (!a.userUpdatedInVaults[transaction.userId]) a.userUpdatedInVaults[transaction.userId] = {};
          a.userUpdatedInVaults[transaction.userId][transaction.vaultId] = (a.userUpdatedInVaults[transaction.userId]?.[transaction.vaultId] || 0) + transaction.balance;
            if (a.userUpdatedInVaults[transaction.userId][transaction.vaultId] === 0) delete a.userUpdatedInVaults[transaction.userId][transaction.vaultId];
            if (a.userUpdatedInVaults[transaction.userId] === {}) delete a.userUpdatedInVaults[transaction.userId];
        });
  
        a.totalFunds = a.totalFunds + b.amount;
  
        if(b.amount > 0 && b.amount <= 100) {
          a.countVaultsSmallFunds ++;
        } else if (b.amount > 100 && b.amount <= 500) {
          a.countVaultsMediumFunds++;
        } else if (b.amount > 500) {
          a.countVaultsBigFunds++;
        }
        else {
          a.countVaultsNoFunds++;
        }
  
        return a;
      }, { userUpdatedInVaults: {}, totalFunds: 0, vaultsFundedUser: {}, countVaultsSmallFunds: 0, countVaultsMediumFunds: 0, countVaultsBigFunds: 0, countVaultsNoFunds: 0 });
  
      const totalUsersFunding = Object.keys(userUpdatedInVaults).length;
      const avgFundsPerVault = totalFunds && (totalFunds / totalVaultsFunded);
      const avgUsersPerVault = totalUsersFunding && (totalUsersFunding / totalVaultsFunded);
      
      return ({
        allocation: { avgInVault: avgFundsPerVault, totalFunds },
        vaults: { totalVaultsFunded, ...restMetrics },
        users: { avgInVault: avgUsersPerVault, usersInVaults: Object.keys(userUpdatedInVaults) }
      });
    })
}
const getFundsBalance = ({ start, end }) =>
  Transaction.aggregate([
    { $match: { type: "balance", updatedAt: { "$gte": new Date(start), "$lte": new Date(end) } } },
    {
      $group: {          
          _id: "$type",
          amount: { $sum: "$amount" },
          userIds: { $addToSet: '$userId'},
          // userIds: { $cond: [ $amount" > 0, { $addToSet: '$user'}, <false-case> ] },
          // userIds: { $addToSet: { $cond : [ { $gte: [ "$amount", 0 ] }, '$user', null
          // ] } },
          userTransactions: { $addToSet: { "userId": "$userId", "balance": "$amount"}},
      }
    }]
  )
  .then(([data]) => {
    const usersBalanceUpdate = data?.userTransactions.reduce((usersBalance, transaction) => {
      usersBalance[transaction.userId] = (usersBalance[transaction.userId] || 0) + transaction.balance;
      if(usersBalance[transaction.userId] === 0) delete usersBalance[transaction.userId];
      return usersBalance;
    }, {}) || {};
    return ({
      allocation: { totalFunds: data && data.amount || 0 },
      users: { usersInBalance: Object.keys(usersBalanceUpdate) || 0 }
    });
  })

const getVaultsMetrics = ({ isPrivate, start, end }) =>
  Vault.aggregate([
    // { $match: { _id: isPrivate ? { $nin: [ null, mongoose.Types.ObjectId(PUBLIC_PARTY) ] } : mongoose.Types.ObjectId(PUBLIC_PARTY), updatedAt: { "$gte": new Date(start), "$lte": new Date(end) } } },
    { $match: { isPublic: !isPrivate, updatedAt: { "$gte": new Date(start), "$lte": new Date(end) } } },
    { $group: {
      _id: "null",
      // vaultIds: { $push: '$_id' },
      avgMinParticipants: { $avg : '$minParticipants'},
      totalVaults: { $sum: 1 },
      countRunning: {
        $sum: {
          $cond: { if: { $eq: ["$state", 2 ]}, then: 1, else: 0 } // YIELDING
        }
      },
      countOpen: {
        $sum: {
          $cond: { if: { $or: [{ $eq: ["$state", 0 ]}, { $eq: ["$state", 1 ]}]}, then: 1, else: 0 } // WAITINGPARTICIPANTS || CREATED
        }
      },
      countClosed: {
        $sum: {
          $cond: { if: { $or: [{ $eq: ["$state", 4 ]}, { $eq: ["$state", 5 ]}]}, then: 1, else: 0 } // FINISHED || CANCELLED
        }
      },
      countRewarding: {
        $sum: {
          $cond: { if: { $eq: ["$state", 3 ]}, then: 1, else: 0 } // REWARDING
        }
      },
      countShortDuration: {
        $sum: {
          $cond: {
            if: { 
              "$and": [ 
                { "$gt": [ "$duration", 0 ] },
                { "$lt": [ "$duration", 1500 ] }
              ]
            },
            then: 1,
            else: 0 
          }
        }
      },
      countMediumDuration: {
        $sum: {
          $cond: {
            if: { 
              "$and": [ 
                { "$gt": [ "$duration", 1500 ] },
                { "$lt": [ "$duration", 1500 ] }
              ]
            },
            then: 1,
            else: 0 
          }
        }
      },
      countLongDuration: {
        $sum: {
          $cond: {
            if: { 
              "$gt": [ "$duration", 3000 ]
            },
            then: 1,
            else: 0 
          }
        }
      },
      avgDuration: { $avg: '$duration' }
    }},
    // Omit unwanted field
    { $project: { "_id": 0 } },
  ])
  .then(([ vaults={} ]) => {
    const { avgDuration=0, avgMinParticipants=0, countLongDuration=0, countMediumDuration=0, countShortDuration=0, countOpen=0, countRunning=0, countClosed=0, countRewarding=0, totalVaults=0 } = vaults;
    return({ status: { totalVaults, countOpen, countRunning, countClosed, countRewarding,  }, duration: { totalVaults, countShortDuration, countMediumDuration, countLongDuration, avgDuration, avgMinParticipants }});
  })

module.exports = { getFundsVaultsMetrics, getFundsBalance, getVaultsMetrics }; 