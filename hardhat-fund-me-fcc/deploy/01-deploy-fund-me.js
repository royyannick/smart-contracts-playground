// ----------------------------
//          METHOD #1
// ----------------------------
// function deployFunc(hre) {
//   console.log("Hello World!");
//   console.log(hre.getNameAccounts);
//   console.log(hre.deployments);
// }

// module.exports.default = deployFunc;
// ----------------------------

// ----------------------------
//          METHOD #2
// ----------------------------
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { network, run } = require("hardhat");
//const { verify } = require("ethers/lib/utils");

module.exports = async ({ getNameAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  const args = [ethUsdPriceFeedAddress];
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  const verify = async (contractAddress, args) => {
    console.log("Verifying contract...");

    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: args,
      });
    } catch (e) {
      if (e.message.toLowerCase().includes("already verified")) {
        console.log("Already Verified!");
      } else {
        console.log(e);
      }
    }
  };

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args);
  }

  log("============================");
};

module.exports.tags = ["all", "fundme"];
