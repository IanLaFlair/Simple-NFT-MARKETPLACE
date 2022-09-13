require("@nomicfoundation/hardhat-toolbox");
const projectId = 'a38a20842773443baa021a16e6268d4f'

const fs = require('fs')
const keyData = fs.readFileSync('./p-key.txt', {
  encoding:'utf8', flag:'r'
})
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai:{
      url: `https://polygon-mumbai.infura.io/v3/${projectId}`,
      accounts:[keyData]
    },
    mainet: {
      url:`https://polygon-mainnet.infura.io/v3/${projectId}`,
      accounts:[keyData]
    }
  },
  solidity:{
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
};
