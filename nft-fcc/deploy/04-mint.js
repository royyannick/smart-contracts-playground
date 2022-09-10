const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async function ({ getNamedAccounts }) {
  const { deployer } = await getNamedAccounts();

  // Basic NFT Stuff
  const basicNFT = await ethers.getContract("BasicNFT", deployer);
  const basicNFTtx = await basicNFT.mintNft();
  await basicNFTtx.wait(1);
  console.log(`Basic NFT index 0 has TokenURI: ${await basicNFT.tokenURI(0)}`);

  // Random IPFS NFT Stuff
  const IpfsNFT = await ethers.getContract("RandomIpfsNft", deployer);
  const mintFee = await IpfsNFT.getMintFee();

  await new Promise(async (resolve, reject) => {
    setTimeout(resolve, 9000000);
    IpfsNFT.once("NftMinted", async function () {
      resolve();
    });

    const IpfsNFTtx = await IpfsNFT.requestNtf({ value: mintFee.toString() });
    const IpfsNFTtxReceipt = await IpfsNFTtx.wait(1);
    if (developmentChains.includes(network.name)) {
      const requestId = IpfsNFTtxReceipt.events[1].args.requestId.toString();
      const vrfCoordinatorV2Mock = await ethers.getContract(
        "VRFCoordinatorV2Mock",
        deployer
      );
      await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, IpfsNFT.address);
    }
  });

  console.log(
    `Random IPFS NFT index 0 has TokenURI: ${await IpfsNFT.tokenURI(0)}`
  );
};

module.exports.tags = ["all", "mint"];
