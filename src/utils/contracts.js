const { getVaultManagerContract, getMiddlewareContract, getVaultReserveContract, getRandMultiTokenContract, getStableTokenContract, getProviders } = require("./web3");
const { encodeSignature, encodeSignatureAndParams }= require("encoding-payload");

const Logger = require("./logger");

const callOptions = { gas: 1500000 };

const contractCall = async (contractInstance, method, input) => {
  try {
      if (input) {
          return await contractInstance.methods[method](input).call();
      }
      else {
          return await contractInstance.methods[method]().call();
      }
  }
  catch (e) {
      Logger.error({ message: `Contract call "${method}" error. Return ${e}` });
      return false;
  }
}

const burnTokens = async (walletAddress, amount) => {
  const { web3OZ, web3Regular } = getProviders();
  const { contract: stableTokenContract, from } = await getStableTokenContract(web3OZ);
  return await stableTokenContract.methods['burn'](walletAddress, web3Regular.utils.toWei(amount.toString())).send(callOptions) // Review if amount with decimals, only on crypto deposits
  // .on('transactionHash', function(hash){
  //   Logger.debug({ label: 'Transaction hash', message: hash })
  // })
  // .on('receipt', async function(receipt){
  //   // Or do the confirmation in this step? 
  //   // web3js docu -> "confirmation" returns confirmation: Number, receipt: Object, latestBlockHash: String: Fired for every confirmation up to the 24th confirmation.
  //   if(receipt.status) {
  //     Logger.debug({ message: { receipt } });
  //     // Two different logics for fiat or crypto
  //     // For crypto await number of blocks or directly create the tx as confirmed (similar flow we have above for BETA TESTING) - anyway it will take some time to be confirmed... so maybe onreceipt create as pending and onconfirm update it as "confimred"?
  //     Transactions.create({
  //       userId: req.user._id,
  //       status: 'pending',
  //       origin: req.body.origin,
  //       amount: req.body.amount,
  //       // transactionId: receipt.transactionHash,
  //       address: req.body?.address || null,
  //       type: 'balance',
  //     })
  //     .then(async (transaction) => {
    
  //       Logger.debug({ label: 'New transaction ', message: transaction });
      
  //       res.send({success: true, transaction})
    
  //     })
  //     .catch((error) => {
  //       Logger.error({ message: error });
  //         next({
  //           statusCode: 404,
  //           message: 'Not able to create the transaction',
  //         })
  //     });
  //   } else{
  //     // Tx still executed but failed onchain, return error and send us an email
  //     InsightsClient.trackException({ exception: new Error(`Mint status ${receipt.status} for ${JSON.stringify(receipt)}`) });
  //     Logger.error({ message: { receipt } });
  //     isProd && sendMail({ to: 'sergi@rand.network', from: 'no-reply@rand.network', subject, text: `There has been an error with transaction ${receipt} for user ${req.user._id}` })
  //     .then(() => {
  //       next({
  //         statusCode: 404,
  //         message: 'Not able to create the transaction',
  //       })
  //     })
  //   }
  // })
  // .on('confirmation', function(confirmationNumber, receipt){ // To review, since on get BalanceOf we are already displaying the balance on the app from the first confirmation...
  //   /*if(confirmationNumber == 2) {
  //     Transactions.findOneAndUpdate({ transactionId: receipt.transactionHash, status: 'pending' }, { status: 'confirmed' }, { runValidators: true })
  //     .then(result => console.log(result))
  //   }*/
  // })
  // .on('error', function(error, receipt) {
  //   Logger.error({ message: { error, receipt} });
  //   throw new Error(error);
  // });
}

