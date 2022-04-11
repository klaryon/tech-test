const axios = require('axios');

const Web3 = require('web3');
const { DefenderRelayProvider } = require('defender-relay-client/lib/web3');
const { getSecret } = require('../utils/tools')
const Logger = require("../utils/logger");

const envPath = process.env.TARGET_ENV || 'development';
const RPC_PROVIDER = process.env.RPC_PROVIDER;
const RPC_PROVIDER_INFURA = process.env.RPC_PROVIDER_INFURA;

const DEFENDER_RELAY_API_KEY = process.env.DEFENDER_RELAY_API_KEY;
// const DEFENDER_RELAY_SECRET_KEY = process.env.DEFENDER_RELAY_SECRET_KEY;
const DEFENDER_RELAY_ETH_API_KEY = process.env.DEFENDER_RELAY_ETH_API_KEY;
// const DEFENDER_RELAY_ETH_SECRET_KEY = process.env.DEFENDER_RELAY_ETH_SECRET_KEY;

const DEPOSIT_CONFIRMED_BLOCKS = process.env.DEPOSIT_CONFIRMED_BLOCKS || 5;

const vaultManagerAbi = require(`../config/abis/${envPath}/vaultManager.json`)
const randMultiTokenAbi = require(`../config/abis/${envPath}/randMultiToken.json`)
const stableTokenAbi = require(`../config/abis/${envPath}/stableToken.json`)
const middlewareManagerAbi = require(`../config/abis/${envPath}/middlewareManager.json`)
const vaultReserveManagerAbi = require(`../config/abis/${envPath}/vaultReserveManager.json`)

const { vaultManagerAdress, randMultiTokenAdress, stableTokenAdress, middlewareManagerAdress, vaultReserveManagerAdress } = require('../config/contractAddress/');

let web3OZ;
let web3OZETH;
let web3Regular;

getSecret('DefenderRelaySecretKey')
.then((DEFENDER_RELAY_SECRET_KEY) =>{
    const credentials = { apiKey: DEFENDER_RELAY_API_KEY, apiSecret: DEFENDER_RELAY_SECRET_KEY };
    const provider = new DefenderRelayProvider(credentials, { speed: 'fast' });
    web3OZ = new Web3(provider);
    web3Regular = web3OZ;
    Logger.info({ message: 'web3 DefenderRelaySecretKey' });
});

getSecret('DefenderRelayEthSecretKey')
.then((DEFENDER_RELAY_ETH_SECRET_KEY) =>{
    const credentials = { apiKey: DEFENDER_RELAY_ETH_API_KEY, apiSecret: DEFENDER_RELAY_ETH_SECRET_KEY };
    const providerEthereum = new DefenderRelayProvider(credentials, { speed: 'fast' });

    web3OZETH = new Web3(providerEthereum);
    Logger.info({ message: 'web3 DefenderRelayEthSecretKey' });
});

//const rpcProvider = new Web3.providers.HttpProvider(RPC_PROVIDER);
const infuraRpcProvider = new Web3.providers.HttpProvider(RPC_PROVIDER_INFURA);

//const web3Regular = new Web3(rpcProvider);
const web3RegularInfura = new Web3(infuraRpcProvider);

const getVaultReserveContract = async (web3, options) => {
    const [from] = await web3.eth.getAccounts();
    return { contract: new web3.eth.Contract(vaultReserveManagerAbi, vaultReserveManagerAdress, { from, ...options }) };
};

const getMiddlewareContract = async (web3, options) => {
    const [from] = await web3.eth.getAccounts();
    return { contract: new web3.eth.Contract(middlewareManagerAbi, middlewareManagerAdress, { from, ...options }) };
};
const getVaultManagerContract = async (web3) => {
    const [from] = await web3.eth.getAccounts();
    return { contract: new web3.eth.Contract(vaultManagerAbi, vaultManagerAdress, { from }), from };
};
const getRandMultiTokenContract = async (web3) => {
    const [from] = await web3.eth.getAccounts();
    return { contract: new web3.eth.Contract(randMultiTokenAbi, randMultiTokenAdress, { from }), from };
};
const getStableTokenContract = async (web3) => {
    const [from] = await web3.eth.getAccounts();
    return { contract: new web3.eth.Contract(stableTokenAbi, stableTokenAdress, { from }), from };
};
const validateTransactionStatus = async (hash) => {
    return web3RegularInfura.eth.getTransactionReceipt(hash)
    .then(async (receipt) => {
          const { blockNumber, status } = receipt || {};
          const actualblock = await web3RegularInfura.eth.getBlockNumber();

        return status ? actualblock - blockNumber >= DEPOSIT_CONFIRMED_BLOCKS ? 'confirmed' : 'pending': 'failed';
      })
};

const getCryptoFee = async () => {
    const gasPrice = await web3OZETH.eth.getGasPrice()
    .then((price) => web3OZETH.utils.toBN(price));
    const gasUsed = 21000;
  
    return axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`)
    .then(({ data }) => {
      const fee = data.ethereum.usd * ((gasUsed * gasPrice)/1e18)
      return { fee: parseFloat(fee.toFixed(8)) };
    })
    
  };
  
const getProviders = () => ({ web3Regular, web3RegularInfura, web3OZ, web3OZETH });

module.exports = { validateTransactionStatus, getVaultManagerContract, getVaultReserveContract, getMiddlewareContract, getRandMultiTokenContract, getStableTokenContract, getProviders, getCryptoFee }; 
