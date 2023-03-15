require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/OPIopA92E0LEjRnRJvmiTYWfsswtAZAG",
      accounts: [
        "9cad2b8cbda217bb8ef532b177530453074c2d4dff7d79f7591f7e1697d3a153",
      ],
    },
  },
};