const mintTokens = async (walletAddress, amount) => {
  const { web3OZ, web3Regular } = getProviders();
  const { contract: stableTokenContract, from } = await getStableTokenContract(web3OZ);

  return await stableTokenContract.methods['mint'](walletAddress, web3Regular.utils.toWei(amount.toString())).send(callOptions) // Review if amount with decimals, only on crypto deposits
  // .on('transactionHash', function(hash){
  //   Logger.debug({ label: 'Transaction hash', message: hash })
  // })
  // .on('receipt', async function(receipt){
  //   // Or do the confirmation in this step? 
  //   // web3js docu -> "confirmation" returns confirmation: Number, receipt: Object, latestBlockHash: String: Fired for every confirmation up to the 24th confirmation.
  //   if(receipt.status) {
  //     Logger.debug({ message: { receipt } });
  //     // Two different logics for fiat or crypto
  //     // For crypto await number of blocks or directly create the tx as confirmed (similar flow we have above for BETA TESTING) - anyway it will take some time to be confirmed... so maybe onreceipt create as pending and onconfirm update it as "confimred"?
      
  //     res.send({success: true, transaction})
  //   } else{
  //     InsightsClient.trackException({ exception: new Error(`Mint status ${receipt.status} for ${JSON.stringify(receipt)}`) });
  //     Logger.error({ message: { receipt, userWallet } });
  //     // Tx still executed but failed onchain, return error and send us an email
  //     isProd && sendMail({ to: 'sergi@rand.network', from: 'no-reply@rand.network', subject, text: `There has been an error with transaction ${receipt} for user ${req.user._id}` })
  //     .then(() => {
  //       next({
  //         statusCode: 404,
  //         message: 'Not able to create the transaction',
  //       })
  //     })
  //   }
  // })
  // .on('confirmation', function(confirmationNumber, receipt){ // To review, since on get BalanceOf we are already displaying the balance on the app from the first confirmation...
  //   /*if(confirmationNumber == 2) {
  //     Transactions.findOneAndUpdate({ transactionId: receipt.transactionHash, status: 'pending' }, { status: 'confirmed' }, { runValidators: true })
  //     .then(result => console.log(result))
  //   }*/
  // })
  // .on('error', function(error, receipt) {
  //   Logger.error({ message: { error, receipt} });
  // });
};

const withdrawFromVaultReserve = async (walletAddress, amount) => {
  const { web3Regular, web3OZETH } = getProviders();

  const { contract: vaultReserveContract } = await getVaultReserveContract(web3OZETH, callOptions);

  // Logger.debug({ message: { walletAddress, amount, wei: web3Regular.utils.toWei(amount.toString(), 'mwei')}})
  const computedAmount = web3Regular.utils.toWei(amount.toFixed(6), 'mwei');
  return await vaultReserveContract.methods['transfer'](walletAddress,computedAmount).send();
};

// const withdrawFromVaultReserve = async (walletAddress, amount) => {
//   const { web3Regular, web3OZETH } = getProviders();

//   const { contract: middlewareContract } = await getMiddlewareContract(web3OZETH, callOptions);
//   // Logger.debug({ message: { walletAddress, amount, wei: web3Regular.utils.toWei(amount.toString(), 'mwei')}})
//   const computedAmount = web3Regular.utils.toWei(amount.toFixed(6), 'mwei');
//   return await middlewareContract.methods['forwardCallToProxy'](computedAmount,
//     encodeSignatureAndParams(
//       "transfer(address,uint256)",
//       ["address", "uint256"],
//       [walletAddress, computedAmount]
//     )).send();
// };

const stopYielding = async (
  chainId,
  tiers,
  percentages,
  contractPrize,
  FIXED,
  externalRandomNumber,
  twaNoRandom,
  alltoCreator,
  tierRandomBased
) => {
  const { web3OZ, web3Regular } = getProviders();
  const { contract: vaultManagerContract } = await getVaultManagerContract(web3OZ);
  return await vaultManagerContract.methods['stopYielding'](
    chainId,
    tiers,
    percentages,
    web3Regular.utils.toWei(contractPrize),
    FIXED,
    externalRandomNumber,
    twaNoRandom,
    alltoCreator,
    tierRandomBased
  ).send(callOptions)
}

const startYielding = async (
  chainId,
  durationBlocks,
  forceStart=false
) => {
  const { web3OZ } = getProviders();
  const { contract: vaultManagerContract } = await getVaultManagerContract(web3OZ);
  return await vaultManagerContract.methods['startYielding'](chainId, durationBlocks, forceStart).send(callOptions)
}

const closeVaultBeforeYielding = async (chainId) => {
  const { web3OZ } = getProviders();
  const { contract: vaultManagerContract } = await getVaultManagerContract(web3OZ);
  const getBalance = await vaultManagerContract.methods['closeVaultBeforeYielding'](chainId).send(callOptions);
  
  return getBalance;
}

