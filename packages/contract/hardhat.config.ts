import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

import { HardhatUserConfig } from "hardhat/types";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-etherscan";
import "solidity-coverage";
// import "hardhat-gas-reporter";
import "hardhat-deploy";
import "hardhat-deploy-ethers";

const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const MATICVIGIL_API_KEY = process.env.MATICVIGIL_API_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY;
const DEPLOYER = process.env.DEPLOYER || "";
const DEPLOYER_MNEMONIC = process.env.DEPLOYER_MNEMONIC || "";
const accounts = {
  mnemonic: DEPLOYER_MNEMONIC,
};

const RINKEBY_PRIVATE_KEY =
  process.env.RINKEBY_PRIVATE_KEY! ||
  "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3"; // well known private key

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [{ version: "0.8.17", settings: {} }],
  },
  networks: {
    hardhat: {
      accounts,
    },
    localhost: {
      accounts,
    },
    mumbai: {
      url: `https://rpc-mumbai.maticvigil.com/v1/${MATICVIGIL_API_KEY}`,
      accounts,
    },
    coverage: {
      url: "http://127.0.0.1:8555", // Coverage launches its own ganache-cli client
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      mumbai: `${DEPLOYER}`,
      hardhat: `${DEPLOYER}`,
      localhost: `${DEPLOYER}`,
    },
    r1: {
      default: 1,
    },
    r2: {
      default: 2,
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;