const getVaultTWBalance = async (walletAddresses, chainIds) => {
  const { web3Regular, web3OZ } = getProviders();

  const { contract: randMultiTokenContract, from } = await getRandMultiTokenContract(web3OZ);
  const getBalance = await randMultiTokenContract.methods['twaBalanceOfBatch'](walletAddresses, chainIds).call({ from });
  
  const result = getBalance.map((balance) => web3Regular.utils.fromWei(balance));
  return result.reduce((sum, balance) => sum + parseInt(balance), 0);
}

const getVaultCompleteBalance = async (walletAddress, chainId) => {
  const { web3Regular, web3OZ } = getProviders();

  const { contract: randMultiTokenContract, from } = await getRandMultiTokenContract(web3OZ);
  const getBalance = await randMultiTokenContract.methods['balancesOf'](walletAddress, chainId).call({ from });

  return Object.fromEntries(Object.entries(getBalance).map(([k, v]) => [k, web3Regular.utils.fromWei(v)]));
}

const getVaultUserBalance = async (walletAddress, chainId) => {
  const { web3Regular, web3OZ } = getProviders();

  const { contract: randMultiTokenContract, from } = await getRandMultiTokenContract(web3OZ);
  const getBalance = await randMultiTokenContract.methods['balanceOf'](walletAddress, chainId).call({ from })
  .catch((error) => {
    Logger.debug({ message: { error, chainId }})
  });

  return web3Regular.utils.fromWei(getBalance);
}

const getVaultDetails = async (chainId) => {
  const { web3OZ } = getProviders();

  const { contract: vaultManagerContract, from } = await getVaultManagerContract(web3OZ);
  const getBalance = await vaultManagerContract.methods['getVault'](chainId).call({ from });

  return getBalance;
}

const hashVaultId = async (walletAddress, minParticipants, durationBlocks) => {
  const { web3OZ } = getProviders();

  const { contract: vaultManagerContract, from } = await getVaultManagerContract(web3OZ);
  const vaultHashId =  await vaultManagerContract.methods['hashVaultId'](walletAddress, minParticipants, durationBlocks).call({from}); 

  return vaultHashId.toString();
};

const createVault = async (vaultHashId, walletAddress, minParticipants, lockDuration, isRecurrent=false, isPublic=false) => {
  const { web3OZ } = getProviders();

  const { contract: vaultManagerContract } = await getVaultManagerContract(web3OZ);
  const vault = await vaultManagerContract.methods['createVault'](vaultHashId, walletAddress, minParticipants.toString(), lockDuration, isRecurrent, isPublic).send(callOptions)
  console.log(vault);
  return vault;
};

const participantVaultTransaction = async (vaultId, userWallet, amount) => {
  const { web3OZ, web3Regular } = getProviders();
  const { contract: vaultManagerContract } = await getVaultManagerContract(web3OZ);

  if (amount > 0) { // Add money to the vault
    return vaultManagerContract.methods['participantDeposit'](vaultId, userWallet, web3Regular.utils.toWei(amount.toString())).send(callOptions);
  } else {
    return vaultManagerContract.methods['participantWithdraw'](vaultId, userWallet, web3Regular.utils.toWei((-1*amount).toString()), 0).send(callOptions);
  }
};

const getUserBalance = async (walletAddress, chainId) => {
  const { web3OZ, web3Regular } = getProviders();

  const { contract: stableTokenContract, from } = await getStableTokenContract(web3OZ);
  const getBalance = await stableTokenContract.methods['balanceOf'](walletAddress).call({ from });

  return web3Regular.utils.fromWei(getBalance);
}

const createWallet  = async () => {
  const { web3Regular } = getProviders();

  const account = web3Regular.eth.accounts.create(web3Regular.utils.randomHex(32));
  const wallet = web3Regular.eth.accounts.wallet.add(account);
  const keystore = wallet.encrypt(web3Regular.utils.randomHex(32));
  
  const userWallet = {
      account: account,
      wallet: wallet,
      keystore: keystore
  }
  return userWallet;
};

module.exports = {
  burnTokens,
  closeVaultBeforeYielding,
  contractCall,
  createVault,
  createWallet,
  getUserBalance,
  getVaultDetails,
  getVaultUserBalance,
  getVaultCompleteBalance,
  getVaultTWBalance,
  hashVaultId,
  mintTokens,
  participantVaultTransaction,
  startYielding,
  stopYielding,
  withdrawFromVaultReserve
}; 
